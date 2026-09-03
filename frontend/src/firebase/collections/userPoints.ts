import { db } from "../firebase.config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "user_points"
// Document ID: Firebase Auth UID

export interface UserPointsDocument {
  userId: string;                        // Firebase Auth UID
  totalPoints: number;                   // default: 0
  level: number;                         // default: 1
  streakDays: number;                    // default: 0
  lastActivity: any;                     // serverTimestamp()
  createdAt: any;                        // serverTimestamp()
  updatedAt: any;                        // serverTimestamp()
}

// Create user points doc
export const createUserPoints = async (userId: string) => {
  const pointsRef = doc(db, "user_points", userId);
  await setDoc(pointsRef, {
    userId,
    totalPoints: 0,
    level: 1,
    streakDays: 0,
    lastActivity: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update user points
export const updateUserPoints = async (userId: string, data: Partial<UserPointsDocument>) => {
  const pointsRef = doc(db, "user_points", userId);
  await updateDoc(pointsRef, { ...data, updatedAt: serverTimestamp() });
};

// Get leaderboard (all users points - public)
export const getLeaderboard = async () => {
  const pointsRef = collection(db, "user_points");
  const q = query(pointsRef, orderBy("totalPoints", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserPointsDocument & { id: string }));
};