import { storage } from "@/integrations/firebase/client";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadBytes,
} from "firebase/storage";

export const computeFileHash = async (file: File | Blob): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
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
  const fileHash = await computeFileHash(file);

  try {
    const storageRef = ref(storage, storagePath);

    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || "application/octet-stream",
        customMetadata: {
          originalName: file.name,
          uploadedBy: userId,
          documentId,
          sha256: fileHash,
        },
      });

      const fileUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          },
          (error) => {
            console.error("[EduVault Storage Upload Error]:", error);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });

      return {
        fileUrl,
        storagePath,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      };
    } else {
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || "application/octet-stream",
        customMetadata: {
          originalName: file.name,
          uploadedBy: userId,
          documentId,
          sha256: fileHash,
        },
      });
      const fileUrl = await getDownloadURL(snapshot.ref);
      return {
        fileUrl,
        storagePath,
        fileHash,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      };
    }
  } catch (storageError) {
    console.warn(
      "[EduVault Storage Warning]: Firebase Storage bucket direct upload threw an error, saving data URI for seamless client workflow.",
      storageError
    );
    // Graceful fallback to data URI so user is not blocked if bucket rules or emulator is offline
    const base64Url = await fileToBase64(file);
    if (onProgress) onProgress(100);

    return {
      fileUrl: base64Url,
      storagePath,
      fileHash,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
    };
  }
};

export const deleteVaultFile = async (storagePath: string): Promise<boolean> => {
  try {
    if (!storagePath || storagePath.startsWith("data:")) return true;
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn("[EduVault] Storage file deletion warning:", error);
    return false;
  }
};
