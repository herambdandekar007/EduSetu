// features/performance/components/Milestones.tsx
// Visual Educational Journey Timeline & Milestone Progression

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  CircleDot,
  Clock,
  ShieldCheck,
  UserCheck,
  Brain,
  ScrollText,
  Sparkles,
  Code2,
  Trophy,
  ArrowRight,
} from "lucide-react";
import type { MilestoneItem, PerformanceTab } from "../types/performance.types";

interface MilestonesProps {
  milestones: MilestoneItem[];
  onNavigateTab: (tab: PerformanceTab) => void;
}

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  UserCheck,
  Brain,
  ScrollText,
  Sparkles,
  Code2,
  Clock,
  Trophy,
};

export const Milestones: React.FC<MilestonesProps> = ({ milestones, onNavigateTab }) => {
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const currentMilestone = milestones.find((m) => m.status === "current");

  return (
    <div className="space-y-6">
      {/* 1. Milestone Banner */}
      <Card className="rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-card/70 to-transparent backdrop-blur-xl">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20">
                Educational Journey
              </Badge>
              <span className="text-xs text-muted-foreground">Lifelong Learning Roadmap</span>
            </div>
            <h3 className="text-xl font-black text-foreground">
              Student Milestone Roadmap
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Track major architectural markers in your career — from creating your EduID identity to winning national hackathons.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-card/80 border border-border/60 p-4 rounded-2xl">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-semibold">Milestones Achieved</div>
              <div className="text-2xl font-black text-primary">
                {completedCount} <span className="text-xs font-normal text-muted-foreground">/ {milestones.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Next Target Milestone Highlight */}
      {currentMilestone && (
        <Card className="rounded-2xl border-primary/40 bg-gradient-to-br from-primary/10 via-card/70 to-card/40 backdrop-blur-sm shadow-md">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-md shrink-0">
                <CircleDot className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px] bg-primary">
                    Next Recommended Milestone
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentMilestone.category}
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground">
                  {currentMilestone.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  {currentMilestone.description}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 w-full sm:w-48 shrink-0">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Progress</span>
                <span className="text-primary">{currentMilestone.progressPercent}%</span>
              </div>
              <Progress value={currentMilestone.progressPercent} className="h-2 bg-muted" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Visual Timeline of Milestones */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
        {milestones.map((m, idx) => {
          const isCompleted = m.status === "completed";
          const isCurrent = m.status === "current";
          const IconComp = ICON_MAP[m.iconName] || Trophy;

          return (
            <div key={m.id} className="relative flex items-start gap-4">
              {/* Timeline marker */}
              <div
                className={`absolute -left-6 sm:-left-8 mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                    : isCurrent
                    ? "bg-background border-primary text-primary animate-pulse"
                    : "bg-muted border-border/80 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              {/* Card Body */}
              <Card
                className={`w-full rounded-2xl border transition-all ${
                  isCompleted
                    ? "border-border/60 bg-card/60"
                    : isCurrent
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border/40 bg-card/30 opacity-70"
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {m.category}
                      </Badge>
                      {m.completedDate && (
                        <span className="text-[11px] text-muted-foreground">
                          Completed on {m.completedDate}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-sm text-foreground">{m.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isCompleted ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Achieved
                      </span>
                    ) : (
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                          <span>Progress</span>
                          <span>{m.progressPercent}%</span>
                        </div>
                        <Progress value={m.progressPercent} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
