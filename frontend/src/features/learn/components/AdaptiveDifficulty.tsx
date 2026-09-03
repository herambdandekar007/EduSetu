// features/learn/components/AdaptiveDifficulty.tsx
import React, { useState } from "react";
import { SlidersHorizontal, CheckCircle2, Sparkles } from "lucide-react";
import { AdaptiveDifficultySetting, Difficulty } from "../types/learn.types";
import { adaptiveDifficultySettings } from "../data/learnData";

interface AdaptiveDifficultyProps {
  settings?: AdaptiveDifficultySetting[];
  onToggleAutoAdjust?: (subjectName: string, value: boolean) => void;
  onChangeLevel?: (subjectName: string, level: Difficulty) => void;
}

const LEVELS: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function AdaptiveDifficulty({
  settings = adaptiveDifficultySettings,
  onToggleAutoAdjust,
  onChangeLevel,
}: AdaptiveDifficultyProps) {
  // Local state for instant optimistic UI responses
  const [localSettings, setLocalSettings] = useState<Record<string, { level: Difficulty; autoAdjust: boolean }>>(() => {
    const init: Record<string, { level: Difficulty; autoAdjust: boolean }> = {};
    settings.forEach((s) => {
      init[s.subjectName] = { level: s.currentLevel, autoAdjust: s.autoAdjust };
    });
    return init;
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSelectLevel = (subjectName: string, level: Difficulty) => {
    setLocalSettings((prev) => ({
      ...prev,
      [subjectName]: {
        ...(prev[subjectName] || { autoAdjust: true }),
        level,
      },
    }));
    onChangeLevel?.(subjectName, level);
    setSavedNotice(`${subjectName} calibrated to ${level}`);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleToggleAuto = (subjectName: string, autoAdjust: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [subjectName]: {
        ...(prev[subjectName] || { level: "Medium" }),
        autoAdjust,
      },
    }));
    onToggleAutoAdjust?.(subjectName, autoAdjust);
    setSavedNotice(`${subjectName} auto-adjust ${autoAdjust ? "enabled" : "disabled"}`);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <section className="w-full space-y-4">
      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-700 animate-in fade-in">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>{savedNotice} — New quizzes and adaptive problem sets will match this tier.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {settings.map((s) => {
          const current = localSettings[s.subjectName] || { level: s.currentLevel, autoAdjust: s.autoAdjust };
          return (
            <div
              key={s.subjectName}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{s.subjectName}</p>
                  <p className="text-xs text-slate-400">Current AI tier: <span className="font-semibold text-indigo-600">{current.level}</span></p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 select-none bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={current.autoAdjust}
                    onChange={(e) => handleToggleAuto(s.subjectName, e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-500" />
                    Auto-adjust
                  </span>
                </label>
              </div>

              {/* Clickable interactive difficulty buttons */}
              <div className="mb-3 flex gap-1.5 rounded-xl bg-slate-100/80 p-1 border border-slate-200/60">
                {LEVELS.map((level) => {
                  const isActive = current.level === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleSelectLevel(s.subjectName, level)}
                      className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20 scale-[1.01]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>

              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <SlidersHorizontal size={13} className="text-slate-400 shrink-0" />
                <span>{s.reason}</span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}