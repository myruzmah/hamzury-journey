/* ============================================================
   FIRESTORE INITIAL SEEDER & CONNECTION TESTER
   Reads credentials strictly from local .env
   Run: node scripts/seed.js
   ============================================================ */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Load .env variables locally
function loadEnv() {
  const env = {};
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.trim().match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || ""
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID in .env");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log(`Connecting to Firebase project '${firebaseConfig.projectId}'...`);

  try {
    // 1. Seed demo application
    const demoRef = doc(db, "applications", "HMZ-2026-DEMO");
    await setDoc(demoRef, {
      ref: "HMZ-2026-DEMO",
      status: "verified",
      statusLabel: "Verified & Confirmed",
      name: "Auwal Hamzury",
      email: "applicant@example.com",
      phone: "08067149356",
      location: "Kano",
      route: "ceo",
      track: "data",
      level: "ready",
      resumption: "1 October 2026",
      payments: {
        applicationFee: {
          amount: 5000,
          status: "verified",
          receiptUrl: `https://res.cloudinary.com/${env.VITE_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/sample.jpg`,
          receiptName: "moniepoint_receipt.pdf",
          storageProvider: "cloudinary",
          uploadedAt: new Date().toISOString()
        },
        programmeFee: {
          amount: 64000,
          title: "AI Data & Insight Analyst",
          status: "pending",
          uploadedAt: null
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log("✅ Successfully created 'applications/HMZ-2026-DEMO' in Firestore!");

    // 2. Seed initial treasury record
    const treasuryRef = doc(db, "treasury", "cohort-2026");
    await setDoc(treasuryRef, {
      year: 2026,
      status: "Active",
      stats: {
        impact: "Growing",
        cohorts: "3",
        businesses: "12",
        projects: "28"
      },
      updatedAt: new Date().toISOString()
    });

    console.log("✅ Successfully created 'treasury/cohort-2026' in Firestore!");
    console.log("\n🎉 Firestore is populated. Refresh your Firebase Console to see the collections.");
    process.exit(0);
  } catch (err) {
    if (err.code === "permission-denied") {
      console.error("\n❌ PERMISSION DENIED (Error code 7):");
      console.error("Firestore is blocking writes because security rules are set to: allow read, write: if false;");
      console.error("To fix: In Firebase Console -> Cloud Firestore -> Rules, allow read/write and click Publish.");
    } else {
      console.error("Firestore Error:", err);
    }
    process.exit(1);
  }
}

seed();
