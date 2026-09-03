// features/performance/components/AddProjectDialog.tsx
// Dialog for adding or editing a student project, tech stack, and portfolio links

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ProjectItem, ProjectStatus } from "../types/performance.types";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: ProjectItem | null;
  onSave: (project: Omit<ProjectItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  saving: boolean;
}

export const AddProjectDialog: React.FC<AddProjectDialogProps> = ({
  open,
  onOpenChange,
  projectToEdit,
  onSave,
  saving,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("In Progress");
  const [progressPercentage, setProgressPercentage] = useState<number>(80);
  const [technologiesText, setTechnologiesText] = useState("React, TypeScript, Firebase, Tailwind");
  const [teamType, setTeamType] = useState<"Individual" | "Team">("Individual");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetCompletionDate, setTargetCompletionDate] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [syncedToPortfolio, setSyncedToPortfolio] = useState(true);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStatus(projectToEdit.status);
      setProgressPercentage(projectToEdit.progressPercentage || 80);
      setTechnologiesText(projectToEdit.technologies?.join(", ") || "");
      setTeamType(projectToEdit.teamType || "Individual");
      setStartDate(projectToEdit.startDate || new Date().toISOString().split("T")[0]);
      setTargetCompletionDate(projectToEdit.targetCompletionDate || "");
      setGithubUrl(projectToEdit.githubUrl || "");
      setLiveDemoUrl(projectToEdit.liveDemoUrl || "");
      setSyncedToPortfolio(projectToEdit.syncedToPortfolio ?? true);
    } else {
      setName("");
      setDescription("");
      setStatus("In Progress");
      setProgressPercentage(80);
      setTechnologiesText("React, TypeScript, Tailwind CSS");
      setTeamType("Individual");
      setGithubUrl("");
      setLiveDemoUrl("");
      setSyncedToPortfolio(true);
    }
  }, [projectToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const technologies = technologiesText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await onSave({
      id: projectToEdit?.id,
      name: name.trim(),
      description: description.trim(),
      status,
      progressPercentage,
      technologies,
      teamType,
      startDate,
      targetCompletionDate: targetCompletionDate || undefined,
      completionDate: status === "Completed" ? new Date().toISOString().split("T")[0] : undefined,
      githubUrl: githubUrl.trim() || undefined,
      liveDemoUrl: liveDemoUrl.trim() || undefined,
      syncedToPortfolio,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {projectToEdit ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Document practical builds, technology stacks, and link directly with your public EduPortfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Project Title</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SMART EDUCATION AI Learning Engine"
              className="rounded-xl h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Description & Objective</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what problem this solves, core features, architecture..."
              className="rounded-xl text-xs min-h-[60px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Project Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Team Type</Label>
              <Select value={teamType} onValueChange={(val: any) => setTeamType(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Team Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual Project</SelectItem>
                  <SelectItem value="Team">Team Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Project Completion Progress</span>
              <span className="text-primary font-bold">{progressPercentage}%</span>
            </div>
            <Slider
              value={[progressPercentage]}
              min={0}
              max={100}
              step={5}
              onValueChange={([val]) => setProgressPercentage(val)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Technologies (Comma separated)</Label>
            <Input
              value={technologiesText}
              onChange={(e) => setTechnologiesText(e.target.value)}
              placeholder="React, TypeScript, Node.js, Firebase, Tailwind"
              className="rounded-xl h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">GitHub Repository URL (Optional)</Label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="rounded-xl h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Live Demo URL (Optional)</Label>
              <Input
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="rounded-xl h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold">Sync to Public EduPortfolio</Label>
              <p className="text-[11px] text-muted-foreground">
                Automatically showcase this project on your student portfolio profile.
              </p>
            </div>
            <Switch
              checked={syncedToPortfolio}
              onCheckedChange={setSyncedToPortfolio}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : projectToEdit ? "Update Project" : "Save Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
