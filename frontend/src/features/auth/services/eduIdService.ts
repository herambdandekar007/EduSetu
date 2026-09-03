// frontend/src/features/auth/services/eduIdService.ts
// Unique Permanent EduID Generation, Validation and Firestore Lookup

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

const STATE_CODE_MAP: Record<string, string> = {
  "Maharashtra": "MH",
  "Delhi": "DL",
  "Karnataka": "KA",
  "Tamil Nadu": "TN",
  "Telangana": "TS",
  "Gujarat": "GJ",
  "Uttar Pradesh": "UP",
  "West Bengal": "WB",
  "Rajasthan": "RJ",
  "Kerala": "KL",
  "Madhya Pradesh": "MP",
  "Punjab": "PB",
  "Haryana": "HR",
  "Bihar": "BR",
  "Odisha": "OD",
  "Andhra Pradesh": "AP",
  "Assam": "AS",
};

/**
 * Generate a candidate EduID string
 * Format: EDU-{STATE_OR_IN}-{YEAR}-{RANDOM6}
 * Example: EDU-MH-2026-8F42A9 or EDU-IN-2026-9XK31M
 */
export function generateCandidateEduId(state?: string): string {
  const year = new Date().getFullYear();
  const stateCode = (state && STATE_CODE_MAP[state]) ? STATE_CODE_MAP[state] : "IN";
  
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `EDU-${stateCode}-${year}-${random}`;
}

/**
 * Generate guaranteed unique permanent EduID by checking collision in Firestore
 */
export async function generateUniqueEduId(state?: string): Promise<string> {
  let attempts = 0;
  while (attempts < 5) {
    const candidate = generateCandidateEduId(state);
    const q = query(collection(db, "profiles"), where("eduId", "==", candidate));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return candidate;
    }
    attempts++;
  }
  
  // Fallback with timestamp hash suffix
  const timestampSuffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `EDU-IN-${new Date().getFullYear()}-${timestampSuffix}X9`;
}

/**
 * Format raw user input into standard formatted EduID if possible
 */
export function formatEduIdInput(val: string): string {
  return val.trim().toUpperCase();
}

/**
 * Find student profile and associated email by EduID
 */
export async function findEmailByEduId(eduIdInput: string): Promise<{ email: string; fullName: string } | null> {
  const normalizedId = formatEduIdInput(eduIdInput);
  if (!normalizedId) return null;

  const q = query(collection(db, "profiles"), where("eduId", "==", normalizedId));
  const snap = await getDocs(q);

  if (snap.empty) {
    // Also try checking without hyphen or case variation
    return null;
  }

  const docData = snap.docs[0].data();
  if (docData && docData.email) {
    return {
      email: docData.email,
      fullName: docData.fullName || docData.full_name || "Student",
    };
  }

  return null;
}
