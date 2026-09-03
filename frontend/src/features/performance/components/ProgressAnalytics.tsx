// features/performance/components/ProgressAnalytics.tsx
// Comprehensive Progress Analytics & Visualizations with 6 date filter presets

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Target,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type {
  PerformanceAnalyticsReport,
  AnalyticsTimeRange,
} from "../types/performance.types";

interface ProgressAnalyticsProps {
  analytics: PerformanceAnalyticsReport | null;
  timeRange: AnalyticsTimeRange;
  onTimeRangeChange: (range: AnalyticsTimeRange) => void;
}

const TIME_RANGES: { value: AnalyticsTimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
];

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  analytics,
  timeRange,
  onTimeRangeChange,
}) => {
  const performanceTrend = analytics?.performanceTrend || [];
  const studyTimeTrend = analytics?.studyTimeTrend || [];
  const subjectComparisons = analytics?.subjectComparisons || [];
  const skillDistribution = analytics?.skillDistribution || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Date Range Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Performance & Growth Analytics Engine
          </h3>
          <p className="text-xs text-muted-foreground">
            Multi-variable time series tracking study hours, accuracy trends, and subject comparisons
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-muted/60 rounded-2xl border border-border/40">
          {TIME_RANGES.map((tr) => (
            <Button
              key={tr.value}
              variant={timeRange === tr.value ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs rounded-xl shrink-0 font-medium"
              onClick={() => onTimeRangeChange(tr.value)}
            >
              {tr.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 2. Top Two Charts: Performance Index Trend & Study Time Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Platform Performance Trend */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Overall Performance Growth Trend
                </h4>
                <p className="text-xs text-muted-foreground">
                  Combined weighted index across selected time period
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-bold text-primary">
                +14.2% Growth
              </Badge>
            </div>

            <div className="h-[220px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrend}>
                  <defs>
                    <linearGradient id="perfTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(265, 80%, 62%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(265, 80%, 62%)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="#888" fontSize={11} />
                  <YAxis domain={[50, 100]} stroke="#888" fontSize={11} />
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
                    fill="url(#perfTrendGrad)"
                    name="Performance Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Study Time / Engagement Trend */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Daily Study & Practice Engagement
                </h4>
                <p className="text-xs text-muted-foreground">
                  Active minutes logged in learning, quizzes & coding drills
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-bold text-blue-500">
                Avg 45m / day
              </Badge>
            </div>

            <div className="h-[220px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="studyMinutes"
                    fill="hsl(217, 91%, 60%)"
                    radius={[6, 6, 0, 0]}
                    name="Study Minutes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Subject-Wise Comparative Bar Chart */}
      <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="border-b border-border/40 pb-3">
            <h4 className="text-sm font-bold text-foreground">
              Cross-Subject Performance & Mastery Comparison
            </h4>
            <p className="text-xs text-muted-foreground">
              Compares course progress, quiz averages, and assignment submissions across active subjects
            </p>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectComparisons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" domain={[0, 100]} stroke="#888" fontSize={11} />
                <YAxis dataKey="subject" type="category" stroke="#888" fontSize={10} width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="progress" fill="hsl(265, 80%, 62%)" name="Curriculum Progress %" radius={[0, 4, 4, 0]} />
                <Bar dataKey="quizAverage" fill="hsl(142, 76%, 36%)" name="Quiz Average %" radius={[0, 4, 4, 0]} />
                <Bar dataKey="assignmentAverage" fill="hsl(199, 89%, 48%)" name="Assignment Avg %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. Skill Distribution Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skillDistribution.map((sd, i) => (
          <Card key={i} className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                {sd.category} Skills
              </span>
              <div className="text-xl font-black text-foreground">
                {sd.count} Skills
              </div>
              <div className="text-xs text-primary font-bold">
                {sd.averageProgress}% Average Mastery
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
