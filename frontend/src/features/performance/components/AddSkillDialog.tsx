// features/performance/components/AddSkillDialog.tsx
// Dialog for adding or updating a student's skill and proficiency level

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
import { Slider } from "@/components/ui/slider";
import type { SkillProgressItem, SkillCategory, SkillProficiencyLevel } from "../types/performance.types";

interface AddSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillToEdit?: SkillProgressItem | null;
  onSave: (skill: Omit<SkillProgressItem, "id" | "userId" | "lastUpdated"> & { id?: string }) => Promise<void>;
  saving: boolean;
}

export const AddSkillDialog: React.FC<AddSkillDialogProps> = ({
  open,
  onOpenChange,
  skillToEdit,
  onSave,
  saving,
}) => {
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("Technical");
  const [currentLevel, setCurrentLevel] = useState<SkillProficiencyLevel>("Intermediate");
  const [previousLevel, setPreviousLevel] = useState<SkillProficiencyLevel>("Beginner");
  const [progressPercentage, setProgressPercentage] = useState<number>(75);
  const [learningEvidence, setLearningEvidence] = useState("");

  useEffect(() => {
    if (skillToEdit) {
      setSkillName(skillToEdit.skillName);
      setCategory(skillToEdit.category);
      setCurrentLevel(skillToEdit.currentLevel);
      setPreviousLevel(skillToEdit.previousLevel || "Beginner");
      setProgressPercentage(skillToEdit.progressPercentage || 75);
      setLearningEvidence(skillToEdit.learningEvidence || "");
    } else {
      setSkillName("");
      setCategory("Technical");
      setCurrentLevel("Intermediate");
      setPreviousLevel("Beginner");
      setProgressPercentage(70);
      setLearningEvidence("");
    }
  }, [skillToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    await onSave({
      id: skillToEdit?.id,
      skillName: skillName.trim(),
      category,
      currentLevel,
      previousLevel,
      progressPercentage,
      learningEvidence: learningEvidence.trim() || undefined,
      verified: true,
      growthHistory: skillToEdit?.growthHistory || [
        {
          date: new Date().toISOString().split("T")[0],
          level: currentLevel,
          progress: progressPercentage,
          source: "Manual",
        },
      ],
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {skillToEdit ? "Update Skill Competency" : "Add New Skill"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Track competency ladders, mastery percentages, and evidence from courses or projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Skill Name</Label>
            <Input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React.js, Python, System Architecture, UI/UX"
              className="rounded-xl h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Proficiency Level</Label>
              <Select value={currentLevel} onValueChange={(val: any) => setCurrentLevel(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Mastery Progress</span>
              <span className="text-primary font-bold">{progressPercentage}%</span>
            </div>
            <Slider
              value={[progressPercentage]}
              min={10}
              max={100}
              step={5}
              onValueChange={([val]) => setProgressPercentage(val)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Learning Evidence / Project Source (Optional)</Label>
            <Input
              value={learningEvidence}
              onChange={(e) => setLearningEvidence(e.target.value)}
              placeholder="e.g. Capstone Project, EduRoadmap Course, Certificate"
              className="rounded-xl h-9 text-xs"
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
              {saving ? "Saving..." : skillToEdit ? "Update Skill" : "Add Skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
