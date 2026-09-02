// features/eduspeak/components/SpeakingAnalysisView.tsx
// Comprehensive multi-dimension AI speaking analysis results with mistakes diffs and strengths.

import React from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Bot,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { playTextToSpeech } from "../services/speechService";
import type { SpeechAnalysisResult } from "../types/eduspeak.types";

interface SpeakingAnalysisViewProps {
  analysis: SpeechAnalysisResult;
  onPracticeAgain: () => void;
  onAskMentor: (prompt: string) => void;
}

export const SpeakingAnalysisView: React.FC<SpeakingAnalysisViewProps> = ({
  analysis,
  onPracticeAgain,
  onAskMentor,
}) => {
  const handleListenCorrection = () => {
    if (analysis.correctedSentence) {
      playTextToSpeech(analysis.correctedSentence);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* ── 1. Top Composite Score Card ─────────────────────────────────── */}
      <Card className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-primary/5 to-background shadow-md overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-600 text-white">
                  🧠 AI SPEECH EVALUATION REPORT
                </span>
                <Badge variant="outline" className="text-xs">
                  Pace: {analysis.speakingPaceWpm} WPM
                </Badge>
              </div>

              <h2 className="text-2xl font-bold text-foreground">
                Speaking Assessment & Diagnostic Feedback
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                {analysis.feedback}
              </p>
            </div>

            {/* Big Overall Score Meter */}
            <div className="flex items-center gap-4 bg-background/80 p-4 rounded-2xl border border-border shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-extrabold text-2xl shadow-xs">
                {analysis.overallScore}%
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Overall Performance</p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  {analysis.overallScore >= 80 ? "Proficient & Fluent" : "Good Progress • Keep Practicing"}
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. Metric Score Bars ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-background/90 border border-border space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Pronunciation</span>
                <strong className="text-foreground">{analysis.pronunciationScore}%</strong>
              </div>
              <Progress value={analysis.pronunciationScore} className="h-1.5" />
            </div>

            <div className="p-3 rounded-xl bg-background/90 border border-border space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Fluency</span>
                <strong className="text-foreground">{analysis.fluencyScore}%</strong>
              </div>
              <Progress value={analysis.fluencyScore} className="h-1.5" />
            </div>

            <div className="p-3 rounded-xl bg-background/90 border border-border space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Grammar</span>
                <strong className="text-foreground">{analysis.grammarScore}%</strong>
              </div>
              <Progress value={analysis.grammarScore} className="h-1.5" />
            </div>

            <div className="p-3 rounded-xl bg-background/90 border border-border space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Vocabulary</span>
                <strong className="text-foreground">{analysis.vocabularyScore}%</strong>
              </div>
              <Progress value={analysis.vocabularyScore} className="h-1.5" />
            </div>

            <div className="p-3 rounded-xl bg-background/90 border border-border space-y-1.5 col-span-2 lg:col-span-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Confidence</span>
                <strong className="text-foreground">{analysis.confidenceScore}%</strong>
              </div>
              <Progress value={analysis.confidenceScore} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Transcripts & Suggested Sentence Enhancement ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Spoken Transcript */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-cyan-600" />
              Your Spoken Transcript
            </h3>
            <div className="p-3.5 rounded-xl bg-muted/40 text-xs leading-relaxed text-foreground min-h-[100px] border border-border/60">
              {analysis.transcript}
            </div>
          </CardContent>
        </Card>

        {/* AI Enhanced Correction */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-600" />
                Enhanced Standard English
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleListenCorrection}
                className="h-7 text-xs text-primary gap-1 px-2"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Listen Audio
              </Button>
            </div>
            <div className="p-3.5 rounded-xl bg-cyan-500/5 text-xs leading-relaxed text-foreground min-h-[100px] border border-cyan-500/20 font-medium">
              {analysis.correctedSentence || analysis.transcript}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Detected Mistakes & Corrections ──────────────────────────── */}
      {analysis.corrections && analysis.corrections.length > 0 && (
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Grammar & Phrasing Corrections ({analysis.corrections.length})
            </h3>

            <div className="space-y-2">
              {analysis.corrections.map((corr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                      {corr.category || "Grammar"}
                    </Badge>
                    <span className="text-rose-500 font-semibold line-through">"{corr.original}"</span>
                    <span>→</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">"{corr.suggested}"</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{corr.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 5. Strengths & Recommendations ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Key Speaking Strengths
            </h4>
            <div className="space-y-2">
              {analysis.strengths.map((str, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Next Recommended Exercises
            </h4>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 6. Bottom Action Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAskMentor(`How can I improve my speaking score from ${analysis.overallScore}% in English interviews?`)}
          className="gap-2 text-xs text-primary"
        >
          <Bot className="h-4 w-4" />
          Ask AI Speaking Mentor
        </Button>

        <Button
          onClick={onPracticeAgain}
          className="gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow"
        >
          <RotateCcw className="h-4 w-4" />
          Practice Another Topic
        </Button>
      </div>
    </div>
  );
};
