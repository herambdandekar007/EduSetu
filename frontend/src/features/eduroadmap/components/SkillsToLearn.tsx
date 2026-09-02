// features/eduroadmap/components/SkillsToLearn.tsx
// Skills inventory categorized into Current, Strong, Skills to Improve, and Missing Skills.

import React from "react";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CircleDot,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SkillProgressItem, SkillPriority } from "../types/roadmap.types";

interface SkillsToLearnProps {
  skills: SkillProgressItem[];
  onPracticeSkill: (skillName: string) => void;
  onAskMentorAboutSkill: (skillName: string) => void;
}

const PRIORITY_BADGES: Record<SkillPriority, { bg: string; text: string }> = {
  Critical: { bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-600 dark:text-rose-400" },
  High: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-600 dark:text-amber-400" },
  Medium: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-600 dark:text-blue-400" },
  Low: { bg: "bg-muted border-border", text: "text-muted-foreground" },
};

export const SkillsToLearn: React.FC<SkillsToLearnProps> = ({
  skills,
  onPracticeSkill,
  onAskMentorAboutSkill,
}) => {
  const currentSkills = skills.filter((s) => s.group === "current" || (s.currentLevel >= 60 && s.currentLevel < s.requiredLevel));
  const strongSkills = skills.filter((s) => s.group === "strong" || s.currentLevel >= s.requiredLevel);
  const improveSkills = skills.filter((s) => s.group === "improve" || (s.currentLevel > 0 && s.currentLevel < 60));
  const missingSkills = skills.filter((s) => s.group === "missing" || s.currentLevel === 0);

  const renderSkillCard = (skill: SkillProgressItem) => {
    const priorityStyle = PRIORITY_BADGES[skill.priority] || PRIORITY_BADGES.Medium;

    return (
      <div
        key={skill.id || skill.name}
        className="p-4 rounded-xl border border-border/70 bg-card hover:border-border transition-all space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-foreground">{skill.name}</h4>
            <p className="text-[11px] text-muted-foreground">{skill.category}</p>
          </div>
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${priorityStyle.bg} ${priorityStyle.text}`}
          >
            {skill.priority} Priority
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Current: <strong className="text-foreground">{skill.currentLevel}%</strong></span>
            <span>Target: <strong className="text-foreground">{skill.requiredLevel}%</strong></span>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                skill.currentLevel >= skill.requiredLevel
                  ? "bg-emerald-500"
                  : skill.currentLevel >= 50
                  ? "bg-primary"
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(skill.currentLevel, 100)}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAskMentorAboutSkill(skill.name)}
            className="h-7 text-xs text-primary px-2"
          >
            Study with AI
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPracticeSkill(skill.name)}
            className="h-7 text-xs rounded-lg border-border"
          >
            Practice Topic
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Skills To Improve (Highest Attention) ───────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Skills to Improve</h3>
              <p className="text-[11px] text-muted-foreground">Highest impact on your upcoming milestone score</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
            {improveSkills.length} Skills
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {improveSkills.map(renderSkillCard)}
        </div>
      </div>

      {/* ── 2. Missing Skills (Next Milestones) ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <CircleDot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Missing Core Skills</h3>
              <p className="text-[11px] text-muted-foreground">Required for upcoming technical stages</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-rose-600 border-rose-300">
            {missingSkills.length} Skills
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {missingSkills.map(renderSkillCard)}
        </div>
      </div>

      {/* ── 3. Current Skills (Active In-Progress) ─────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Current Active Skills</h3>
              <p className="text-[11px] text-muted-foreground">Currently progressing through lessons & projects</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
            {currentSkills.length} Skills
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentSkills.map(renderSkillCard)}
        </div>
      </div>

      {/* ── 4. Strong Skills (Verified Mastery) ────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Strong / Mastered Skills</h3>
              <p className="text-[11px] text-muted-foreground">Validated through quizzes and completed milestones</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
            {strongSkills.length} Mastered
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {strongSkills.map(renderSkillCard)}
        </div>
      </div>
    </div>
  );
};
