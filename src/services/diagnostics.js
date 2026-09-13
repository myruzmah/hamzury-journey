/* ============================================================
   SYSTEM DIAGNOSTICS
   Verifies that receipts can actually be stored and that
   applications can actually be written to the database.

   These checks run inside the app so staff never need to paste
   anything into the browser console.
   ============================================================ */
import { db } from "./firebase.js";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { cloudinaryConfig, isCloudinaryConfigured } from "./cloudinary.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase.js";

const PROBE_REF = "HMZ-DIAGNOSTIC-PROBE";

/**
 * Confirms the Cloudinary unsigned upload preset accepts a file.
 * This is the single most common cause of missing receipts: a preset
 * left on "Signed" rejects every browser upload.
 */
export function checkCloudinary() {
  return new Promise((resolve) => {
    if (!isCloudinaryConfigured()) {
      resolve({
        ok: false,
        title: "Receipt storage (Cloudinary)",
        detail:
          "Not configured. VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are missing from the deployment environment.",
        fix: "Add both variables to your hosting environment and redeploy."
      });
      return;
    }

    const blob = new Blob(["hamzury diagnostic probe"], { type: "text/plain" });
    const file = new File([blob], "hamzury-probe.txt", { type: "text/plain" });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", cloudinaryConfig.uploadPreset);
    fd.append("folder", "hamzury/_diagnostics");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, true);
    xhr.timeout = 30000;

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let url = "";
        try {
          url = JSON.parse(xhr.responseText).secure_url || "";
        } catch (e) {}
        resolve({
          ok: true,
          title: "Receipt storage (Cloudinary)",
          detail: `Working. Preset "${cloudinaryConfig.uploadPreset}" on cloud "${cloudinaryConfig.cloudName}" accepted a test upload.`,
          url
        });
      } else {
        let msg = xhr.responseText || "";
        try {
          msg = JSON.parse(xhr.responseText)?.error?.message || msg;
        } catch (e) {}
        const signed = /whitelist|unsigned|signature|preset/i.test(msg);
        resolve({
          ok: false,
          title: "Receipt storage (Cloudinary)",
          detail: `Rejected with status ${xhr.status}. ${msg}`.trim(),
          fix: signed
            ? `Open Cloudinary → Settings → Upload → Upload presets → "${cloudinaryConfig.uploadPreset}" and set Signing Mode to "Unsigned". Every receipt upload fails until this is done.`
            : "Check the preset name and cloud name match your Cloudinary account exactly."
        });
      }
    };

    xhr.ontimeout = () =>
      resolve({
        ok: false,
        title: "Receipt storage (Cloudinary)",
        detail: "The upload timed out after 30 seconds.",
        fix: "Check the network connection on this device and try again."
      });

    xhr.onerror = () =>
      resolve({
        ok: false,
        title: "Receipt storage (Cloudinary)",
        detail: "Network error reaching Cloudinary.",
        fix: "Check internet access, or whether a firewall is blocking api.cloudinary.com."
      });

    xhr.send(fd);
  });
}

/**
 * Confirms an application document can be written to, and removed from,
 * Cloud Firestore with the current security rules.
 */
export async function checkFirestore() {
  if (!isFirebaseConfigured()) {
    return {
      ok: false,
      title: "Admissions database (Firestore)",
      detail: "Not configured. The VITE_FIREBASE_* variables are missing from the deployment environment.",
      fix: "Add the Firebase config to your hosting environment and redeploy."
    };
  }
  if (!db) {
    return {
      ok: false,
      title: "Admissions database (Firestore)",
      detail: "Firebase is configured but the client failed to initialise.",
      fix: "Check the browser console for a Firebase initialisation error."
    };
  }

  try {
    const ref = doc(db, "applications", PROBE_REF);
    await setDoc(ref, {
      ref: PROBE_REF,
      name: "Diagnostic Probe (Demo)",
      status: "diagnostic",
      createdAt: serverTimestamp()
    });
    // Clean up so the probe never shows in the applications list.
    try {
      await deleteDoc(ref);
    } catch (e) {
      return {
        ok: true,
        title: "Admissions database (Firestore)",
        detail: `Writing works on project "${firebaseConfig.projectId}", but the test record could not be deleted.`,
        fix: `Delete the document "${PROBE_REF}" from the applications collection manually.`
      };
    }
    return {
      ok: true,
      title: "Admissions database (Firestore)",
      detail: `Working. Applications can be saved to project "${firebaseConfig.projectId}".`
    };
  } catch (e) {
    const msg = String(e?.message || e);
    const denied = /permission|insufficient|PERMISSION_DENIED/i.test(msg);
    return {
      ok: false,
      title: "Admissions database (Firestore)",
      detail: denied
        ? "Permission denied by Firestore security rules. Applications cannot be saved."
        : `Write failed: ${msg}`,
      fix: denied
        ? "In Firebase Console → Firestore → Rules, allow create/update on the 'applications' collection. Until this is fixed, no application will reach this dashboard."
        : "Check the Firebase project settings and that the project is on an active plan."
    };
  }
}

/**
 * Reports applications still held on this device because a previous
 * database write failed.
 */
export function checkPendingQueue() {
  let queue = [];
  try {
    const raw = JSON.parse(localStorage.getItem("hamzury.pendingSync") || "[]");
    if (Array.isArray(raw)) queue = raw;
  } catch (e) {}

  if (!queue.length) {
    return {
      ok: true,
      title: "Unsent applications on this device",
      detail: "None waiting. Everything recorded on this device has reached the database."
    };
  }
  return {
    ok: false,
    title: "Unsent applications on this device",
    detail: `${queue.length} application${queue.length === 1 ? "" : "s"} could not be saved and are held locally: ${queue.join(", ")}.`,
    fix: "Fix the database check above, then reload this page — they are re-sent automatically."
  };
}

/**
 * Runs every check.
 */
export async function runDiagnostics() {
  const [cloudinary, firestore] = await Promise.all([checkCloudinary(), checkFirestore()]);
  return [firestore, cloudinary, checkPendingQueue()];
}
