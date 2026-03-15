import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "saved_jobs"
// Document ID: auto-generated

export interface SavedJobDocument {
  userId: string;                        // Firebase Auth UID
  jobId: string;                         // Job document ID
  createdAt: any;                        // serverTimestamp()
}

// Save a job
export const saveJob = async (userId: string, jobId: string) => {
  const savedRef = collection(db, "saved_jobs");
  await addDoc(savedRef, { userId, jobId, createdAt: serverTimestamp() });
};

// Get user's saved jobs
export const getSavedJobs = async (userId: string) => {
  const savedRef = collection(db, "saved_jobs");
  const q = query(savedRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedJobDocument & { id: string }));
};

// Unsave a job
export const unsaveJob = async (savedJobDocId: string) => {
  const savedRef = doc(db, "saved_jobs", savedJobDocId);
  await deleteDoc(savedRef);
};