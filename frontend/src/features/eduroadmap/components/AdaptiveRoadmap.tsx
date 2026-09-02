// features/eduroadmap/components/AdaptiveRoadmap.tsx
// Interactive visual inspector & trigger for the AI Adaptive Roadmap Engine.

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Cpu,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface AdaptiveRoadmapProps {
  onAdaptTopic: (topic: string) => Promise<void>;
  isAdapting: boolean;
  onAskMentor: (prompt: string) => void;
}

const ADAPTIVE_CYCLE = [
  { step: 1, label: "Student Learns", icon: "📚", desc: "Access study materials, videos & docs" },
  { step: 2, label: "Student Practices", icon: "💻", desc: "Executes task exercises & code drills" },
  { step: 3, label: "Diagnostic Check", icon: "📝", desc: "Takes milestone & self-check quizzes" },
  { step: 4, label: "EduMind Diagnosis", icon: "🧠", desc: "Detects strengths, weak topics & gaps" },
  { step: 5, label: "Roadmap Adaptation", icon: "🗺️", desc: "Injects revision steps & reprioritizes" },
  { step: 6, label: "Next Action Push", icon: "🎯", desc: "EduMentor delivers targeted daily schedule" },
];

export const AdaptiveRoadmap: React.FC<AdaptiveRoadmapProps> = ({
  onAdaptTopic,
  isAdapting,
  onAskMentor,
}) => {
  const [testTopic, setTestTopic] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTriggerAdapt = async (topicToUse?: string) => {
    const topic = (topicToUse || testTopic).trim();
    if (!topic || isAdapting) return;

    try {
      await onAdaptTopic(topic);
      setSuccessMessage(`AI Engine successfully adapted roadmap for: "${topic}"!`);
      setTestTopic("");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Adaptive trigger error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 shadow-md">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                <Cpu className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">
                    🤖 AI Adaptive Roadmap Engine
                  </h2>
                  <Badge className="bg-primary text-primary-foreground text-xs font-mono">
                    Zero-Progress-Loss Protocol
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Unlike static roadmaps, EduRoadmap continuously monitors your quiz scores, learning pace, and diagnostic performance. When you struggle with a topic, the engine automatically injects precision reinforcement drills before advancing to complex prerequisites.
                </p>
              </div>
            </div>

            <Button
              onClick={() => onAskMentor("How does the AI Adaptive Engine personalize my learning pathway?")}
              className="gap-2 rounded-xl bg-primary text-primary-foreground text-xs shadow hover:shadow-md shrink-0 self-start lg:self-center"
            >
              <Bot className="h-4 w-4" />
              Ask AI Architecture
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. The 6-Step Adaptive Feedback Loop ──────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Continuous Adaptation Feedback Architecture
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {ADAPTIVE_CYCLE.map((item, index) => (
              <div
                key={item.step}
                className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center space-y-2 flex flex-col justify-between"
              >
                <div className="h-10 w-10 mx-auto rounded-xl bg-background border border-border flex items-center justify-center text-lg shadow-xs">
                  {item.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-primary font-bold">Step {item.step}</span>
                  <h4 className="text-xs font-bold text-foreground leading-tight mt-0.5">{item.label}</h4>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Interactive Adaptive Trigger Simulator ──────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Test Dynamic Topic Recalibration
            </h3>
            <p className="text-xs text-muted-foreground">
              Simulate what happens when you struggle with a specific academic concept. The engine will synthesize a targeted remediation step into your active roadmap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <input
              value={testTopic}
              onChange={(e) => setTestTopic(e.target.value)}
              placeholder="e.g. Binary Search Trees, Graph Traversals, SQL Normalization..."
              className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              disabled={isAdapting}
            />
            <Button
              onClick={() => handleTriggerAdapt()}
              disabled={!testTopic.trim() || isAdapting}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground gap-2 shrink-0 shadow"
            >
              <Zap className={`h-4 w-4 ${isAdapting ? "animate-spin" : ""}`} />
              {isAdapting ? "Recalibrating..." : "Trigger AI Adapt"}
            </Button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-muted-foreground">
            <span>Quick test presets:</span>
            {["Dynamic Programming", "Recursion & Backtracking", "Relational Normalization", "TCP Handshake"].map(
              (preset) => (
                <button
                  key={preset}
                  onClick={() => handleTriggerAdapt(preset)}
                  className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium border border-border transition-colors"
                >
                  {preset}
                </button>
              )
            )}
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
