import { db } from "@/integrations/firebase/client";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import type {
  VaultDocument,
  DocumentVersion,
  VaultStats,
  VerificationStatus,
} from "../types/eduvault.types";
import { deleteVaultFile } from "./storageService";
import { logDocumentActivity } from "./activityService";
import { sendVaultNotification } from "./notificationService";
import { DEFAULT_STORAGE_QUOTA_BYTES } from "../constants/categories";

const DOCUMENTS_COLLECTION = "documents";
const VERSIONS_COLLECTION = "documentVersions";

/**
 * Creates a new document record in Firestore
 */
export const createVaultDocument = async (
  documentData: Omit<VaultDocument, "id" | "createdAt" | "updatedAt">
): Promise<VaultDocument> => {
  const docRef = doc(collection(db, DOCUMENTS_COLLECTION));
  const id = docRef.id;

  const newDoc: VaultDocument = {
    ...documentData,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, newDoc);

  // Record version 1
  try {
    await addDoc(collection(db, VERSIONS_COLLECTION), {
      documentId: id,
      versionNumber: 1,
      fileName: documentData.fileName,
      fileUrl: documentData.fileUrl,
      storagePath: documentData.storagePath,
      fileSize: documentData.fileSize,
      modifiedBy: documentData.userId,
      createdAt: serverTimestamp(),
      changeDescription: "Initial document upload",
    });
  } catch (versionErr) {
    console.warn("[EduVault] Version 1 creation warning:", versionErr);
  }

  // Audit activity
  await logDocumentActivity({
    userId: documentData.userId,
    documentId: id,
    documentName: documentData.documentName,
    action: "UPLOAD",
    metadata: {
      category: documentData.category,
      type: documentData.type,
      fileSize: documentData.fileSize,
      mimeType: documentData.mimeType,
    },
  });

  // Vault notification
  await sendVaultNotification({
    userId: documentData.userId,
    type: "UPLOAD_SUCCESS",
    title: "Document Uploaded Successfully",
    message: `"${documentData.documentName}" has been safely encrypted and saved to your EduVault.`,
    relatedDocumentId: id,
  });

  return newDoc;
};

/**
 * Get all active (non-deleted) documents for a user
 */
export const getUserDocuments = async (
  userId: string,
  includeDeleted: boolean = false
): Promise<VaultDocument[]> => {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as VaultDocument;
    });

    if (includeDeleted) {
      return docs;
    }

    return docs.filter((d) => !d.isDeleted);
  } catch (error) {
    console.error("[EduVault] Failed to get user documents:", error);
    return [];
  }
};

/**
 * Get single document by ID
 */
export const getVaultDocumentById = async (
  documentId: string
): Promise<VaultDocument | null> => {
  if (!documentId) return null;

  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as VaultDocument;
  } catch (error) {
    console.error("[EduVault] Error fetching document:", error);
    return null;
  }
};

/**
 * Update document metadata
 */
export const updateVaultDocument = async (
  documentId: string,
  userId: string,
  updates: Partial<VaultDocument>
): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await logDocumentActivity({
      userId,
      documentId,
      documentName: updates.documentName || "Document",
      action: "EDIT",
      metadata: updates,
    });
  } catch (error) {
    console.error("[EduVault] Error updating document:", error);
    throw error;
  }
};

/**
 * Toggle Favorite
 */
export const toggleFavoriteDocument = async (
  documentId: string,
  userId: string,
  currentFavorite: boolean
): Promise<void> => {
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
  await updateDoc(docRef, {
    isFavorite: !currentFavorite,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Toggle Archive
 */
export const toggleArchiveDocument = async (
  documentId: string,
  userId: string,
  currentArchived: boolean,
  documentName?: string
): Promise<void> => {
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
  const nextState = !currentArchived;
  await updateDoc(docRef, {
    isArchived: nextState,
    updatedAt: serverTimestamp(),
  });

  await logDocumentActivity({
    userId,
    documentId,
    documentName: documentName || "Document",
    action: nextState ? "ARCHIVE" : "RESTORE",
  });
};

/**
 * Soft Delete to Recycle Bin
 */
export const softDeleteDocument = async (
  documentId: string,
  userId: string,
  documentName?: string
): Promise<void> => {
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
  await updateDoc(docRef, {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    deletedBy: userId,
    updatedAt: serverTimestamp(),
  });

  await logDocumentActivity({
    userId,
    documentId,
    documentName: documentName || "Document",
    action: "DELETE",
    metadata: { reason: "Moved to Recycle Bin" },
  });
};

/**
 * Restore from Recycle Bin
 */
export const restoreDocument = async (
  documentId: string,
  userId: string,
  documentName?: string
): Promise<void> => {
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
  await updateDoc(docRef, {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    updatedAt: serverTimestamp(),
  });

  await logDocumentActivity({
    userId,
    documentId,
    documentName: documentName || "Document",
    action: "RESTORE",
    metadata: { reason: "Restored from Recycle Bin" },
  });
};

/**
 * Permanently Delete Document (Firestore + Storage + Activity)
 */
export const permanentDeleteDocument = async (
  documentId: string,
  userId: string,
  storagePath: string,
  documentName?: string
): Promise<void> => {
  try {
    // 1. Delete physical storage file
    if (storagePath) {
      await deleteVaultFile(storagePath);
    }

    // 2. Delete Firestore doc
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(docRef);

    // 3. Log activity
    await logDocumentActivity({
      userId,
      documentId,
      documentName: documentName || "Deleted Document",
      action: "PERMANENT_DELETE",
      metadata: { storagePath },
    });
  } catch (error) {
    console.error("[EduVault] Permanent delete error:", error);
    throw error;
  }
};

/**
 * Get Document Versions
 */
export const getDocumentVersions = async (
  documentId: string
): Promise<DocumentVersion[]> => {
  try {
    const q = query(
      collection(db, VERSIONS_COLLECTION),
      where("documentId", "==", documentId),
      orderBy("versionNumber", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DocumentVersion[];
  } catch (error) {
    console.warn("[EduVault] Versions fetch error:", error);
    return [];
  }
};

/**
 * Calculate user vault statistics dynamically from Firestore
 */
export const calculateVaultStats = (
  documents: VaultDocument[],
  allDocsWithDeleted: VaultDocument[] = []
): VaultStats => {
  const activeDocs = documents.filter((d) => !d.isDeleted);
  const deletedDocs = allDocsWithDeleted.filter((d) => d.isDeleted);

  let totalVerified = 0;
  let pendingVerification = 0;
  let favoriteCount = 0;
  let archivedCount = 0;
  let storageUsedBytes = 0;
  let expiringCount = 0;

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  activeDocs.forEach((doc) => {
    if (doc.verificationStatus === "verified") totalVerified++;
    if (doc.verificationStatus === "pending") pendingVerification++;
    if (doc.isFavorite) favoriteCount++;
    if (doc.isArchived) archivedCount++;
    if (doc.fileSize) storageUsedBytes += doc.fileSize;

    if (doc.expiryDate) {
      const expTime = new Date(doc.expiryDate).getTime();
      if (expTime > now && expTime - now <= thirtyDaysMs) {
        expiringCount++;
      }
    }
  });

  // Sort recent uploads by date
  const recentUploads = [...activeDocs].sort((a, b) => {
    const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
    const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
    return tB - tA;
  }).slice(0, 5);

  return {
    totalDocuments: activeDocs.length,
    totalVerified,
    pendingVerification,
    favoriteCount,
    archivedCount,
    recycleBinCount: deletedDocs.length,
    sharedCount: 0, // dynamic from shareService
    expiringCount,
    storageUsedBytes,
    storageQuotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
    recentUploads,
    recentlyViewed: recentUploads.slice(0, 3),
    recentlyDownloaded: [],
  };
};
