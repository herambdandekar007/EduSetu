// frontend/src/features/dashboard/components/LearningProgress.tsx
// 3D Visual Learning Progress Card for SMART EDUCATION AI Dashboard

import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock, Award, ArrowRight, Sparkles } from "lucide-react";
import type { OverallLearningProgress } from "../types/dashboard.types";

interface LearningProgressProps {
  progress: OverallLearningProgress;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ progress }) => {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>SEMESTER 6 CURRICULUM</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Overall Learning Progress 📊</h2>
        </div>

        <Link
          to="/learn"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
        >
          <span>Open Learn Hub</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Progress Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Progress Circular Arc & Total */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-indigo-200 bg-indigo-50/60 shadow-xs">
            <div className="text-center">
              <span className="font-mono text-3xl font-extrabold text-indigo-700">{progress.overallPercentage}%</span>
              <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">
                Completed
              </span>
            </div>
          </div>
          <span className="mt-3 text-xs font-bold text-slate-800">Curriculum Mastery</span>
          <span className="text-[10px] text-slate-500">{progress.topicsCompleted} of {progress.totalTopics} Topics Finished</span>
        </div>

        {/* Right: Metrics Grid */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          {/* Subjects */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              Subjects
            </span>
            <p className="font-mono text-base font-extrabold text-slate-900">
              {progress.subjectsCompleted} / {progress.totalSubjects}
            </p>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(progress.subjectsCompleted / progress.totalSubjects) * 100}%` }}
              />
            </div>
          </div>

          {/* Quiz Accuracy */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Quiz Accuracy
            </span>
            <p className="font-mono text-base font-extrabold text-emerald-600">
              {progress.quizAccuracy}%
            </p>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${progress.quizAccuracy}%` }}
              />
            </div>
          </div>

          {/* Study Hours */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
              <Clock className="h-3.5 w-3.5 text-cyan-600" />
              Study Hours
            </span>
            <p className="font-mono text-base font-extrabold text-slate-900">
              {progress.studyHoursTotal} hrs
            </p>
            <span className="text-[10px] text-slate-400 block">Cumulative on platform</span>
          </div>

          {/* Weekly Target */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
              <Award className="h-3.5 w-3.5 text-pink-600" />
              Weekly Goal
            </span>
            <p className="font-mono text-base font-extrabold text-pink-600">
              {progress.weeklyCompletedHours} / {progress.weeklyTargetHours}h
            </p>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full"
                style={{ width: `${(progress.weeklyCompletedHours / progress.weeklyTargetHours) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
