// features/learn/components/PersonalizedRevision.tsx
import React, { useState } from "react";
import {
  AlarmClock,
  TrendingDown,
  XOctagon,
  CloudOff,
  CalendarCheck2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  X,
  Loader2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { PersonalizedRevisionItem } from "../types/learn.types";
import { personalizedRevisionQueue } from "../data/learnData";
import { explainTopic } from "../services/aiLearnService";

interface PersonalizedRevisionProps {
  items?: PersonalizedRevisionItem[];
  onRevise?: (item: PersonalizedRevisionItem) => void;
  onLaunchTopicQuiz?: (topic: string) => void;
}

const REASON_ICON: Record<PersonalizedRevisionItem["reason"], React.ElementType> = {
  "Weak Topic": TrendingDown,
  "Past Mistake": XOctagon,
  "Forgotten Topic": CloudOff,
  "Upcoming Exam": CalendarCheck2,
  "Spaced Revision": RefreshCw,
};

export default function PersonalizedRevision({
  items = personalizedRevisionQueue,
  onRevise,
  onLaunchTopicQuiz,
}: PersonalizedRevisionProps) {
  const [activeRevisionItem, setActiveRevisionItem] = useState<PersonalizedRevisionItem | null>(null);
  const [revisedIds, setRevisedIds] = useState<Set<string>>(new Set());
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleOpenRevise = async (item: PersonalizedRevisionItem) => {
    setActiveRevisionItem(item);
    setAiExplanation(null);
    onRevise?.(item);

    // Fetch instant AI summary of this topic
    setLoadingAI(true);
    try {
      const expl = await explainTopic({
        topicName: item.topic,
        subject: item.subjectName,
      });
      setAiExplanation(expl);
    } catch {
      setAiExplanation(
        `Key Revision Tips for ${item.topic}:\n• Review standard definitions and fundamental axioms.\n• Focus on solving 3 core problem variations.\n• Review past mistakes and edge case boundary conditions.`
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleMarkRevised = (id: string) => {
    setRevisedIds((prev) => new Set([...prev, id]));
    setActiveRevisionItem(null);
  };

  return (
    <section className="w-full space-y-3">
      {/* Revision Items list */}
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = REASON_ICON[item.reason] || RefreshCw;
          const isRevised = revisedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-xl border p-4 shadow-xs transition ${
                isRevised
                  ? "bg-slate-50/80 border-slate-200 opacity-60"
                  : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isRevised ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {isRevised ? <CheckCircle size={16} /> : <Icon size={16} />}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${isRevised ? "line-through text-slate-500" : "text-slate-900"}`}>
                    {item.topic}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.subjectName ? `${item.subjectName} · ` : ""}
                    <span className="font-medium text-slate-600">{item.reason}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <AlarmClock size={12} /> {isRevised ? "In 7 days" : item.dueIn}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenRevise(item)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition ${
                    isRevised
                      ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs hover:shadow"
                  }`}
                >
                  {isRevised ? "Review Again" : "Revise"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Quick Revision Station Modal */}
      {activeRevisionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-indigo-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                  <Sparkles size={12} /> AI Quick Revision Station
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{activeRevisionItem.topic}</h3>
                <p className="text-xs text-slate-500">
                  {activeRevisionItem.subjectName} · Targeted recall for {activeRevisionItem.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRevisionItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Generated Revision Explainer */}
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-600" /> High-Yield Revision Summary
              </p>
              {loadingAI ? (
                <div className="flex items-center gap-2 py-4 text-xs text-indigo-600 font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  Generating personalized revision points with AI...
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {aiExplanation}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              {onLaunchTopicQuiz && (
                <button
                  type="button"
                  onClick={() => {
                    const topic = activeRevisionItem.topic;
                    setActiveRevisionItem(null);
                    onLaunchTopicQuiz(topic);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition"
                >
                  <Sparkles size={13} /> Take Topic Quiz <ArrowRight size={12} />
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveRevisionItem(null)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkRevised(activeRevisionItem.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs"
                >
                  <CheckCircle size={14} /> Mark as Mastered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}