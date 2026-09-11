/* ============================================================
   COURSES SERVICE
   Dynamic Course / Track management with Cloud Firestore & local fallback
   ============================================================ */
import { db } from "./firebase.js";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { TR as DEFAULT_TRACKS } from "../data/tracks.js";

let customCoursesCache = [];

/**
 * Fetches all custom courses from Cloud Firestore and localStorage
 */
export async function fetchCustomCourses() {
  const list = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db, "courses"));
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length > 0) {
        customCoursesCache = list;
        localStorage.setItem("hamzury.customCourses", JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn("[Courses] Firestore fetch failed, falling back to local cache:", e);
    }
  }

  try {
    const raw = localStorage.getItem("hamzury.customCourses");
    if (raw) {
      customCoursesCache = JSON.parse(raw);
      return customCoursesCache;
    }
  } catch (e) {}

  return customCoursesCache;
}

/**
 * Returns all active courses (Default tracks + Custom courses)
 */
export function getAllCourses() {
  const customMap = new Map(customCoursesCache.map((c) => [c.id, c]));
  const merged = [...DEFAULT_TRACKS];

  customCoursesCache.forEach((custom) => {
    if (!DEFAULT_TRACKS.some((d) => d.id === custom.id)) {
      merged.push(custom);
    }
  });

  return merged;
}

/**
 * Adds a new course to Cloud Firestore and updates local cache
 */
export async function addCourse(courseData) {
  const slug = (courseData.id || courseData.nm || "").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error("A valid course ID or name is required.");

  const payload = {
    id: slug,
    nm: courseData.nm.trim(),
    p: Number(courseData.p) || 60000,
    prob: courseData.prob?.trim() || "Operational bottleneck in traditional workflows.",
    market: courseData.market?.trim() || "Businesses seeking modern technical infrastructure.",
    work: courseData.work?.trim() || "Practical building, deployment, and systems implementation.",
    out: courseData.out?.trim() || "Deliver real working systems and revenue impact.",
    biz: courseData.biz?.trim() || "Client service contract, retainer, or project build fee.",
    fit: courseData.fit?.trim() || "For driven individuals who want to solve real market problems.",
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, "courses", slug), {
        ...payload,
        createdAt: serverTimestamp()
      });
      console.info("[Courses] Course saved to Firestore:", slug);
    } catch (e) {
      console.warn("[Courses] Could not persist course to Firestore:", e);
    }
  }

  // Update local cache
  customCoursesCache = customCoursesCache.filter((c) => c.id !== slug);
  customCoursesCache.push(payload);
  localStorage.setItem("hamzury.customCourses", JSON.stringify(customCoursesCache));

  return payload;
}

/**
 * Deletes a custom course from Firestore and local cache
 */
export async function deleteCourse(courseId) {
  if (db && courseId) {
    try {
      await deleteDoc(doc(db, "courses", courseId));
      console.info("[Courses] Course deleted from Firestore:", courseId);
    } catch (e) {
      console.warn("[Courses] Could not delete course from Firestore:", e);
    }
  }

  customCoursesCache = customCoursesCache.filter((c) => c.id !== courseId);
  localStorage.setItem("hamzury.customCourses", JSON.stringify(customCoursesCache));
}
