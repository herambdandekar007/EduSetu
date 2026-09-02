// features/performance/components/SkillProgress.tsx
// Visual skill growth tracker with proficiency ladders and evidence links

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Plus,
  Edit2,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { SkillProgressItem, SkillCategory } from "../types/performance.types";
import { AddSkillDialog } from "./AddSkillDialog";

interface SkillProgressProps {
  skills: SkillProgressItem[];
  onSaveSkill: (skill: Omit<SkillProgressItem, "id" | "userId" | "lastUpdated"> & { id?: string }) => Promise<void>;
  saving: boolean;
}

const LEVEL_STAGES = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const SkillProgress: React.FC<SkillProgressProps> = ({ skills, onSaveSkill, saving }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillProgressItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));
  const filtered = selectedCategory === "all" ? skills : skills.filter((s) => s.category === selectedCategory);

  const handleEdit = (skill: SkillProgressItem) => {
    setEditingSkill(skill);
    setOpenAddDialog(true);
  };

  const handleAdd = () => {
    setEditingSkill(null);
    setOpenAddDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Skill Progression & Competency Matrix
          </h3>
          <p className="text-xs text-muted-foreground">
            Track competency ladders from Beginner to Expert across projects, quizzes, and course roadmaps
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {categories.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-[260px]">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs rounded-xl"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs rounded-xl shrink-0"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          <Button size="sm" onClick={handleAdd} className="rounded-xl text-xs gap-1.5 h-8 ml-auto sm:ml-0">
            <Plus className="h-3.5 w-3.5" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* 2. Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((skill) => {
          const currentStageIndex = LEVEL_STAGES.indexOf(skill.currentLevel);

          return (
            <Card
              key={skill.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {skill.category}
                      </Badge>
                      {skill.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{skill.skillName}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs font-bold">
                      {skill.currentLevel} ({skill.progressPercentage}%)
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(skill)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Visual Ladder */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {LEVEL_STAGES.map((lvl, i) => {
                      const isReached = i <= currentStageIndex;
                      const isCurrent = i === currentStageIndex;
                      return (
                        <div
                          key={lvl}
                          className={`p-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            isCurrent
                              ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                              : isReached
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-muted/40 text-muted-foreground/60 border-border/40"
                          }`}
                        >
                          {lvl}
                        </div>
                      );
                    })}
                  </div>
                  <Progress value={skill.progressPercentage} className="h-2 bg-muted" />
                </div>

                {/* Evidence Tag */}
                {skill.learningEvidence && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-xl border border-border/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">Evidence: {skill.learningEvidence}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Update Dialog */}
      <AddSkillDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        skillToEdit={editingSkill}
        onSave={onSaveSkill}
        saving={saving}
      />
    </div>
  );
};
