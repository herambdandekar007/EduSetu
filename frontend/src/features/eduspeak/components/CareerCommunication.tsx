// features/eduspeak/components/CareerCommunication.tsx
// Connects with EduCareer & EduRoadmap to provide career-specific speaking and presentation simulations.

import React from "react";
import {
  Briefcase,
  Sparkles,
  Play,
  Award,
  Users,
  Layers,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SpeakingPracticeMode, CareerCommTopic } from "../types/eduspeak.types";

interface CareerCommunicationProps {
  careerGoal: string;
  onSelectTopic: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
  }) => void;
  onAskMentor: (prompt: string) => void;
}

const CAREER_DRILLS: CareerCommTopic[] = [
  {
    id: "cc-1",
    careerName: "Software Engineer",
    title: "Explain Your Capstone Project & Architecture",
    scenario: "Technical Interview & Capstone Defense",
    prompt: "Explain your fullstack web portal: discuss database choices, REST endpoints, auth, and state management.",
    keyPhrases: ["System architecture", "Database indexing", "Scalability", "Asynchronous processing"],
    durationMinutes: 2,
    difficulty: "Intermediate",
  },
  {
    id: "cc-2",
    careerName: "Software Engineer",
    title: "Live Code Walkthrough & Debugging Explanation",
    scenario: "Technical Coding Round",
    prompt: "Explain your thought process while implementing a recursive graph search or tree traversal algorithm.",
    keyPhrases: ["Time complexity", "Edge cases", "Base condition", "Memory overhead"],
    durationMinutes: 2,
    difficulty: "Advanced",
  },
  {
    id: "cc-3",
    careerName: "AI & Machine Learning Specialist",
    title: "Presenting Model Evaluation & RAG Pipeline",
    scenario: "AI Engineering Panel",
    prompt: "Present your retrieval-augmented generation pipeline, vector database embeddings, and token cost optimization.",
    keyPhrases: ["Embeddings", "Cosine similarity", "Latency benchmarks", "Model hallucination mitigation"],
    durationMinutes: 3,
    difficulty: "Professional",
  },
  {
    id: "cc-4",
    careerName: "General / Corporate",
    title: "Executive Cross-Functional Stakeholder Update",
    scenario: "Client & Manager Sync",
    prompt: "Provide a 90-second progress update on project milestones, deliverable deadlines, and team blockers.",
    keyPhrases: ["Action items", "Key milestones", "Risk mitigation", "Deliverable timeline"],
    durationMinutes: 2,
    difficulty: "Intermediate",
  },
];

export const CareerCommunication: React.FC<CareerCommunicationProps> = ({
  careerGoal,
  onSelectTopic,
  onAskMentor,
}) => {
  return (
    <div className="space-y-6">
      {/* ── Top Summary Banner ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  🧑‍💼 CAREER-ALIGNED COMMUNICATION
                </span>
                <Badge variant="outline" className="text-xs">
                  Aligned with: {careerGoal || "Software Engineering"}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Professional Speaking & Job Readiness Drills
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Tailored speech exercises designed for technical job interviews, project presentations, team standups, and client discussions.
              </p>
            </div>

            <Button
              onClick={() => onAskMentor(`What are the top 5 communication tips for a ${careerGoal} interview?`)}
              className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow hover:shadow-md shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Interview Communication Tips
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Drills Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAREER_DRILLS.map((drill) => (
          <Card
            key={drill.id}
            className="rounded-2xl border-border/70 bg-card hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-600 border-indigo-300">
                    {drill.scenario}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground mt-1">{drill.title}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {drill.difficulty}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {drill.prompt}
              </p>

              {/* Recommended Vocabulary Phrases */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Key Vocabulary to Incorporate:
                </p>
                <div className="flex flex-wrap gap-1">
                  {drill.keyPhrases.map((phrase) => (
                    <Badge key={phrase} variant="outline" className="text-[10px] rounded-md font-mono bg-background">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  Duration: {drill.durationMinutes} Mins
                </span>

                <Button
                  size="sm"
                  onClick={() =>
                    onSelectTopic({
                      title: drill.title,
                      mode: "Presentation Practice",
                      instructions: `Speak for ${drill.durationMinutes * 60} seconds. Scenario: ${drill.scenario}. Aim to incorporate: ${drill.keyPhrases.join(", ")}.`,
                      durationSeconds: drill.durationMinutes * 60,
                    })
                  }
                  className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-xs"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Career Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
