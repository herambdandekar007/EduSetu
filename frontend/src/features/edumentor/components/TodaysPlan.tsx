// features/edumentor/components/TodaysPlan.tsx
// Interactive Daily Study Plan with task tracking, Firebase persistence, and AI plan regenerator.

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Plus,
  Flame,
  ArrowRight,
  Bot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  DailyStudyPlan,
  PlanTask,
  StudentLearningContext,
} from "../types/mentor.types";
import { togglePlanTaskStatus, saveDailyStudyPlan } from "../services/mentorService";
import { generateAIStudyPlan } from "../services/mentorAIService";
import { toast } from "sonner";

interface TodaysPlanProps {
  context: StudentLearningContext;
  plan: DailyStudyPlan | null;
  onUpdatePlan: (updated: DailyStudyPlan) => void;
  onStartTask: (subject: string, topic: string) => void;
  onAskAIAboutTask: (task: PlanTask) => void;
}

export const TodaysPlan: React.FC<TodaysPlanProps> = ({
  context,
  plan,
  onUpdatePlan,
  onStartTask,
  onAskAIAboutTask,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const completedCount = plan?.tasks.filter((t) => t.isCompleted).length || 0;
  const totalCount = plan?.tasks.length || 0;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!plan) return;
    const newStatus = !currentStatus;

    const updatedTasks = plan.tasks.map((t) =>
      t.id === taskId
        ? { ...t, isCompleted: newStatus, completedAt: newStatus ? new Date().toISOString() : undefined }
        : t
    );

    const newCompletedCount = updatedTasks.filter((t) => t.isCompleted).length;
    const newPct = updatedTasks.length ? Math.round((newCompletedCount / updatedTasks.length) * 100) : 0;

    const updatedPlan: DailyStudyPlan = {
      ...plan,
      tasks: updatedTasks,
      completionPercentage: newPct,
      updatedAt: new Date().toISOString(),
    };

    onUpdatePlan(updatedPlan);

    try {
      await togglePlanTaskStatus(plan.id, taskId, newStatus);
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleGenerateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAIStudyPlan({
        studentContext: context,
        days: 1,
        availableHoursPerDay: 3,
        focusSubjects: context.subjects,
        weakTopics: context.weakTopics,
      });

      await saveDailyStudyPlan(generated);
      onUpdatePlan(generated);
      toast.success("✨ New personalized study plan generated!");
    } catch (err) {
      console.error("Plan generation error:", err);
      toast.error("Failed to generate new study plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Plan Overview Card ──────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/5 via-card to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {plan?.title || "Today's Study Plan"}
                </h2>
                <Badge variant="outline" className="text-xs">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {plan?.summary || "Tailored schedule balanced across concept review, practice problems, and self-assessment."}
              </p>
            </div>

            <Button
              onClick={handleGenerateNewPlan}
              disabled={isGenerating}
              variant="outline"
              className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/5 shrink-0"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating Plan..." : "Regenerate AI Plan"}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {completedCount} of {totalCount} tasks completed
              </span>
              <span className="text-primary font-bold">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2.5 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Task Checklist ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Assigned Tasks for Today
        </h3>

        {plan && plan.tasks.length ? (
          <div className="space-y-2.5">
            {plan.tasks.map((task, idx) => {
              const priorityColors = {
                High: "bg-rose-500/10 text-rose-600 border-rose-200",
                Medium: "bg-amber-500/10 text-amber-600 border-amber-200",
                Low: "bg-blue-500/10 text-blue-600 border-blue-200",
              };

              return (
                <Card
                  key={task.id}
                  className={`rounded-2xl transition-all border ${
                    task.isCompleted
                      ? "bg-muted/40 border-border/40 opacity-80"
                      : "border-border/70 hover:border-primary/40 bg-card"
                  }`}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start gap-3.5 flex-1">
                        <button
                          onClick={() => handleToggleTask(task.id, task.isCompleted)}
                          className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                          title={task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-sm font-bold text-foreground ${
                                task.isCompleted ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {idx + 1}. {task.taskName}
                            </h4>
                            <Badge className={`text-[10px] px-2 py-0 border ${priorityColors[task.priority]}`}>
                              {task.priority} Priority
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {task.difficulty}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            📚 <strong>{task.subject}</strong> • Topic: {task.topic}
                          </p>

                          {task.learningObjective && (
                            <p className="text-[11px] text-muted-foreground/80 italic">
                              Target: {task.learningObjective}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{task.durationMinutes}m</span>
                        </div>

                        {!task.isCompleted ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onStartTask(task.subject, task.topic)}
                              className="h-8 rounded-xl bg-primary text-primary-foreground gap-1.5 text-xs shadow-sm hover:shadow"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAskAIAboutTask(task)}
                              className="h-8 rounded-xl text-xs gap-1 border-primary/30"
                              title="Ask EduMentor to explain this task"
                            >
                              <Bot className="h-3.5 w-3.5 text-primary" />
                              Ask AI
                            </Button>
                          </>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">
                            Done ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-2 border-border p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-foreground">No study plan for today yet</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Click below to generate a tailored study plan calibrated for your syllabus and weak areas.
            </p>
            <Button
              onClick={handleGenerateNewPlan}
              disabled={isGenerating}
              className="mt-4 gap-2 rounded-xl bg-primary text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              Generate Today's Plan
            </Button>
          </Card>
        )}
      </div>

      {/* ── 3. Mentor Tips ─────────────────────────────────────────────── */}
      {plan?.mentorTips && plan.mentorTips.length > 0 && (
        <Card className="rounded-2xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40">
          <CardContent className="p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              💡 EduMentor Study Tips
            </h4>
            <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200/90 pl-4 list-disc">
              {plan.mentorTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TodaysPlan;
