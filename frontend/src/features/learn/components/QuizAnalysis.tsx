// features/learn/components/QuizAnalysis.tsx
// Diagnostic AI-Generated Quiz & Assessment Analysis with rich recommendations.

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Brain,
  AlertTriangle,
  Rocket,
  Sparkles,
  Volume2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { QuizAnalysisData } from "../types/learn.types";
import { quizAnalyses } from "../data/learnData";
import { readAloud } from "../services/aiLearnService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuizAnalysisProps {
  analysis?: QuizAnalysisData;
  onPracticeTopic?: (topic: string) => void;
}

export default function QuizAnalysis({
  analysis = quizAnalyses[0],
  onPracticeTopic,
}: QuizAnalysisProps) {
  const safeStrong = Array.isArray(analysis?.strongConcepts) ? analysis.strongConcepts : [];
  const safeWeak = Array.isArray(analysis?.weakConcepts) ? analysis.weakConcepts : [];
  const safeMistakes = Array.isArray(analysis?.mistakeAnalysis) ? analysis.mistakeAnalysis : [];
  const safePractice = Array.isArray(analysis?.recommendedPractice) ? analysis.recommendedPractice : [];

  const handleReadAloudAnalysis = () => {
    const speech = `Quiz Analysis for ${analysis.quizTitle}. Your score is ${analysis.score} with ${analysis.accuracy} percent accuracy. You got ${analysis.correctAnswers} correct and ${analysis.wrongAnswers} wrong. ${
      safeWeak.length > 0 ? `Concepts needing revision include: ${safeWeak.join(", ")}.` : "Great job, all concepts mastered!"
    }`;
    readAloud(speech);
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
              AI Diagnostic Report
            </Badge>
            <span className="text-xs text-slate-400">SMART EDUCATION AI</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{analysis.quizTitle || "Diagnostic Quiz Assessment"}</h2>
          <p className="text-xs text-slate-500">
            Personalized concept mastery and learning gap analysis derived from your answers
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReadAloudAnalysis}
          className="gap-1.5 rounded-xl border-slate-200 text-xs self-start sm:self-auto hover:bg-slate-50"
        >
          <Volume2 size={14} className="text-indigo-600" />
          <span>Read Analysis</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 p-4 text-center">
          <p className="text-2xl font-black text-indigo-700">{analysis.score ?? 0}%</p>
          <p className="text-xs font-semibold text-indigo-600">Total Score</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-slate-800">{analysis.accuracy ?? 0}%</p>
          <p className="text-xs font-semibold text-slate-500">Accuracy Rate</p>
        </div>
        <div className="rounded-xl bg-emerald-50/80 border border-emerald-100 p-4 text-center">
          <p className="flex items-center justify-center gap-1 text-2xl font-black text-emerald-700">
            <CheckCircle2 size={20} /> {analysis.correctAnswers ?? 0}
          </p>
          <p className="text-xs font-semibold text-emerald-600">Correct Answers</p>
        </div>
        <div className="rounded-xl bg-rose-50/80 border border-rose-100 p-4 text-center">
          <p className="flex items-center justify-center gap-1 text-2xl font-black text-rose-700">
            <XCircle size={20} /> {analysis.wrongAnswers ?? 0}
          </p>
          <p className="text-xs font-semibold text-rose-600">Wrong Answers</p>
        </div>
      </div>

      {/* Strong & Weak Concepts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 size={14} className="text-emerald-600" /> Strong Concepts Mastered
          </p>
          {safeStrong.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {safeStrong.map((c, i) => (
                <span key={`${c}-${i}`} className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800">
                  ✓ {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700/80">No strong concepts recorded yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-2">
          <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle size={14} className="text-rose-600" /> Concepts Needing Improvement
          </p>
          {safeWeak.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {safeWeak.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => onPracticeTopic?.(c)}
                  className="rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-medium text-rose-800 hover:bg-rose-200 transition-all flex items-center gap-1"
                >
                  <span>{c}</span>
                  <ArrowRight size={10} />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-rose-700/80">All concepts answered accurately!</p>
          )}
        </div>
      </div>

      {/* Mistake Pattern Analysis */}
      {safeMistakes.length > 0 && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <AlertTriangle size={15} className="text-amber-500" /> AI Mistake Pattern Breakdown
          </p>
          <div className="space-y-2">
            {safeMistakes.map((m, i) => (
              <div key={i} className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs text-slate-800">
                <span className="font-bold text-amber-900">{m.concept || "Question Concept"}:</span>{" "}
                <span className="text-slate-700">{m.mistake}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Practice Plan */}
      {safePractice.length > 0 && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-5 space-y-3">
          <p className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
            <Rocket size={16} className="text-indigo-600" /> AI Recommended Next Steps
          </p>
          <ul className="space-y-2">
            {safePractice.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-medium text-indigo-950">
                <Sparkles size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}