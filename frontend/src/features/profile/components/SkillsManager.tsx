// frontend/src/features/profile/components/SkillsManager.tsx
// Pure Minimalist White & Grayscale Skills Section for SMART EDUCATION AI

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Code,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  Award,
} from "lucide-react";
import type { SkillItem, SkillCategory, SkillProficiency } from "../types/profile.types";
import { toast } from "sonner";

interface SkillsManagerProps {
  skills: SkillItem[];
  onAddOrUpdateSkill: (skill: Omit<SkillItem, "id"> & { id?: string }) => Promise<void>;
  onRemoveSkill: (skillId: string) => Promise<void>;
}

const CATEGORIES: SkillCategory[] = [
  "Technical",
  "Communication",
  "Academic",
  "Creative",
  "Leadership",
  "Other",
];

const PROFICIENCY_LEVELS: SkillProficiency[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  onAddOrUpdateSkill,
  onRemoveSkill,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    category: SkillCategory;
    level: SkillProficiency;
  }>({
    name: "",
    category: "Technical",
    level: "Intermediate",
  });

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormState({
      name: "",
      category: "Technical",
      level: "Intermediate",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (skill: SkillItem) => {
    setEditingSkill(skill);
    setFormState({
      name: skill.name,
      category: skill.category,
      level: skill.level,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    await onAddOrUpdateSkill({
      id: editingSkill?.id,
      userId: editingSkill?.userId || "",
      name: formState.name.trim(),
      category: formState.category,
      level: formState.level,
    });

    setDialogOpen(false);
  };

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Code className="h-5 w-5 text-gray-700" />
            Skills & Competencies
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your verified technical, communication, academic, and leadership skills.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenAdd}
          className="h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Skill
        </Button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="h-9 rounded-lg border-gray-300 bg-white pl-9 text-xs text-black"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-black text-xs">
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c} Skills
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categorized Skills Render */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const categorySkills = filteredSkills.filter((s) => s.category === category);
          if (categorySkills.length === 0 && selectedCategory !== "All" && selectedCategory !== category) {
            return null;
          }

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  {category} Skills
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  {categorySkills.length} {categorySkills.length === 1 ? "skill" : "skills"}
                </span>
              </div>

              {categorySkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-black transition-colors hover:border-black"
                    >
                      <span className="font-semibold">{skill.name}</span>
                      <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.2 text-[10px] font-medium text-gray-600">
                        {skill.level}
                      </span>

                      {/* Edit/Delete icons on hover */}
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(skill)}
                          className="text-gray-400 hover:text-black transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSkill(skill.id)}
                          className="text-gray-400 hover:text-black transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-1">No {category.toLowerCase()} skills added.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Skill Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl border border-gray-200 bg-white p-6 text-black sm:max-w-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-black">
              {editingSkill ? "Edit Skill" : "Add Skill"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Provide skill details and proficiency level.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Skill Name</Label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. Python, Communication, Problem Solving"
                required
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(val: SkillCategory) => setFormState({ ...formState, category: val })}
                >
                  <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-black text-xs">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Proficiency Level</Label>
                <Select
                  value={formState.level}
                  onValueChange={(val: SkillProficiency) => setFormState({ ...formState, level: val })}
                >
                  <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-black text-xs">
                    {PROFICIENCY_LEVELS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="border-gray-300 bg-white text-black text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-black text-white text-xs font-semibold">
                {editingSkill ? "Save" : "Add Skill"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
