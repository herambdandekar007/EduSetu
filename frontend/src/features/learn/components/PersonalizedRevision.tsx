// features/learn/components/PersonalizedRevision.tsx
import React from "react";
import { AlarmClock, TrendingDown, XOctagon, CloudOff, CalendarCheck2, RefreshCw } from "lucide-react";
import { PersonalizedRevisionItem } from "../types/learn.types";
import { personalizedRevisionQueue } from "../data/learnData";

interface PersonalizedRevisionProps {
  items?: PersonalizedRevisionItem[];
  onRevise?: (item: PersonalizedRevisionItem) => void;
}

const REASON_ICON: Record<PersonalizedRevisionItem["reason"], React.ElementType> = {
  "Weak Topic": TrendingDown,
  "Past Mistake": XOctagon,
  "Forgotten Topic": CloudOff,
  "Upcoming Exam": CalendarCheck2,
  "Spaced Revision": RefreshCw,
};

export default function PersonalizedRevision({ items = personalizedRevisionQueue, onRevise }: PersonalizedRevisionProps) {
  return (
    <section className="w-full space-y-2">
      {items.map((item) => {
        const Icon = REASON_ICON[item.reason];
        return (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{item.topic}</p>
                <p className="text-xs text-slate-500">
                  {item.subjectName} · {item.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <AlarmClock size={12} /> {item.dueIn}
              </span>
              <button
                onClick={() => onRevise?.(item)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                Revise
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}