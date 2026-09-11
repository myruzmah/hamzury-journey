/* ============================================================
   ENQUIRIES SERVICE
   Firestore persistence for Partnership and Sponsorship inquiries
   ============================================================ */
import { db, isFirebaseConfigured } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Saves a partnership request to Firestore
 */
export async function savePartnership(data) {
  const payload = {
    ...data,
    createdAt: isFirebaseConfigured() ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, "partnerships");
      const docRef = await addDoc(colRef, payload);
      return docRef.id;
    } catch (e) {
      console.warn("[Firestore] Could not save partnership enquiry:", e);
    }
  }

  // Backup to localStorage
  try {
    const list = JSON.parse(localStorage.getItem("hamzury.partnerships") || "[]");
    list.push(payload);
    localStorage.setItem("hamzury.partnerships", JSON.stringify(list));
  } catch (e) {}

  return "local-id";
}

/**
 * Saves a sponsorship offer to Firestore
 */
export async function saveSponsorship(data) {
  const payload = {
    ...data,
    createdAt: isFirebaseConfigured() ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, "sponsorships");
      const docRef = await addDoc(colRef, payload);
      return docRef.id;
    } catch (e) {
      console.warn("[Firestore] Could not save sponsorship offer:", e);
    }
  }

  // Backup to localStorage
  try {
    const list = JSON.parse(localStorage.getItem("hamzury.sponsorships") || "[]");
    list.push(payload);
    localStorage.setItem("hamzury.sponsorships", JSON.stringify(list));
  } catch (e) {}

  return "local-id";
}
