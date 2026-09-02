// features/eduroadmap/components/RoadmapProjects.tsx
// Project-based roadmap connected to stages with Beginner, Intermediate, Advanced, and Portfolio categories.

import React, { useState } from "react";
import {
  FolderGit2,
  Sparkles,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Bot,
  Play,
  Github,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { RoadmapProject } from "../types/roadmap.types";

interface RoadmapProjectsProps {
  projects: RoadmapProject[];
  onStartProject: (project: RoadmapProject) => void;
  onAskMentor: (prompt: string) => void;
}

const CATEGORY_BADGES: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
  Intermediate: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-600 dark:text-blue-400" },
  Advanced: { bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-600 dark:text-purple-400" },
  Portfolio: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-600 dark:text-amber-400" },
};

export const RoadmapProjects: React.FC<RoadmapProjectsProps> = ({
  projects,
  onStartProject,
  onAskMentor,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Beginner", "Intermediate", "Advanced", "Portfolio"];

  const filteredProjects = projects.filter(
    (p) => filterCategory === "All" || p.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  💻 PRACTICAL PROJECT MILESTONES
                </span>
                <Badge variant="outline" className="text-xs">
                  Hands-on Portfolio Assets
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Apply Conceptual Theory into Real-world Code
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Complete structured milestone projects tied directly to your roadmap stages. Projects directly contribute to your overall career readiness score and portfolio proof.
              </p>
            </div>

            <Button
              onClick={() => onAskMentor("Suggest an innovative capstone project idea combining my strongest skills.")}
              className="gap-2 rounded-xl bg-primary text-primary-foreground text-xs shadow hover:shadow-md shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              AI Project Brainstormer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-2xl border border-border/70 bg-card">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterCategory(cat)}
            className="rounded-xl text-xs"
          >
            {cat} Projects {cat !== "All" && `(${projects.filter((p) => p.category === cat).length})`}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => {
          const catStyle = CATEGORY_BADGES[proj.category] || CATEGORY_BADGES.Beginner;
          const isCompleted = proj.status === "Completed";
          const isInProgress = proj.status === "In Progress";

          return (
            <Card
              key={proj.id || proj.title}
              className={`rounded-2xl border transition-all flex flex-col justify-between ${
                isInProgress
                  ? "border-primary/40 shadow-sm bg-gradient-to-br from-primary/5 to-background"
                  : isCompleted
                  ? "border-emerald-500/30 bg-card"
                  : "border-border/70 bg-card hover:border-border"
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${catStyle.bg} ${catStyle.text}`}
                      >
                        {proj.category}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Difficulty: {proj.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {proj.estimatedDuration}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {proj.title}
                    </h3>
                  </div>

                  {isCompleted ? (
                    <Badge className="bg-emerald-500 text-white text-[10px] gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </Badge>
                  ) : isInProgress ? (
                    <Badge className="bg-primary text-primary-foreground text-[10px] gap-1 shrink-0">
                      <Clock className="h-3 w-3 animate-pulse" />
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                      Recommended
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {proj.description}
                </p>

                {/* Roadmap Step Link */}
                <div className="p-2 rounded-xl bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    Tied to Roadmap: <strong className="text-foreground">{proj.relatedRoadmapStep}</strong>
                  </span>
                </div>

                {/* Required Skills */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Required Stack & Skills:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.requiredSkills.map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-[10px] rounded-md font-normal">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAskMentor(`Provide an architectural diagram and boilerplate code structure for "${proj.title}".`)}
                    className="text-xs text-primary h-8 px-2"
                  >
                    AI Architecture Guide
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onStartProject(proj)}
                    className="gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {isCompleted ? "View Project" : isInProgress ? "Continue Code" : "Start Project"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
