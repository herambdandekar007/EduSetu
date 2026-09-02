// features/eduroadmap/components/RoadmapStepCard.tsx
// Interactive roadmap step card with task checklists, resource links, and status triggers.

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckSquare,
  Award,
  ExternalLink,
  Bot,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { RoadmapStep, RoadmapStatus } from "../types/roadmap.types";

interface RoadmapStepCardProps {
  step: RoadmapStep;
  index: number;
  onToggleTask: (taskId: string) => void;
  onMarkCompleted: (stepId: string) => void;
  onStartLearning: (step: RoadmapStep) => void;
  onAskMentor: (step: RoadmapStep) => void;
}

const STATUS_CONFIG: Record<
  RoadmapStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-primary/10 border-primary/30",
    text: "text-primary",
    icon: <Clock className="h-4 w-4 text-primary animate-pulse" />,
  },
  recommended: {
    label: "Recommended",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    icon: <Sparkles className="h-4 w-4 text-amber-500" />,
  },
  not_started: {
    label: "Not Started",
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    icon: <Circle className="h-4 w-4 text-muted-foreground" />,
  },
  locked: {
    label: "Locked",
    bg: "bg-muted/50 border-border/50 opacity-70",
    text: "text-muted-foreground",
    icon: <Lock className="h-4 w-4 text-muted-foreground" />,
  },
};

export const RoadmapStepCard: React.FC<RoadmapStepCardProps> = ({
  step,
  index,
  onToggleTask,
  onMarkCompleted,
  onStartLearning,
  onAskMentor,
}) => {
  const [isExpanded, setIsExpanded] = useState(step.status === "in_progress" || step.status === "recommended");
  const statusCfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.not_started;
  const isLocked = step.status === "locked";

  const completedTasks = step.practiceTasks.filter((t) => t.completed).length;
  const totalTasks = step.practiceTasks.length;

  return (
    <Card
      className={`rounded-2xl transition-all duration-200 border ${
        step.status === "in_progress"
          ? "border-primary/40 shadow-md bg-gradient-to-r from-primary/5 to-background"
          : step.status === "completed"
          ? "border-emerald-500/30 bg-card"
          : "border-border/70 bg-card hover:border-border"
      }`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Step Number Badge */}
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs ${
                step.status === "completed"
                  ? "bg-emerald-500 text-white"
                  : step.status === "in_progress"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {step.stage}
                </Badge>
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text}`}
                >
                  {statusCfg.icon}
                  <span>{statusCfg.label}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {step.estimatedDuration}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {!isLocked && step.status !== "completed" && (
              <Button
                size="sm"
                onClick={() => onStartLearning(step)}
                className="gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs shadow-xs"
              >
                <Play className="h-3.5 w-3.5" />
                Start Learning
              </Button>
            )}

            {step.status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStartLearning(step)}
                className="gap-1.5 rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Revise Topic
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 rounded-xl"
              aria-label={isExpanded ? "Collapse step details" : "Expand step details"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Step Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {/* Skills Required Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Skills:</span>
          {step.skillsRequired.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[11px] font-medium rounded-lg">
              {skill}
            </Badge>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>Progress: {completedTasks} / {totalTasks} Tasks</span>
            <span className="text-foreground font-bold">{step.progress}%</span>
          </div>
          <Progress value={step.progress} className="h-2" />
        </div>

        {/* ── Expandable Details ────────────────────────────────────────── */}
        {isExpanded && !isLocked && (
          <div className="pt-3 border-t border-border/60 space-y-4 animate-in fade-in">
            {/* Practice Tasks Checklist */}
            {step.practiceTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  Practice Tasks
                </h4>
                <div className="space-y-1.5">
                  {step.practiceTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        task.completed
                          ? "bg-emerald-500/5 border-emerald-500/20 text-foreground line-through opacity-80"
                          : "bg-muted/30 border-border/70 text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            task.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span>{task.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {task.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Resources */}
            {step.learningResources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Curated Learning Resources
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {step.learningResources.map((res, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-muted/30 border border-border/70 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <p className="font-semibold text-foreground truncate">{res.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{res.type} • {res.duration || "Self-paced"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAskMentor(step)}
                        className="h-7 text-xs text-primary gap-1 shrink-0"
                      >
                        Study <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment / Quiz Info */}
            {step.quizAssessment && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{step.quizAssessment.title}</h5>
                    <p className="text-[11px] text-muted-foreground">{step.quizAssessment.questionsCount} Questions • Milestone Assessment</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAskMentor(step)}
                  className="gap-1.5 rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                >
                  <Bot className="h-3.5 w-3.5" />
                  Ask EduMentor Prep
                </Button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAskMentor(step)}
                className="text-xs text-muted-foreground hover:text-primary gap-1"
              >
                <Bot className="h-3.5 w-3.5" />
                Ask EduMentor about this step
              </Button>

              {step.status !== "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkCompleted(step.id)}
                  className="text-xs rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Step as Completed
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
