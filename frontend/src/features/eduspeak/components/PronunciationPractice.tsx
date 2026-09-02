// features/eduspeak/components/PronunciationPractice.tsx
// Word & phrase pronunciation lab with phonetics, audio listening guides, and instant accuracy scoring.

import React, { useState } from "react";
import {
  Volume2,
  Mic,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { playTextToSpeech } from "../services/speechService";
import type { PronunciationWord, SpeakingPracticeMode } from "../types/eduspeak.types";

interface PronunciationPracticeProps {
  onPracticeWord: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
  }) => void;
}

const PRONUNCIATION_LIBRARY: PronunciationWord[] = [
  {
    id: "pw-1",
    word: "Algorithm",
    phonetic: "/ˈæl.ɡə.rɪ.ðəm/",
    category: "Technical",
    meaning: "A step-by-step procedure or set of rules for solving a problem.",
    example: "The binary search algorithm operates in logarithmic time complexity.",
  },
  {
    id: "pw-2",
    word: "Hierarchy",
    phonetic: "/ˈhaɪə.rɑː.ki/",
    category: "Academic",
    meaning: "A system in which members or items are ranked according to status.",
    example: "The class hierarchy defines clean inheritance in object-oriented design.",
  },
  {
    id: "pw-3",
    word: "Simultaneously",
    phonetic: "/ˌsɪm.əlˈteɪ.ni.əs.li/",
    category: "Difficult",
    meaning: "At the exact same time; concurrently.",
    example: "The microservices process thousands of transactions simultaneously.",
  },
  {
    id: "pw-4",
    word: "Particularly",
    phonetic: "/pəˈtɪk.jə.lə.li/",
    category: "Daily",
    meaning: "To a higher degree than usual; specifically.",
    example: "I am particularly interested in frontend performance optimization.",
  },
  {
    id: "pw-5",
    word: "Phenomenon",
    phonetic: "/fɪˈnɒm.ɪ.nən/",
    category: "Academic",
    meaning: "A remarkable development, circumstance, or observed fact.",
    example: "The adoption of generative AI represents a global technological phenomenon.",
  },
  {
    id: "pw-6",
    word: "Asynchronous",
    phonetic: "/eɪˈsɪŋ.krə.nəs/",
    category: "Technical",
    meaning: "Not occurring at the same time; non-blocking operations.",
    example: "JavaScript uses promises and async/await for asynchronous network calls.",
  },
];

export const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({
  onPracticeWord,
}) => {
  const [filterCat, setFilterCat] = useState<string>("All");

  const categories = ["All", "Technical", "Academic", "Difficult", "Daily"];

  const filteredWords = PRONUNCIATION_LIBRARY.filter(
    (w) => filterCat === "All" || w.category === filterCat
  );

  const handleListen = (text: string) => {
    playTextToSpeech(text, "en-IN", 0.9);
  };

  return (
    <div className="space-y-6">
      {/* ── Filter Pills ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-2xl border border-border/70 bg-card">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filterCat === cat ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterCat(cat)}
            className="rounded-xl text-xs"
          >
            {cat} Words
          </Button>
        ))}
      </div>

      {/* ── Words Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((item) => (
          <Card
            key={item.id}
            className="rounded-2xl border-border/70 bg-card hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">{item.word}</h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono pt-0.5">
                    {item.phonetic}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {item.category}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Meaning: </strong>
                {item.meaning}
              </p>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs italic text-foreground/90">
                "{item.example}"
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleListen(item.word)}
                  className="h-8 text-xs text-primary gap-1.5 px-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen Audio
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    onPracticeWord({
                      title: `Pronunciation: ${item.word}`,
                      mode: "Read Aloud",
                      instructions: `Pronounce "${item.word}" clearly, then speak the full sentence: "${item.example}"`,
                      durationSeconds: 30,
                    })
                  }
                  className="gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow-xs"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Speak & Score
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
