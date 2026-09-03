import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "user_achievements"
// Document ID: auto-generated

export interface UserAchievementDocument {
  userId: string;                        // Firebase Auth UID
  achievementType: string;               // unique per user
  achievementName: string;               // required
  description: string;                   // default: ''
  points: number;                        // default: 0
  icon: string;                          // default: 'trophy'
  earnedAt: any;                         // serverTimestamp()
}

// Add achievement
export const addAchievement = async (data: Omit<UserAchievementDocument, "earnedAt">) => {
  const achievementsRef = collection(db, "user_achievements");
  await addDoc(achievementsRef, { ...data, earnedAt: serverTimestamp() });
};

// Get user achievements
export const getUserAchievements = async (userId: string) => {
  const achievementsRef = collection(db, "user_achievements");
  const q = query(achievementsRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserAchievementDocument & { id: string }));
};