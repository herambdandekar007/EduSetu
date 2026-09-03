import { db } from "@/integrations/firebase/client";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { VaultSettings } from "../types/eduvault.types";
import { DEFAULT_STORAGE_QUOTA_BYTES } from "../constants/categories";

const SETTINGS_COLLECTION = "vaultSettings";

export const getDefaultSettings = (userId: string): VaultSettings => ({
  userId,
  storageQuotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
  defaultShareExpiryDays: 7,
  requirePasswordByDefault: false,
  requireOtpByDefault: false,
  autoAiIntelligence: true,
  emailNotifications: true,
  activityLogging: true,
  twoFactorAuthEnabled: false,
  updatedAt: new Date().toISOString(),
});

export const getVaultSettings = async (userId: string): Promise<VaultSettings> => {
  if (!userId) return getDefaultSettings("");

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as unknown as VaultSettings;
    }
    const defaults = getDefaultSettings(userId);
    await setDoc(docRef, {
      ...defaults,
      updatedAt: serverTimestamp(),
    });
    return defaults;
  } catch (error) {
    console.warn("[EduVault] Settings fetch error:", error);
    return getDefaultSettings(userId);
  }
};

export const updateVaultSettings = async (
  userId: string,
  settings: Partial<VaultSettings>
): Promise<void> => {
  if (!userId) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, userId);
    await setDoc(
      docRef,
      {
        ...settings,
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("[EduVault] Settings save error:", error);
    throw error;
  }
};
