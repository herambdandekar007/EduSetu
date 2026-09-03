// features/performance/components/LearningProgress.tsx
// Learning Progress Integration with SMART EDUCATION AI Learn Module

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
  BarChart2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PerformanceOverviewStats } from "../types/performance.types";

interface LearningProgressProps {
  stats: PerformanceOverviewStats;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ stats }) => {
  const navigate = useNavigate();

  const subjects = [
    {
      name: "Mathematics & Statistics",
      progress: 78,
      chapters: 8,
      topicsCount: 32,
      masteredCount: 25,
      strongTopics: ["Linear Algebra", "Matrix Inversion", "Eigenvalues"],
      weakTopics: ["Bayesian Probability", "Multivariable Calculus"],
      studyHours: 14,
      icon: "📐",
    },
    {
      name: "Data Structures & Algorithms",
      progress: 85,
      chapters: 10,
      topicsCount: 40,
      masteredCount: 34,
      strongTopics: ["Dynamic Programming", "Binary Trees", "Graphs"],
      weakTopics: ["Trie Trees", "Red-Black Balancing"],
      studyHours: 18,
      icon: "⚡",
    },
    {
      name: "Database Management Systems",
      progress: 90,
      chapters: 6,
      topicsCount: 24,
      masteredCount: 22,
      strongTopics: ["SQL Optimization", "Relational Normalization (3NF/BCNF)"],
      weakTopics: ["Distributed ACID Locks"],
      studyHours: 12,
      icon: "🗄️",
    },
    {
      name: "Operating Systems",
      progress: 70,
      chapters: 8,
      topicsCount: 28,
      masteredCount: 20,
      strongTopics: ["CPU Scheduling", "Process Synchronization", "Semaphores"],
      weakTopics: ["Virtual Memory Paging", "Page Replacement LRU"],
      studyHours: 9,
      icon: "💻",
    },
    {
      name: "Web Technologies (React & TypeScript)",
      progress: 92,
      chapters: 7,
      topicsCount: 30,
      masteredCount: 28,
      strongTopics: ["Component Lifecycle", "State Reducers", "Tailwind CSS"],
      weakTopics: ["SSR Hydration Architecture"],
      studyHours: 16,
      icon: "🌐",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Jump to Learn */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/70 bg-gradient-to-r from-blue-500/10 via-primary/5 to-transparent backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[10px] bg-blue-600">
              SMART Learn Engine
            </Badge>
            <span className="text-xs text-muted-foreground">
              Connected to curriculum & adaptive practice
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            Subject & Topic Mastery Progression
          </h3>
          <p className="text-xs text-muted-foreground">
            Real-time mastery index computed across chapters, practice questions, and comprehension drills.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate("/learn")}
          className="rounded-xl text-xs gap-2 shrink-0 h-9"
        >
          Open Learn Module
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Active Streak
              </span>
              <div className="text-xl font-black text-foreground mt-0.5">
                🔥 {stats.streakDays} Days
              </div>
            </div>
            <Flame className="h-5 w-5 text-rose-500" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Study Time
              </span>
              <div className="text-xl font-black text-foreground mt-0.5">
                {stats.learningHours} Hours
              </div>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Active Subjects
              </span>
              <div className="text-xl font-black text-foreground mt-0.5">
                {subjects.length} Subjects
              </div>
            </div>
            <BookOpen className="h-5 w-5 text-purple-500" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Topics Mastered
              </span>
              <div className="text-xl font-black text-foreground mt-0.5">
                {subjects.reduce((sum, s) => sum + s.masteredCount, 0)} Topics
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Subject-Wise Progress Cards */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-foreground">
          Subject Breakdown & Topic Mastery
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub, idx) => (
            <Card
              key={idx}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-muted">{sub.icon}</div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{sub.name}</h5>
                      <span className="text-xs text-muted-foreground">
                        {sub.chapters} Chapters • {sub.topicsCount} Topics ({sub.studyHours}h studied)
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs font-black text-primary font-mono">
                    {sub.progress}%
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                    <span>Curriculum Completion</span>
                    <span>{sub.masteredCount} of {sub.topicsCount} Mastered</span>
                  </div>
                  <Progress value={sub.progress} className="h-2.5 bg-muted" />
                </div>

                {/* Strong & Weak Topics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Strong Topics
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sub.strongTopics.map((t, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5" /> Needs Practice
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sub.weakTopics.map((t, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
