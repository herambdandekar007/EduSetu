// frontend/src/features/dashboard/components/AIRecommendations.tsx
// EduMind Recommends AI Section for SMART EDUCATION AI Dashboard

import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Brain, Lightbulb, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIRecommendationItem } from "../types/dashboard.types";

interface AIRecommendationsProps {
  recommendations: AIRecommendationItem[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">
            <Sparkles className="h-3 w-3 text-purple-600" />
            <span>EDUMIND NEURAL ENGINE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">EduMind Recommends 💡</h2>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Personalized from real quiz & speech data
        </span>
      </div>

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 transition-all duration-200 hover:border-purple-300 hover:bg-white hover:shadow-xs space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    rec.category === "Weakness Drill"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : rec.category === "Speech Lab"
                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  {rec.category}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">{rec.difficulty}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                {rec.title}
              </h3>

              {/* "Why is this recommended?" Badge & Explanation */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                  <HelpCircle className="h-3 w-3 text-purple-600" />
                  <span>Why is this recommended?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{rec.reason}</p>
              </div>
            </div>

            {/* Action CTA */}
            <Button
              size="sm"
              onClick={() => navigate(rec.actionUrl)}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-white text-xs shadow-xs"
            >
              <span>{rec.actionLabel}</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
