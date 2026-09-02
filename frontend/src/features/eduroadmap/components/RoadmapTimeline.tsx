// features/eduroadmap/components/RoadmapTimeline.tsx
// Visual step-by-step roadmap timeline with stage group markers and filter tabs.

import React, { useState } from "react";
import {
  Map,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoadmapStepCard } from "./RoadmapStepCard";
import type { RoadmapStep, RoadmapStatus } from "../types/roadmap.types";

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  onToggleTask: (stepId: string, taskId: string) => void;
  onMarkCompleted: (stepId: string) => void;
  onStartLearning: (step: RoadmapStep) => void;
  onAskMentor: (step: RoadmapStep) => void;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  steps,
  onToggleTask,
  onMarkCompleted,
  onStartLearning,
  onAskMentor,
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSteps = steps.filter((step) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && step.status === "completed") ||
      (filter === "in_progress" && step.status === "in_progress") ||
      (filter === "recommended" && (step.status === "recommended" || step.status === "not_started"));

    const matchesSearch =
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Group steps by stage for visual separation
  const stages = Array.from(new Set(steps.map((s) => s.stage)));

  return (
    <div className="space-y-6">
      {/* ── Filter & Search Toolbar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-xl text-xs"
          >
            All Steps ({steps.length})
          </Button>
          <Button
            variant={filter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in_progress")}
            className="rounded-xl text-xs gap-1.5"
          >
            <Clock className="h-3.5 w-3.5 text-primary" />
            In Progress ({steps.filter((s) => s.status === "in_progress").length})
          </Button>
          <Button
            variant={filter === "recommended" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("recommended")}
            className="rounded-xl text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Upcoming ({steps.filter((s) => s.status === "recommended" || s.status === "not_started").length})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
            className="rounded-xl text-xs gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Completed ({steps.filter((s) => s.status === "completed").length})
          </Button>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or skill..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>
      </div>

      {/* ── Timeline Steps ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredSteps.length ? (
          filteredSteps.map((step, idx) => (
            <RoadmapStepCard
              key={step.id}
              step={step}
              index={idx}
              onToggleTask={(taskId) => onToggleTask(step.id, taskId)}
              onMarkCompleted={onMarkCompleted}
              onStartLearning={onStartLearning}
              onAskMentor={onAskMentor}
            />
          ))
        ) : (
          <div className="text-center p-12 rounded-2xl border border-dashed border-border/70 bg-card/50 space-y-3">
            <Map className="h-10 w-10 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-bold text-foreground">No roadmap steps found</h4>
            <p className="text-xs text-muted-foreground">Try adjusting your search filters or resetting to "All Steps".</p>
          </div>
        )}
      </div>
    </div>
  );
};
