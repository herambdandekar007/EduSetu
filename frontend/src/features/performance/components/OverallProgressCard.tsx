// features/performance/components/OverallProgressCard.tsx
// Visual dynamic overall progress calculator with weighted component breakdowns

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  SlidersHorizontal,
  Info,
  BookOpen,
  Brain,
  FileCheck2,
  Code2,
  Trophy,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { PerformanceOverviewStats, ProgressWeights } from "../types/performance.types";

interface OverallProgressCardProps {
  stats: PerformanceOverviewStats;
  weights: ProgressWeights;
  onUpdateWeights?: (weights: ProgressWeights) => void;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({
  stats,
  weights,
  onUpdateWeights,
}) => {
  const [openConfig, setOpenConfig] = useState(false);
  const [localWeights, setLocalWeights] = useState<ProgressWeights>(weights);

  const { progressBreakdown, overallScore } = stats;

  const handleSaveWeights = () => {
    if (onUpdateWeights) {
      onUpdateWeights(localWeights);
    }
    setOpenConfig(false);
  };

  const componentsList = [
    {
      label: "Learning Progress",
      score: progressBreakdown.learningScore,
      weight: Math.round(weights.learning * 100),
      icon: BookOpen,
      color: "text-blue-500",
      barColor: "bg-blue-500",
    },
    {
      label: "Quiz Performance",
      score: progressBreakdown.quizScore,
      weight: Math.round(weights.quizzes * 100),
      icon: Brain,
      color: "text-purple-500",
      barColor: "bg-purple-500",
    },
    {
      label: "Assignment Mastery",
      score: progressBreakdown.assignmentScore,
      weight: Math.round(weights.assignments * 100),
      icon: FileCheck2,
      color: "text-emerald-500",
      barColor: "bg-emerald-500",
    },
    {
      label: "Skill Development",
      score: progressBreakdown.skillScore,
      weight: Math.round(weights.skills * 100),
      icon: Sparkles,
      color: "text-amber-500",
      barColor: "bg-amber-500",
    },
    {
      label: "Project Completion",
      score: progressBreakdown.projectScore,
      weight: Math.round(weights.projects * 100),
      icon: Code2,
      color: "text-cyan-500",
      barColor: "bg-cyan-500",
    },
    {
      label: "Extracurricular Activities",
      score: progressBreakdown.activityScore,
      weight: Math.round(weights.activities * 100),
      icon: Activity,
      color: "text-rose-500",
      barColor: "bg-rose-500",
    },
  ];

  return (
    <Card className="rounded-3xl border border-border/80 bg-gradient-to-br from-card/90 via-card/70 to-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardContent className="p-6 md:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold px-2.5 py-0.5"
              >
                SMART EDUCATION AI • PLATFORM INDEX
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Adaptive Weighted
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              Overall Student Progress Index
            </h2>
            <p className="text-xs text-muted-foreground">
              Dynamic multi-dimensional growth metric compiled continuously from your learning, quizzes, projects, and activities.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Configure Weights Dialog */}
            <Dialog open={openConfig} onOpenChange={setOpenConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 h-9">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Weights ({Math.round(weights.learning * 100)}% / {Math.round(weights.quizzes * 100)}%...)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    Configure Calculation Weights
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Customize the contribution weight of each learning domain in your platform progress calculation.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Learning Progress</span>
                      <span>{Math.round(localWeights.learning * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(localWeights.learning * 100)]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setLocalWeights((prev) => ({ ...prev, learning: val / 100 }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Quiz Performance</span>
                      <span>{Math.round(localWeights.quizzes * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(localWeights.quizzes * 100)]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setLocalWeights((prev) => ({ ...prev, quizzes: val / 100 }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Assignment Mastery</span>
                      <span>{Math.round(localWeights.assignments * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(localWeights.assignments * 100)]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setLocalWeights((prev) => ({ ...prev, assignments: val / 100 }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Skill Growth</span>
                      <span>{Math.round(localWeights.skills * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(localWeights.skills * 100)]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setLocalWeights((prev) => ({ ...prev, skills: val / 100 }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Projects</span>
                      <span>{Math.round(localWeights.projects * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(localWeights.projects * 100)]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setLocalWeights((prev) => ({ ...prev, projects: val / 100 }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Activities & Extracurriculars</span>
                      <span>{Math.round(localWeights.activities * 100)}%</span>
                    </div>
                    <Slider
                      value={[Math.round(localWeights.activities * 100)]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setLocalWeights((prev) => ({ ...prev, activities: val / 100 }))
                      }
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalWeights({ learning: 0.3, quizzes: 0.2, assignments: 0.15, skills: 0.15, projects: 0.1, activities: 0.1 })}
                    >
                      Reset Defaults
                    </Button>
                    <Button size="sm" onClick={handleSaveWeights}>
                      Apply Weights
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Score Pill */}
            <div className="flex items-baseline gap-1 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl text-primary font-black">
              <span className="text-3xl">{overallScore}</span>
              <span className="text-sm font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Overall Platform Growth Progress</span>
            <span className="text-primary font-extrabold">{overallScore}% Achieved</span>
          </div>
          <div className="h-4 w-full rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/50">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${overallScore}%`,
                background: "linear-gradient(90deg, hsl(265,80%,62%), hsl(250,84%,54%), hsl(190,90%,50%))",
                boxShadow: "0 0 16px rgba(147, 51, 234, 0.4)",
              }}
            />
          </div>
        </div>

        {/* 6 Sub-Component Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {componentsList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-3.5 rounded-2xl border border-border/60 bg-card/50 hover:bg-card/90 transition-all duration-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-muted ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                      {item.label}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {item.weight}% weight
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Mastery Score</span>
                    <span className="font-bold text-foreground">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2 bg-muted" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Academic Disclaimer */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
          <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Platform Progress Notice:</strong> This Overall Progress Index is a calculated educational engagement indicator designed to guide your continuous learning on <strong>SMART EDUCATION AI</strong>. It does not represent an official university marksheet or institutional CGPA grade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
