/* ============================================================
   ADMIN SERVICES
   Firestore queries for staff admissions management
   ============================================================ */
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

/**
 * Fetches all applications from Cloud Firestore
 */
export async function fetchAllApplications() {
  const map = new Map();

  // 1. Read local storage backup first for immediate availability
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("hamzury.app.HMZ-")) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.ref && !item.name?.includes("Amina Bello (Demo)") && item.status !== "diagnostic") {
          map.set(item.ref, item);
        }
      } catch (e) {}
    }
  }

  // 2. Overlay Cloud Firestore records
  if (db) {
    try {
      const snap = await getDocs(collection(db, "applications"));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.ref && !data.name?.includes("Amina Bello (Demo)") && data.status !== "diagnostic") {
          map.set(data.ref, { id: docSnap.id, ...data });
        }
      });
    } catch (e) {
      console.warn("[Admin] Firestore query failed, using local backup:", e);
    }
  }

  const list = Array.from(map.values());
  list.sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });

  return list;
}

/**
 * Updates application status in Cloud Firestore
 */
export async function updateApplicationStatus(ref, status, statusLabel) {
  if (db) {
    try {
      const docRef = doc(db, "applications", ref);
      await updateDoc(docRef, {
        status,
        statusLabel,
        "payments.applicationFee.status": status === "verified" ? "verified" : (status === "rejected" ? "rejected" : "paid_pending_verification"),
        updatedAt: serverTimestamp()
      });
      console.info("[Admin] Application status updated in Firestore:", ref, status);
    } catch (e) {
      console.error("[Admin] Could not update status in Firestore:", e);
    }
  }

  // Update localStorage backup
  const key = `hamzury.app.${ref}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const item = JSON.parse(raw);
      item.status = status;
      item.statusLabel = statusLabel;
      if (item.payments?.applicationFee) {
        item.payments.applicationFee.status = status === "verified" ? "verified" : (status === "rejected" ? "rejected" : "paid_pending_verification");
      }
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {}
  }
}

/**
 * Deletes an application from Cloud Firestore and localStorage
 */
export async function deleteApplication(ref) {
  if (db) {
    try {
      const docRef = doc(db, "applications", ref);
      await deleteDoc(docRef);
      console.info("[Admin] Application deleted from Firestore:", ref);
    } catch (e) {
      console.error("[Admin] Could not delete from Firestore:", e);
    }
  }

  // Remove from localStorage
  const key = `hamzury.app.${ref}`;
  localStorage.removeItem(key);
}

/**
 * Fetches all partnership requests from Cloud Firestore
 */
export async function fetchAllPartnerships() {
  const list = [];
  if (db) {
    try {
      const snap = await getDocs(collection(db, "partnerships"));
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (e) {}
  }

  try {
    return JSON.parse(localStorage.getItem("hamzury.partnerships") || "[]");
  } catch (e) {
    return [];
  }
}

/**
 * Fetches all sponsorship offers from Cloud Firestore
 */
export async function fetchAllSponsorships() {
  const list = [];
  if (db) {
    try {
      const snap = await getDocs(collection(db, "sponsorships"));
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (e) {}
  }

  try {
    return JSON.parse(localStorage.getItem("hamzury.sponsorships") || "[]");
  } catch (e) {
    return [];
  }
}

/**
 * Deletes an enquiry (partnership or sponsorship)
 */
export async function deleteEnquiry(kind, id) {
  const colName = kind === "partner" ? "partnerships" : "sponsorships";
  if (db && id) {
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (e) {
      console.warn("[Admin] Could not delete enquiry from Firestore:", e);
    }
  }

  // Also update localStorage
  try {
    const key = kind === "partner" ? "hamzury.partnerships" : "hamzury.sponsorships";
    let list = JSON.parse(localStorage.getItem(key) || "[]");
    list = list.filter((item) => item.id !== id && item.phone !== id);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {}
}

/**
 * Clears all demo, test, and placeholder records across Firestore and localStorage
 */
export async function clearAllDemoData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("hamzury.app.HMZ-")) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (
          item &&
          (item.name?.toLowerCase().includes("demo") ||
           item.email?.toLowerCase().includes("example.com") ||
           item.ref?.includes("DEMO"))
        ) {
          keysToRemove.push(key);
          if (db && item.ref) {
            deleteDoc(doc(db, "applications", item.ref)).catch(() => {});
          }
        }
      } catch (e) {}
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  if (db) {
    try {
      const snap = await getDocs(collection(db, "applications"));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data &&
          (data.name?.toLowerCase().includes("demo") ||
           data.email?.toLowerCase().includes("example.com") ||
           docSnap.id.includes("DEMO"))
        ) {
          deleteDoc(doc(db, "applications", docSnap.id)).catch(() => {});
        }
      });
    } catch (e) {}
  }
}

/**
 * Exports applications list as a downloadable CSV file
 */
export function exportApplicationsCSV(applications) {
  if (!applications || !applications.length) return;

  const headers = [
    "Reference",
    "Applicant Name",
    "Phone",
    "Email",
    "Route",
    "Track",
    "Resumption",
    "Level",
    "Status",
    "Fee Amount",
    "Receipt URL",
    "Created Date"
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = applications.map((app) => [
    escapeCSV(app.ref),
    escapeCSV(app.name),
    escapeCSV(app.phone),
    escapeCSV(app.email),
    escapeCSV(app.route),
    escapeCSV(app.track),
    escapeCSV(app.resumption),
    escapeCSV(app.level === "needs" ? "Digital Foundation" : "Direct Track"),
    escapeCSV(app.status),
    escapeCSV("₦5,000"),
    escapeCSV(app.payments?.applicationFee?.receiptUrl || ""),
    escapeCSV(app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : (app.createdAt || ""))
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hamzury-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Backward compatibility stub for cached browser modules
 */
export function createSampleApplicant() {
  return null;
}
