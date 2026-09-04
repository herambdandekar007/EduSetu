// features/learn/components/NextBestAction.tsx
import React from "react";
import { Compass, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { NextBestActionItem } from "../types/learn.types";
import { nextBestActions } from "../data/learnData";

interface NextBestActionProps {
  actions?: NextBestActionItem[];
  onAct?: (action: NextBestActionItem) => void;
}

export default function NextBestAction({ actions = nextBestActions, onAct }: NextBestActionProps) {
  return (
    <section className="w-full rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-6 text-white shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-indigo-100 uppercase tracking-wider">
          <Compass size={16} className="text-indigo-300" /> Next Best Action for You
        </p>
        <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full font-medium text-indigo-200 border border-white/10">
          AI Prioritized
        </span>
      </div>

      <div className="space-y-2.5">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAct?.(a)}
            className="group flex w-full items-center justify-between rounded-xl bg-white/10 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-md cursor-pointer border border-white/10"
          >
            <div>
              <p className="text-xs text-indigo-200 font-medium">{a.question}</p>
              <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles size={14} className="text-amber-300 shrink-0" />
                <span>{a.actionLabel}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-lg text-white transition group-hover:bg-white group-hover:text-indigo-700">
                Start Now
              </span>
              <ArrowRight size={16} className="shrink-0 text-indigo-200 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}