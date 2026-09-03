// frontend/src/features/dashboard/components/PerformanceOverview.tsx
// 3D Academic & Assessment Performance Card for SMART EDUCATION AI Dashboard

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, CheckCircle, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import type { PerformanceOverviewData } from "../types/dashboard.types";

interface PerformanceOverviewProps {
  performance: PerformanceOverviewData;
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ performance }) => {
  const [filter, setFilter] = useState<"weekly" | "monthly" | "semester">("monthly");

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>ACADEMIC ANALYTICS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Performance Overview 📈</h2>
        </div>

        {/* Time Filters */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
          {(["weekly", "monthly", "semester"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition-all ${
                filter === t
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500">Overall Marks</span>
          <p className="font-mono text-xl font-extrabold text-slate-900">{performance.overallMarksScore}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+4.2% vs last term</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500">Quiz Accuracy</span>
          <p className="font-mono text-xl font-extrabold text-cyan-700">{performance.quizPerformanceScore}%</p>
          <span className="text-[10px] text-cyan-600 font-semibold">Top 5% in class</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500">Assignments</span>
          <p className="font-mono text-xl font-extrabold text-purple-700">{performance.assignmentScore}%</p>
          <span className="text-[10px] text-slate-400">12 / 12 on time</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500">Attendance</span>
          <p className="font-mono text-xl font-extrabold text-emerald-600">{performance.attendanceScore}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Exemplary</span>
        </div>
      </div>

      {/* Weekly Visual Chart Bars */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Weekly Performance Trend</span>
          <span className="font-mono text-indigo-700 font-bold">88.4 Avg Score</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-16 pt-2">
          {performance.recentWeeklyScores.map((w, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-lg bg-indigo-600 transition-all duration-500"
                style={{ height: `${w.score}%` }}
              />
              <span className="text-[10px] font-mono text-slate-500">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Link to Full Performance Page */}
      <div className="text-right pt-1">
        <Link
          to="/performance"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
        >
          <span>View Deep Analytics & Radar Charts</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
