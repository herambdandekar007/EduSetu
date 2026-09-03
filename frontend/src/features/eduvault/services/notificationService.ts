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
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VaultNotification[];
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
