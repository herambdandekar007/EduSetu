import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "notifications"
// Document ID: auto-generated

export interface NotificationDocument {
  userId: string;                        // Firebase Auth UID
  title: string;                         // required
  message: string;                       // required
  type: string;                          // default: 'info'
  isRead: boolean;                       // default: false
  createdAt: any;                        // serverTimestamp()
}

// Create notification
export const createNotification = async (data: Omit<NotificationDocument, "createdAt">) => {
  const notifRef = collection(db, "notifications");
  await addDoc(notifRef, { ...data, createdAt: serverTimestamp() });
};

// Get user's notifications
export const getUserNotifications = async (userId: string) => {
  const notifRef = collection(db, "notifications");
  const q = query(notifRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDocument & { id: string }));
};

// Mark notification as read
export const markAsRead = async (notifId: string) => {
  const notifRef = doc(db, "notifications", notifId);
  await updateDoc(notifRef, { isRead: true });
};