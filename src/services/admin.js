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
  const list = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db, "applications"));
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("[Admin] Firestore query failed, checking local backup:", e);
    }
  }

  // Check local storage backup if Firestore returns empty or permission denied
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("hamzury.app.HMZ-")) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.ref) list.push(item);
      } catch (e) {}
    }
  }

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
 * Creates a sample demo applicant for staff testing
 */
export async function createSampleApplicant() {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const ref = `HMZ-2026-${randNum}`;
  const sample = {
    ref,
    name: "Amina Bello (Demo)",
    phone: "08031234567",
    email: "amina.bello@example.com",
    route: "ceo",
    track: "fullstack",
    resumption: "First Monday of Next Month",
    level: "direct",
    status: "paid_pending_verification",
    statusLabel: "Under Review · Payment Submitted",
    payments: {
      applicationFee: {
        amount: 5000,
        status: "paid_pending_verification",
        receiptUrl: "https://res.cloudinary.com/e8rvl3pz/image/upload/v1720000000/sample.jpg"
      }
    },
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, "applications", ref), {
        ...sample,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("[Admin] Could not write sample to Firestore:", e);
    }
  }

  localStorage.setItem(`hamzury.app.${ref}`, JSON.stringify(sample));
  return ref;
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

