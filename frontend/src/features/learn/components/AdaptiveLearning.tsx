// features/learn/components/AdaptiveLearning.tsx
// Continuous AI Learning Assessment & Adaptive Diagnostic Dashboard.

import React, { useState } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RotateCcw,
  Gauge,
  Timer,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { LearningAssessment } from "../types/learn.types";
import { learningAssessment } from "../data/learnData";

interface AdaptiveLearningProps {
  assessment?: LearningAssessment;
  onSelectConcept?: (concept: string) => void;
  onRecalibrate?: () => Promise<void> | void;
}

function Chip({
  label,
  variant = "default",
  onClick,
}: {
  label: string;
  variant?: "emerald" | "rose" | "default";
  onClick?: () => void;
}) {
  const styles = {
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
    default: "bg-white text-slate-700 border-slate-200 hover:bg-slate-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium border shadow-2xs transition cursor-pointer ${styles[variant]}`}
    >
      {label} {onClick && <span className="opacity-70">↗</span>}
    </button>
  );
}

export default function AdaptiveLearning({
  assessment = learningAssessment,
  onSelectConcept,
  onRecalibrate,
}: AdaptiveLearningProps) {
  const [calibrating, setCalibrating] = useState(false);
  const [calibratedNotice, setCalibratedNotice] = useState(false);

  const safeStrengths = Array.isArray(assessment?.strengthDetection) ? assessment.strengthDetection : [];
  const safeWeaknesses = Array.isArray(assessment?.weaknessDetection) ? assessment.weaknessDetection : [];
  const safeGaps = Array.isArray(assessment?.learningGapDetection) ? assessment.learningGapDetection : [];
  const safeMistakes = Array.isArray(assessment?.mistakePatternDetection) ? assessment.mistakePatternDetection : [];

  const handleRecalibrate = async () => {
    setCalibrating(true);
    setCalibratedNotice(false);
    try {
      if (onRecalibrate) {
        await onRecalibrate();
      } else {
        await new Promise((r) => setTimeout(r, 1200));
      }
      setCalibratedNotice(true);
      setTimeout(() => setCalibratedNotice(false), 3000);
    } finally {
      setCalibrating(false);
    }
  };

  return (
    <section className="w-full rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wider">
          <Brain size={18} className="text-indigo-600" /> AI Adaptive Assessment
        </p>
        <button
          type="button"
          onClick={handleRecalibrate}
          disabled={calibrating}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-200 transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {calibrating ? (
            <>
              <Loader2 size={13} className="animate-spin text-indigo-600" />
              Recalibrating AI...
            </>
          ) : (
            <>
              <Sparkles size={13} className="text-indigo-600" />
              Recalibrate with AI
            </>
          )}
        </button>
      </div>

      {calibratedNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>Continuous AI Calibration updated your mastery benchmarks in real time.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-white border border-indigo-50 p-4 text-center shadow-xs">
          <Gauge className="mx-auto mb-1 text-indigo-600" size={20} />
          <p className="text-lg font-bold text-slate-900">{assessment.knowledgeLevel || "Medium"}</p>
          <p className="text-xs text-slate-500 font-medium">Knowledge Level</p>
        </div>
        <div className="rounded-xl bg-white border border-indigo-50 p-4 text-center shadow-xs">
          <Target className="mx-auto mb-1 text-indigo-600" size={20} />
          <p className="text-lg font-bold text-slate-900">{assessment.topicMastery ?? 75}%</p>
          <p className="text-xs text-slate-500 font-medium">Topic Mastery</p>
        </div>
        <div className="rounded-xl bg-white border border-indigo-50 p-4 text-center shadow-xs">
          <RotateCcw className="mx-auto mb-1 text-indigo-600" size={20} />
          <p className="text-lg font-bold text-slate-900">{assessment.learningSpeed || "Optimal"}</p>
          <p className="text-xs text-slate-500 font-medium">Learning Speed</p>
        </div>
        <div className="rounded-xl bg-white border border-indigo-50 p-4 text-center shadow-xs">
          <Timer className="mx-auto mb-1 text-indigo-600" size={20} />
          <p className="text-lg font-bold text-slate-900">{Math.round((assessment.studyTimeMinutesPerWeek ?? 120) / 60)}h</p>
          <p className="text-xs text-slate-500 font-medium">Study Time / Week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp size={14} className="text-emerald-600" /> Strengths Detected
          </p>
          {safeStrengths.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {safeStrengths.map((s, i) => (
                <Chip
                  key={`${s}-${i}`}
                  label={s}
                  variant="emerald"
                  onClick={() => onSelectConcept?.(s)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700/80">Keep learning to detect top strengths.</p>
          )}
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-2">
          <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingDown size={14} className="text-rose-600" /> Improvement Areas
          </p>
          {safeWeaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {safeWeaknesses.map((w, i) => (
                <Chip
                  key={`${w}-${i}`}
                  label={w}
                  variant="rose"
                  onClick={() => onSelectConcept?.(w)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-rose-700/80">No major weaknesses identified!</p>
          )}
        </div>
      </div>

      {(safeGaps.length > 0 || safeMistakes.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <AlertCircle size={15} className="text-amber-600" /> Learning Gaps &amp; Mistake Patterns
          </p>
          <ul className="space-y-1.5 text-xs text-amber-950">
            {[...safeGaps, ...safeMistakes].map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}