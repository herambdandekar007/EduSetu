import { db } from "@/integrations/firebase/client";
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import type { ActivityActionType, DocumentActivity } from "../types/eduvault.types";

const ACTIVITIES_COLLECTION = "documentActivities";

export const logDocumentActivity = async ({
  userId,
  documentId,
  documentName,
  action,
  metadata = {},
}: {
  userId: string;
  documentId?: string;
  documentName?: string;
  action: ActivityActionType;
  metadata?: Record<string, any>;
}): Promise<string | null> => {
  try {
    if (!userId) return null;

    const cleanMetadata: Record<string, any> = {};
    if (metadata && typeof metadata === "object") {
      Object.keys(metadata).forEach((key) => {
        cleanMetadata[key] = metadata[key] === undefined ? null : metadata[key];
      });
    }

    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      userId,
      documentId: documentId || null,
      documentName: documentName || "",
      action,
      timestamp: serverTimestamp(),
      deviceInfo,
      metadata: cleanMetadata,
    });

    return docRef.id;
  } catch (error) {
    console.warn("[EduVault Activity Logger] Failed to record activity:", error);
    return null;
  }
};

export const getUserActivities = async (
  userId: string,
  maxResults: number = 50
): Promise<DocumentActivity[]> => {
  try {
    if (!userId) return [];

    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DocumentActivity[];

    return docs
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, maxResults);
  } catch (error) {
    console.error("[EduVault] Failed to fetch activities:", error);
    return [];
  }
};

export const getDocumentActivities = async (
  documentId: string,
  maxResults: number = 20
): Promise<DocumentActivity[]> => {
  try {
    if (!documentId) return [];

    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where("documentId", "==", documentId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DocumentActivity[];

    return docs
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, maxResults);
  } catch (error) {
    console.error("[EduVault] Failed to fetch document activities:", error);
    return [];
  }
};
