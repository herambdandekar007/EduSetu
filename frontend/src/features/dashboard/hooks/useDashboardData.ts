// frontend/src/features/dashboard/hooks/useDashboardData.ts
// Custom hook for managing the 3D Smart Education AI Dashboard state

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadCompleteDashboardData } from "../services/dashboardService";
import type {
  StudentDashboardData,
  LearningIntelligenceData,
  OverallLearningProgress,
  TodayTaskItem,
  AIRecommendationItem,
  RoadmapOverviewData,
  CareerDirectionData,
  PerformanceOverviewData,
  RecentAchievementItem,
  UpcomingTaskItem,
  DashboardNotificationItem,
} from "../types/dashboard.types";
import { toast } from "sonner";

export function useDashboardData() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentDashboardData | null>(null);
  const [intelligence, setIntelligence] = useState<LearningIntelligenceData | null>(null);
  const [progress, setProgress] = useState<OverallLearningProgress | null>(null);
  const [todayPlan, setTodayPlan] = useState<TodayTaskItem[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapOverviewData | null>(null);
  const [career, setCareer] = useState<CareerDirectionData | null>(null);
  const [performance, setPerformance] = useState<PerformanceOverviewData | null>(null);
  const [achievements, setAchievements] = useState<RecentAchievementItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskItem[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotificationItem[]>([]);

  const loadData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);

    try {
      const activeUid = user?.uid || "guest_student";
      const data = await loadCompleteDashboardData(
        activeUid,
        user?.email || undefined,
        user?.displayName || undefined
      );

      // Restore completed tasks state from localStorage
      let savedTodayCompleted: string[] = [];
      let savedUpcomingCompleted: string[] = [];
      try {
        savedTodayCompleted = JSON.parse(localStorage.getItem(`dashboard_completed_today_${activeUid}`) || "[]");
        savedUpcomingCompleted = JSON.parse(localStorage.getItem(`dashboard_completed_upcoming_${activeUid}`) || "[]");
      } catch {}

      const mergedTodayPlan = data.todayPlan.map((t) => ({
        ...t,
        completed: t.completed || savedTodayCompleted.includes(t.id),
      }));

      const mergedUpcomingTasks = data.upcomingTasks.map((t) => ({
        ...t,
        completed: t.completed || savedUpcomingCompleted.includes(t.id),
      }));

      setStudent(data.student);
      setIntelligence(data.intelligence);
      setProgress(data.progress);
      setTodayPlan(mergedTodayPlan);
      setRecommendations(data.recommendations);
      setRoadmap(data.roadmap);
      setCareer(data.career);
      setPerformance(data.performance);
      setAchievements(data.achievements);
      setUpcomingTasks(mergedUpcomingTasks);
      setNotifications(data.notifications);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      try {
        const fallback = await loadCompleteDashboardData("guest_student", user?.email || undefined, user?.displayName || undefined);
        setStudent(fallback.student);
        setIntelligence(fallback.intelligence);
        setProgress(fallback.progress);
        setTodayPlan(fallback.todayPlan);
        setRecommendations(fallback.recommendations);
        setRoadmap(fallback.roadmap);
        setCareer(fallback.career);
        setPerformance(fallback.performance);
        setAchievements(fallback.achievements);
        setUpcomingTasks(fallback.upcomingTasks);
        setNotifications(fallback.notifications);
      } catch (fallbackErr) {
        console.error("Dashboard fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.uid, user?.email, user?.displayName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle today's task completion with persistence
  const toggleTask = (taskId: string) => {
    setTodayPlan((prev) => {
      const nextPlan = prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            toast.success(`Completed: ${t.title}`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      });
      try {
        const completedIds = nextPlan.filter((t) => t.completed).map((t) => t.id);
        localStorage.setItem(`dashboard_completed_today_${user?.uid || "guest_student"}`, JSON.stringify(completedIds));
      } catch {}
      return nextPlan;
    });
  };

  // Toggle upcoming task completion with persistence
  const toggleUpcomingTask = (taskId: string) => {
    setUpcomingTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      try {
        const completedIds = nextTasks.filter((t) => t.completed).map((t) => t.id);
        localStorage.setItem(`dashboard_completed_upcoming_${user?.uid || "guest_student"}`, JSON.stringify(completedIds));
      } catch {}
      return nextTasks;
    });
    toast.success("Task updated");
  };

  return {
    loading: loading || authLoading,
    student,
    intelligence,
    progress,
    todayPlan,
    recommendations,
    roadmap,
    career,
    performance,
    achievements,
    upcomingTasks,
    notifications,
    refreshDashboard: loadData,
    toggleTask,
    toggleUpcomingTask,
  };
}
