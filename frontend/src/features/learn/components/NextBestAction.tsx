// features/learn/components/NextBestAction.tsx
import React from "react";
import { Compass, ArrowRight, Sparkles } from "lucide-react";
import { NextBestActionItem } from "../types/learn.types";
import { nextBestActions } from "../data/learnData";

interface NextBestActionProps {
  actions?: NextBestActionItem[];
  onAct?: (action: NextBestActionItem) => void;
}

export default function NextBestAction({ actions = nextBestActions, onAct }: NextBestActionProps) {
  return (
    <section className="w-full rounded-2xl border border-indigo-200 bg-indigo-600 p-6 text-white">
      <p className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-100">
        <Compass size={16} /> Next best action for you
      </p>

      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onAct?.(a)}
            className="flex w-full items-center justify-between rounded-xl bg-white/10 p-3.5 text-left backdrop-blur transition hover:bg-white/20"
          >
            <div>
              <p className="text-xs text-indigo-100">{a.question}</p>
              <p className="flex items-center gap-1.5 text-sm font-medium text-white">
                <Sparkles size={13} className="text-amber-300" /> {a.actionLabel}
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-indigo-100" />
          </button>
        ))}
      </div>
    </section>
  );
}