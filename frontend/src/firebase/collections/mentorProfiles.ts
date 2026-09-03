import { db } from "../firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "mentor_profiles"
// Document ID: auto-generated

export interface MentorProfileDocument {
  userId: string;                        // Firebase Auth UID (unique)
  name: string;                          // required
  expertise: string[];                   // default: []
  bio: string;                           // default: ''
  company: string;                       // default: ''
  role: string;                          // default: ''
  availability: string;                  // default: 'available'
  rating: number;                        // default: 0
  sessionsCount: number;                 // default: 0
  avatarUrl: string;                     // default: ''
  isActive: boolean;                     // default: true
  createdAt: any;                        // serverTimestamp()
}

// Add mentor profile
export const addMentorProfile = async (data: Omit<MentorProfileDocument, "createdAt">) => {
  const mentorsRef = collection(db, "mentor_profiles");
  await addDoc(mentorsRef, { ...data, createdAt: serverTimestamp() });
};

// Get all active mentors
export const getActiveMentors = async () => {
  const mentorsRef = collection(db, "mentor_profiles");
  const q = query(mentorsRef, where("isActive", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MentorProfileDocument & { id: string }));
};

// Update mentor profile
export const updateMentorProfile = async (mentorId: string, data: Partial<MentorProfileDocument>) => {
  const mentorRef = doc(db, "mentor_profiles", mentorId);
  await updateDoc(mentorRef, data);
};