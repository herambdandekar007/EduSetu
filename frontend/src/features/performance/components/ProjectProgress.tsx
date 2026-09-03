// features/performance/components/ProjectProgress.tsx
// Project progress showcase and management connected to EduPortfolio

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Github,
  Users,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import type { ProjectItem, ProjectStatus } from "../types/performance.types";
import { AddProjectDialog } from "./AddProjectDialog";

interface ProjectProgressProps {
  projects: ProjectItem[];
  onSaveProject: (project: Omit<ProjectItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  saving: boolean;
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  saving,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered =
    filterStatus === "all"
      ? projects
      : projects.filter((p) => p.status.toLowerCase() === filterStatus.toLowerCase());

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setOpenAddDialog(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setOpenAddDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyan-500" />
            Engineering & Practical Projects Tracker
          </h3>
          <p className="text-xs text-muted-foreground">
            Capstone applications, software engineering repositories, and synced EduPortfolio builds
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 overflow-x-auto">
            {["all", "in progress", "completed", "planning"].map((st) => (
              <Button
                key={st}
                variant={filterStatus === st ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs rounded-xl capitalize shrink-0"
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </Button>
            ))}
          </div>

          <Button size="sm" onClick={handleAdd} className="rounded-xl text-xs gap-1.5 h-8 ml-auto sm:ml-0">
            <Plus className="h-3.5 w-3.5" />
            Add Project
          </Button>
        </div>
      </div>

      {/* 2. Projects Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
              <Code2 className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Projects Recorded Yet</h4>
            <p className="text-xs text-muted-foreground">
              Document your software builds, algorithms, and engineering projects to enhance your platform score and portfolio.
            </p>
            <Button size="sm" onClick={handleAdd} className="mt-2 rounded-xl text-xs gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((proj) => (
            <Card
              key={proj.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          proj.status === "Completed"
                            ? "default"
                            : proj.status === "In Progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {proj.status}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        {proj.teamType === "Team" ? (
                          <>
                            <Users className="h-3 w-3" /> Team Build
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3" /> Individual
                          </>
                        )}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-foreground leading-snug">
                      {proj.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(proj)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => onDeleteProject(proj.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {proj.description}
                </p>

                {/* Tech stack chips */}
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies?.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-semibold text-foreground/80 border border-border/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                    <span>Completion</span>
                    <span className="text-primary font-bold">{proj.progressPercentage}%</span>
                  </div>
                  <Progress value={proj.progressPercentage} className="h-2 bg-muted" />
                </div>

                {/* Bottom Links */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="h-3.5 w-3.5" /> GitHub
                      </a>
                    )}
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                      </a>
                    )}
                  </div>

                  {proj.syncedToPortfolio && (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      ✓ In EduPortfolio
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddProjectDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        projectToEdit={editingProject}
        onSave={onSaveProject}
        saving={saving}
      />
    </div>
  );
};
