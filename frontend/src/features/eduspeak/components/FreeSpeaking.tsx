import React, { useState } from "react";
import { evaluateSpeechInput } from "../services/eduSpeakService";
import { SpeechAnalysisResult } from "../types/eduspeak.types";
import { StartSpeaking } from "./StartSpeaking";
import { AISpeechAnalysis } from "./AISpeechAnalysis";
import { AICorrection } from "./AICorrection";

export const FreeSpeaking: React.FC = () => {
  const [analysis, setAnalysis] = useState<SpeechAnalysisResult | null>(null);

  const handleComplete = async (transcript: string, duration: number) => {
    const res = await evaluateSpeechInput(transcript, undefined, duration);
    setAnalysis(res);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Free Unstructured Speech</h3>
        <p className="text-xs text-muted-foreground">Speak freely on any topic and receive full AI feedback.</p>
      </div>

      <StartSpeaking onRecordingComplete={handleComplete} />

      {analysis && (
        <div className="space-y-6">
          <AISpeechAnalysis analysis={analysis} />
          <AICorrection corrections={analysis.corrections} />
        </div>
      )}
    </div>
  );
};