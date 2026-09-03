// frontend/src/features/dashboard/pages/DashboardPage.tsx
// Master 3D AI Command Center Dashboard for SMART EDUCATION AI

import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
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
          
          {/* Setup Action Required Banner for new / incomplete users */}
          {!student.profileCompleted && (
            <div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-5 sm:p-6 text-white shadow-md">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-200 backdrop-blur-xs">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-300" />
                    <span>PROFILE SETUP REQUIRED</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Complete your profile to unlock full AI capabilities 🎓
                  </h2>
                  <p className="text-xs text-indigo-100/90 leading-relaxed">
                    Please fill in your personal contact details, education level, and accessibility needs first so our AI can accurately curate your personalized curriculum, schemes, and job matches.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/profile")}
                  className="rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs px-5 py-2.5 shrink-0 shadow-sm gap-1.5 self-start md:self-center"
                >
                  <span>Complete Profile Now</span>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-700" />
                </Button>
              </div>
            </div>
          )}

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
