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
const LOCAL_VAULT_PREFIX = "eduvault_local_docs_";

/* =========================================================
   LOCAL PERSISTENCE HELPERS
========================================================= */
const getLocalDocs = (userId: string): VaultDocument[] => {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`${LOCAL_VAULT_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalDocs = (userId: string, docs: VaultDocument[]): void => {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${LOCAL_VAULT_PREFIX}${userId}`, JSON.stringify(docs));
  } catch (e) {
    console.warn("[EduVault] Local docs cache warning:", e);
  }
};

const upsertLocalDoc = (userId: string, newDoc: VaultDocument): void => {
  const docs = getLocalDocs(userId);
  const idx = docs.findIndex((d) => d.id === newDoc.id);
  if (idx >= 0) {
    docs[idx] = newDoc;
  } else {
    docs.unshift(newDoc);
  }
  saveLocalDocs(userId, docs);
};

const removeLocalDoc = (userId: string, documentId: string): void => {
  const docs = getLocalDocs(userId);
  saveLocalDocs(userId, docs.filter((d) => d.id !== documentId));
};

/**
 * Creates a new document record in Firestore and local backup
 */
export const createVaultDocument = async (
  documentData: Omit<VaultDocument, "id" | "createdAt" | "updatedAt">
): Promise<VaultDocument> => {
  const docRef = doc(collection(db, DOCUMENTS_COLLECTION));
  const id = docRef.id;

  const newDoc: VaultDocument = {
    ...documentData,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately store in local cache so UI is responsive and resilient
  upsertLocalDoc(documentData.userId, newDoc);

  // 2. Persist to Firestore
  try {
    await setDoc(docRef, {
      ...newDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (fsErr) {
    console.warn("[EduVault] Firestore document write warning (cached locally):", fsErr);
  }

  // 3. Record version 1
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

  // 4. Audit activity
  try {
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
  } catch (activityErr) {
    console.warn("[EduVault] Activity logging warning:", activityErr);
  }

  // 5. Vault notification
  try {
    await sendVaultNotification({
      userId: documentData.userId,
      type: "UPLOAD_SUCCESS",
      title: "Document Uploaded Successfully",
      message: `"${documentData.documentName}" has been safely encrypted and saved to your EduVault.`,
      relatedDocumentId: id,
    });
  } catch (notifErr) {
    console.warn("[EduVault] Notification warning:", notifErr);
  }

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

  const localDocs = getLocalDocs(userId);

  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const firestoreDocs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as VaultDocument;
    });

    // Merge: prioritize Firestore docs, incorporate any local-only docs
    const mergedMap = new Map<string, VaultDocument>();
    localDocs.forEach((d) => mergedMap.set(d.id, d));
    firestoreDocs.forEach((d) => mergedMap.set(d.id, { ...(mergedMap.get(d.id) || {}), ...d }));

    const merged = Array.from(mergedMap.values());
    saveLocalDocs(userId, merged);

    if (includeDeleted) {
      return merged;
    }
    return merged.filter((d) => !d.isDeleted);
  } catch (error) {
    console.warn("[EduVault] Firestore read failed, using cached local documents:", error);
    if (includeDeleted) {
      return localDocs;
    }
    return localDocs.filter((d) => !d.isDeleted);
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

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as VaultDocument;
    }
  } catch (error) {
    console.warn("[EduVault] Error fetching document from Firestore:", error);
  }

  // Fallback to local storage
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_VAULT_PREFIX)) {
        try {
          const docs: VaultDocument[] = JSON.parse(localStorage.getItem(key) || "[]");
          const found = docs.find((d) => d.id === documentId);
          if (found) return found;
        } catch {}
      }
    }
  }

  return null;
};

/**
 * Update document metadata
 */
export const updateVaultDocument = async (
  documentId: string,
  userId: string,
  updates: Partial<VaultDocument>
): Promise<void> => {
  // Update local cache
  const localDocs = getLocalDocs(userId);
  const updatedLocal = localDocs.map((d) =>
    d.id === documentId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
  );
  saveLocalDocs(userId, updatedLocal);

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
    console.warn("[EduVault] Error updating document in Firestore:", error);
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
  await updateVaultDocument(documentId, userId, { isFavorite: !currentFavorite });
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
  const nextState = !currentArchived;
  await updateVaultDocument(documentId, userId, { isArchived: nextState });

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
  await updateVaultDocument(documentId, userId, {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    deletedBy: userId,
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
  await updateVaultDocument(documentId, userId, {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
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
  documentName?: string,
  fileName?: string
): Promise<void> => {
  // 1. Remove from local cache
  removeLocalDoc(userId, documentId);

  // 2. Delete physical storage file
  if (storagePath) {
    await deleteVaultFile(storagePath, userId, documentId, fileName);
  }

  // 3. Delete Firestore doc
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("[EduVault] Firestore permanent delete warning:", error);
  }

  // 4. Log activity
  try {
    await logDocumentActivity({
      userId,
      documentId,
      documentName: documentName || "Deleted Document",
      action: "PERMANENT_DELETE",
      metadata: { storagePath },
    });
  } catch (activityErr) {
    console.warn("[EduVault] Activity logging warning:", activityErr);
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
    const tA = (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : new Date(a.createdAt || 0).getTime();
    const tB = (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : new Date(b.createdAt || 0).getTime();
    return tB - tA;
  }).slice(0, 5);

  return {
    totalDocuments: activeDocs.length,
    totalVerified,
    pendingVerification,
    favoriteCount,
    archivedCount,
    recycleBinCount: deletedDocs.length,
    sharedCount: 0,
    expiringCount,
    storageUsedBytes,
    storageQuotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
    recentUploads,
    recentlyViewed: recentUploads.slice(0, 3),
    recentlyDownloaded: [],
  };
};
