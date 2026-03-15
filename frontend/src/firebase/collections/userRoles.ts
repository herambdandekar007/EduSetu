import { db } from "../firebase.config";
import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

// Firestore Collection: "user_roles"
// Document ID: Firebase Auth UID

export type AppRole = "admin" | "moderator" | "user";

export interface UserRoleDocument {
  userId: string;                        // Firebase Auth UID
  role: AppRole;                         // default: 'user'
}

// Set user role (auto-called on signup)
export const setUserRole = async (userId: string, role: AppRole = "user") => {
  const roleRef = doc(db, "user_roles", userId);
  await setDoc(roleRef, { userId, role });
};

// Get user role
export const getUserRole = async (userId: string): Promise<AppRole> => {
  const roleRef = doc(db, "user_roles", userId);
  const snap = await getDoc(roleRef);
  return snap.exists() ? (snap.data() as UserRoleDocument).role : "user";
};

// Check if user has a role
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  const userRole = await getUserRole(userId);
  return userRole === role;
};