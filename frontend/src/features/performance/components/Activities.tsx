// features/performance/components/Activities.tsx
// Extracurricular & Co-curricular activities tracking connected to EduVault evidence

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building,
  UserCheck,
  Clock,
  ExternalLink,
  Award,
} from "lucide-react";
import type { ActivityItem, ActivityCategory } from "../types/performance.types";
import { AddActivityDialog } from "./AddActivityDialog";

interface ActivitiesProps {
  activities: ActivityItem[];
  onSaveActivity: (activity: Omit<ActivityItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDeleteActivity: (id: string) => Promise<void>;
  saving: boolean;
}

export const Activities: React.FC<ActivitiesProps> = ({
  activities,
  onSaveActivity,
  onDeleteActivity,
  saving,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(activities.map((a) => a.category).filter(Boolean)));
  const filtered = selectedCategory === "all" ? activities : activities.filter((a) => a.category === selectedCategory);

  const handleEdit = (act: ActivityItem) => {
    setEditingActivity(act);
    setOpenAddDialog(true);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    setOpenAddDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-500" />
            Extracurricular & Holistic Student Activities
          </h3>
          <p className="text-xs text-muted-foreground">
            Track seminars, workshops, sports, hackathons, and volunteer community leadership
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
            Add Activity
          </Button>
        </div>
      </div>

      {/* 2. Activities List */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
              <Activity className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Activities Recorded</h4>
            <p className="text-xs text-muted-foreground">
              Log your participation in conferences, workshops, cultural events, and community service.
            </p>
            <Button size="sm" onClick={handleAdd} className="mt-2 rounded-xl text-xs gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add First Activity
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((act) => (
            <Card
              key={act.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {act.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                        {act.role}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{act.name}</h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(act)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => onDeleteActivity(act.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 truncate">
                    <Building className="h-3.5 w-3.5 shrink-0" /> {act.organizer}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="h-3.5 w-3.5" /> {act.date}
                  </span>
                  {act.hoursSpent && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3.5 w-3.5" /> {act.hoursSpent}h
                    </span>
                  )}
                </div>

                {act.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {act.description}
                  </p>
                )}

                {act.evidenceDocumentUrl && (
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-primary" /> Certificate / Evidence Attached
                    </span>
                    <a
                      href={act.evidenceDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline text-[11px] font-semibold"
                    >
                      View Evidence <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddActivityDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        activityToEdit={editingActivity}
        onSave={onSaveActivity}
        saving={saving}
      />
    </div>
  );
};
