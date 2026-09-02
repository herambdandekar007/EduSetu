// frontend/src/features/dashboard/components/TodayPlan.tsx
// Today's AI Personalized Learning Plan for SMART EDUCATION AI Dashboard

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Clock, Play, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodayTaskItem } from "../types/dashboard.types";

interface TodayPlanProps {
  tasks: TodayTaskItem[];
  onToggleTask: (taskId: string) => void;
}

export const TodayPlan: React.FC<TodayPlanProps> = ({ tasks, onToggleTask }) => {
  const navigate = useNavigate();

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>AI DAILY CURATION</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Today's AI Learning Plan 🎯</h2>
        </div>

        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
          {completedCount} / {tasks.length} Done
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-200 ${
              task.completed
                ? "border-emerald-200 bg-emerald-50/40 text-emerald-900 opacity-80"
                : "border-slate-200/80 bg-slate-50/60 hover:border-indigo-300 hover:bg-white hover:shadow-xs"
            }`}
          >
            {/* Task Info & Checkbox */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className="mt-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                title={task.completed ? "Mark incomplete" : "Mark completed"}
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                )}
              </button>

              <div className="space-y-1">
                <h3
                  className={`text-xs sm:text-sm font-bold ${
                    task.completed ? "line-through text-slate-400" : "text-slate-900"
                  }`}
                >
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-indigo-700 font-semibold shadow-xs">
                    {task.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {task.estimatedMinutes} mins
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      task.priority === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                size="sm"
                onClick={() => navigate(task.actionUrl)}
                className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 text-xs font-semibold text-white shadow-xs"
              >
                <Play className="mr-1 h-3 w-3 fill-white" />
                <span>Start</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="text-right pt-1">
        <Link
          to="/learn"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
        >
          <span>Open Full Curriculum</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
