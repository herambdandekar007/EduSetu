import { db } from "@/integrations/firebase/client";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { DocumentShare, DocumentPermission } from "../types/eduvault.types";
import { logDocumentActivity } from "./activityService";
import { sendVaultNotification } from "./notificationService";

const SHARES_COLLECTION = "documentShares";

const generateShareToken = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

const hashPassword = async (password: string): Promise<string> => {
  const buffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const createDocumentShare = async ({
  documentId,
  documentName,
  ownerId,
  ownerName,
  recipientEmail,
  permission = "VIEW",
  expiresInDays = 7,
  password,
  requireOtp = false,
}: {
  documentId: string;
  documentName?: string;
  ownerId: string;
  ownerName?: string;
  recipientEmail?: string;
  permission: DocumentPermission;
  expiresInDays?: number;
  password?: string;
  requireOtp?: boolean;
}): Promise<{ share: DocumentShare; shareUrl: string }> => {
  const shareRef = doc(collection(db, SHARES_COLLECTION));
  const shareId = shareRef.id;
  const accessToken = generateShareToken();

  let expiresAt: string | null = null;
  if (expiresInDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + expiresInDays);
    expiresAt = d.toISOString();
  }

  let passwordHash = "";
  let passwordProtected = false;
  if (password && password.trim()) {
    passwordProtected = true;
    passwordHash = await hashPassword(password.trim());
  }

  let otpCode = "";
  if (requireOtp) {
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Build the Firestore payload explicitly — never include undefined values
  // Firestore rejects `undefined`; use conditional spread to omit optional fields entirely
  const firestorePayload: Record<string, any> = {
    id: shareId,
    documentId,
    documentName: documentName || "Document",
    ownerId,
    ownerName: ownerName || "Student",
    recipientEmail: recipientEmail || "",
    permission,
    accessToken,
    expiresAt: expiresAt ?? null,
    passwordProtected,
    passwordHash: passwordProtected ? passwordHash : null,
    otpRequired: requireOtp,
    otpCode: requireOtp ? otpCode : null,
    isActive: true,
    accessCount: 0,
    createdAt: serverTimestamp(),
  };

  // Final safety net: strip any remaining undefined values Firestore would reject
  Object.keys(firestorePayload).forEach((key) => {
    if (firestorePayload[key] === undefined) {
      firestorePayload[key] = null;
    }
  });

  // Keep a typed in-memory copy for the return value
  const shareData: DocumentShare = {
    ...(firestorePayload as any),
  };

  await setDoc(shareRef, firestorePayload);

  // Log activity
  await logDocumentActivity({
    userId: ownerId,
    documentId,
    documentName: documentName || "Document",
    action: "SHARE",
    metadata: {
      shareId,
      permission,
      recipientEmail: recipientEmail || "",
      expiresAt: expiresAt || null,
      passwordProtected,
      otpRequired: requireOtp,
    },
  });

  await sendVaultNotification({
    userId: ownerId,
    type: "DOCUMENT_SHARED",
    title: "Secure Share Link Generated",
    message: `Share link created for "${documentName || "Document"}" with ${permission} permission.`,
    relatedDocumentId: documentId,
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8081";
  const shareUrl = `${origin}/vault/share/${accessToken}`;

  return { share: shareData, shareUrl };
};

export const getSharesByOwner = async (ownerId: string): Promise<DocumentShare[]> => {
  if (!ownerId) return [];
  try {
    const q = query(
      collection(db, SHARES_COLLECTION),
      where("ownerId", "==", ownerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DocumentShare[];
  } catch (error) {
    console.error("[EduVault] Error fetching shares:", error);
    return [];
  }
};

export const getSharesForDocument = async (documentId: string): Promise<DocumentShare[]> => {
  if (!documentId) return [];
  try {
    const q = query(
      collection(db, SHARES_COLLECTION),
      where("documentId", "==", documentId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DocumentShare[];
  } catch (error) {
    console.error("[EduVault] Error fetching doc shares:", error);
    return [];
  }
};

export const getShareByToken = async (token: string): Promise<DocumentShare | null> => {
  if (!token) return null;
  try {
    const q = query(
      collection(db, SHARES_COLLECTION),
      where("accessToken", "==", token)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as DocumentShare;
  } catch (error) {
    console.error("[EduVault] Error fetching share by token:", error);
    return null;
  }
};

export const revokeShare = async (shareId: string, ownerId: string): Promise<void> => {
  try {
    const docRef = doc(db, SHARES_COLLECTION, shareId);
    await updateDoc(docRef, {
      isActive: false,
    });

    await logDocumentActivity({
      userId: ownerId,
      action: "ACCESS_REVOKED",
      metadata: { shareId },
    });
  } catch (error) {
    console.error("[EduVault] Error revoking share:", error);
    throw error;
  }
};

export const recordShareAccess = async (shareId: string, currentCount: number = 0): Promise<void> => {
  try {
    const docRef = doc(db, SHARES_COLLECTION, shareId);
    await updateDoc(docRef, {
      accessCount: (currentCount || 0) + 1,
      lastAccessedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("[EduVault] Error updating share access count:", error);
  }
};
