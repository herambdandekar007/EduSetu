// frontend/src/features/dashboard/components/RoadmapPreview.tsx
// 3D Career Roadmap Preview for SMART EDUCATION AI Dashboard

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, CheckCircle2, Circle, ArrowRight, Sparkles, MapPin, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoadmapOverviewData } from "../types/dashboard.types";

interface RoadmapPreviewProps {
  roadmap: RoadmapOverviewData;
}

export const RoadmapPreview: React.FC<RoadmapPreviewProps> = ({ roadmap }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-7 text-slate-900 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold text-cyan-700">
            <Compass className="h-3 w-3 text-cyan-600" />
            <span>LIFELONG CAREER PATHWAY</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">EduRoadmap Journey 🚀</h2>
        </div>

        <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-xl">
          {roadmap.completionPercentage}% On Track
        </span>
      </div>

      {/* Target Career Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Target Career Milestone
            </span>
            <h3 className="text-base font-extrabold text-slate-900">{roadmap.targetCareer}</h3>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-500 block">Next Target Skill:</span>
            <span className="text-xs font-bold text-indigo-700">{roadmap.nextSkill}</span>
          </div>
        </div>
      </div>

      {/* Milestone Pathway Horizontal Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
        {roadmap.milestones.map((m) => (
          <div
            key={m.id}
            className={`relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${
              m.status === "Completed"
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                : m.status === "Current"
                ? "border-indigo-500 bg-indigo-50/60 text-slate-900 ring-1 ring-indigo-400 shadow-xs"
                : "border-slate-200/80 bg-slate-50/50 text-slate-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                Step {m.stepNumber}
              </span>
              {m.status === "Completed" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : m.status === "Current" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
            </div>

            <p className="text-xs font-bold mt-2 leading-tight text-slate-900">{m.title}</p>
            <span
              className={`text-[9px] mt-2 font-semibold uppercase tracking-wider ${
                m.status === "Completed"
                  ? "text-emerald-700 font-bold"
                  : m.status === "Current"
                  ? "text-indigo-700 font-bold"
                  : "text-slate-400"
              }`}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          {roadmap.skillsRemainingCount} critical milestones remaining before industry graduation
        </span>
        <Button
          size="sm"
          onClick={() => navigate("/eduroadmap")}
          className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 text-xs font-semibold text-white shadow-xs"
        >
          <span>View Full EduRoadmap</span>
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
