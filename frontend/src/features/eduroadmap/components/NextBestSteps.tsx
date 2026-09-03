// features/eduroadmap/components/NextBestSteps.tsx
// High-priority AI next actions guiding what to learn, practice, revise, test, or build next.

import React from "react";
import {
  Sparkles,
  BookOpen,
  Target,
  RotateCcw,
  Award,
  FolderGit2,
  Brain,
  Clock,
  ArrowRight,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NextBestStep } from "../types/roadmap.types";

interface NextBestStepsProps {
  nextSteps: NextBestStep[];
  onTakeAction: (step: NextBestStep) => void;
  onAskMentor: (prompt: string) => void;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  learn: {
    label: "What Should I Learn Next?",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  practice: {
    label: "What Should I Practice Next?",
    icon: <Target className="h-4 w-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  revise: {
    label: "What Should I Revise?",
    icon: <RotateCcw className="h-4 w-4" />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  skill: {
    label: "Which Skill Should I Improve?",
    icon: <Brain className="h-4 w-4" />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  quiz: {
    label: "Which Quiz Should I Take?",
    icon: <Award className="h-4 w-4" />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
  },
  project: {
    label: "Which Project Should I Build?",
    icon: <FolderGit2 className="h-4 w-4" />,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/30",
  },
};

export const NextBestSteps: React.FC<NextBestStepsProps> = ({
  nextSteps,
  onTakeAction,
  onAskMentor,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  🎯 AI RECOMMENDED ACTIONS
                </span>
                <Badge variant="outline" className="text-xs">
                  Real-time Roadmap Flow
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Your Next Best Learning & Skill Actions
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Dynamically calculated from completed roadmap milestones, syllabus gaps, and recent quiz metrics to keep you in the optimal learning zone.
              </p>
            </div>

            <Button
              onClick={() => onAskMentor("What is the most effective way to complete today's top recommended roadmap action?")}
              className="gap-2 rounded-xl bg-primary text-primary-foreground text-xs shadow hover:shadow-md shrink-0"
            >
              <Bot className="h-4 w-4" />
              Ask EduMentor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextSteps.map((step, idx) => {
          const cfg = TYPE_CONFIG[step.type] || TYPE_CONFIG.learn;

          return (
            <Card
              key={step.id || idx}
              className="rounded-2xl border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color}`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </div>

                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {step.estimatedTime}
                  </span>
                </div>

                {/* Title & Topic */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                  <p className="text-xs text-primary font-semibold">Focus: {step.subjectOrSkill}</p>
                </div>

                {/* Why explanation */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Why this action? </strong>
                  {step.reason}
                </p>

                {/* Recommended Checklist */}
                {step.recommendedActions && step.recommendedActions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Action Checklist:
                    </p>
                    {step.recommendedActions.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAskMentor(`Provide a step-by-step tutorial on: ${step.title}`)}
                    className="text-xs text-primary h-8 px-2"
                  >
                    Ask AI Tutor
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onTakeAction(step)}
                    className="gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs shadow-xs"
                  >
                    Execute Step <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
