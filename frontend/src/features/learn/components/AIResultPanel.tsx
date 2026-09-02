// features/learn/components/AIResultPanel.tsx
// Shared panel that renders AI tutor output with loading / error states,
// copy-to-clipboard and read-aloud controls.
import React, { useState } from "react";
import { Loader2, AlertCircle, Copy, Check, Volume2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { readAloud, stopReading } from "../services/aiLearnService";

interface AIResultPanelProps {
  title?: string;
  loading?: boolean;
  error?: string | null;
  content?: string;
  accent?: "amber" | "indigo";
}

export default function AIResultPanel({
  title = "AI result",
  loading,
  error,
  content,
  accent = "amber",
}: AIResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [reading, setReading] = useState(false);

  const border = accent === "amber" ? "border-amber-200" : "border-indigo-200";
  const bg = accent === "amber" ? "bg-amber-50" : "bg-indigo-50";
  const heading = accent === "amber" ? "text-amber-700" : "text-indigo-700";

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleReadAloud = () => {
    if (reading) {
      stopReading();
      setReading(false);
    } else if (content) {
      readAloud(content.replace(/[#*_>`]/g, ""));
      setReading(true);
      // Rough estimate; speech synthesis has no reliable onend across browsers here
      setTimeout(() => setReading(false), Math.min(content.length * 60, 300000));
    }
  };

  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={`flex items-center gap-2 text-sm font-medium ${heading}`}>
          <Sparkles size={16} /> {title}
        </p>
        {!loading && !error && content && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              title="Copy"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800"
            >
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>
            <button
              onClick={handleReadAloud}
              title={reading ? "Stop reading" : "Read aloud"}
              className={`rounded-lg p-1.5 transition hover:bg-white ${
                reading ? "text-indigo-700" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Volume2 size={15} />
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-600">
          <Loader2 size={18} className="animate-spin" /> EduMind is thinking...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 py-2 text-sm text-rose-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && content && (
        <div className="max-h-[28rem] overflow-y-auto pr-1 text-sm leading-relaxed text-slate-800 [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
