import { db } from "@/integrations/firebase/client";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { VerificationRequest, VerificationStatus } from "../types/eduvault.types";
import { updateVaultDocument } from "./documentService";
import { logDocumentActivity } from "./activityService";
import { sendVaultNotification } from "./notificationService";

const VERIFICATION_COLLECTION = "verificationRequests";

export const requestDocumentVerification = async ({
  documentId,
  documentName,
  studentId,
  studentName,
  eduId,
  institutionName,
  institutionId,
}: {
  documentId: string;
  documentName: string;
  studentId: string;
  studentName?: string;
  eduId?: string;
  institutionName: string;
  institutionId?: string;
}): Promise<VerificationRequest> => {
  const reqRef = doc(collection(db, VERIFICATION_COLLECTION));
  const id = reqRef.id;

  const requestData: VerificationRequest = {
    id,
    documentId,
    documentName,
    studentId,
    studentName: studentName || "Student",
    eduId: eduId || "",
    institutionName,
    institutionId: institutionId || "",
    status: "PENDING",
    requestedAt: serverTimestamp(),
  };

  await setDoc(reqRef, requestData);

  // Update document status to pending
  await updateVaultDocument(documentId, studentId, {
    verificationStatus: "pending",
  });

  // Log activity
  await logDocumentActivity({
    userId: studentId,
    documentId,
    documentName,
    action: "VERIFY",
    metadata: {
      institutionName,
      status: "PENDING",
      requestId: id,
    },
  });

  await sendVaultNotification({
    userId: studentId,
    type: "ACCESS_REQUEST",
    title: "Verification Request Submitted",
    message: `Verification request for "${documentName}" sent to ${institutionName}.`,
    relatedDocumentId: documentId,
  });

  return requestData;
};

export const getVerificationRequestsByStudent = async (
  studentId: string
): Promise<VerificationRequest[]> => {
  if (!studentId) return [];
  try {
    const q = query(
      collection(db, VERIFICATION_COLLECTION),
      where("studentId", "==", studentId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as VerificationRequest[];
  } catch (error) {
    console.error("[EduVault] Error fetching verification requests:", error);
    return [];
  }
};

/**
 * Institutional approval/rejection handler (for verifier/officer role or demo simulation)
 */
export const updateVerificationStatus = async ({
  requestId,
  documentId,
  studentId,
  status,
  verifiedBy,
  remarks,
}: {
  requestId: string;
  documentId: string;
  studentId: string;
  status: "VERIFIED" | "REJECTED";
  verifiedBy: string;
  remarks?: string;
}): Promise<void> => {
  try {
    const reqRef = doc(db, VERIFICATION_COLLECTION, requestId);
    await updateDoc(reqRef, {
      status,
      verifiedBy,
      remarks: remarks || "",
      verifiedAt: serverTimestamp(),
    });

    const docVerificationStatus: VerificationStatus = status === "VERIFIED" ? "verified" : "rejected";

    await updateVaultDocument(documentId, studentId, {
      verificationStatus: docVerificationStatus,
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      verificationRemarks: remarks || "",
    });

    await logDocumentActivity({
      userId: studentId,
      documentId,
      action: "VERIFY",
      metadata: {
        status,
        verifiedBy,
        remarks,
      },
    });

    await sendVaultNotification({
      userId: studentId,
      type: status === "VERIFIED" ? "VERIFICATION_COMPLETED" : "VERIFICATION_FAILED",
      title: status === "VERIFIED" ? "Document Verified! 🎉" : "Verification Rejected",
      message:
        status === "VERIFIED"
          ? `Your document has been officially verified by ${verifiedBy}.`
          : `Verification request was rejected. Remarks: ${remarks || "No remarks"}`,
      relatedDocumentId: documentId,
    });
  } catch (error) {
    console.error("[EduVault] Error updating verification status:", error);
    throw error;
  }
};
