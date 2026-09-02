// features/performance/components/Achievements.tsx
// Comprehensive Achievement management system with verified badge levels and certificate linkage

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Building,
  Calendar,
  ExternalLink,
  Award,
  Medal,
  Sparkles,
} from "lucide-react";
import type { AchievementItem, AchievementCategory } from "../types/performance.types";
import { AddAchievementDialog } from "./AddAchievementDialog";

interface AchievementsProps {
  achievements: AchievementItem[];
  onSaveAchievement: (achievement: Omit<AchievementItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDeleteAchievement: (id: string) => Promise<void>;
  saving: boolean;
}

export const Achievements: React.FC<AchievementsProps> = ({
  achievements,
  onSaveAchievement,
  onDeleteAchievement,
  saving,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(achievements.map((a) => a.category).filter(Boolean)));
  const filtered =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const handleEdit = (ach: AchievementItem) => {
    setEditingAchievement(ach);
    setOpenAddDialog(true);
  };

  const handleAdd = () => {
    setEditingAchievement(null);
    setOpenAddDialog(true);
  };

  const getLevelColor = (level: string) => {
    if (level.includes("International")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    if (level.includes("National")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    if (level.includes("State")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    return "bg-muted text-muted-foreground border-border/40";
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Milestone Honors, Competitions & Hackathons
          </h3>
          <p className="text-xs text-muted-foreground">
            Document verified achievements across institutional, national, and international stages
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
            Add Achievement
          </Button>
        </div>
      </div>

      {/* 2. Achievements Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
              <Trophy className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Achievements Recorded Yet</h4>
            <p className="text-xs text-muted-foreground">
              Record your hackathons, scholarships, academic ranks, and competition victories.
            </p>
            <Button size="sm" onClick={handleAdd} className="mt-2 rounded-xl text-xs gap-1">
              <Plus className="h-3.5 w-3.5" />
              Record First Achievement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ach) => (
            <Card
              key={ach.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] font-bold ${getLevelColor(ach.level)}`}>
                        {ach.level}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {ach.category}
                      </Badge>
                      {ach.verificationStatus === "Verified" && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base text-foreground leading-snug pt-1">
                      {ach.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(ach)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => onDeleteAchievement(ach.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <Building className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{ach.organizer}</span>
                  </div>
                  {ach.position && (
                    <Badge variant="default" className="text-[10px] font-bold bg-amber-600 text-white shrink-0">
                      🏆 {ach.position}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ach.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {ach.date}
                  </span>

                  {ach.evidenceUrl && (
                    <a
                      href={ach.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline font-semibold text-[11px]"
                    >
                      View Certificate <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddAchievementDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        achievementToEdit={editingAchievement}
        onSave={onSaveAchievement}
        saving={saving}
      />
    </div>
  );
};
