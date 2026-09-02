// features/eduroadmap/components/CareerPaths.tsx
// Multi-track career exploration, comparison, and safe switching with modal confirmation.

import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CareerPathOption } from "../types/roadmap.types";

interface CareerPathsProps {
  currentCareerId: string;
  paths: CareerPathOption[];
  onSwitchCareer: (career: CareerPathOption) => void;
  onAddSecondaryGoal: (career: CareerPathOption) => void;
  onAskMentor: (prompt: string) => void;
}

export const CareerPaths: React.FC<CareerPathsProps> = ({
  currentCareerId,
  paths,
  onSwitchCareer,
  onAddSecondaryGoal,
  onAskMentor,
}) => {
  const [selectedCareerToSwitch, setSelectedCareerToSwitch] = useState<CareerPathOption | null>(null);
  const [compareCareer, setCompareCareer] = useState<CareerPathOption | null>(null);

  const handleConfirmSwitch = () => {
    if (selectedCareerToSwitch) {
      onSwitchCareer(selectedCareerToSwitch);
      setSelectedCareerToSwitch(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  🚀 CAREER DISCOVERY & PATHWAYS
                </span>
                <Badge variant="outline" className="text-xs">
                  Cross-Discipline Alignment
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Explore Industry Pathways & Specializations
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Compare readiness requirements across specialized technical tracks. You can explore or switch tracks without losing your verified core academic milestone history.
              </p>
            </div>

            <Button
              onClick={() => onAskMentor("Which career path is best suited for my current skills and learning strengths?")}
              className="gap-2 rounded-xl bg-primary text-primary-foreground text-xs shadow hover:shadow-md shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Career Match Guidance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pathways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((path) => {
          const isCurrentActive = path.id === currentCareerId;

          return (
            <Card
              key={path.id}
              className={`rounded-2xl transition-all border flex flex-col justify-between ${
                isCurrentActive
                  ? "border-primary/50 bg-gradient-to-b from-primary/5 to-background shadow-md"
                  : "border-border/70 bg-card hover:border-border"
              }`}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      {path.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{path.category}</p>
                  </div>
                  {isCurrentActive ? (
                    <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-bold shrink-0">
                      Active Goal
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {path.difficulty}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {path.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Market Demand:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{path.marketDemand || "High"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salary Range:</span>
                    <p className="font-bold text-foreground">{path.salaryRange || "Competitive"}</p>
                  </div>
                </div>

                {/* Readiness meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Readiness Match</span>
                    <span className="text-foreground font-bold">{path.readinessScore}%</span>
                  </div>
                  <Progress value={path.readinessScore} className="h-1.5" />
                </div>

                {/* Required Skills */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Required Core Skills:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {path.requiredSkills.map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-[10px] rounded-md font-normal">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAskMentor(`Explain the day-to-day work and learning roadmap for ${path.title}.`)}
                    className="text-xs text-primary h-8 px-2"
                  >
                    Ask Details
                  </Button>

                  {isCurrentActive ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Current Roadmap
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setSelectedCareerToSwitch(path)}
                      className="gap-1 rounded-xl bg-primary text-primary-foreground text-xs shadow-xs"
                    >
                      Switch Goal <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Switch Career Confirmation Modal ──────────────────────────── */}
      <Dialog open={!!selectedCareerToSwitch} onOpenChange={() => setSelectedCareerToSwitch(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Compass className="h-5 w-5 text-primary" />
              Switch Primary Career Goal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2 leading-relaxed">
              Are you sure you want to switch your active roadmap to{" "}
              <strong className="text-foreground">{selectedCareerToSwitch?.title}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              Your completed milestones and quiz history will be safely preserved!
            </div>
            <p className="text-muted-foreground text-[11px]">
              EduRoadmap will recalibrate new technical milestones and update your skill gap analysis to align with this career goal.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSelectedCareerToSwitch(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmSwitch} className="rounded-xl bg-primary text-primary-foreground shadow">
              Confirm & Switch Roadmap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
