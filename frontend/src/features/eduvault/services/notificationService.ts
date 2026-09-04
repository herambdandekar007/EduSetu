import { db } from "@/integrations/firebase/client";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import type { VaultNotification } from "../types/eduvault.types";

const NOTIFICATIONS_COLLECTION = "vaultNotifications";

export const sendVaultNotification = async ({
  userId,
  type,
  title,
  message,
  relatedDocumentId,
}: {
  userId: string;
  type: VaultNotification["type"];
  title: string;
  message: string;
  relatedDocumentId?: string;
}): Promise<string | null> => {
  try {
    if (!userId) return null;

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId,
      type,
      title,
      message,
      relatedDocumentId: relatedDocumentId || null,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.warn("[EduVault Notification] Failed to create notification:", error);
    return null;
  }
};

export const getUserNotifications = async (
  userId: string,
  maxResults: number = 30
): Promise<VaultNotification[]> => {
  try {
    if (!userId) return [];

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VaultNotification[];

    return docs
      .sort((a, b) => {
        const timeA = (a.createdAt as any)?.seconds
          ? (a.createdAt as any).seconds * 1000
          : new Date(a.createdAt || 0).getTime();
        const timeB = (b.createdAt as any)?.seconds
          ? (b.createdAt as any).seconds * 1000
          : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, maxResults);
  } catch (error) {
    console.error("[EduVault] Failed to get notifications:", error);
    return [];
  }
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.error("[EduVault] Failed to mark notification read:", error);
  }
};
