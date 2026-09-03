// features/edumentor/components/MentorDashboard.tsx
// Main overview dashboard for EduMentor AI with real-time stats and Next Best Action.

import React from "react";
import {
  Bot,
  Flame,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  StudentLearningContext,
  DailyStudyPlan,
  NextBestActionItem,
} from "../types/mentor.types";

interface MentorDashboardProps {
  context: StudentLearningContext;
  todayPlan: DailyStudyPlan | null;
  nextBestAction: NextBestActionItem;
  onStartLearning: (subject: string, topic: string) => void;
  onPracticeWeakness: (subject: string, topic: string) => void;
  onAskEduMentor: (initialPrompt: string) => void;
  onTabChange: (tab: string) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  context,
  todayPlan,
  nextBestAction,
  onStartLearning,
  onPracticeWeakness,
  onAskEduMentor,
  onTabChange,
}) => {
  const completedTasks = todayPlan?.tasks.filter((t) => t.isCompleted).length || 0;
  const totalTasks = todayPlan?.tasks.length || 0;
  const planProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : context.overallProgressPct;

  return (
    <div className="space-y-6">
      {/* ── 1. Welcome Banner ───────────────────────────────────────────── */}
      <Card className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-sm">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                <Bot className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    Hello {context.name || "Student"} 👋
                  </h1>
                  <Badge variant="outline" className="bg-background/80 text-primary border-primary/30 text-xs font-mono">
                    {context.eduId}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I am your <strong>EduMentor</strong>. Let's optimize your study plan, strengthen weak concepts, and achieve your academic goals today.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                  <span>🎓 {context.course || "Curriculum"}</span>
                  <span>•</span>
                  <span>📚 {context.subjects.length} Active Subjects</span>
                  <span>•</span>
                  <span>🎯 Target: {context.careerInterests[0] || "Excellence"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => onAskEduMentor("What should I study today based on my learning gaps?")}
                className="gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Ask EduMentor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Stat Pills ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Today's Progress</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{planProgress}%</h3>
              <p className="text-[11px] text-muted-foreground">{completedTasks} of {totalTasks} tasks done</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Study Streak</p>
              <h3 className="text-xl font-bold text-amber-500 mt-0.5">🔥 {context.studyStreakDays} Days</h3>
              <p className="text-[11px] text-muted-foreground">Keep the momentum going!</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Weak Topics</p>
              <h3 className="text-xl font-bold text-rose-500 mt-0.5">{context.weakTopics.length} Areas</h3>
              <p className="text-[11px] text-rose-500 font-medium">Needs practice</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Recent Accuracy</p>
              <h3 className="text-xl font-bold text-emerald-500 mt-0.5">{context.recentAccuracy}%</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Diagnostic score</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Next Best Action Banner ─────────────────────────────────── */}
      <Card className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                  🔥 YOUR NEXT BEST ACTION
                </span>
                <Badge variant="outline" className="text-xs font-semibold text-muted-foreground">
                  {nextBestAction.priority} Priority
                </Badge>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {nextBestAction.title}
              </h2>

              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {nextBestAction.reason}
              </p>

              <div className="flex items-center gap-2 text-xs font-semibold text-primary pt-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Subject: {nextBestAction.subject}</span>
                <span>•</span>
                <span>Topic: {nextBestAction.topic}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Button
                onClick={() => onStartLearning(nextBestAction.subject, nextBestAction.topic)}
                className="gap-2 rounded-xl bg-primary text-primary-foreground shadow hover:shadow-md"
              >
                <Play className="h-4 w-4" />
                Start Learning
              </Button>
              <Button
                variant="outline"
                onClick={() => onPracticeWeakness(nextBestAction.subject, nextBestAction.topic)}
                className="gap-2 rounded-xl border-primary/30 hover:bg-primary/5"
              >
                <Target className="h-4 w-4 text-primary" />
                Practice Weak Topic
              </Button>
              <Button
                variant="secondary"
                onClick={() => onAskEduMentor(`Explain the fundamentals of ${nextBestAction.topic} in ${nextBestAction.subject}`)}
                className="gap-2 rounded-xl"
              >
                <Bot className="h-4 w-4" />
                Ask EduMentor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Weak & Strong Topics Breakdown ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weak Topics */}
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Topics Needing Improvement
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange("weakness")}
                className="text-xs text-primary h-7 px-2"
              >
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <div className="space-y-2.5">
              {context.weakTopics.length ? (
                context.weakTopics.slice(0, 3).map((topic, idx) => (
                  <div
                    key={topic}
                    className="p-3 rounded-xl bg-rose-500/5 border border-rose-200/50 dark:border-rose-900/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{topic}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {context.subjects[idx % context.subjects.length] || "Core Subject"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPracticeWeakness(context.subjects[idx % context.subjects.length] || "General", topic)}
                      className="h-7 text-xs rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      Practice
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">No weak topics detected yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Strong Topics */}
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                High Mastery Topics
              </h3>
              <span className="text-xs text-emerald-600 font-semibold">85%+ Mastery</span>
            </div>

            <div className="space-y-2.5">
              {context.strongTopics.length ? (
                context.strongTopics.slice(0, 3).map((topic) => (
                  <div
                    key={topic}
                    className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{topic}</h4>
                      <p className="text-[11px] text-muted-foreground">Verified high quiz retention</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">
                      Mastered
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">Complete quizzes to unlock strong topic badges.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorDashboard;
