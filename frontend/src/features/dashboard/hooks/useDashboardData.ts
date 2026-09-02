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

      setStudent(data.student);
      setIntelligence(data.intelligence);
      setProgress(data.progress);
      setTodayPlan(data.todayPlan);
      setRecommendations(data.recommendations);
      setRoadmap(data.roadmap);
      setCareer(data.career);
      setPerformance(data.performance);
      setAchievements(data.achievements);
      setUpcomingTasks(data.upcomingTasks);
      setNotifications(data.notifications);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error("Notice: Initialized Smart Education AI dashboard.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.uid, user?.email, user?.displayName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle today's task completion
  const toggleTask = (taskId: string) => {
    setTodayPlan((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            toast.success(`Completed: ${t.title}`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  // Toggle upcoming task completion
  const toggleUpcomingTask = (taskId: string) => {
    setUpcomingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
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
