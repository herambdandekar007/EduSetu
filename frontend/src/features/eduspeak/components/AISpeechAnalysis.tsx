import React from "react";
import { SpeechAnalysisResult } from "../types/eduspeak.types";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Gauge, Award, CheckCircle } from "lucide-react";

interface AISpeechAnalysisProps {
  analysis: SpeechAnalysisResult;
}

export const AISpeechAnalysis: React.FC<AISpeechAnalysisProps> = ({ analysis }) => {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">AI Speech Evaluation</h3>
              <p className="text-xs text-muted-foreground">Generated analysis from your vocal input</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Overall Mastery</span>
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {analysis.overallScore}%
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pronunciation", value: `${analysis.metrics.pronunciation}%`, icon: <Award className="h-4 w-4" /> },
            { label: "Fluency", value: `${analysis.metrics.fluency}%`, icon: <Gauge className="h-4 w-4" /> },
            { label: "Grammar Accuracy", value: `${analysis.metrics.grammar}%`, icon: <CheckCircle className="h-4 w-4" /> },
            { label: "Speaking Pace", value: `${analysis.metrics.paceWpm} WPM`, icon: <Gauge className="h-4 w-4" /> },
          ].map((m) => (
            <div key={m.label} className="p-3.5 rounded-xl border border-border/50 bg-muted/30 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">{m.icon} {m.label}</span>
              <span className="text-lg font-bold text-foreground mt-2">{m.value}</span>
            </div>
          ))}
        </div>

        {/* Spoken Transcript */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected Transcript</span>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs font-mono text-foreground leading-relaxed">
            "{analysis.transcript}"
          </div>
        </div>

        {/* AI Constructive Feedback */}
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-900 dark:text-cyan-200">
          <strong>AI Insights: </strong> {analysis.feedback}
        </div>
      </CardContent>
    </Card>
  );
};