// features/edumentor/components/ExamPreparation.tsx
// Comprehensive Exam Sprint Preparation Dashboard with countdown, readiness score, high-yield topics, and revision sprint.

import React, { useState, useEffect } from "react";
import {
  Target,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Award,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  StudentLearningContext,
  ExamPrepPlan,
} from "../types/mentor.types";
import { generateExamPrepRoadmap } from "../services/mentorAIService";
import { getExamPrepPlan, saveExamPrepPlan } from "../services/mentorService";

interface ExamPreparationProps {
  context: StudentLearningContext;
  onAskMentorExamDoubt: (topic: string) => void;
}

export const ExamPreparation: React.FC<ExamPreparationProps> = ({
  context,
  onAskMentorExamDoubt,
}) => {
  const [examName, setExamName] = useState("University Semester Examinations");
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [plan, setPlan] = useState<ExamPrepPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadSavedPlan() {
      const saved = await getExamPrepPlan(context.userId);
      if (saved) {
        setPlan(saved);
        setExamName(saved.examName);
        setExamDate(saved.examDate);
      }
    }
    loadSavedPlan();
  }, [context.userId]);

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateExamPrepRoadmap({
        examName,
        examDate,
        subjects: context.subjects,
        importantTopics: [...context.weakTopics, ...context.strongTopics],
        studentContext: context,
      });

      setPlan(generated);
      await saveExamPrepPlan(generated);
    } catch (err) {
      console.error("Exam prep generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const daysLeft = examDate
    ? Math.max(1, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  return (
    <div className="space-y-6">
      {/* ── 1. Header & Countdown Dashboard ────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-gradient-to-r from-rose-500/10 via-background to-primary/10 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-rose-500 text-white font-bold text-xs">
                  🎯 EXAM SPRINT MODE
                </Badge>
                <span className="text-xs text-muted-foreground">Target Exam:</span>
                <span className="text-xs font-bold text-foreground">{examName}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">
                Final Exam Preparation Dashboard
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
                Personalized roadmap, high-yield scoring topics, and spaced revision sprint calibrated for your upcoming evaluation.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-4 bg-background/80 border border-border/70 rounded-2xl p-4 shadow-sm shrink-0">
              <div className="text-center">
                <div className="text-3xl font-black text-rose-600">{daysLeft}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Days Left
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-black text-primary">
                  {plan?.readinessScore || 72}%
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Readiness
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Configure Exam Sprint ───────────────────────────────────── */}
      <Card className="rounded-2xl border-border/70">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Exam Title
              </label>
              <input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. End Semester Exam"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Exam Target Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <Button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="gap-2 rounded-xl bg-primary text-primary-foreground h-10 shadow hover:shadow-md sm:col-span-1"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Calculating Sprint..." : "Generate Exam Roadmap"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. High-Yield Topics & Sprint Phases ────────────────────────── */}
      {plan ? (
        <div className="space-y-6">
          {/* High Yield Topics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              High-Yield Scoring Topics Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {plan.highYieldTopics.map((topic, idx) => (
                <Card
                  key={idx}
                  className="rounded-2xl border border-border/70 hover:border-primary/40 transition-all bg-card"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {topic.subject}
                      </Badge>
                      <Badge className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-200">
                        {topic.weightage} Weightage
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-foreground">{topic.topic}</h4>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAskMentorExamDoubt(topic.topic)}
                      className="w-full text-xs h-8 rounded-xl border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Review High-Yield Notes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Phase Strategy Roadmap */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Multi-Phase Sprint Strategy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.phaseStrategy.map((phase, idx) => (
                <Card
                  key={idx}
                  className="rounded-2xl border border-border/70 bg-gradient-to-b from-muted/30 to-card"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="text-[10px] bg-primary text-primary-foreground font-bold">
                        {phase.daysSpan}
                      </Badge>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Phase {idx + 1}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground">{phase.phaseName}</h4>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {phase.focus}
                    </p>

                    <div className="pt-2 border-t border-border/60 text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Milestone: {phase.milestone}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mentor Exam Advice */}
          {plan.mentorExamAdvice && plan.mentorExamAdvice.length > 0 && (
            <Card className="rounded-2xl border border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/40">
              <CardContent className="p-5 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                  🎓 EduMentor Exam Day Tips
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-200 pl-4 list-disc">
                  {plan.mentorExamAdvice.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-2 border-border p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">
            No active exam roadmap
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            Enter your exam details above and click <strong>Generate Exam Roadmap</strong> to calculate days left, high-yield weightages, and sprint strategy.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ExamPreparation;
