// features/eduspeak/components/SpeakingPractice.tsx
// 12 Speaking practice modes with topic library and instant speech recording launcher.

import React, { useState } from "react";
import {
  Mic,
  Play,
  Sparkles,
  Users,
  MessageSquare,
  BookOpen,
  Image,
  Award,
  Flame,
  Volume2,
  Briefcase,
  Layers,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SpeakingPracticeMode, SpeakingTopicPrompt } from "../types/eduspeak.types";

interface SpeakingPracticeProps {
  onSelectTopic: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
  }) => void;
  onOpenFreeSpeaking: () => void;
}

interface PracticeModeCard {
  mode: SpeakingPracticeMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  duration: string;
  durationSec: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  instructions: string;
}

const PRACTICE_MODES: PracticeModeCard[] = [
  {
    mode: "Self Introduction",
    icon: <Users className="h-5 w-5 text-cyan-600" />,
    title: "Professional Self Introduction",
    description: "Introduce your name, academic background, technical skills, and career aspirations.",
    category: "Foundational",
    duration: "1–2 Mins",
    durationSec: 90,
    difficulty: "Beginner",
    instructions: "Speak for 90 seconds. Cover: 1) Your Name & College 2) Key Skills & Branch 3) Projects 4) Career Goal.",
  },
  {
    mode: "Daily Conversation",
    icon: <MessageSquare className="h-5 w-5 text-emerald-600" />,
    title: "Everyday Social Situations",
    description: "Practice casual greetings, asking for directions, making restaurant orders, and campus chats.",
    category: "Fluency",
    duration: "1 Min",
    durationSec: 60,
    difficulty: "Beginner",
    instructions: "Imagine talking with a peer about campus events, weekend study plans, or project deadlines.",
  },
  {
    mode: "Interview Practice",
    icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
    title: "HR & Technical Mock Interview",
    description: "Answer classic behavioral interview questions using the STAR framework (Situation, Task, Action, Result).",
    category: "Career",
    duration: "2–3 Mins",
    durationSec: 120,
    difficulty: "Intermediate",
    instructions: "Answer: 'Tell me about a difficult problem you faced in a project and how you solved it.'",
  },
  {
    mode: "Story Speaking",
    icon: <BookOpen className="h-5 w-5 text-amber-600" />,
    title: "Spontaneous Narrative & Storytelling",
    description: "Narrate an engaging personal experience, memorable trip, or life lesson with vivid descriptive vocabulary.",
    category: "Fluency",
    duration: "2 Mins",
    durationSec: 120,
    difficulty: "Intermediate",
    instructions: "Tell a short story about an unexpected hurdle you overcame and what you learned from it.",
  },
  {
    mode: "Picture Description",
    icon: <Image className="h-5 w-5 text-purple-600" />,
    title: "Visual Scene & Chart Description",
    description: "Describe visual relationships, spatial orientation, colors, and contextual action in real time.",
    category: "Vocabulary",
    duration: "1 Min",
    durationSec: 60,
    difficulty: "Beginner",
    instructions: "Describe a modern workspace: discuss lighting, ergonomics, collaborative workstations, and technology.",
  },
  {
    mode: "Read Aloud",
    icon: <Volume2 className="h-5 w-5 text-blue-600" />,
    title: "Pronunciation & Cadence Read-Aloud",
    description: "Read technical and literary passages aloud while maintaining natural syllable pacing and voice pitch.",
    category: "Pronunciation",
    duration: "1 Min",
    durationSec: 60,
    difficulty: "Beginner",
    instructions: "Read clearly: 'Artificial intelligence and inclusive technology empower diverse learners worldwide.'",
  },
  {
    mode: "Topic Speaking",
    icon: <Sparkles className="h-5 w-5 text-cyan-600" />,
    title: "2-Minute Technical Extempore",
    description: "Speak spontaneously on technology trends, cloud systems, web accessibility, or clean energy.",
    category: "Confidence",
    duration: "2 Mins",
    durationSec: 120,
    difficulty: "Intermediate",
    instructions: "Topic: 'Why Web Accessibility (WCAG) is essential for modern software applications.'",
  },
  {
    mode: "Debate Practice",
    icon: <Flame className="h-5 w-5 text-rose-600" />,
    title: "Constructive Debate & Argumentation",
    description: "Defend or oppose controversial propositions using logical linking phrases and data evidence.",
    category: "Advanced",
    duration: "2 Mins",
    durationSec: 120,
    difficulty: "Advanced",
    instructions: "Argue: 'Remote learning offers superior flexibility vs traditional in-person classroom education.'",
  },
  {
    mode: "Group Discussion",
    icon: <Users className="h-5 w-5 text-indigo-600" />,
    title: "Group Discussion (GD) Communication",
    description: "Practice formal GD etiquette: polite interruptions, summarizing viewpoints, and constructive consensus building.",
    category: "Career",
    duration: "2 Mins",
    durationSec: 120,
    difficulty: "Intermediate",
    instructions: "Initiate and conclude a group discussion on 'Impact of Automation on Engineering Job Roles'.",
  },
  {
    mode: "Presentation Practice",
    icon: <Award className="h-5 w-5 text-teal-600" />,
    title: "Project & Slide Pitch Delivery",
    description: "Deliver an executive summary of your engineering project with problem statement, architecture, and results.",
    category: "Professional",
    duration: "3 Mins",
    durationSec: 180,
    difficulty: "Advanced",
    instructions: "Present your capstone project: 1) Problem Statement 2) Solution Architecture 3) Impact.",
  },
  {
    mode: "Public Speaking",
    icon: <Mic className="h-5 w-5 text-orange-600" />,
    title: "Keynote & Motivational Address",
    description: "Deliver a compelling, structured speech designed to inspire an audience with pauses, cadence, and rhetoric.",
    category: "Advanced",
    duration: "3 Mins",
    durationSec: 180,
    difficulty: "Advanced",
    instructions: "Give a 3-minute speech on 'How perseverance and curiosity shape innovative problem solvers.'",
  },
  {
    mode: "Free Speaking",
    icon: <Sparkles className="h-5 w-5 text-pink-600" />,
    title: "Open-Mic Free Speaking & Expression",
    description: "Speak freely about any subject without time constraints. AI will analyze grammar, vocabulary, and rhythm.",
    category: "General",
    duration: "Open",
    durationSec: 60,
    difficulty: "Beginner",
    instructions: "Express your thoughts freely on any topic of your choice. AI will provide comprehensive feedback.",
  },
];

export const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({
  onSelectTopic,
  onOpenFreeSpeaking,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Foundational", "Fluency", "Career", "Pronunciation", "Advanced"];

  const filteredModes = PRACTICE_MODES.filter((m) => {
    const matchesCat = filterCategory === "All" || m.category === filterCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Filter Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat)}
              className="rounded-xl text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search practice mode..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-foreground"
          />
        </div>
      </div>

      {/* ── Modes Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModes.map((card) => (
          <Card
            key={card.mode}
            className="rounded-2xl border-border/70 bg-card hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {card.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {card.duration}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">
                  {card.category}
                </span>

                <Button
                  size="sm"
                  onClick={() =>
                    onSelectTopic({
                      title: card.title,
                      mode: card.mode,
                      instructions: card.instructions,
                      durationSeconds: card.durationSec,
                    })
                  }
                  className="gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow-xs"
                >
                  <Play className="h-3.5 w-3.5" />
                  Practice Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
