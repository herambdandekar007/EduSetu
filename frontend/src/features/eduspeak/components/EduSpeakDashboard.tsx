// features/eduspeak/components/EduSpeakDashboard.tsx
// Top overview dashboard for 🗣️ EduSpeak with live streak, metrics, and daily speaking goal.

import React from "react";
import {
  Mic,
  Sparkles,
  Flame,
  Clock,
  TrendingUp,
  Award,
  Volume2,
  Play,
  ArrowRight,
  MessageSquare,
  Globe,
  Bot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { EduSpeakProfile, SpeakingProgressStats } from "../types/eduspeak.types";

interface EduSpeakDashboardProps {
  profile: EduSpeakProfile;
  stats: SpeakingProgressStats;
  onStartDailyPractice: () => void;
  onOpenConversation: () => void;
  onOpenPronunciation: () => void;
  onOpenMentor: () => void;
  onTabChange: (tab: string) => void;
}

export const EduSpeakDashboard: React.FC<EduSpeakDashboardProps> = ({
  profile,
  stats,
  onStartDailyPractice,
  onOpenConversation,
  onOpenPronunciation,
  onOpenMentor,
  onTabChange,
}) => {
  return (
    <div className="space-y-6">
      {/* ── 1. Hero Banner ──────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-primary/5 to-background shadow-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
                <Mic className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-600 text-white shadow-sm">
                    🗣️ EDUSPEAK AI
                  </span>
                  <Badge variant="outline" className="bg-background/80 text-foreground border-border text-xs font-semibold">
                    Level: {profile.currentLevel}
                  </Badge>
                  <Badge variant="outline" className="bg-background/80 text-cyan-600 dark:text-cyan-400 border-cyan-300 text-xs font-semibold">
                    Language: {profile.preferredLanguage}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    Your Communication & Speaking Journey
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    Master spoken fluency, accent clarity, professional vocabulary, and job interview confidence with real-time AI speech feedback.
                  </p>
                </div>

                {/* Today's Goal Banner */}
                <div className="p-3 rounded-xl bg-background/80 border border-border/70 flex items-center gap-3 text-xs text-foreground max-w-xl">
                  <Sparkles className="h-4 w-4 text-cyan-600 shrink-0" />
                  <span>
                    <strong>Today's Goal: </strong> Practice 10 minutes of English conversation & interview self-introduction.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
              <Button
                onClick={onStartDailyPractice}
                className="gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <Play className="h-4 w-4" />
                Start Today's Practice
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenConversation}
                  className="gap-1.5 rounded-xl border-border text-xs flex-1"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-cyan-600" />
                  AI Dialogue
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onOpenMentor}
                  className="gap-1.5 rounded-xl text-xs flex-1"
                >
                  <Bot className="h-3.5 w-3.5" />
                  AI Coach
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Metric Pills ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Practice Streak</p>
              <h3 className="text-xl font-bold text-amber-500 mt-0.5">🔥 {stats.practiceStreak} Days</h3>
              <p className="text-[11px] text-muted-foreground">Daily momentum</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pronunciation</p>
              <h3 className="text-xl font-bold text-emerald-500 mt-0.5">{stats.pronunciationScore}%</h3>
              <p className="text-[11px] text-emerald-600 font-medium">Clarity rating</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Volume2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Spoken Fluency</p>
              <h3 className="text-xl font-bold text-cyan-600 mt-0.5">{stats.fluencyScore}%</h3>
              <p className="text-[11px] text-muted-foreground">Pacing & rhythm</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Speaking Confidence</p>
              <h3 className="text-xl font-bold text-indigo-500 mt-0.5">{stats.confidenceScore}%</h3>
              <p className="text-[11px] text-muted-foreground">{stats.sessionsCompleted} sessions logged</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Next Recommended Activity Banner ─────────────────────────── */}
      <Card className="rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-background to-indigo-500/5 shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-600 text-white">
                🎯 RECOMMENDED NEXT DRILL
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Interview Communication</span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Professional Self Introduction & Elevator Pitch (90 Seconds)
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Calibrated to strengthen your opening impression, sentence structure, and vocabulary choice for HR and technical interview panels.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={onStartDailyPractice}
              className="gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow"
            >
              <Mic className="h-4 w-4" />
              Start 90s Drill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
