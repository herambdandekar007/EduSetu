// features/learn/components/AdaptiveDifficulty.tsx
import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { AdaptiveDifficultySetting, Difficulty } from "../types/learn.types";
import { adaptiveDifficultySettings } from "../data/learnData";

interface AdaptiveDifficultyProps {
  settings?: AdaptiveDifficultySetting[];
  onToggleAutoAdjust?: (subjectName: string, value: boolean) => void;
}

const LEVELS: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function AdaptiveDifficulty({
  settings = adaptiveDifficultySettings,
  onToggleAutoAdjust,
}: AdaptiveDifficultyProps) {
  return (
    <section className="w-full space-y-3">
      {settings.map((s) => (
        <div key={s.subjectName} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{s.subjectName}</p>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span>Auto-adjust</span>
              <input
                type="checkbox"
                checked={s.autoAdjust}
                onChange={(e) => onToggleAutoAdjust?.(s.subjectName, e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
            </label>
          </div>

          <div className="mb-2 flex gap-1 rounded-lg bg-slate-100 p-1">
            {LEVELS.map((level) => (
              <span
                key={level}
                className={`flex-1 rounded-md py-1 text-center text-xs font-medium ${
                  s.currentLevel === level ? "bg-indigo-600 text-white" : "text-slate-500"
                }`}
              >
                {level}
              </span>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal size={12} /> {s.reason}
          </p>
        </div>
      ))}
    </section>
  );
}