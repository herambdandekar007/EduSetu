// frontend/src/features/education/hooks/useEducationProfile.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEducationProfile,
  saveEducationProfile,
  calculateProfileCompletion,
} from "../services/educationService";
import type { EducationProfile } from "../types/education.types";

export const useEducationProfile = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<EducationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getEducationProfile(user.uid, authProfile?.edu_id || authProfile?.eduId);
      setProfile(data);
    } catch (err) {
      console.error("useEducationProfile load failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load education profile");
    } finally {
      setLoading(false);
    }
  }, [user, authProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (updates: Partial<EducationProfile>) => {
    if (!user) throw new Error("User not authenticated");
    setSaving(true);
    setError(null);
    try {
      const merged = { ...profile, ...updates, userId: user.uid };
      const saved = await saveEducationProfile(merged);
      setProfile(saved);
      return saved;
    } catch (err) {
      console.error("useEducationProfile save failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to save education profile";
      setError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const completion = calculateProfileCompletion(profile);

  return {
    profile,
    loading,
    saving,
    error,
    completion,
    updateProfile,
    refresh: loadProfile,
  };
};
