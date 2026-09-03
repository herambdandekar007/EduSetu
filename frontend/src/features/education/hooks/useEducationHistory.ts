// frontend/src/features/education/hooks/useEducationHistory.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEducationHistory,
  addEducationHistory,
  updateEducationHistory,
  deleteEducationHistory,
  getStudentSubjects,
  addStudentSubject,
  updateStudentSubject,
  deleteStudentSubject,
  getStudentSkills,
  addStudentSkill,
  deleteStudentSkill,
  getStudentLanguages,
  addStudentLanguage,
  deleteStudentLanguage,
} from "../services/educationService";
import type {
  EducationHistoryItem,
  EducationSubject,
  SkillItem,
  LanguageItem,
} from "../types/education.types";

export const useEducationHistory = () => {
  const { user, profile: authProfile } = useAuth();
  const [history, setHistory] = useState<EducationHistoryItem[]>([]);
  const [subjects, setSubjects] = useState<EducationSubject[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [histData, subData, skData, langData] = await Promise.all([
        getEducationHistory(user.uid),
        getStudentSubjects(user.uid),
        getStudentSkills(user.uid),
        getStudentLanguages(user.uid),
      ]);
      setHistory(histData);
      setSubjects(subData);
      setSkills(skData);
      setLanguages(langData);
    } catch (err) {
      console.error("useEducationHistory load failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load academic records");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // History CRUD
  const addHistoryItem = async (item: Omit<EducationHistoryItem, "id" | "userId" | "eduId">) => {
    if (!user) return;
    const eduId = authProfile?.edu_id || authProfile?.eduId || "EDU-STU-2026";
    const added = await addEducationHistory({ ...item, userId: user.uid, eduId });
    setHistory((prev) => [added, ...prev]);
    return added;
  };

  const updateHistoryItem = async (id: string, updates: Partial<EducationHistoryItem>) => {
    await updateEducationHistory(id, updates);
    setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const removeHistoryItem = async (id: string) => {
    await deleteEducationHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  // Subjects CRUD
  const addSubject = async (subject: Omit<EducationSubject, "id" | "userId" | "eduId">) => {
    if (!user) return;
    const eduId = authProfile?.edu_id || authProfile?.eduId || "EDU-STU-2026";
    const added = await addStudentSubject({ ...subject, userId: user.uid, eduId });
    setSubjects((prev) => [...prev, added]);
    return added;
  };

  const updateSubject = async (id: string, updates: Partial<EducationSubject>) => {
    await updateStudentSubject(id, updates);
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSubject = async (id: string) => {
    await deleteStudentSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Skills CRUD
  const addSkill = async (skill: Omit<SkillItem, "id" | "userId" | "eduId">) => {
    if (!user) return;
    const eduId = authProfile?.edu_id || authProfile?.eduId || "EDU-STU-2026";
    const added = await addStudentSkill({ ...skill, userId: user.uid, eduId });
    setSkills((prev) => [...prev, added]);
    return added;
  };

  const removeSkill = async (id: string) => {
    await deleteStudentSkill(id);
    setSkills((prev) => prev.filter((sk) => sk.id !== id));
  };

  // Languages CRUD
  const addLanguage = async (lang: Omit<LanguageItem, "id" | "userId" | "eduId">) => {
    if (!user) return;
    const eduId = authProfile?.edu_id || authProfile?.eduId || "EDU-STU-2026";
    const added = await addStudentLanguage({ ...lang, userId: user.uid, eduId });
    setLanguages((prev) => [...prev, added]);
    return added;
  };

  const removeLanguage = async (id: string) => {
    await deleteStudentLanguage(id);
    setLanguages((prev) => prev.filter((lg) => lg.id !== id));
  };

  return {
    history,
    subjects,
    skills,
    languages,
    loading,
    error,
    addHistoryItem,
    updateHistoryItem,
    removeHistoryItem,
    addSubject,
    updateSubject,
    removeSubject,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    refresh: loadAllData,
  };
};
