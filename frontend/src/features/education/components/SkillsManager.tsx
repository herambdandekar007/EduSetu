// frontend/src/features/education/components/SkillsManager.tsx
import React, { useState } from "react";
import type { SkillItem } from "../types/education.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Target, Plus, Trash2, Award, Zap, Sparkles } from "lucide-react";

interface Props {
  skills: SkillItem[];
  onAddSkill: (skill: Omit<SkillItem, "id" | "userId" | "eduId">) => Promise<any>;
  onDeleteSkill: (id: string) => Promise<void>;
}

const CATEGORIES = ["All", "Technical", "Academic", "Soft", "Creative", "Professional"] as const;

export const SkillsManager: React.FC<Props> = ({ skills, onAddSkill, onDeleteSkill }) => {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillItem["category"]>("Technical");
  const [level, setLevel] = useState<SkillItem["level"]>("Intermediate");
  const [status, setStatus] = useState<SkillItem["status"]>("Learning");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = selectedCat === "All" ? skills : skills.filter((s) => s.category === selectedCat);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSkill({
        name: name.trim(),
        category,
        level,
        status,
      });
      setName("");
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" /> Student Skills & Competencies ({skills.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Skills synchronized with 🧠 EduMind cognitive mapping and 🎯 EduCareer job alignment.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          className="rounded-2xl gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow"
        >
          <Plus className="h-4 w-4" /> Add Skill
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedCat === cat
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                : "border-border/70 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filtered.map((skill) => (
          <Card
            key={skill.id}
            className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:border-emerald-500/40 hover:shadow-sm transition-all"
          >
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-muted/40">
                    {skill.category}
                  </Badge>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    • {skill.level}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground truncate block">{skill.name}</h4>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteSkill(skill.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md rounded-3xl border-border bg-card shadow-2xl overflow-hidden">
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add Skill
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Skill Name *</label>
                <Input
                  placeholder="e.g. Python / SQL / Public Speaking / Machine Learning"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Academic">Academic</option>
                    <option value="Soft">Soft Skill</option>
                    <option value="Creative">Creative</option>
                    <option value="Professional">Professional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Proficiency Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdd(false)}
                  disabled={isSubmitting}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  {isSubmitting ? "Adding..." : "Add Skill"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
