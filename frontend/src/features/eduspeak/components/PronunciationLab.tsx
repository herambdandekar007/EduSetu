import React, { useState } from "react";
import { playSpeechAudio, evaluateSpeechInput } from "../services/eduSpeakService";
import { StartSpeaking } from "./StartSpeaking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Award } from "lucide-react";

const PHONETIC_TARGETS = [
  { word: "Phenomenon", phonetic: "/fəˈnɒm.ɪ.nən/", tip: "Emphasis is on the second syllable: fuh-NOM-uh-non" },
  { word: "Specific", phonetic: "/spəˈsɪf.ɪk/", tip: "Ensure the initial 'S' and 'P' are crisp, not 'Pacific'" },
  { word: "Hierarchy", phonetic: "/ˈhaɪə.rɑː.ki/", tip: "Three syllables: HY-er-ar-kee" },
];

export const PronunciationLab: React.FC = () => {
  const [selectedWord, setSelectedWord] = useState(PHONETIC_TARGETS[0]);
  const [score, setScore] = useState<number | null>(null);

  const handleTestPronunciation = async (transcript: string) => {
    const res = await evaluateSpeechInput(transcript, selectedWord.word);
    setScore(res.metrics.pronunciation);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PHONETIC_TARGETS.map((t) => (
          <button
            key={t.word}
            type="button"
            onClick={() => {
              setSelectedWord(t);
              setScore(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedWord.word === t.word
                ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/20"
                : "border-border/70 bg-card/60 hover:bg-muted"
            }`}
          >
            <h4 className="font-bold text-base text-foreground">{t.word}</h4>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">{t.phonetic}</span>
          </button>
        ))}
      </div>

      <Card className="rounded-2xl border-border/70 bg-card/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-foreground">{selectedWord.word}</h3>
              <p className="text-xs text-muted-foreground mt-1">{selectedWord.tip}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => playSpeechAudio(selectedWord.word)}
              className="rounded-xl text-xs gap-1.5"
            >
              <Volume2 className="h-4 w-4" /> Listen
            </Button>
          </div>

          <StartSpeaking onRecordingComplete={handleTestPronunciation} />

          {score !== null && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-cyan-500" /> Pronunciation Match
              </span>
              <span className="text-lg font-bold text-cyan-600">{score}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};