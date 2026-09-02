// features/eduspeak/components/EnglishPractice.tsx
// Structured English speaking curriculum organized into Beginner, Intermediate, Advanced, and Professional tiers.

import React, { useState } from "react";
import {
  Sparkles,
  Play,
  Volume2,
  BookOpen,
  Briefcase,
  Award,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ProficiencyLevel, SpeakingPracticeMode } from "../types/eduspeak.types";

interface EnglishPracticeProps {
  currentLevel: ProficiencyLevel;
  onSelectPracticeTopic: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
  }) => void;
}

interface EnglishLevelModule {
  level: ProficiencyLevel;
  badgeColor: string;
  description: string;
  topics: {
    id: string;
    title: string;
    mode: SpeakingPracticeMode;
    prompt: string;
    instructions: string;
    durationSeconds: number;
    skills: string[];
    isCompleted?: boolean;
  }[];
}

const ENGLISH_LEVELS: EnglishLevelModule[] = [
  {
    level: "Beginner",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
    description: "Foundational vocabulary, simple greetings, family descriptions, and basic daily routines.",
    topics: [
      {
        id: "b-1",
        title: "Personal Greetings & Self Introduction",
        mode: "Self Introduction",
        prompt: "Introduce your name, where you are from, and what you are studying.",
        instructions: "Speak for 60 seconds. Mention your name, home city, college course, and hobbies.",
        durationSeconds: 60,
        skills: ["Present Tense", "Basic Pronouns", "Vocal Clarity"],
        isCompleted: true,
      },
      {
        id: "b-2",
        title: "Describing Your Daily Routine",
        mode: "Topic Speaking",
        prompt: "Describe your typical weekday from morning to evening.",
        instructions: "Speak for 60 seconds using sequential words (first, then, after that, finally).",
        durationSeconds: 60,
        skills: ["Sequence Words", "Time Expressions", "Simple Present"],
      },
      {
        id: "b-3",
        title: "Campus Life & Favorite College Subjects",
        mode: "Topic Speaking",
        prompt: "Talk about your favorite subject and why you enjoy learning it.",
        instructions: "Speak for 60 seconds explaining your favorite classes and professors.",
        durationSeconds: 60,
        skills: ["Descriptive Adjectives", "Subject Pronunciation"],
      },
    ],
  },
  {
    level: "Intermediate",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
    description: "Expressing nuanced opinions, storytelling, travel discussions, and logical problem explanations.",
    topics: [
      {
        id: "i-1",
        title: "Explaining a Difficult Academic Concept",
        mode: "Presentation Practice",
        prompt: "Explain a core concept from your coursework so a beginner can understand.",
        instructions: "Speak for 90 seconds. Use simple analogies and clear definitions.",
        durationSeconds: 90,
        skills: ["Analogies", "Complex Sentence Structure", "Pacing"],
      },
      {
        id: "i-2",
        title: "Overcoming an Engineering Hurdle",
        mode: "Story Speaking",
        prompt: "Describe a project roadblock you faced and how your team resolved it.",
        instructions: "Speak for 90 seconds using past tense and problem-solving vocabulary.",
        durationSeconds: 90,
        skills: ["Past Tense Consistency", "Action Verbs", "Linking Words"],
      },
      {
        id: "i-3",
        title: "Constructive Discussion: Online vs Classroom Study",
        mode: "Debate Practice",
        prompt: "Discuss the pros and cons of remote digital education vs physical classes.",
        instructions: "Speak for 90 seconds balancing both perspectives with evidence.",
        durationSeconds: 90,
        skills: ["Contrasting Connectors", "Balanced Argumentation"],
      },
    ],
  },
  {
    level: "Advanced",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-300",
    description: "Debates, public addresses, abstract discussions, and rapid extempore synthesis.",
    topics: [
      {
        id: "a-1",
        title: "Ethics of Artificial Intelligence & Automation",
        mode: "Public Speaking",
        prompt: "Deliver a compelling 2-minute speech on responsible AI deployment.",
        instructions: "Speak for 2 minutes on privacy, algorithmic fairness, and human oversight.",
        durationSeconds: 120,
        skills: ["Rhetoric", "Vocal Modulation", "Advanced Vocabulary"],
      },
      {
        id: "a-2",
        title: "Sustainable Smart Cities & Clean Technology",
        mode: "Presentation Practice",
        prompt: "Present a visionary blueprint for accessible, green urban infrastructure.",
        instructions: "Speak for 2 minutes detailing renewable grids and inclusive transit.",
        durationSeconds: 120,
        skills: ["Technical Depth", "Structure", "Persuasive Cadence"],
      },
    ],
  },
  {
    level: "Professional",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-300",
    description: "Job interviews, HR behavioral drills, technical capstone pitches, and client communication.",
    topics: [
      {
        id: "p-1",
        title: "HR Behavioral Drill: 'Tell Me About Yourself'",
        mode: "Interview Practice",
        prompt: "Deliver your crisp 90-second interview elevator pitch.",
        instructions: "Speak for 90 seconds using the STAR format focusing on professional value.",
        durationSeconds: 90,
        skills: ["Executive Presence", "STAR Framework", "Confidence"],
      },
      {
        id: "p-2",
        title: "Technical Architecture Project Defense",
        mode: "Presentation Practice",
        prompt: "Present your system architecture, database choices, and scalability safeguards.",
        instructions: "Speak for 2 minutes explaining trade-offs and tech stack decisions.",
        durationSeconds: 120,
        skills: ["System Terminology", "Concise Delivery", "Answering Queries"],
      },
    ],
  },
];

export const EnglishPractice: React.FC<EnglishPracticeProps> = ({
  currentLevel,
  onSelectPracticeTopic,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyLevel>(currentLevel || "Intermediate");

  const activeModule = ENGLISH_LEVELS.find((m) => m.level === selectedLevel) || ENGLISH_LEVELS[1];

  return (
    <div className="space-y-6">
      {/* ── Level Selector Pills ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap p-2 rounded-2xl border border-border/70 bg-card">
        {ENGLISH_LEVELS.map((m) => {
          const isSelected = selectedLevel === m.level;
          return (
            <button
              key={m.level}
              onClick={() => setSelectedLevel(m.level)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted border-border"
              }`}
            >
              <span>{m.level}</span>
              {currentLevel === m.level && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                  Current
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Level Info Card ────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  English Speaking Track
                </span>
                <Badge variant="outline" className={`text-xs font-bold ${activeModule.badgeColor}`}>
                  {activeModule.level} Tier
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {activeModule.level} English Communication Syllabus
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                {activeModule.description}
              </p>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {activeModule.topics.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-border/70 bg-muted/20 hover:border-cyan-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-cyan-600 border-cyan-300">
                      {t.mode}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      ~{t.durationSeconds}s
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground">{t.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.prompt}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {t.skills.map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-[10px] rounded-md font-normal">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      onSelectPracticeTopic({
                        title: t.title,
                        mode: t.mode,
                        instructions: t.instructions,
                        durationSeconds: t.durationSeconds,
                      })
                    }
                    className="gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Speaking Drill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
