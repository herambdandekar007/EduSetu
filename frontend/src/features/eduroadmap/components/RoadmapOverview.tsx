// features/eduroadmap/components/RoadmapOverview.tsx
// Header and summary dashboard for 🗺️ EduRoadmap

import React from "react";
import {
  Map,
  Sparkles,
  Compass,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { UserEduRoadmap, RoadmapStats } from "../types/roadmap.types";

interface RoadmapOverviewProps {
  roadmap: UserEduRoadmap | null;
  stats: RoadmapStats;
  onExploreCareers: () => void;
  onViewNextSteps: () => void;
  onRegenerateRoadmap: () => void;
  isRegenerating?: boolean;
}

export const RoadmapOverview: React.FC<RoadmapOverviewProps> = ({
  roadmap,
  stats,
  onExploreCareers,
  onViewNextSteps,
  onRegenerateRoadmap,
  isRegenerating = false,
}) => {
  const careerTitle = roadmap?.careerName || "Software Engineering";
  const stage = roadmap?.currentStage || "Foundation";
  const progress = stats.overallProgress;

  return (
    <div className="space-y-6">
      {/* ── 1. Hero Banner ──────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-background shadow-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-primary text-primary-foreground shadow-sm">
                  🗺️ ACTIVE ROADMAP
                </span>
                <Badge variant="outline" className="bg-background/80 text-foreground border-border text-xs font-semibold">
                  Stage: {stage}
                </Badge>
                <Badge variant="outline" className="bg-background/80 text-emerald-600 dark:text-emerald-400 border-emerald-300 text-xs font-semibold">
                  AI Calibrated
                </Badge>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  {careerTitle}
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Your personalized, step-by-step academic and technical development roadmap calibrated from your syllabus, diagnostic quizzes, and career goals.
                </p>
              </div>

              {/* Milestones bar */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Current: <span className="text-primary">{roadmap?.currentMilestone || "Data Structures & Core Algorithms"}</span>
                </span>
                <span>•</span>
                <span>Next: {roadmap?.nextMilestone || "Database Design & SQL"}</span>
              </div>
            </div>

            {/* Overall Progress Widget */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 bg-background/80 lg:bg-transparent p-4 lg:p-0 rounded-2xl border lg:border-none border-border">
              <div className="space-y-1.5 w-full sm:w-48 text-left lg:text-right">
                <div className="flex items-center justify-between lg:justify-end gap-2 text-xs font-bold text-foreground">
                  <span>Overall Readiness</span>
                  <span className="text-primary text-base font-extrabold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2.5 bg-muted" />
                <p className="text-[11px] text-muted-foreground">
                  {stats.completedMilestones} of {stats.completedMilestones + stats.inProgressMilestones + stats.remainingMilestones} milestones completed
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerateRoadmap}
                  disabled={isRegenerating}
                  className="gap-1.5 rounded-xl border-border text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin text-primary" : ""}`} />
                  {isRegenerating ? "Recalibrating..." : "Recalibrate AI"}
                </Button>
                <Button
                  size="sm"
                  onClick={onViewNextSteps}
                  className="gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs shadow hover:shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Next Best Step
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Metric Pills ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed Steps</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{stats.completedMilestones} Steps</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Verified milestones</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-xl font-bold text-primary mt-0.5">{stats.inProgressMilestones} Active</h3>
              <p className="text-[11px] text-muted-foreground">Current focus</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Skills Mastered</p>
              <h3 className="text-xl font-bold text-amber-500 mt-0.5">{stats.completedSkills} / {stats.totalSkills}</h3>
              <p className="text-[11px] text-muted-foreground">Target competency</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Career Tracks</p>
              <h3 className="text-xl font-bold text-indigo-500 mt-0.5">6 Tracks</h3>
              <button
                onClick={onExploreCareers}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5 mt-0.5"
              >
                Explore Paths <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
