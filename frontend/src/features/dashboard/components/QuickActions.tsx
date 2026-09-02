// frontend/src/features/dashboard/components/QuickActions.tsx
// 3D Elevated Quick Action Command Bar for SMART EDUCATION AI Dashboard

import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bot, Mic, Compass, FolderLock, Briefcase, User, Sparkles } from "lucide-react";

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const ACTIONS = [
    {
      label: "Start Learning",
      desc: "Adaptive Courses",
      icon: BookOpen,
      url: "/learn",
      color: "from-indigo-500 to-indigo-700",
      shadow: "shadow-indigo-500/20",
    },
    {
      label: "Ask EduMentor",
      desc: "24/7 AI Tutor",
      icon: Bot,
      url: "/edumentor",
      color: "from-purple-500 to-purple-700",
      shadow: "shadow-purple-500/20",
    },
    {
      label: "EduSpeak Lab",
      desc: "AI Pronunciation",
      icon: Mic,
      url: "/eduspeak",
      color: "from-cyan-500 to-cyan-700",
      shadow: "shadow-cyan-500/20",
    },
    {
      label: "EduRoadmap",
      desc: "Career Milestones",
      icon: Compass,
      url: "/eduroadmap",
      color: "from-pink-500 to-pink-700",
      shadow: "shadow-pink-500/20",
    },
    {
      label: "EduVault",
      desc: "Verified Credentials",
      icon: FolderLock,
      url: "/eduvault",
      color: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Job Matches",
      desc: "AI Career Match",
      icon: Briefcase,
      url: "/jobs",
      color: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/20",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Quick Command Actions
          </h3>
          <p className="text-xs text-slate-500">
            Instant 1-click access to major Smart Education AI intelligent modules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(action.url)}
              className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-center transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-xs active:scale-95"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="mt-2.5 text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {action.label}
              </span>
              <span className="text-[10px] text-slate-400">{action.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
