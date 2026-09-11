/* ============================================================
   APPLICATIONS SERVICE
   Cloud Firestore for database records & Cloudinary for storage
   ============================================================ */
import { db } from "./firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinary.js";

/**
 * Saves a full application record to Cloud Firestore and uploads receipts to Cloudinary
 * @param {object} appData - Application fields
 * @param {object} files - Raw File instances for fee receipt, prog receipt, school letter
 * @param {function} onUploadProgress - Callback (fieldName, percent)
 * @returns {Promise<object>} Saved record summary
 */
export async function submitApplication(appData, files = {}, onUploadProgress = null) {
  const reference = appData.ref;
  if (!reference) throw new Error("Missing application reference");

  const uploadedUrls = {};
  const folder = `hamzury/applications/${reference}`;

  // 1. Upload Application Fee Receipt to Cloudinary
  if (files.receipt instanceof File) {
    try {
      uploadedUrls.receiptUrl = await uploadToCloudinary(
        files.receipt,
        folder,
        (p) => onUploadProgress && onUploadProgress("receipt", p)
      );
    } catch (e) {
      console.warn("Could not upload application fee receipt to Cloudinary:", e);
    }
  }

  // 2. Upload Programme Fee Receipt to Cloudinary
  if (files.receipt2 instanceof File) {
    try {
      uploadedUrls.receipt2Url = await uploadToCloudinary(
        files.receipt2,
        folder,
        (p) => onUploadProgress && onUploadProgress("receipt2", p)
      );
    } catch (e) {
      console.warn("Could not upload programme fee receipt to Cloudinary:", e);
    }
  }

  // 3. Upload Placement Letter to Cloudinary
  if (files.letter instanceof File) {
    try {
      uploadedUrls.letterUrl = await uploadToCloudinary(
        files.letter,
        folder,
        (p) => onUploadProgress && onUploadProgress("letter", p)
      );
    } catch (e) {
      console.warn("Could not upload school placement letter to Cloudinary:", e);
    }
  }

  const documentPayload = {
    ref: reference,
    status: "submitted",
    statusLabel: "Submitted · Payment under verification",
    createdAt: db ? serverTimestamp() : new Date().toISOString(),
    updatedAt: db ? serverTimestamp() : new Date().toISOString(),
    name: appData.name || "",
    email: appData.email || "",
    phone: appData.phone || "",
    location: appData.location || "",
    route: appData.route || "",
    track: appData.track || null,
    level: appData.level || "needs",
    age: appData.age || null,
    resumption: appData.resumption || "",
    payments: {
      applicationFee: {
        amount: 5000,
        status: "paid_pending_verification",
        receiptUrl: uploadedUrls.receiptUrl || appData.receipt || null,
        receiptName: appData.receiptName || null,
        storageProvider: "cloudinary",
        uploadedAt: new Date().toISOString()
      },
      programmeFee: {
        amount: appData.progDueAmount || null,
        title: appData.progDueTitle || "",
        status: appData.progDueAmount ? "paid_pending_verification" : "pending",
        receiptUrl: uploadedUrls.receipt2Url || appData.receipt2 || null,
        receiptName: appData.receiptName2 || null,
        storageProvider: "cloudinary",
        uploadedAt: appData.progDueAmount ? new Date().toISOString() : null
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
      letterUrl: uploadedUrls.letterUrl || appData.letter || null,
      letterName: appData.letterName || null,
      storageProvider: "cloudinary"
    } : null
  };

  // Cache locally in localStorage for immediate client-side recovery
  try {
    localStorage.setItem(`hamzury.app.${reference}`, JSON.stringify(documentPayload));
    localStorage.setItem("hamzury.lastAppRef", reference);
  } catch (e) {}

  // Save to Cloud Firestore
  if (db) {
    try {
      const appDocRef = doc(db, "applications", reference);
      await setDoc(appDocRef, documentPayload, { merge: true });
      console.info("[Firestore] Application saved with ref:", reference);
    } catch (firestoreError) {
      console.error("[Firestore] Error saving application document:", firestoreError);
    }
  }

  return documentPayload;
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
