// features/eduroadmap/components/CurrentProgress.tsx
// Comprehensive learning analytics and milestone tracking progress dashboard.

import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  FolderGit2,
  Brain,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { RoadmapStats } from "../types/roadmap.types";

interface CurrentProgressProps {
  stats: RoadmapStats;
}

export const CurrentProgress: React.FC<CurrentProgressProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* ── 1. Big Progress Summary Card ───────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                📊 LIVE ACCREDITATION METRICS
              </span>
              <h2 className="text-xl font-bold text-foreground mt-1">
                Overall Career Readiness & Roadmap Completion
              </h2>
              <p className="text-xs text-muted-foreground">
                Aggregated from verified roadmap step checklists, diagnostic quiz scores, and capstone milestones.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-primary">{stats.overallProgress}%</span>
              <p className="text-[11px] text-muted-foreground">Composite Index</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={stats.overallProgress} className="h-3.5 bg-muted" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Foundation (0%)</span>
              <span>Technical Core (50%)</span>
              <span>Career Ready (100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Progress Pillars Breakdown ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Milestone Pillar */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-foreground">
                {stats.completedMilestones} / {stats.completedMilestones + stats.inProgressMilestones + stats.remainingMilestones}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Roadmap Milestones</h4>
              <p className="text-[11px] text-muted-foreground">
                {stats.inProgressMilestones} In Progress • {stats.remainingMilestones} Remaining
              </p>
            </div>
            <Progress
              value={
                stats.completedMilestones + stats.inProgressMilestones + stats.remainingMilestones
                  ? Math.round(
                      (stats.completedMilestones /
                        (stats.completedMilestones + stats.inProgressMilestones + stats.remainingMilestones)) *
                        100
                    )
                  : 0
              }
              className="h-1.5"
            />
          </CardContent>
        </Card>

        {/* Skills Pillar */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Brain className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-amber-500">
                {stats.completedSkills} / {stats.totalSkills}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Skills Mastered</h4>
              <p className="text-[11px] text-muted-foreground">{stats.skillsInProgress} currently in training</p>
            </div>
            <Progress
              value={stats.totalSkills ? Math.round((stats.completedSkills / stats.totalSkills) * 100) : 0}
              className="h-1.5"
            />
          </CardContent>
        </Card>

        {/* Quizzes Pillar */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-emerald-600">{stats.quizProgress}%</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Diagnostic Quiz Score</h4>
              <p className="text-[11px] text-muted-foreground">Weighted accuracy across topics</p>
            </div>
            <Progress value={stats.quizProgress} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Projects Pillar */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-indigo-600">{stats.projectProgress}%</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Project Portfolio</h4>
              <p className="text-[11px] text-muted-foreground">Practical code implementation</p>
            </div>
            <Progress value={stats.projectProgress} className="h-1.5" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
