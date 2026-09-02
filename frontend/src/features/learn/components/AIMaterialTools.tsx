// features/learn/components/AIMaterialTools.tsx
// Fully working AI tools for a learning material — calls the backend
// /learn-ai/material-tool endpoint (NVIDIA NIM) via aiLearnService.
import React, { useState } from "react";
import {
  FileText,
  Wand2,
  BookOpenCheck,
  ListOrdered,
  HelpCircle,
  Layers,
  NotebookPen,
  MessageCircleQuestion,
  Volume2,
  Loader2,
  Send,
  X,
  LucideIcon,
} from "lucide-react";
import { AIMaterialToolKey, LearningMaterial } from "../types/learn.types";
import { runMaterialTool, readAloud } from "../services/aiLearnService";
import AIResultPanel from "./AIResultPanel";

interface AIMaterialToolsProps {
  material?: LearningMaterial;
  targetTitle?: string;
  /** Extra context (e.g. OCR-extracted text) that tools should reason over */
  materialContext?: string;
  onToolSelect?: (tool: AIMaterialToolKey) => void;
  onClose?: () => void;
}

const TOOLS: { key: AIMaterialToolKey; icon: LucideIcon }[] = [
  { key: "Summarize", icon: FileText },
  { key: "Explain Simply", icon: Wand2 },
  { key: "Explain with Example", icon: BookOpenCheck },
  { key: "Important Points", icon: ListOrdered },
  { key: "Generate Questions", icon: HelpCircle },
  { key: "Generate Flashcards", icon: Layers },
  { key: "Generate Revision Notes", icon: NotebookPen },
  { key: "Ask AI", icon: MessageCircleQuestion },
  { key: "Read Aloud", icon: Volume2 },
];

export default function AIMaterialTools({
  material,
  targetTitle,
  materialContext,
  onToolSelect,
  onClose,
}: AIMaterialToolsProps) {
  const [activeTool, setActiveTool] = useState<AIMaterialToolKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // Ask AI free-text input
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const title = material?.title ?? targetTitle ?? "this material";

  const handleRun = async (tool: AIMaterialToolKey, q?: string) => {
    onToolSelect?.(tool);

    if (!material && !materialContext && tool !== "Read Aloud") return;

    if (tool === "Read Aloud") {
      readAloud(q || materialContext || material?.title || title);
      return;
    }

    setActiveTool(tool);
    setError(null);
    setResult(null);

    if (tool === "Ask AI") {
      setAskOpen(true);
      if (!q) return;
      setQuestion("");
    }

    setLoading(true);
    try {
      const res = await runMaterialTool(tool, {
        materialTitle: material?.title ?? title,
        subject: material?.subjectName,
        chapter: material?.chapter,
        question: q,
        materialContext:
          materialContext ||
          (material ? `${material.title} (${material.subjectName}, ${material.chapter})` : undefined),
      });
      setResult(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
      <p className="mb-1 flex items-center justify-between text-sm font-medium text-amber-800">
        <span>AI tools for {title}</span>
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            className="rounded-lg p-1 text-amber-700 transition hover:bg-amber-100"
          >
            <X size={15} />
          </button>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {TOOLS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleRun(key)}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition disabled:opacity-60 ${
              activeTool === key
                ? "border-amber-500 bg-amber-600 text-white"
                : "border-amber-200 bg-white text-amber-800 hover:border-amber-400 hover:bg-amber-100"
            }`}
          >
            {loading && activeTool === key ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Icon size={13} />
            )}
            {key}
          </button>
        ))}
      </div>

      {/* Free-text question box for Ask AI */}
      {askOpen && activeTool === "Ask AI" && !result && !loading && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) handleRun("Ask AI", question.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask anything about "${title}"...`}
            className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <Send size={14} /> Ask
          </button>
        </form>
      )}

      {(loading || error || result) && (
        <AIResultPanel
          title={
            activeTool === "Ask AI"
              ? `EduMind answer${question ? "" : ""}`
              : `${activeTool} · EduMind`
          }
          loading={loading}
          error={error}
          content={result ?? undefined}
        />
      )}
    </section>
  );
}
