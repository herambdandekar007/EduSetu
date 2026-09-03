// features/eduspeak/components/SpeakingProgressView.tsx
// Detailed analytics tracking speaking fluency, pronunciation, vocabulary, and practice time over time.

import React from "react";
import {
  TrendingUp,
  Volume2,
  Brain,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SpeakingProgressStats } from "../types/eduspeak.types";

interface SpeakingProgressViewProps {
  stats: SpeakingProgressStats;
}

export const SpeakingProgressView: React.FC<SpeakingProgressViewProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* ── 1. Big Summary Card ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-600/10 text-cyan-600">
                📊 LIVE COMMUNICATION SCORECARD
              </span>
              <h2 className="text-xl font-bold text-foreground mt-1">
                Overall Spoken English & Speech Competency
              </h2>
              <p className="text-xs text-muted-foreground">
                Synthesized across pronunciation accuracy, fluency cadence, grammar consistency, and vocabulary breadth.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-cyan-600">{stats.overallProgress}%</span>
              <p className="text-[11px] text-muted-foreground">Fluency Index</p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={stats.overallProgress} className="h-3 bg-muted" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner (0%)</span>
              <span>Intermediate (50%)</span>
              <span>Professional Fluent (100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. The 5 Core Pillar Gauges ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Pronunciation</span>
              <Volume2 className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">{stats.pronunciationScore}%</h3>
            <Progress value={stats.pronunciationScore} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Phonetic clarity</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Fluency & Rhythm</span>
              <TrendingUp className="h-4 w-4 text-cyan-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">{stats.fluencyScore}%</h3>
            <Progress value={stats.fluencyScore} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Natural cadence</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Spoken Grammar</span>
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">{stats.grammarScore}%</h3>
            <Progress value={stats.grammarScore} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Tense agreement</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Vocabulary Variety</span>
              <Award className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">{stats.vocabularyScore}%</h3>
            <Progress value={stats.vocabularyScore} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Word breadth</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card col-span-1 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Confidence Level</span>
              <Flame className="h-4 w-4 text-rose-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">{stats.confidenceScore}%</h3>
            <Progress value={stats.confidenceScore} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Delivery presence</p>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Time & Consistency Breakdown ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">Weekly Practice Time</p>
              <h4 className="text-xl font-bold text-foreground">{stats.weeklyPracticeMinutes} Minutes</h4>
              <p className="text-[11px] text-emerald-600 font-medium">Target: 60 mins/week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">Active Streak</p>
              <h4 className="text-xl font-bold text-foreground">{stats.practiceStreak} Consecutive Days</h4>
              <p className="text-[11px] text-muted-foreground">Keep the habit going!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">Sessions Completed</p>
              <h4 className="text-xl font-bold text-foreground">{stats.sessionsCompleted} Drills</h4>
              <p className="text-[11px] text-muted-foreground">Across 6 practice modes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
