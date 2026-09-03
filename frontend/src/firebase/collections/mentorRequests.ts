import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "mentor_requests"
// Document ID: auto-generated

export interface MentorRequestDocument {
  menteeId: string;                      // Firebase Auth UID
  mentorId: string;                      // mentor_profiles document ID
  message: string;                       // default: ''
  status: string;                        // default: 'pending'
  careerGoal: string;                    // default: ''
  createdAt: any;                        // serverTimestamp()
  updatedAt: any;                        // serverTimestamp()
}

// Create mentor request
export const createMentorRequest = async (data: Omit<MentorRequestDocument, "createdAt" | "updatedAt">) => {
  const requestsRef = collection(db, "mentor_requests");
  await addDoc(requestsRef, {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Get requests by mentee
export const getRequestsByMentee = async (menteeId: string) => {
  const requestsRef = collection(db, "mentor_requests");
  const q = query(requestsRef, where("menteeId", "==", menteeId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MentorRequestDocument & { id: string }));
};

// Update request status
export const updateRequestStatus = async (requestId: string, status: string) => {
  const requestRef = doc(db, "mentor_requests", requestId);
  await updateDoc(requestRef, { status, updatedAt: serverTimestamp() });
};