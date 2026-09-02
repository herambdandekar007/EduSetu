// features/edumentor/components/StudyPlanner.tsx
// Custom AI Study Planner allowing student configuration of hours, exam dates, subjects, and pace.

import React, { useState } from "react";
import {
  CalendarDays,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Save,
  RotateCcw,
  Sliders,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type {
  StudentLearningContext,
  DailyStudyPlan,
  PlanTask,
} from "../types/mentor.types";
import { generateAIStudyPlan } from "../services/mentorAIService";
import { saveDailyStudyPlan } from "../services/mentorService";

interface StudyPlannerProps {
  context: StudentLearningContext;
  onApplyPlan: (plan: DailyStudyPlan) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  context,
  onApplyPlan,
}) => {
  const [examName, setExamName] = useState("Semester Midterms");
  const [days, setDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(context.subjects);
  const [selectedWeakTopics, setSelectedWeakTopics] = useState<string[]>(context.weakTopics);
  const [targetScore, setTargetScore] = useState(85);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DailyStudyPlan | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleWeakTopic = (topic: string) => {
    setSelectedWeakTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveSuccess(false);

    try {
      const plan = await generateAIStudyPlan({
        studentContext: context,
        days,
        availableHoursPerDay: hoursPerDay,
        targetExam: examName,
        focusSubjects: selectedSubjects,
        weakTopics: selectedWeakTopics,
      });

      setGeneratedPlan(plan);
    } catch (err) {
      console.error("Study planner error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndApply = async () => {
    if (!generatedPlan) return;
    try {
      await saveDailyStudyPlan(generatedPlan);
      onApplyPlan(generatedPlan);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save plan error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Header Banner ───────────────────────────────────────────── */}
      <Card className="rounded-2xl border-border/70 bg-gradient-to-r from-purple-500/10 via-background to-indigo-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                AI Custom Study Planner
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Configure your available daily study hours, target exam date, and learning priorities. EduMentor will generate a realistic, high-efficiency schedule.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Planner Form & Parameters ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/70 lg:col-span-1">
          <CardContent className="p-5 space-y-5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Plan Parameters
            </h3>

            {/* Target Exam */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Target Exam / Goal
              </label>
              <input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Schedule Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Plan Duration</span>
                <span className="text-primary font-bold">{days} Days</span>
              </div>
              <div className="flex gap-2">
                {[3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      days === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:bg-muted border-border"
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Hours Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Available Hours / Day</span>
                <span className="text-primary font-bold">{hoursPerDay} Hours</span>
              </div>
              <Slider
                value={[hoursPerDay]}
                onValueChange={(val) => setHoursPerDay(val[0])}
                min={1}
                max={8}
                step={0.5}
              />
            </div>

            {/* Target Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Target Score</span>
                <span className="text-emerald-600 font-bold">{targetScore}%</span>
              </div>
              <Slider
                value={[targetScore]}
                onValueChange={(val) => setTargetScore(val[0])}
                min={60}
                max={100}
                step={5}
              />
            </div>

            {/* Focus Subjects */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Include Subjects ({selectedSubjects.length})
              </label>
              <div className="flex flex-wrap gap-1.5">
                {context.subjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-primary/10 text-primary border-primary font-semibold"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prioritize Weak Topics */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Prioritize Weak Topics
              </label>
              <div className="flex flex-wrap gap-1.5">
                {context.weakTopics.map((top) => {
                  const isSelected = selectedWeakTopics.includes(top);
                  return (
                    <button
                      key={top}
                      type="button"
                      onClick={() => toggleWeakTopic(top)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-rose-500/10 text-rose-600 border-rose-300 font-semibold"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {top}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 rounded-xl bg-primary text-primary-foreground shadow hover:shadow-md h-11"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating Study Plan..." : "Generate AI Study Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* ── 3. Generated Schedule Display ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {generatedPlan ? (
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {generatedPlan.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {generatedPlan.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={handleSaveAndApply}
                      className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 shadow"
                    >
                      <Save className="h-4 w-4" />
                      {saveSuccess ? "Applied to Today! ✓" : "Apply to Today's Plan"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Generated Daily Schedule Tasks
                  </h4>

                  <div className="space-y-2.5">
                    {generatedPlan.tasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground">
                              {idx + 1}. {task.taskName}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {task.subject}
                            </Badge>
                            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              {task.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Topic: {task.topic}
                          </p>
                          {task.learningObjective && (
                            <p className="text-[11px] text-muted-foreground/80 italic">
                              Goal: {task.learningObjective}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          {task.durationMinutes}m
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {generatedPlan.mentorTips && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5">
                      💡 Mentor Strategy Tips:
                    </p>
                    <ul className="pl-4 list-disc space-y-1">
                      {generatedPlan.mentorTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-dashed border-2 border-border p-12 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-foreground">
                No custom plan generated yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Configure your target exam and study hours on the left, then click <strong>Generate AI Study Plan</strong>.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
