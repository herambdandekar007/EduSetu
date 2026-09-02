// frontend/src/features/dashboard/components/UpcomingTasks.tsx
// Upcoming Deadlines & Examination Tasks for SMART EDUCATION AI Dashboard

import React from "react";
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, Sparkles } from "lucide-react";
import type { UpcomingTaskItem } from "../types/dashboard.types";

interface UpcomingTasksProps {
  tasks: UpcomingTaskItem[];
  onToggleTask: (taskId: string) => void;
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks, onToggleTask }) => {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
            <Calendar className="h-3 w-3 text-indigo-600" />
            <span>DEADLINES & EXAMS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Upcoming Tasks ⏳</h2>
        </div>

        <span className="text-xs text-slate-500 font-medium">{tasks.length} Pending Deadlines</span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-200 ${
              task.completed
                ? "border-emerald-200 bg-emerald-50/40 text-slate-500"
                : "border-slate-200/80 bg-slate-50/60 hover:border-indigo-300 hover:bg-white hover:shadow-xs"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className="mt-0.5 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400" />
                )}
              </button>

              <div className="space-y-0.5">
                <h4 className={`text-xs font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{task.subject}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-indigo-700 font-medium">
                    <Clock className="h-3 w-3 text-indigo-600" />
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                task.priority === "High"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {task.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
