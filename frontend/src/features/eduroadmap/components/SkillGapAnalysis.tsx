// features/eduroadmap/components/SkillGapAnalysis.tsx
// AI-driven Skill Gap Analysis comparing Student Current Skills VS Career Required Skills.

import React from "react";
import {
  Target,
  Sparkles,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SkillGapItem } from "../types/roadmap.types";

interface SkillGapAnalysisProps {
  careerName: string;
  skillGaps: SkillGapItem[];
  onBridgeGap: (skill: SkillGapItem) => void;
  onAskMentor: (prompt: string) => void;
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({
  careerName,
  skillGaps,
  onBridgeGap,
  onAskMentor,
}) => {
  return (
    <div className="space-y-6">
      {/* ── Top Summary Card ────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                🎯 AI SKILL GAP BENCHMARK
              </span>
              <Badge variant="outline" className="text-xs">
                Target: {careerName}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Candidate Skill Profile vs Industry Benchmark
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl">
              EduRoadmap automatically matches your active coursework performance against required industry competency levels to eliminate learning gaps.
            </p>
          </div>

          <Button
            onClick={() => onAskMentor(`Generate an intensive 14-day study plan to bridge my largest skill gaps for ${careerName}.`)}
            className="gap-2 rounded-xl bg-primary text-primary-foreground text-xs shadow hover:shadow-md shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            AI Gap Recovery Plan
          </Button>
        </CardContent>
      </Card>

      {/* ── Gap Items Grid ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {skillGaps.map((gap) => (
          <Card key={gap.id || gap.skill} className="rounded-2xl border-border/70 bg-card hover:border-border transition-all">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">{gap.skill}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {gap.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          gap.priority === "Critical"
                            ? "bg-rose-500/10 text-rose-600 border-rose-300"
                            : "bg-amber-500/10 text-amber-600 border-amber-300"
                        }`}
                      >
                        {gap.priority} Priority Gap
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pt-0.5">
                      Skill deficit: <strong className="text-rose-500 font-bold">{gap.gapPercentage}% gap</strong> to target readiness
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onBridgeGap(gap)}
                    className="gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs shadow-xs"
                  >
                    Bridge Gap <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Progress Comparison */}
              <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Student Current: <strong className="text-foreground">{gap.currentLevel}%</strong></span>
                  <span>Target Industry Standard: <strong className="text-foreground">{gap.requiredLevel}%</strong></span>
                </div>
                <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                  {/* Target bar background marker */}
                  <div
                    className="absolute top-0 left-0 h-full bg-primary/20 rounded-full"
                    style={{ width: `${gap.requiredLevel}%` }}
                  />
                  {/* Current fill */}
                  <div
                    className="relative h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${gap.currentLevel}%` }}
                  />
                </div>
              </div>

              {/* AI Recommendation Banner */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-foreground/90">
                <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-primary font-bold">Recommended Learning Action: </strong>
                  <span>{gap.recommendation}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
