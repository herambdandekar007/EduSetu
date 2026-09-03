// frontend/src/features/profile/components/ProfileCompletion.tsx
// Pure Minimalist White & Grayscale Profile Completion System for SMART EDUCATION AI

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, ArrowRight } from "lucide-react";
import type { ProfileCompletionSummary } from "../types/profile.types";

interface ProfileCompletionProps {
  summary: ProfileCompletionSummary;
  onNavigateToTab: (tab: string) => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  summary,
  onNavigateToTab,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-black shadow-sm space-y-4">
      {/* Header with Completion Percentage */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-black">Profile Completion Status</h2>
          <p className="text-xs text-gray-500">
            Complete your profile details to ensure full academic and career readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold text-black">{summary.overallPercentage}%</span>
          <span className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
            {summary.isComplete ? "Complete" : "In Progress"}
          </span>
        </div>
      </div>

      {/* Monochrome Progress Bar */}
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-500 rounded-full"
          style={{ width: `${summary.overallPercentage}%` }}
        />
      </div>

      {/* Sections Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
        {summary.sections.map((section, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onNavigateToTab(section.actionTab)}
            className={`flex flex-col justify-between rounded-lg border p-2.5 text-left transition-colors ${
              section.completed
                ? "border-gray-300 bg-gray-50 text-black hover:border-black"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-bold truncate">{section.title}</span>
              {section.completed ? (
                <Check className="h-3.5 w-3.5 text-black shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-mono">
              {section.completed ? "Done" : `+${section.weight}%`}
            </span>
          </button>
        ))}
      </div>

      {/* Missing Recommendations */}
      {summary.recommendations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>{summary.recommendations[0]}</span>
          <span className="text-black font-semibold text-xs inline-flex items-center">
            Complete next section <ArrowRight className="ml-1 h-3 w-3" />
          </span>
        </div>
      )}
    </div>
  );
};
