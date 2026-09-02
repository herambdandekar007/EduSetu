// features/performance/components/PerformanceOverview.tsx
// 10-Card dynamic summary dashboard with quick insights, badges, and weighted growth score

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Flame,
  BookOpen,
  Sparkles,
  Brain,
  FileCheck2,
  Code2,
  ScrollText,
  Trophy,
  Clock,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Target,
  Award,
} from "lucide-react";
import { OverallProgressCard } from "./OverallProgressCard";
import type {
  PerformanceOverviewStats,
  ProgressWeights,
  BadgeItem,
  MilestoneItem,
  PersonalizedInsight,
  PerformanceTab,
} from "../types/performance.types";

interface PerformanceOverviewProps {
  stats: PerformanceOverviewStats;
  weights: ProgressWeights;
  badges: BadgeItem[];
  milestones: MilestoneItem[];
  insights: PersonalizedInsight[];
  onNavigateTab: (tab: PerformanceTab) => void;
  onUpdateWeights?: (weights: ProgressWeights) => void;
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  stats,
  weights,
  badges,
  milestones,
  insights,
  onNavigateTab,
  onUpdateWeights,
}) => {
  const summaryCards = [
    {
      title: "Overall Progress",
      value: `${stats.overallScore}%`,
      subtitle: "Platform Index",
      icon: TrendingUp,
      color: "text-purple-500",
      bgGradient: "from-purple-500/10 to-indigo-500/5",
      borderColor: "border-purple-500/30",
      tab: "overview" as PerformanceTab,
    },
    {
      title: "Learning Streak",
      value: `🔥 ${stats.streakDays} Days`,
      subtitle: "Daily Consistency",
      icon: Flame,
      color: "text-rose-500",
      bgGradient: "from-rose-500/10 to-amber-500/5",
      borderColor: "border-rose-500/30",
      tab: "learning" as PerformanceTab,
    },
    {
      title: "Active Subjects",
      value: `${stats.activeSubjectsCount}`,
      subtitle: "Enrolled Courses",
      icon: BookOpen,
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-cyan-500/5",
      borderColor: "border-blue-500/30",
      tab: "learning" as PerformanceTab,
    },
    {
      title: "Skills Developed",
      value: `${stats.skillsCount}`,
      subtitle: "Verified Competencies",
      icon: Sparkles,
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-yellow-500/5",
      borderColor: "border-amber-500/30",
      tab: "skills" as PerformanceTab,
    },
    {
      title: "Quizzes Completed",
      value: `${stats.quizzesCompletedCount}`,
      subtitle: "Evaluated Tests",
      icon: Brain,
      color: "text-violet-500",
      bgGradient: "from-violet-500/10 to-fuchsia-500/5",
      borderColor: "border-violet-500/30",
      tab: "quizzes" as PerformanceTab,
    },
    {
      title: "Assignments Completed",
      value: `${stats.assignmentsCompletedCount}`,
      subtitle: "Submitted & Evaluated",
      icon: FileCheck2,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      borderColor: "border-emerald-500/30",
      tab: "assignments" as PerformanceTab,
    },
    {
      title: "Projects Completed",
      value: `${stats.projectsCompletedCount}`,
      subtitle: "Portfolios Built",
      icon: Code2,
      color: "text-cyan-500",
      bgGradient: "from-cyan-500/10 to-blue-500/5",
      borderColor: "border-cyan-500/30",
      tab: "projects" as PerformanceTab,
    },
    {
      title: "Certificates Earned",
      value: `${stats.certificatesCount}`,
      subtitle: "Stored in EduVault",
      icon: ScrollText,
      color: "text-teal-500",
      bgGradient: "from-teal-500/10 to-emerald-500/5",
      borderColor: "border-teal-500/30",
      tab: "certificates" as PerformanceTab,
    },
    {
      title: "Achievements Earned",
      value: `${stats.achievementsCount}`,
      subtitle: "Hackathons & Honors",
      icon: Trophy,
      color: "text-amber-500",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      borderColor: "border-amber-500/30",
      tab: "achievements" as PerformanceTab,
    },
    {
      title: "Learning Hours",
      value: `${stats.learningHours} hrs`,
      subtitle: "Study & Practice Time",
      icon: Clock,
      color: "text-indigo-500",
      bgGradient: "from-indigo-500/10 to-purple-500/5",
      borderColor: "border-indigo-500/30",
      tab: "analytics" as PerformanceTab,
    },
  ];

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const nextMilestone = milestones.find((m) => m.status === "current") || milestones[0];

  return (
    <div className="space-y-6">
      {/* 1. Master Calculated Progress Card */}
      <OverallProgressCard
        stats={stats}
        weights={weights}
        onUpdateWeights={onUpdateWeights}
      />

      {/* 2. 10 Dynamic Metric Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-foreground tracking-wide uppercase">
            Core Performance Metrics
          </h3>
          <span className="text-xs text-muted-foreground">
            Live Synchronized from Firebase
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card
                key={idx}
                onClick={() => onNavigateTab(card.tab)}
                className={`cursor-pointer rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} bg-card/60 backdrop-blur-sm hover:scale-[1.02] hover:shadow-lg transition-all duration-200`}
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground truncate">
                      {card.title}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-background/80 ${card.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-foreground tracking-tight">
                      {card.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {card.subtitle}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. AI Growth Insights & Active Journey Milestones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Insights */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Personalized AI Growth Insights (EduMind & EduMentor)
            </h3>
            <Badge variant="outline" className="text-[10px]">
              Continuous Assessment
            </Badge>
          </div>

          <div className="space-y-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm hover:bg-card/90 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {ins.title}
                    </span>
                    {ins.metric && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                        {ins.metric}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ins.description}
                  </p>
                </div>

                {ins.actionTab && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigateTab(ins.actionTab!)}
                    className="shrink-0 text-xs rounded-xl h-8 gap-1"
                  >
                    {ins.actionLabel || "View"}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Journey Milestones & Badges Summary */}
        <div className="space-y-6">
          {/* Milestone Widget */}
          <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Next Learning Milestone
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab("milestones")}
                  className="text-xs text-primary p-0 h-auto font-semibold hover:underline"
                >
                  View All
                </Button>
              </div>

              {nextMilestone && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-foreground leading-tight">
                        {nextMilestone.title}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {nextMilestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>Milestone Progress</span>
                      <span className="text-primary font-bold">{nextMilestone.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${nextMilestone.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges Widget */}
          <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  Unlocked Badges ({unlockedBadges.length}/{badges.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab("achievements")}
                  className="text-xs text-primary p-0 h-auto font-semibold hover:underline"
                >
                  View Badges
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {badges.slice(0, 6).map((b) => (
                  <div
                    key={b.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      b.unlocked
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-muted/50 text-muted-foreground border-border/40 opacity-60"
                    }`}
                  >
                    <span>{b.unlocked ? "🏆" : "🔒"}</span>
                    <span className="text-[11px] truncate max-w-[90px]">{b.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
