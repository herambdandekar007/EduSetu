export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type DocumentPermission = "VIEW" | "VIEW_DOWNLOAD";

export type ActivityActionType =
  | "UPLOAD"
  | "VIEW"
  | "DOWNLOAD"
  | "SHARE"
  | "EDIT"
  | "RENAME"
  | "ARCHIVE"
  | "RESTORE"
  | "DELETE"
  | "PERMANENT_DELETE"
  | "VERIFY"
  | "ACCESS_GRANTED"
  | "ACCESS_REVOKED"
  | "INTELLIGENCE_PROCESSED";

export interface DocumentIntelligence {
  summary?: string;
  classification?: {
    suggestedCategory?: string;
    suggestedType?: string;
    confidence?: number;
  };
  extractedData?: {
    documentNumber?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    institution?: string | null;
    scoreOrGrade?: string | null;
    recipientName?: string | null;
  };
  tags?: string[];
  securityAnalysis?: {
    fraudRisk?: "LOW" | "MEDIUM" | "HIGH";
    notes?: string;
    tamperFlags?: string[];
  };
  ocrText?: string;
  processedAt?: string;
}

export interface VaultDocument {
  id: string;
  userId: string;
  eduId?: string | null;

  documentName: string;
  category: string;
  type: string;

  institution?: string | null;
  academicYear?: string | null;

  issueDate?: string | null;
  expiryDate?: string | null;

  documentNumber?: string | null;
  description?: string | null;

  fileName: string;
  fileUrl: string;
  storagePath: string;

  mimeType: string;
  fileSize: number;

  verificationStatus: VerificationStatus;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationRemarks?: string | null;

  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;

  tags: string[];

  fileHash?: string | null;
  hashAlgorithm?: string | null;

  intelligence?: DocumentIntelligence;
  versionCount?: number;

  createdAt: any;
  updatedAt: any;
}

export interface DocumentActivity {
  id: string;
  userId: string;
  documentId?: string;
  documentName?: string;
  action: ActivityActionType;
  timestamp: any;
  deviceInfo?: string;
  ipInfo?: string;
  metadata?: Record<string, any>;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  documentName?: string;
  ownerId: string;
  ownerName?: string;
  recipientId?: string;
  recipientEmail?: string;
  permission: DocumentPermission;
  accessToken: string;
  expiresAt?: string | null;
  passwordProtected: boolean;
  passwordHash?: string;
  otpRequired: boolean;
  otpCode?: string;
  isActive: boolean;
  accessCount?: number;
  lastAccessedAt?: string;
  createdAt: any;
}

export interface VerificationRequest {
  id: string;
  documentId: string;
  documentName: string;
  studentId: string;
  studentName?: string;
  eduId?: string;
  institutionId?: string;
  institutionName: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  requestedAt: any;
  verifiedAt?: any;
  verifiedBy?: string;
  remarks?: string;
}

export interface VaultNotification {
  id: string;
  userId: string;
  type:
    | "UPLOAD_SUCCESS"
    | "VERIFICATION_COMPLETED"
    | "VERIFICATION_FAILED"
    | "DOCUMENT_VIEWED"
    | "DOCUMENT_DOWNLOADED"
    | "DOCUMENT_SHARED"
    | "ACCESS_REQUEST"
    | "ACCESS_EXPIRING"
    | "DOCUMENT_EXPIRING"
    | "SECURITY_ALERT";
  title: string;
  message: string;
  relatedDocumentId?: string;
  isRead: boolean;
  createdAt: any;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileSize: number;
  modifiedBy: string;
  createdAt: any;
  changeDescription?: string;
}

export interface VaultSettings {
  userId: string;
  storageQuotaBytes: number;
  defaultShareExpiryDays: number;
  requirePasswordByDefault: boolean;
  requireOtpByDefault: boolean;
  autoAiIntelligence: boolean;
  emailNotifications: boolean;
  activityLogging: boolean;
  twoFactorAuthEnabled: boolean;
  updatedAt: any;
}

export interface VaultStats {
  totalDocuments: number;
  totalVerified: number;
  pendingVerification: number;
  favoriteCount: number;
  archivedCount: number;
  recycleBinCount: number;
  sharedCount: number;
  expiringCount: number;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  recentUploads: VaultDocument[];
  recentlyViewed: VaultDocument[];
  recentlyDownloaded: VaultDocument[];
}
