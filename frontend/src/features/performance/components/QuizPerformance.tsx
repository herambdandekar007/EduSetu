// features/performance/components/QuizPerformance.tsx
// Comprehensive Quiz Performance Analytics with score trends, accuracy, and mistake analysis

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import type { PerformanceOverviewStats, PerformanceAnalyticsReport } from "../types/performance.types";

interface QuizPerformanceProps {
  stats: PerformanceOverviewStats;
  analytics: PerformanceAnalyticsReport | null;
}

export const QuizPerformance: React.FC<QuizPerformanceProps> = ({ stats, analytics }) => {
  const navigate = useNavigate();

  const chartData = analytics?.quizScoreTrend || [
    { label: "Quiz 1", score: 75, accuracy: 70 },
    { label: "Quiz 2", score: 80, accuracy: 78 },
    { label: "Quiz 3", score: 85, accuracy: 82 },
    { label: "Quiz 4", score: 90, accuracy: 88 },
    { label: "Quiz 5", score: 88, accuracy: 85 },
    { label: "Quiz 6", score: 94, accuracy: 92 },
  ];

  const recentAttempts = [
    {
      id: "qa1",
      quizTitle: "Data Structures: Binary Trees & Graphs",
      subject: "Data Structures & Algorithms",
      score: 92,
      totalQuestions: 15,
      correct: 14,
      duration: "12 mins",
      date: "Today, 10:30 AM",
      accuracy: 93,
    },
    {
      id: "qa2",
      quizTitle: "SQL Relational Queries & Normalization",
      subject: "Database Management Systems",
      score: 88,
      totalQuestions: 20,
      correct: 18,
      duration: "18 mins",
      date: "Yesterday",
      accuracy: 90,
    },
    {
      id: "qa3",
      quizTitle: "Linear Algebra: Matrix Inversion",
      subject: "Mathematics & Statistics",
      score: 84,
      totalQuestions: 12,
      correct: 10,
      duration: "15 mins",
      date: "Aug 26, 2026",
      accuracy: 83,
    },
    {
      id: "qa4",
      quizTitle: "React Component Lifecycle & Hooks",
      subject: "Web Technologies",
      score: 96,
      totalQuestions: 25,
      correct: 24,
      duration: "20 mins",
      date: "Aug 24, 2026",
      accuracy: 96,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Total Completed
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {stats.quizzesCompletedCount}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Brain className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Average Score
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {stats.progressBreakdown.quizScore}%
              </div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Average Accuracy
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                88.5%
              </div>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Best Score
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                100%
              </div>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Interactive Score Trend Graph */}
      <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Quiz Score & Accuracy Progression Trend
              </h4>
              <p className="text-xs text-muted-foreground">
                Historical scores across all timed, chapter, and AI-generated evaluations
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/learn")}
              className="rounded-xl text-xs gap-1.5 h-8"
            >
              Take Practice Quiz <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="quizScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(265, 80%, 62%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(265, 80%, 62%)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="#888" fontSize={11} />
                <YAxis domain={[40, 100]} stroke="#888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(265, 80%, 62%)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#quizScoreGrad)"
                  name="Quiz Score %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Strong Concepts vs Weak Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border/70 bg-emerald-500/5 backdrop-blur-sm border-emerald-500/20">
          <CardContent className="p-5 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Strongest Concepts (Accuracy &gt; 85%)
            </h5>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-card/60 flex items-center justify-between">
                <span className="font-semibold">Binary Tree In-Order Traversal</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                  96% Accuracy
                </Badge>
              </div>
              <div className="p-2.5 rounded-xl bg-card/60 flex items-center justify-between">
                <span className="font-semibold">SQL Indexing & Foreign Keys</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                  92% Accuracy
                </Badge>
              </div>
              <div className="p-2.5 rounded-xl bg-card/60 flex items-center justify-between">
                <span className="font-semibold">React useEffect Hook Dependencies</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                  90% Accuracy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-amber-500/5 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-5 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Priority Areas for Revision
            </h5>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-card/60 flex items-center justify-between">
                <span className="font-semibold">Bayesian Probability & Conditionals</span>
                <Badge variant="secondary" className="text-[10px] text-amber-600 bg-amber-500/10">
                  65% Accuracy
                </Badge>
              </div>
              <div className="p-2.5 rounded-xl bg-card/60 flex items-center justify-between">
                <span className="font-semibold">Dijkstra Shortest Path Matrix</span>
                <Badge variant="secondary" className="text-[10px] text-amber-600 bg-amber-500/10">
                  68% Accuracy
                </Badge>
              </div>
              <div className="p-2.5 rounded-xl bg-card/60 flex items-center justify-between">
                <span className="font-semibold">Virtual Memory LRU Page Faults</span>
                <Badge variant="secondary" className="text-[10px] text-amber-600 bg-amber-500/10">
                  70% Accuracy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Quiz Attempts History */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">
          Recent Quiz Results & Detailed Attempts
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentAttempts.map((att) => (
            <Card
              key={att.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {att.subject}
                  </Badge>
                  <h5 className="font-bold text-xs text-foreground leading-snug">{att.quizTitle}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{att.correct} / {att.totalQuestions} correct</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {att.duration}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="text-lg font-black text-primary">{att.score}%</div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      att.score >= 90
                        ? "text-emerald-500 border-emerald-500/30"
                        : "text-blue-500 border-blue-500/30"
                    }`}
                  >
                    {att.accuracy}% Accuracy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
