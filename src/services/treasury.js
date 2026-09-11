/* ============================================================
   TREASURY SERVICE
   Public records, cohorts, projects, and businesses ledger
   ============================================================ */
import { db, isFirebaseConfigured } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { TY } from "../data/routes.js";

export async function fetchTreasuryYears() {
  if (isFirebaseConfigured() && db) {
    try {
      const col = collection(db, "treasury");
      const snap = await getDocs(col);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("[Firestore] Treasury query error, using built-in ledger:", e);
    }
  }
  return TY;
}
