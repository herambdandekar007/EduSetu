// features/learn/components/TopicLearning.tsx
import React, { useState } from "react";
import { Lightbulb, BookMarked, ListChecks, PenSquare, Sparkles, Gauge, Loader2 } from "lucide-react";
import { Topic } from "../types/learn.types";
import { topics } from "../data/learnData";
import { explainTopic } from "../services/aiLearnService";
import AIResultPanel from "./AIResultPanel";

interface TopicLearningProps {
  topic?: Topic;
}

const TABS = ["Concept", "Explanation", "Examples", "Activities", "Practice", "AI Explanation"] as const;
type Tab = (typeof TABS)[number];

export default function TopicLearning({ topic = topics[0] }: TopicLearningProps) {
  const [tab, setTab] = useState<Tab>("Concept");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<string | null>(null);

  const handleAskAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiContent(null);
    try {
      const content = await explainTopic({
        topicName: topic.name,
        chapter: topic.chapter,
        concept: topic.concept,
      });
      setAiContent(content);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to get AI explanation.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-indigo-600">
        <Gauge size={14} /> Mastery {topic.mastery}%
      </div>
      <h2 className="text-xl font-semibold text-slate-900">{topic.name}</h2>
      <p className="mb-4 text-sm text-slate-500">{topic.chapter}</p>

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Concept" && (
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" /> {topic.concept}
        </p>
      )}

      {tab === "Explanation" && (
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
          <BookMarked size={16} className="mt-0.5 shrink-0 text-indigo-500" /> {topic.explanation}
        </p>
      )}

      {tab === "Examples" && (
        <ul className="space-y-2">
          {topic.examples.map((e, i) => (
            <li key={i} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {e}
            </li>
          ))}
        </ul>
      )}

      {tab === "Activities" && (
        <ul className="space-y-2">
          {topic.activities.map((a, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <ListChecks size={16} className="shrink-0 text-teal-600" /> {a}
            </li>
          ))}
        </ul>
      )}

      {tab === "Practice" && (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-sm text-slate-700">
            <PenSquare size={16} className="text-slate-500" /> {topic.practiceQuestions} practice questions available
          </p>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Start practice
          </button>
        </div>
      )}

      {tab === "AI Explanation" && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700">
            <Sparkles size={16} /> AI explanation
          </p>
          <p className="text-sm text-amber-900">
            Ask the AI tutor to re-explain "{topic.name}" in a simpler way, with a real-life example.
          </p>
          <button
            onClick={handleAskAI}
            disabled={aiLoading}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {aiLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> EduMind is thinking...
              </>
            ) : (
              "Ask AI to explain"
            )}
          </button>
          {(aiLoading || aiError || aiContent) && (
            <AIResultPanel
              title={`Simple explanation of "${topic.name}"`}
              loading={aiLoading}
              error={aiError}
              content={aiContent ?? undefined}
            />
          )}
        </div>
      )}
    </section>
  );
}