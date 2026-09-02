// features/performance/pages/PerformancePage.tsx
// Main entry page for SMART EDUCATION AI — Achievements & Progress (Performance) System

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  GraduationCap,
  BookOpen,
  Brain,
  FileCheck2,
  Sparkles,
  Code2,
  Activity,
  Trophy,
  ScrollText,
  Target,
  BarChart3,
  RotateCcw,
  ShieldCheck,
  Award,
} from "lucide-react";
import { usePerformance } from "../hooks/usePerformance";
import {
  PerformanceOverview,
  AcademicProgress,
  LearningProgress,
  QuizPerformance,
  AssignmentPerformance,
  SkillProgress,
  ProjectProgress,
  Activities,
  Achievements,
  AchievementBadges,
  Milestones,
  ProgressAnalytics,
  CertificatesView,
} from "../components";
import type { PerformanceTab } from "../types/performance.types";
import { useAuth } from "@/contexts/AuthContext";

const TABS: { id: PerformanceTab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "academic", label: "Academic Progress", icon: GraduationCap },
  { id: "learning", label: "Learning Progress", icon: BookOpen },
  { id: "quizzes", label: "Quiz Performance", icon: Brain },
  { id: "assignments", label: "Assignment Performance", icon: FileCheck2 },
  { id: "skills", label: "Skill Progress", icon: Sparkles },
  { id: "projects", label: "Projects", icon: Code2 },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "certificates", label: "Certificates", icon: ScrollText },
  { id: "milestones", label: "Milestones", icon: Target },
  { id: "analytics", label: "Progress Analytics", icon: BarChart3 },
];

export const PerformancePage: React.FC = () => {
  const { profile } = useAuth();
  const {
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
    refreshAll,
    addOrUpdateAcademicRecord,
    removeAcademicRecord,
    addOrUpdateSkill,
    addOrUpdateProject,
    removeProject,
    addOrUpdateActivity,
    removeActivity,
    addOrUpdateAchievement,
    removeAchievement,
  } = usePerformance();

  const studentEduId = profile?.eduId || "EDU-2026-STU89";
  const studentName = profile?.fullName || profile?.full_name || "Student Learner";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-border/80 bg-gradient-to-br from-card/90 via-card/70 to-card/40 backdrop-blur-xl shadow-lg">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-extrabold bg-primary/10 text-primary border-primary/30 px-2.5 py-0.5">
                SMART EDUCATION AI
              </Badge>
              <Badge variant="secondary" className="text-[10px] flex items-center gap-1 font-mono">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> {studentEduId}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Lifelong Learning Journey
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Achievements & Educational Progress
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Welcome back, <strong>{studentName}</strong>. Comprehensive real-time tracker for your academic marks, skill growth, hackathons, and certifications.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshAll()}
              disabled={loading}
              className="rounded-xl text-xs gap-1.5 h-9"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Data
            </Button>
            {stats && (
              <div className="bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-primary">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold font-mono">Index {stats.overallScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* 12-Tab Scrollable Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/70 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => refreshAll()} className="h-7 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !stats ? (
          <div className="space-y-4 py-8">
            <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
              <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
              <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
              <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
            </div>
          </div>
        ) : stats ? (
          <div>
            {/* 1. Overview Tab */}
            {activeTab === "overview" && (
              <PerformanceOverview
                stats={stats}
                weights={weights}
                badges={badges}
                milestones={milestones}
                insights={insights}
                onNavigateTab={setActiveTab}
                onUpdateWeights={setWeights}
              />
            )}

            {/* 2. Academic Progress Tab */}
            {activeTab === "academic" && (
              <AcademicProgress
                records={academicRecords}
                onSaveRecord={addOrUpdateAcademicRecord}
                onDeleteRecord={removeAcademicRecord}
                saving={saving}
              />
            )}

            {/* 3. Learning Progress Tab */}
            {activeTab === "learning" && (
              <LearningProgress stats={stats} />
            )}

            {/* 4. Quiz Performance Tab */}
            {activeTab === "quizzes" && (
              <QuizPerformance stats={stats} analytics={analytics} />
            )}

            {/* 5. Assignment Performance Tab */}
            {activeTab === "assignments" && (
              <AssignmentPerformance stats={stats} />
            )}

            {/* 6. Skill Progress Tab */}
            {activeTab === "skills" && (
              <SkillProgress
                skills={skills}
                onSaveSkill={addOrUpdateSkill}
                saving={saving}
              />
            )}

            {/* 7. Projects Tab */}
            {activeTab === "projects" && (
              <ProjectProgress
                projects={projects}
                onSaveProject={addOrUpdateProject}
                onDeleteProject={removeProject}
                saving={saving}
              />
            )}

            {/* 8. Activities Tab */}
            {activeTab === "activities" && (
              <Activities
                activities={activities}
                onSaveActivity={addOrUpdateActivity}
                onDeleteActivity={removeActivity}
                saving={saving}
              />
            )}

            {/* 9. Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="space-y-8">
                <Achievements
                  achievements={achievements}
                  onSaveAchievement={addOrUpdateAchievement}
                  onDeleteAchievement={removeAchievement}
                  saving={saving}
                />
                <AchievementBadges badges={badges} />
              </div>
            )}

            {/* 10. Certificates Tab */}
            {activeTab === "certificates" && (
              <CertificatesView stats={stats} />
            )}

            {/* 11. Milestones Tab */}
            {activeTab === "milestones" && (
              <Milestones
                milestones={milestones}
                onNavigateTab={setActiveTab}
              />
            )}

            {/* 12. Progress Analytics Tab */}
            {activeTab === "analytics" && (
              <ProgressAnalytics
                analytics={analytics}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            )}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage;
