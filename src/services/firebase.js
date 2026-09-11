/* ============================================================
   FIREBASE CLIENT INITIALIZATION (FIRESTORE)
   Stores structured application, partnership & sponsorship records
   ============================================================ */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDYAuexNIfaN3jz3uj-eIbpBjt4nPC3vVs",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "hamzury-journey.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "hamzury-journey",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "hamzury-journey.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "56612324793",
  appId: env.VITE_FIREBASE_APP_ID || "1:56612324793:web:83a5579224bf5657022268"
};

export const isFirebaseConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.info("[Hamzury Firebase] Firestore connected to project:", firebaseConfig.projectId);
} catch (error) {
  console.error("[Hamzury Firebase] Initialization error:", error);
}

export { app, db };
