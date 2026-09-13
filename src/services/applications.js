/* ============================================================
   APPLICATIONS SERVICE
   Cloud Firestore for database records & Cloudinary for storage

   PERSISTENCE CONTRACT
   The record is written to Firestore BEFORE any file upload is
   attempted, so an application can never be lost because an
   upload was slow, failed, or the applicant closed the tab.
   Receipt URLs are patched onto the saved record afterwards.
   ============================================================ */
import { db } from "./firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary.js";

/* Firestore rejects any document over 1MiB. A phone photo turned into a
   base64 data URL blows past that and makes the whole write fail, which
   previously lost the entire application. Anything larger than this is
   kept out of the document and flagged for staff follow-up instead. */
const MAX_INLINE_URL = 40000;

const isUsableUrl = (v) => typeof v === "string" && v.length > 0 && v.length <= MAX_INLINE_URL;

/* A blob:/data: URL is only valid inside the applicant's own browser
   session, so it must never be written to Firestore as if it were
   durable evidence. */
const isEphemeral = (v) => typeof v === "string" && /^(blob:|data:)/i.test(v);

function localSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn("Could not write to localStorage:", e);
    return false;
  }
}

/**
 * Builds the Firestore document for an application.
 */
function buildPayload(appData, uploadedUrls = {}, nowIso = new Date().toISOString()) {
  const pickUrl = (uploaded, raw) => {
    if (isUsableUrl(uploaded)) return uploaded;
    if (isUsableUrl(raw) && !isEphemeral(raw)) return raw;
    return null;
  };

  const provider = (uploaded, raw) => {
    if (isUsableUrl(uploaded)) return "cloudinary";
    if (raw) return "pending_upload";
    return null;
  };

  const receiptUrl = pickUrl(uploadedUrls.receiptUrl, appData.receipt);
  const receipt2Url = pickUrl(uploadedUrls.receipt2Url, appData.receipt2);
  const letterUrl = pickUrl(uploadedUrls.letterUrl, appData.letter);

  // Evidence was attached by the applicant even if its URL is not yet durable.
  const hasProgReceipt = Boolean(uploadedUrls.receipt2Url || appData.receipt2);

  return {
    ref: appData.ref,
    status: "submitted",
    statusLabel: "Submitted · Payment under verification",
    createdAt: nowIso,
    updatedAt: nowIso,
    name: appData.name || "",
    email: appData.email || "",
    phone: appData.phone || "",
    location: appData.location || "",
    route: appData.route || "",
    track: appData.track || null,
    level: appData.level || "needs",
    age: appData.age || null,
    resumption: appData.resumption || "",
    termsAccepted: Boolean(appData.termsAccepted),
    termsAcceptedAt: appData.termsAcceptedAt || null,
    payments: {
      applicationFee: {
        amount: 5000,
        status: "paid_pending_verification",
        receiptUrl,
        receiptName: appData.receiptName || null,
        storageProvider: provider(uploadedUrls.receiptUrl, appData.receipt),
        uploadedAt: nowIso
      },
      programmeFee: {
        amount: appData.progDueAmount || null,
        title: appData.progDueTitle || "",
        status: hasProgReceipt ? "paid_pending_verification" : "pending",
        receiptUrl: receipt2Url,
        receiptName: appData.receiptName2 || null,
        storageProvider: provider(uploadedUrls.receipt2Url, appData.receipt2),
        uploadedAt: hasProgReceipt ? nowIso : null
      }
    },
    guardian: appData.route === "junior" ? {
      name: appData.gname || "",
      relation: appData.grel || "",
      phone: appData.gphone || "",
      email: appData.gemail || "",
      emergency: appData.gemergency || "",
      consent: Boolean(appData.consent)
    } : null,
    child: appData.route === "junior" ? {
      name: appData.name || "",
      dob: appData.dob || "",
      school: appData.school || "",
      class: appData.cls || "",
      interests: appData.interests || ""
    } : null,
    siwes: appData.route === "siwes" ? {
      months: appData.months || "1",
      letterUrl,
      letterName: appData.letterName || null,
      storageProvider: provider(uploadedUrls.letterUrl, appData.letter)
    } : null
  };
}

/**
 * Writes the application document to Firestore.
 * @returns {Promise<boolean>} true when the record is durably stored
 */
async function writeToFirestore(reference, payload, { isNew }) {
  if (!db) return false;
  const appDocRef = doc(db, "applications", reference);
  const data = { ...payload, updatedAt: serverTimestamp() };
  if (isNew) data.createdAt = serverTimestamp();
  else delete data.createdAt; // never overwrite the original submission time
  await setDoc(appDocRef, data, { merge: true });
  return true;
}

/**
 * Saves a full application record to Cloud Firestore, then uploads the
 * attached files and patches their URLs onto the saved record.
 *
 * The returned promise resolves once the record is safely stored; file
 * uploads continue and are awaited too, but an upload failure can no
 * longer prevent the application from being recorded.
 *
 * @param {object} appData - Application fields
 * @param {object} files - Raw File instances for fee receipt, prog receipt, school letter
 * @param {function} onUploadProgress - Callback (fieldName, percent)
 * @returns {Promise<object>} Saved record summary with a `persisted` flag
 */
export async function submitApplication(appData, files = {}, onUploadProgress = null) {
  const reference = appData.ref;
  if (!reference) throw new Error("Missing application reference");

  const nowIso = new Date().toISOString();
  const cacheKey = `hamzury.app.${reference}`;

  // ---------------------------------------------------------------
  // STEP 1 — Record the application immediately, with no attachments.
  // This is the step that must never be blocked by an upload.
  // ---------------------------------------------------------------
  const basePayload = buildPayload(appData, {}, nowIso);

  localSet(cacheKey, JSON.stringify(basePayload));
  localSet("hamzury.lastAppRef", reference);

  let persisted = false;
  let persistError = null;
  try {
    persisted = await writeToFirestore(reference, basePayload, { isNew: true });
    if (persisted) console.info("[Firestore] Application recorded with ref:", reference);
  } catch (e) {
    persistError = e;
    console.error("[Firestore] Could not record application:", reference, e);
  }

  // Queue the reference so a failed write is retried on the next visit.
  if (!persisted) queuePendingSync(reference);

  // ---------------------------------------------------------------
  // STEP 2 — Upload attachments, then patch their URLs onto the record.
  // Each upload is independent; one failure does not affect the others.
  // ---------------------------------------------------------------
  const folder = `hamzury/applications/${reference}`;
  const uploadedUrls = {};

  const targets = [
    ["receipt", files.receipt, "receiptUrl"],
    ["receipt2", files.receipt2, "receipt2Url"],
    ["letter", files.letter, "letterUrl"]
  ];

  await Promise.all(
    targets.map(async ([field, file, urlKey]) => {
      if (!(file instanceof File)) return;
      try {
        const url = await uploadToCloudinary(file, folder, (p) => {
          if (onUploadProgress) onUploadProgress(field, p);
        });
        // A data-URL fallback is not durable storage; do not persist it.
        if (isUsableUrl(url)) uploadedUrls[urlKey] = url;
        else console.warn(`[Upload] ${field} produced no durable URL; flagged for staff follow-up.`);
      } catch (e) {
        console.warn(`[Upload] Could not upload ${field}:`, e);
      }
    })
  );

  const finalPayload = buildPayload(appData, uploadedUrls, nowIso);
  finalPayload.createdAt = basePayload.createdAt;

  // Note any attachment that never made it to durable storage so staff
  // can request it rather than silently seeing an empty receipt.
  const missing = targets
    .filter(([field, file, urlKey]) => file instanceof File && !uploadedUrls[urlKey])
    .map(([field]) => field);
  finalPayload.attachmentsPendingUpload = missing.length ? missing : null;

  localSet(cacheKey, JSON.stringify(finalPayload));

  if (Object.keys(uploadedUrls).length || missing.length) {
    try {
      const wrote = await writeToFirestore(reference, finalPayload, { isNew: !persisted });
      if (wrote) {
        persisted = true;
        persistError = null;
        clearPendingSync(reference);
        console.info("[Firestore] Attachments patched for ref:", reference);
      }
    } catch (e) {
      persistError = e;
      console.error("[Firestore] Could not patch attachments:", reference, e);
      if (!persisted) queuePendingSync(reference);
    }
  } else if (persisted) {
    clearPendingSync(reference);
  }

  return {
    ...finalPayload,
    persisted,
    persistError: persistError ? String(persistError.message || persistError) : null
  };
}

/* ============================================================
   PENDING SYNC QUEUE
   References whose Firestore write failed, so they can be
   retried the next time the applicant opens the site.
   ============================================================ */
const SYNC_KEY = "hamzury.pendingSync";

function readQueue() {
  try {
    const raw = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function queuePendingSync(reference) {
  const q = readQueue();
  if (!q.includes(reference)) {
    q.push(reference);
    localSet(SYNC_KEY, JSON.stringify(q));
  }
}

function clearPendingSync(reference) {
  const q = readQueue().filter((r) => r !== reference);
  localSet(SYNC_KEY, JSON.stringify(q));
}

/**
 * Retries any application whose Firestore write previously failed.
 * Safe to call on every page load.
 * @returns {Promise<number>} count of records recovered
 */
export async function retryPendingSubmissions() {
  if (!db) return 0;
  const queue = readQueue();
  if (!queue.length) return 0;

  let recovered = 0;
  for (const reference of queue) {
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(`hamzury.app.${reference}`) || "null");
    } catch (e) {}
    if (!cached || !cached.ref) {
      clearPendingSync(reference);
      continue;
    }
    try {
      await writeToFirestore(reference, cached, { isNew: true });
      clearPendingSync(reference);
      recovered++;
      console.info("[Firestore] Recovered pending application:", reference);
    } catch (e) {
      console.warn("[Firestore] Retry failed for", reference, e);
    }
  }
  return recovered;
}

/**
 * Saves a draft application as soon as the application fee is attached,
 * so a half-finished application is still visible to admissions staff.
 */
export async function saveDraftApplication(appData) {
  if (!appData || !appData.ref) return null;
  const nowIso = new Date().toISOString();
  const reference = appData.ref;

  const draft = {
    ref: reference,
    status: "draft_fee_paid",
    statusLabel: "Draft · Application fee attached, not yet submitted",
    createdAt: nowIso,
    updatedAt: nowIso,
    name: appData.name || "",
    email: appData.email || "",
    phone: appData.phone || "",
    location: appData.location || "",
    route: appData.route || "",
    track: appData.track || null,
    months: appData.months || null,
    letterName: appData.letterName || null,
    payments: {
      applicationFee: {
        amount: 5000,
        status: "paid_pending_verification",
        receiptName: appData.receiptName || null,
        uploadedAt: nowIso
      }
    }
  };

  localSet(`hamzury.app.${reference}`, JSON.stringify(draft));
  localSet("hamzury.lastAppRef", reference);

  // Persist the draft so staff can see abandoned applications too.
  if (db) {
    try {
      const existing = await getDoc(doc(db, "applications", reference));
      // Never downgrade an already-submitted record back to a draft.
      if (existing.exists() && existing.data()?.status === "submitted") return draft;
      await writeToFirestore(reference, draft, { isNew: !existing.exists() });
      console.info("[Firestore] Draft saved for ref:", reference);
    } catch (e) {
      console.warn("[Firestore] Could not save draft:", e);
      queuePendingSync(reference);
    }
  } else {
    queuePendingSync(reference);
  }

  return draft;
}

/**
 * Returns the most recent application on this device that was paid for
 * but never submitted, so the applicant can be offered the chance to
 * finish it.
 *
 * Only a draft qualifies: a submitted application must never trigger a
 * resume prompt.
 *
 * @returns {object|null} the unfinished draft, or null
 */
export function getUnfinishedApplication() {
  let reference = null;
  try {
    reference = localStorage.getItem("hamzury.lastAppRef");
  } catch (e) {
    return null;
  }
  if (!reference) return null;

  try {
    const cached = JSON.parse(localStorage.getItem(`hamzury.app.${reference}`) || "null");
    if (cached && cached.ref && cached.status === "draft_fee_paid") return cached;
  } catch (e) {}

  return null;
}

/**
 * Forgets the unfinished application on this device, so the resume
 * prompt stops appearing once the applicant chooses to start over.
 */
export function clearUnfinishedApplication() {
  try {
    localStorage.removeItem("hamzury.lastAppRef");
  } catch (e) {}
}

/**
 * Looks up an application by its unique HMZ reference ID
 * @param {string} refQuery - HMZ reference string
 * @returns {Promise<object|null>} Application data or null
 */
export async function getApplicationByRef(refQuery) {
  if (!refQuery) return null;
  const cleanRef = refQuery.trim().toUpperCase();

  // Try Firestore first
  if (db) {
    try {
      const docRef = doc(db, "applications", cleanRef);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (e) {
      console.warn("[Firestore] Lookup error, checking local backup:", e);
    }
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(`hamzury.app.${cleanRef}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  return null;
}
