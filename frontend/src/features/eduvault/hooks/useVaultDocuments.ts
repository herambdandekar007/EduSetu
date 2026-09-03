import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserDocuments,
  toggleFavoriteDocument,
  toggleArchiveDocument,
  softDeleteDocument,
  restoreDocument,
  permanentDeleteDocument,
  updateVaultDocument,
} from "../services/documentService";
import type { VaultDocument } from "../types/eduvault.types";
import { toast } from "sonner";

export const useVaultDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [allDocumentsWithDeleted, setAllDocumentsWithDeleted] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user?.uid) {
      setDocuments([]);
      setAllDocumentsWithDeleted([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const all = await getUserDocuments(user.uid, true);
      setAllDocumentsWithDeleted(all);
      setDocuments(all.filter((d) => !d.isDeleted));
    } catch (err: any) {
      console.error("[useVaultDocuments] Fetch error:", err);
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleToggleFavorite = async (doc: VaultDocument) => {
    if (!user?.uid) return;
    try {
      await toggleFavoriteDocument(doc.id, user.uid, doc.isFavorite);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isFavorite: !d.isFavorite } : d))
      );
      toast.success(doc.isFavorite ? "Removed from Favorites" : "Marked as Favorite ⭐");
    } catch (err: any) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleToggleArchive = async (doc: VaultDocument) => {
    if (!user?.uid) return;
    try {
      await toggleArchiveDocument(doc.id, user.uid, doc.isArchived, doc.documentName);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isArchived: !d.isArchived } : d))
      );
      toast.success(doc.isArchived ? "Unarchived Document" : "Archived Document 📦");
    } catch (err: any) {
      toast.error("Failed to archive document");
    }
  };

  const handleSoftDelete = async (doc: VaultDocument) => {
    if (!user?.uid) return;
    try {
      await softDeleteDocument(doc.id, user.uid, doc.documentName);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setAllDocumentsWithDeleted((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isDeleted: true, deletedAt: new Date().toISOString() } : d))
      );
      toast.success("Document moved to Recycle Bin 🗑️");
    } catch (err: any) {
      toast.error("Failed to delete document");
    }
  };

  const handleRestore = async (doc: VaultDocument) => {
    if (!user?.uid) return;
    try {
      await restoreDocument(doc.id, user.uid, doc.documentName);
      setAllDocumentsWithDeleted((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isDeleted: false, deletedAt: null } : d))
      );
      setDocuments((prev) => [...prev, { ...doc, isDeleted: false, deletedAt: null }]);
      toast.success("Document restored to vault! ♻️");
    } catch (err: any) {
      toast.error("Failed to restore document");
    }
  };

  const handlePermanentDelete = async (doc: VaultDocument) => {
    if (!user?.uid) return;
    try {
      await permanentDeleteDocument(doc.id, user.uid, doc.storagePath, doc.documentName);
      setAllDocumentsWithDeleted((prev) => prev.filter((d) => d.id !== doc.id));
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document permanently deleted");
    } catch (err: any) {
      toast.error("Failed to permanently delete document");
    }
  };

  const handleUpdateMetadata = async (documentId: string, updates: Partial<VaultDocument>) => {
    if (!user?.uid) return;
    try {
      await updateVaultDocument(documentId, user.uid, updates);
      setDocuments((prev) =>
        prev.map((d) => (d.id === documentId ? { ...d, ...updates } : d))
      );
      toast.success("Document details updated");
    } catch (err: any) {
      toast.error("Failed to update document");
    }
  };

  return {
    documents,
    allDocumentsWithDeleted,
    deletedDocuments: allDocumentsWithDeleted.filter((d) => d.isDeleted),
    loading,
    error,
    refresh: fetchDocuments,
    toggleFavorite: handleToggleFavorite,
    toggleArchive: handleToggleArchive,
    softDelete: handleSoftDelete,
    restore: handleRestore,
    permanentDelete: handlePermanentDelete,
    updateMetadata: handleUpdateMetadata,
  };
};
