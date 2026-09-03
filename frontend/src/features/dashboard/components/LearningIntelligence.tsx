// frontend/src/features/dashboard/components/LearningIntelligence.tsx
// 3D Learning Intelligence & Cognitive Metrics for SMART EDUCATION AI Dashboard

import React from "react";
import { Brain, Zap, Target, TrendingUp, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import type { LearningIntelligenceData } from "../types/dashboard.types";

interface LearningIntelligenceProps {
  intelligence: LearningIntelligenceData;
}

export const LearningIntelligence: React.FC<LearningIntelligenceProps> = ({ intelligence }) => {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>AI COGNITIVE METRICS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            Learning Intelligence 🧠
          </h2>
        </div>

        <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          Optimal Pace
        </span>
      </div>

      {/* Circular / Ring Cognitive Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Consistency */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-50">
            <span className="font-mono text-sm font-extrabold text-indigo-700">{intelligence.studyConsistency}%</span>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">Consistency</span>
          <span className="text-[10px] text-slate-500">Study Streak</span>
        </div>

        {/* Metric 2: Concept Mastery */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-50">
            <span className="font-mono text-sm font-extrabold text-purple-700">{intelligence.conceptMastery}%</span>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">Mastery</span>
          <span className="text-[10px] text-slate-500">Topics Grasped</span>
        </div>

        {/* Metric 3: Quiz Accuracy */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-cyan-500 bg-cyan-50">
            <span className="font-mono text-sm font-extrabold text-cyan-700">{intelligence.accuracyRate}%</span>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">Accuracy</span>
          <span className="text-[10px] text-slate-500">Assessment Score</span>
        </div>

        {/* Metric 4: Learning Speed */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-500 bg-pink-50">
            <span className="font-mono text-xs font-extrabold text-pink-700">1.25x</span>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">Speed</span>
          <span className="text-[10px] text-slate-500">Fast Comprehension</span>
        </div>

      </div>

      {/* Strengths & Weaknesses Split Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Top Cognitive Strengths</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {intelligence.strengths.map((str, idx) => (
              <span
                key={idx}
                className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs"
              >
                ✓ {str}
              </span>
            ))}
          </div>
        </div>

        {/* Weaknesses to Improve */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Target Areas to Reinforce</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {intelligence.weaknesses.map((w, idx) => (
              <span
                key={idx}
                className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-xs"
              >
                ⚠ {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
