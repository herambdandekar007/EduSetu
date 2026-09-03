// frontend/src/features/profile/hooks/useProfile.ts
// Comprehensive React Hook for Monochromatic Profile Management

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import {
  getStudentProfile,
  saveStudentProfile,
  getEducationProfile,
  saveEducationProfile,
  getEducationTimeline,
  saveEducationTimelineItem,
  deleteEducationTimelineItem,
  getUserSkills,
  saveSkillItem,
  deleteSkillItem,
  getUserLanguages,
  saveUserLanguage,
  deleteUserLanguage,
  getUserPortfolio,
  savePortfolioItem,
  deletePortfolioItem,
  getAccessibilityProfile,
  saveAccessibilityProfile,
  calculateProfileCompletion,
} from "../services/profileService";
import type {
  StudentPersonalProfile,
  EducationDetails,
  EducationTimelineItem,
  SkillItem,
  UserLanguage,
  PortfolioItem,
  AccessibilityProfileSettings,
  ProfileCompletionSummary,
} from "../types/profile.types";
import { toast } from "sonner";

export function useProfile() {
  const { user, loading: authLoading, profile: authProfile, refreshProfile: refreshAuthProfile } = useAuth();
  const { update: updateA11yContext } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core Data States
  const [personalProfile, setPersonalProfile] = useState<StudentPersonalProfile | null>(null);
  const [educationProfile, setEducationProfile] = useState<EducationDetails | null>(null);
  const [timeline, setTimeline] = useState<EducationTimelineItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilityProfileSettings | null>(null);

  // Load all profile submodules
  const loadProfileData = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    try {
      const activeUid = user?.uid || "guest_student";
      const [profileData, a11yData, timelineData, skillsData, languagesData, portfolioData] =
        await Promise.all([
          getStudentProfile(activeUid, user?.email || undefined, user?.displayName || undefined),
          getAccessibilityProfile(activeUid),
          getEducationTimeline(activeUid),
          getUserSkills(activeUid),
          getUserLanguages(activeUid),
          getUserPortfolio(activeUid),
        ]);

      setPersonalProfile(profileData);
      setAccessibility(a11yData);
      setTimeline(timelineData);
      setSkills(skillsData);
      setLanguages(languagesData);
      setPortfolio(portfolioData);

      const eduData = await getEducationProfile(profileData.eduId || "", activeUid);
      setEducationProfile(eduData);

      // Compute and synchronize true initial completion score
      const trueCompletion = calculateProfileCompletion(
        profileData,
        eduData,
        skillsData,
        languagesData,
        portfolioData
      );

      if (profileData.profileCompletion !== trueCompletion.overallPercentage && activeUid !== "guest_student") {
        setPersonalProfile((prev) => prev ? { ...prev, profileCompletion: trueCompletion.overallPercentage, profileCompleted: trueCompletion.isComplete } : prev);
        await saveStudentProfile(activeUid, {
          profileCompletion: trueCompletion.overallPercentage,
          profileCompleted: trueCompletion.isComplete,
        });
        if (refreshAuthProfile) await refreshAuthProfile();
      }
    } catch (err) {
      console.error("Profile load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.uid, user?.email, user?.displayName]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Profile completion calculation
  const completionSummary: ProfileCompletionSummary = useMemo(() => {
    if (!personalProfile || !educationProfile) {
      return {
        overallPercentage: 0,
        isComplete: false,
        sections: [],
        recommendations: ["Complete your personal and educational profile."],
      };
    }
    return calculateProfileCompletion(
      personalProfile,
      educationProfile,
      skills,
      languages,
      portfolio
    );
  }, [personalProfile, educationProfile, skills, languages, portfolio]);

  // 1. Update Personal Profile
  const updatePersonalProfile = async (data: Partial<StudentPersonalProfile>) => {
    if (!personalProfile) return;
    setSaving(true);
    try {
      const sanitizedData = { ...data };
      if (sanitizedData.age !== undefined && (isNaN(Number(sanitizedData.age)) || Number(sanitizedData.age) <= 0)) {
        delete sanitizedData.age;
      }
      const updated = { ...personalProfile, ...sanitizedData, updatedAt: new Date().toISOString() };
      
      const newSummary = calculateProfileCompletion(
        updated,
        educationProfile || { eduId: updated.eduId || "", userId: updated.userId || "", educationLevel: "", institutionName: "" },
        skills,
        languages,
        portfolio
      );
      updated.profileCompletion = newSummary.overallPercentage;
      updated.profileCompleted = newSummary.isComplete;

      setPersonalProfile(updated);
      const activeUid = user?.uid || "guest_student";
      await saveStudentProfile(activeUid, updated);
      if (refreshAuthProfile) await refreshAuthProfile();
      toast.success("Profile saved successfully.");
    } catch (e) {
      console.error("Failed to save personal profile:", e);
      toast.error("Could not save personal profile.");
    } finally {
      setSaving(false);
    }
  };

  // 2. Update Education Profile
  const updateEducation = async (data: Partial<EducationDetails>) => {
    if (!educationProfile || !personalProfile) return;
    setSaving(true);
    try {
      const updated = { ...educationProfile, ...data, updatedAt: new Date().toISOString() };
      setEducationProfile(updated);

      const newSummary = calculateProfileCompletion(
        personalProfile,
        updated,
        skills,
        languages,
        portfolio
      );

      const activeUid = user?.uid || "guest_student";
      await saveEducationProfile(personalProfile.eduId || "", activeUid, updated);
      await saveStudentProfile(activeUid, {
        educationLevel: updated.educationLevel,
        profileCompletion: newSummary.overallPercentage,
        profileCompleted: newSummary.isComplete,
      });
      if (refreshAuthProfile) await refreshAuthProfile();
      toast.success("Education profile updated successfully.");
    } catch (e) {
      console.error("Failed to update education:", e);
      toast.error("Could not update education details.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Education Timeline CRUD
  const addTimelineEntry = async (entry: Omit<EducationTimelineItem, "id">) => {
    setSaving(true);
    try {
      const activeUid = user?.uid || "guest_student";
      const id = await saveEducationTimelineItem(activeUid, entry);
      const newItem: EducationTimelineItem = { ...entry, id, userId: activeUid };
      setTimeline((prev) => [newItem, ...prev]);
      toast.success("Education timeline updated.");
    } catch (e) {
      toast.error("Failed to add timeline entry.");
    } finally {
      setSaving(false);
    }
  };

  const removeTimelineEntry = async (id: string) => {
    try {
      await deleteEducationTimelineItem(id);
      setTimeline((prev) => prev.filter((t) => t.id !== id));
      toast.success("Timeline milestone removed.");
    } catch (e) {
      toast.error("Failed to remove milestone.");
    }
  };

  // 4. Skills CRUD
  const addOrUpdateSkill = async (skill: Omit<SkillItem, "id"> & { id?: string }) => {
    setSaving(true);
    try {
      const activeUid = user?.uid || "guest_student";
      const id = await saveSkillItem(activeUid, skill);
      const saved: SkillItem = { ...skill, id, userId: activeUid };
      setSkills((prev) => {
        const existing = prev.findIndex((s) => s.id === id || s.name.toLowerCase() === skill.name.toLowerCase());
        if (existing >= 0) {
          const clone = [...prev];
          clone[existing] = saved;
          return clone;
        }
        return [...prev, saved];
      });
      toast.success(`Skill "${skill.name}" saved.`);
    } catch (e) {
      toast.error("Could not save skill.");
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const activeUid = user?.uid || "guest_student";
      await deleteSkillItem(activeUid, skillId);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
      toast.success("Skill removed.");
    } catch (e) {
      toast.error("Failed to remove skill.");
    }
  };

  // 5. Languages CRUD
  const addOrUpdateLanguage = async (language: Omit<UserLanguage, "id"> & { id?: string }) => {
    setSaving(true);
    try {
      const activeUid = user?.uid || "guest_student";
      const id = await saveUserLanguage(activeUid, language);
      const saved: UserLanguage = { ...language, id, userId: activeUid };
      setLanguages((prev) => {
        const existing = prev.findIndex((l) => l.id === id || l.name.toLowerCase() === language.name.toLowerCase());
        if (existing >= 0) {
          const clone = [...prev];
          clone[existing] = saved;
          return clone;
        }
        return [...prev, saved];
      });
      toast.success(`Language "${language.name}" saved.`);
    } catch (e) {
      toast.error("Could not save language.");
    } finally {
      setSaving(false);
    }
  };

  const removeLanguage = async (langId: string) => {
    try {
      await deleteUserLanguage(langId);
      setLanguages((prev) => prev.filter((l) => l.id !== langId));
      toast.success("Language removed.");
    } catch (e) {
      toast.error("Failed to remove language.");
    }
  };

  // 6. Portfolio CRUD
  const addOrUpdatePortfolio = async (item: Omit<PortfolioItem, "id"> & { id?: string }) => {
    setSaving(true);
    try {
      const activeUid = user?.uid || "guest_student";
      const id = await savePortfolioItem(activeUid, item);
      const saved: PortfolioItem = { ...item, id, userId: activeUid };
      setPortfolio((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = saved;
          return clone;
        }
        return [saved, ...prev];
      });
      toast.success("Portfolio item saved.");
    } catch (e) {
      toast.error("Could not save portfolio item.");
    } finally {
      setSaving(false);
    }
  };

  const removePortfolio = async (itemId: string) => {
    try {
      await deletePortfolioItem(itemId);
      setPortfolio((prev) => prev.filter((p) => p.id !== itemId));
      toast.success("Portfolio item removed.");
    } catch (e) {
      toast.error("Failed to delete item.");
    }
  };

  // 7. Accessibility Settings
  const updateAccessibility = async (settings: Partial<AccessibilityProfileSettings>) => {
    if (!accessibility) return;
    setSaving(true);
    try {
      const updated = { ...accessibility, ...settings };
      setAccessibility(updated);
      const activeUid = user?.uid || "guest_student";
      await saveAccessibilityProfile(activeUid, settings);
      updateA11yContext({
        highContrast: settings.highContrast,
        textSize: settings.largeText ? "large" : "normal",
        dyslexiaFont: settings.dyslexiaFont,
        ttsEnabled: settings.textToSpeech,
        focusIndicators: settings.focusIndicators,
        readingGuide: settings.readingGuide,
      });
      toast.success("Accessibility preferences saved.");
    } catch (e) {
      toast.error("Failed to save accessibility settings.");
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    authLoading,
    loading,
    saving,
    personalProfile,
    educationProfile,
    timeline,
    skills,
    languages,
    portfolio,
    accessibility,
    completionSummary,
    reloadProfile: loadProfileData,
    updatePersonalProfile,
    updateEducation,
    addTimelineEntry,
    removeTimelineEntry,
    addOrUpdateSkill,
    removeSkill,
    addOrUpdateLanguage,
    removeLanguage,
    addOrUpdatePortfolio,
    removePortfolio,
    updateAccessibility,
  };
}
