import { storage } from "@/integrations/firebase/client";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export const getBackendBaseUrl = (): string => {
  const raw = import.meta.env.VITE_AI_ASSISTANT_URL || "http://localhost:3001";
  return raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/ai-assistant\/?$/, "")
    .replace(/\/+$/, "");
};

/* =========================================================
   INDEXEDDB LOCAL BLOB STORE
   Provides zero-latency local caching and offline resilience
========================================================= */
const DB_NAME = "EduVaultLocalDB";
const STORE_NAME = "vault_blobs";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getIndexedDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

export const storeVaultBlob = async (key: string, blob: Blob): Promise<void> => {
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[EduVault IndexedDB] Failed to cache blob locally:", err);
  }
};

export const getVaultBlob = async (key: string): Promise<Blob | null> => {
  try {
    const db = await getIndexedDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[EduVault IndexedDB] Failed to retrieve blob:", err);
    return null;
  }
};

export const deleteVaultBlob = async (key: string): Promise<void> => {
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[EduVault IndexedDB] Failed to delete blob:", err);
  }
};

/* =========================================================
   UTILITIES
========================================================= */
export const computeFileHash = async (file: File | Blob): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (error) {
    console.warn("[EduVault] Hash computation fallback:", error);
    return `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
};

export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

/* =========================================================
   UPLOAD DOCUMENT FILE (FAST & RESILIENT)
========================================================= */
export const uploadVaultFile = async ({
  userId,
  documentId,
  file,
  onProgress,
}: {
  userId: string;
  documentId: string;
  file: File;
  onProgress?: UploadProgressCallback;
}): Promise<{
  fileUrl: string;
  storagePath: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
}> => {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `eduVault/${userId}/${documentId}/${sanitizedFileName}`;

  // 1. Initial Hash & async background cache (non-blocking)
  onProgress?.(25);
  const fileHashPromise = computeFileHash(file);
  storeVaultBlob(storagePath, file).catch(() => {});
  storeVaultBlob(documentId, file).catch(() => {});

  // 2. Upload directly to Backend Storage Service (http://localhost:3001/api/eduvault/upload)
  // BUG-03 FIX: strip the "data:mime;base64," prefix — Buffer.from(data, 'base64') needs pure base64
  const rawBase64 = await fileToBase64(file);
  const base64Data = rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64;
  onProgress?.(55);

  try {
    const baseUrl = getBackendBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s max timeout

    const res = await fetch(`${baseUrl}/api/eduvault/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        documentId,
        fileName: sanitizedFileName,
        mimeType: file.type || "application/octet-stream",
        fileData: base64Data,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.fileUrl) {
        onProgress?.(85);
        const fileHash = await fileHashPromise;
        return {
          fileUrl: data.fileUrl,
          storagePath: data.storagePath || storagePath,
          fileHash: data.fileHash || fileHash,
          fileSize: data.fileSize || file.size,
          mimeType: data.mimeType || file.type || "application/octet-stream",
        };
      }
    }
    throw new Error(`Backend upload failed with status ${res.status}`);
  } catch (backendErr: any) {
    // BUG-05 FIX: Do NOT save a blob:// ObjectURL to Firestore — it dies on page refresh.
    // Throw so the modal shows an error instead of silently saving an inaccessible URL.
    const msg = backendErr?.name === "AbortError"
      ? "Upload timed out. Please check your network and try again."
      : `Upload failed: ${backendErr?.message || "Backend storage unavailable"}. Ensure the backend server is running on port 3001.`;
    throw new Error(msg);
  }
};

/* =========================================================
   RESOLVE / PREVIEW FILE URL
   Ensures files cached locally or stored on backend can always be read
========================================================= */
export const resolveVaultFileUrl = async (
  fileUrl: string | undefined,
  storagePath?: string,
  documentId?: string
): Promise<string> => {
  if (fileUrl && (fileUrl.startsWith("http://") || fileUrl.startsWith("https://") || fileUrl.startsWith("blob:") || fileUrl.startsWith("data:"))) {
    return fileUrl;
  }

  // Check IndexedDB
  if (storagePath) {
    const blob = await getVaultBlob(storagePath);
    if (blob) return URL.createObjectURL(blob);
  }
  if (documentId) {
    const blob = await getVaultBlob(documentId);
    if (blob) return URL.createObjectURL(blob);
  }

  // BUG-10 FIX: return the original fileUrl (even if empty) rather than ""
  return fileUrl ?? "";
};

/* =========================================================
   DELETE FILE
========================================================= */
export const deleteVaultFile = async (
  storagePath: string,
  userId?: string,
  documentId?: string,
  fileName?: string
): Promise<boolean> => {
  try {
    // 1. Delete from local IndexedDB
    deleteVaultBlob(storagePath).catch(() => {});
    if (documentId) deleteVaultBlob(documentId).catch(() => {});

    // 2. Delete from Backend Storage
    if (userId && documentId && fileName) {
      try {
        const baseUrl = getBackendBaseUrl();
        await fetch(
          `${baseUrl}/api/eduvault/files/${encodeURIComponent(userId)}/${encodeURIComponent(documentId)}/${encodeURIComponent(fileName)}`,
          { method: "DELETE" }
        );
      } catch (e) {
        console.warn("[EduVault] Backend file purge warning:", e);
      }
    }

    // 3. Delete from Firebase Storage if present
    if (storagePath && !storagePath.startsWith("data:") && !storagePath.startsWith("blob:")) {
      try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      } catch {}
    }

    return true;
  } catch (error) {
    console.warn("[EduVault] Storage file deletion warning:", error);
    return false;
  }
};
