// frontend/src/features/dashboard/pages/DashboardPage.tsx
// Master 3D AI Command Center Dashboard for SMART EDUCATION AI

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardTopNav } from "../components/DashboardTopNav";
import { DashboardHero } from "../components/DashboardHero";
import { EduIdentityCard } from "../components/EduIdentityCard";
import { LearningIntelligence } from "../components/LearningIntelligence";
import { LearningProgress } from "../components/LearningProgress";
import { TodayPlan } from "../components/TodayPlan";
import { AIRecommendations } from "../components/AIRecommendations";
import { RoadmapPreview } from "../components/RoadmapPreview";
import { CareerInsight } from "../components/CareerInsight";
import { PerformanceOverview } from "../components/PerformanceOverview";
import { AchievementPreview } from "../components/AchievementPreview";
import { UpcomingTasks } from "../components/UpcomingTasks";
import { QuickActions } from "../components/QuickActions";
import { DashboardSkeleton } from "../components/DashboardSkeleton";

export const DashboardPage: React.FC = () => {
  const {
    loading,
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
    toggleTask,
    toggleUpcomingTask,
  } = useDashboardData();

  if (loading || !student || !intelligence || !progress || !roadmap || !career || !performance) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout hideTopBar noPadding>
      <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-900">
        
        {/* 1. Primary Top Navigation Header */}
        <DashboardTopNav student={student} notifications={notifications} />

        <div className="flex-1 p-4 sm:p-6 space-y-6 pb-20 max-w-7xl mx-auto w-full">
          
          {/* 2. Professional Hero Section */}
          <DashboardHero student={student} />

          {/* 3. Identity Card & Cognitive Learning Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-4">
              <EduIdentityCard student={student} />
            </div>
            <div className="lg:col-span-8">
              <LearningIntelligence intelligence={intelligence} />
            </div>
          </div>

          {/* 4. Overall Progress & Today's AI Learning Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-5">
              <LearningProgress progress={progress} />
            </div>
            <div className="lg:col-span-7">
              <TodayPlan tasks={todayPlan} onToggleTask={toggleTask} />
            </div>
          </div>

          {/* 5. EduMind AI Recommendations */}
          <AIRecommendations recommendations={recommendations} />

          {/* 6. EduRoadmap Progress Journey */}
          <RoadmapPreview roadmap={roadmap} />

          {/* 7. Career Direction & Academic Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-6">
              <CareerInsight career={career} />
            </div>
            <div className="lg:col-span-6">
              <PerformanceOverview performance={performance} />
            </div>
          </div>

          {/* 8. Recent Achievements & Upcoming Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-6">
              <AchievementPreview achievements={achievements} />
            </div>
            <div className="lg:col-span-6">
              <UpcomingTasks tasks={upcomingTasks} onToggleTask={toggleUpcomingTask} />
            </div>
          </div>

          {/* 9. Floating 3D Quick Action Command Bar */}
          <QuickActions />

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
