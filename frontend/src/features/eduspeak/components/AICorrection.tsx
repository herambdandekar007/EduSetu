import React from "react";
import { SpeechAnalysisResult } from "../types/eduspeak.types";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface AICorrectionProps {
  corrections: SpeechAnalysisResult["corrections"];
}

export const AICorrection: React.FC<AICorrectionProps> = ({ corrections }) => {
  if (!corrections || corrections.length === 0) {
    return (
      <Card className="rounded-2xl border-border/70 bg-emerald-500/5">
        <CardContent className="p-5 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-xs font-medium">No major grammar or pronunciation errors detected in your speech!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500" /> AI Corrections & Phrasing Optimizations
      </h4>
      <div className="space-y-2.5">
        {corrections.map((corr, idx) => (
          <Card key={idx} className="rounded-xl border-border/70 bg-card/60">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 font-mono line-through">
                  {corr.original}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-semibold">
                  {corr.suggested}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{corr.explanation}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};