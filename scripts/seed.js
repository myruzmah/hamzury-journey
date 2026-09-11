/* ============================================================
   FIRESTORE INITIAL SEEDER & CONNECTION TESTER
   Run: node scripts/seed.js
   ============================================================ */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYAuexNIfaN3jz3uj-eIbpBjt4nPC3vVs",
  authDomain: "hamzury-journey.firebaseapp.com",
  projectId: "hamzury-journey",
  storageBucket: "hamzury-journey.firebasestorage.app",
  messagingSenderId: "56612324793",
  appId: "1:56612324793:web:83a5579224bf5657022268"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Connecting to Firebase project 'hamzury-journey'...");

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
          receiptUrl: "https://res.cloudinary.com/e8rvl3pz/image/upload/sample.jpg",
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
    console.log("\n🎉 Firestore is now populated! Refresh your Firebase Console to see the collections.");
    process.exit(0);
  } catch (err) {
    if (err.code === "permission-denied") {
      console.error("\n❌ PERMISSION DENIED (Error code 7):");
      console.error("Firestore is blocking writes because default security rules are set to: allow read, write: if false;");
      console.error("To fix this:");
      console.error("1. In your Firebase Console, click the 'Rules' tab (right next to 'Data').");
      console.error("2. Change the rule to allow access, e.g.:");
      console.error("   rules_version = '2';");
      console.error("   service cloud.firestore {");
      console.error("     match /databases/{database}/documents {");
      console.error("       match /{document=**} {");
      console.error("         allow read, write: if true;");
      console.error("       }");
      console.error("     }");
      console.error("   }");
      console.error("3. Click 'Publish'. Then run 'node scripts/seed.js' again!");
    } else {
      console.error("Firestore Error:", err);
    }
    process.exit(1);
  }
}

seed();
