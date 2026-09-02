import React, { useState } from "react";
import { DAILY_VOCABULARY } from "../data/eduspeakData";
import { VocabularyWord } from "../types/eduspeak.types";
import { playSpeechAudio } from "../services/eduSpeakService";
import { Volume2, CheckCircle2, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DailyVocabulary: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyWord[]>(DAILY_VOCABULARY);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const toggleMastered = (id: string) => {
    setVocabList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mastered: !item.mastered } : item))
    );
  };

  const handlePronounce = async (word: VocabularyWord) => {
    try {
      setPlayingId(word.id);
      await playSpeechAudio(word.word);
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Daily Lexicon & Vocabulary</h3>
          <p className="text-xs text-muted-foreground">High-impact terms with pronunciation guides</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vocabList.map((item) => (
          <Card key={item.id} className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{item.word}</h4>
                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">{item.phonetic}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {item.partOfSpeech}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">{item.definition}</p>

                <div className="mt-3 p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs italic text-foreground/90">
                  "{item.example}"
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {item.synonyms.map((syn) => (
                    <span key={syn} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePronounce(item)}
                  disabled={playingId === item.id}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Volume2 className={`h-3.5 w-3.5 ${playingId === item.id ? "animate-pulse text-cyan-500" : ""}`} />
                  Listen
                </Button>

                <Button
                  size="sm"
                  variant={item.mastered ? "default" : "ghost"}
                  onClick={() => toggleMastered(item.id)}
                  className={`rounded-xl text-xs gap-1 ${
                    item.mastered ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                >
                  {item.mastered ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  {item.mastered ? "Mastered" : "Mark Mastered"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};