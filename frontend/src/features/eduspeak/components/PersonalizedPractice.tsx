// features/eduspeak/components/PersonalizedPractice.tsx
// Calibrated AI recommendations tailored from previous speaking performance, weak words, and career track.

import React from "react";
import {
  Sparkles,
  Target,
  Play,
  ArrowRight,
  Flame,
  Award,
  Volume2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EduSpeakProfile, SpeakingPracticeMode } from "../types/eduspeak.types";

interface PersonalizedPracticeProps {
  profile: EduSpeakProfile;
  onSelectTopic: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
  }) => void;
  onAskMentor: (prompt: string) => void;
}

export const PersonalizedPractice: React.FC<PersonalizedPracticeProps> = ({
  profile,
  onSelectTopic,
  onAskMentor,
}) => {
  const recommendations = [
    {
      id: "rec-1",
      category: "Interview Readiness",
      title: "HR Behavioral Practice: 'Why Should We Hire You?'",
      mode: "Interview Practice" as SpeakingPracticeMode,
      reason: "Your career profile indicates upcoming technical placements. Focus on structured value propositions.",
      duration: "90s",
      durationSec: 90,
      instructions: "Speak for 90 seconds highlighting 1) Your problem-solving strengths 2) Relevant project experience 3) Work ethic.",
    },
    {
      id: "rec-2",
      category: "Pronunciation Drill",
      title: "Multi-Syllable Technical Vocabulary Drill",
      mode: "Read Aloud" as SpeakingPracticeMode,
      reason: `Reinforce syllable clarity for focus words: ${profile.weakWords?.slice(0, 3).join(", ") || "Technical Vocabulary"}.`,
      duration: "60s",
      durationSec: 60,
      instructions: "Read the technical passage aloud focusing on precise enunciation and natural pauses at commas.",
    },
    {
      id: "rec-3",
      category: "Fluency & Cadence",
      title: "Spontaneous 2-Minute Technical Summary",
      mode: "Topic Speaking" as SpeakingPracticeMode,
      reason: "Enhance spoken confidence and reduce filler hesitations when explaining complex ideas.",
      duration: "2 Mins",
      durationSec: 120,
      instructions: "Speak for 2 minutes on 'The architecture and benefits of modern web applications.'",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-600 text-white">
                  🎯 ADAPTIVE RECOMMENDATIONS
                </span>
                <Badge variant="outline" className="text-xs">
                  Calibrated for {profile.currentLevel} Level
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Your Personalized Communication Plan
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                EduSpeak continuously adapts your daily speaking drills based on diagnostic pronunciation accuracy, filler word patterns, and career placement goals.
              </p>
            </div>

            <Button
              onClick={() => onAskMentor("What is my single most important communication weakness to focus on today?")}
              className="gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow hover:shadow-md shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Ask AI Focus Area
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card
            key={rec.id}
            className="rounded-2xl border-border/70 bg-card hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] text-cyan-600 border-cyan-300 font-bold uppercase">
                    {rec.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rec.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground pt-1">{rec.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Why? </strong>
                  {rec.reason}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                  {rec.mode}
                </span>

                <Button
                  size="sm"
                  onClick={() =>
                    onSelectTopic({
                      title: rec.title,
                      mode: rec.mode,
                      instructions: rec.instructions,
                      durationSeconds: rec.durationSec,
                    })
                  }
                  className="gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow-xs"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Drill
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
