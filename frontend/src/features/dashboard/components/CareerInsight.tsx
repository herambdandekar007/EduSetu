// frontend/src/features/dashboard/components/CareerInsight.tsx
// Career Direction & Placement Readiness for SMART EDUCATION AI Dashboard

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Target, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CareerDirectionData } from "../types/dashboard.types";

interface CareerInsightProps {
  career: CareerDirectionData;
}

export const CareerInsight: React.FC<CareerInsightProps> = ({ career }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold text-pink-700">
            <Sparkles className="h-3 w-3 text-pink-600" />
            <span>AI PLACEMENT INTELLIGENCE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Your Career Direction 💼</h2>
        </div>

        <span className="font-mono text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 px-3 py-1 rounded-xl">
          {career.careerMatchPercentage}% Match
        </span>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Career */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Top Matched Role
          </span>
          <h3 className="text-base font-extrabold text-slate-900">{career.primaryCareer}</h3>
          <div className="flex items-center gap-2 pt-1">
            <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-pink-600"
                style={{ width: `${career.careerMatchPercentage}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-pink-700">
              {career.careerMatchPercentage}%
            </span>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Industry Readiness Score
          </span>
          <h3 className="text-base font-extrabold text-indigo-700 font-mono">
            {career.readinessScore}% Ready
          </h3>
          <p className="text-[11px] text-slate-500">
            Based on completed projects, hackathon achievements & verified skill tests.
          </p>
        </div>
      </div>

      {/* Skills to Improve */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Skills to Accelerate Placement:
        </span>
        <div className="flex flex-wrap gap-2">
          {career.skillsToImprove.map((skill, idx) => (
            <span
              key={idx}
              className="rounded-xl border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700"
            >
              + {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Alternative Matches & CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span>Alternative fits:</span>
          {career.topAlternativeCareers.slice(0, 2).map((alt, i) => (
            <span key={i} className="font-semibold text-slate-800">
              {alt.name} ({alt.matchScore}%)
            </span>
          ))}
        </div>

        <Button
          size="sm"
          onClick={() => navigate("/jobs")}
          className="h-8 rounded-xl bg-pink-600 hover:bg-pink-700 px-4 text-xs font-semibold text-white shadow-xs"
        >
          <span>Explore Job Matches</span>
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
