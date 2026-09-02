// frontend/src/features/dashboard/components/AchievementPreview.tsx
// 3D Elevated Achievement Cards for SMART EDUCATION AI Dashboard

import React from "react";
import { Link } from "react-router-dom";
import { Trophy, Award, Sparkles, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import type { RecentAchievementItem } from "../types/dashboard.types";

interface AchievementPreviewProps {
  achievements: RecentAchievementItem[];
}

export const AchievementPreview: React.FC<AchievementPreviewProps> = ({ achievements }) => {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
            <Trophy className="h-3 w-3 text-amber-600" />
            <span>VERIFIED ACADEMIC MILESTONES</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recent Achievements 🏆</h2>
        </div>

        <Link
          to="/profile"
          className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 group"
        >
          <span>View All in Portfolio</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {achievements.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all duration-200 hover:border-amber-300 hover:bg-white hover:shadow-xs space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  {item.category === "Hackathon" ? (
                    <Trophy className="h-4 w-4" />
                  ) : item.category === "Streak Milestone" ? (
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-tight">
                {item.title}
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 truncate">{item.organization}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
