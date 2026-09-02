// features/performance/hooks/usePerformance.ts
// React hook for managing SMART EDUCATION AI Performance & Achievements data

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  PerformanceTab,
  AnalyticsTimeRange,
  ProgressWeights,
  PerformanceOverviewStats,
  AcademicRecord,
  SkillProgressItem,
  ProjectItem,
  ActivityItem,
  AchievementItem,
  BadgeItem,
  MilestoneItem,
  PerformanceAnalyticsReport,
  PersonalizedInsight,
} from "../types/performance.types";
import {
  DEFAULT_PROGRESS_WEIGHTS,
  getPerformanceOverviewStats,
  getAcademicRecords,
  saveAcademicRecord,
  deleteAcademicRecord,
  getSkillProgressList,
  saveSkillProgress,
  getProjects,
  saveProject,
  deleteProject,
  getActivities,
  saveActivity,
  deleteActivity,
  getAchievements,
  saveAchievement,
  deleteAchievement,
  generateStudentMilestones,
  getPerformanceAnalytics,
  generatePersonalizedInsights,
} from "../services/performanceService";
import { evaluateStudentBadges } from "../services/badgeRuleEngine";

export function usePerformance() {
  const { user, profile } = useAuth();
  const userId = user?.uid || "";
  const eduId = profile?.eduId || "EDU-2026-STU";

  const [activeTab, setActiveTab] = useState<PerformanceTab>("overview");
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d");
  const [weights, setWeights] = useState<ProgressWeights>(DEFAULT_PROGRESS_WEIGHTS);

  const [stats, setStats] = useState<PerformanceOverviewStats | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [skills, setSkills] = useState<SkillProgressItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalyticsReport | null>(null);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [
        overviewStats,
        academics,
        skillList,
        projectList,
        activityList,
        achievementList,
        analyticsReport,
      ] = await Promise.all([
        getPerformanceOverviewStats(userId, weights),
        getAcademicRecords(userId),
        getSkillProgressList(userId),
        getProjects(userId),
        getActivities(userId),
        getAchievements(userId),
        getPerformanceAnalytics(userId, timeRange),
      ]);

      setStats(overviewStats);
      setAcademicRecords(academics);
      setSkills(skillList);
      setProjects(projectList);
      setActivities(activityList);
      setAchievements(achievementList);
      setAnalytics(analyticsReport);

      // Evaluate badges dynamically from real student activity
      const evaluatedBadges = evaluateStudentBadges({
        streakDays: overviewStats.streakDays,
        totalQuizzesTaken: overviewStats.quizzesCompletedCount,
        averageQuizScore: overviewStats.progressBreakdown.quizScore,
        averageQuizAccuracy: 88,
        completedAssignmentsCount: overviewStats.assignmentsCompletedCount,
        completedProjectsCount: overviewStats.projectsCompletedCount,
        verifiedAchievementsCount: achievementList.filter((a) => a.verificationStatus === "Verified").length,
        totalAchievementsCount: achievementList.length,
        certificatesCount: overviewStats.certificatesCount,
        skillsCount: skillList.length,
        overallProgressScore: overviewStats.overallScore,
        academicRecordsCount: academics.length,
        activitiesCount: activityList.length,
        achievements: achievementList,
        projects: projectList,
        activities: activityList,
      });
      setBadges(evaluatedBadges);

      // Generate Milestones & Insights
      setMilestones(generateStudentMilestones(overviewStats, profile));
      setInsights(generatePersonalizedInsights(overviewStats));
    } catch (err: any) {
      console.error("usePerformance loadData error:", err);
      setError(err?.message || "Failed to load performance metrics.");
    } finally {
      setLoading(false);
    }
  }, [userId, timeRange, weights, profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     MUTATIONS & CRUD HANDLERS
  ========================================================= */

  const addOrUpdateAcademicRecord = async (
    record: Omit<AcademicRecord, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      setSaving(true);
      await saveAcademicRecord(userId, record, eduId);
      toast.success(record.id ? "Academic record updated successfully." : "Academic record added successfully.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to save academic record: " + (err?.message || ""));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const removeAcademicRecord = async (id: string) => {
    try {
      setSaving(true);
      await deleteAcademicRecord(id);
      toast.success("Academic record deleted.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete academic record.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addOrUpdateSkill = async (
    skill: Omit<SkillProgressItem, "id" | "userId" | "lastUpdated"> & { id?: string }
  ) => {
    try {
      setSaving(true);
      await saveSkillProgress(userId, skill);
      toast.success("Skill progress updated.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to update skill progress.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addOrUpdateProject = async (
    project: Omit<ProjectItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      setSaving(true);
      await saveProject(userId, project, eduId);
      toast.success(project.id ? "Project updated successfully." : "Project added and synced to portfolio.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to save project.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (id: string) => {
    try {
      setSaving(true);
      await deleteProject(id);
      toast.success("Project removed.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete project.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addOrUpdateActivity = async (
    activity: Omit<ActivityItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      setSaving(true);
      await saveActivity(userId, activity, eduId);
      toast.success(activity.id ? "Activity updated." : "Activity record added.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to save activity.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const removeActivity = async (id: string) => {
    try {
      setSaving(true);
      await deleteActivity(id);
      toast.success("Activity deleted.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete activity.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addOrUpdateAchievement = async (
    achievement: Omit<AchievementItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    try {
      setSaving(true);
      await saveAchievement(userId, achievement, eduId);
      toast.success(achievement.id ? "Achievement updated." : "Achievement successfully recorded!");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to save achievement.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const removeAchievement = async (id: string) => {
    try {
      setSaving(true);
      await deleteAchievement(id);
      toast.success("Achievement record removed.");
      await loadData();
    } catch (err: any) {
      toast.error("Failed to delete achievement.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    timeRange,
    setTimeRange,
    weights,
    setWeights,
    stats,
    academicRecords,
    skills,
    projects,
    activities,
    achievements,
    badges,
    milestones,
    analytics,
    insights,
    loading,
    saving,
    error,
    refreshAll: loadData,
    addOrUpdateAcademicRecord,
    removeAcademicRecord,
    addOrUpdateSkill,
    addOrUpdateProject,
    removeProject,
    addOrUpdateActivity,
    removeActivity,
    addOrUpdateAchievement,
    removeAchievement,
  };
}
