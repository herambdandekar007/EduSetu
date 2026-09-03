// frontend/src/features/education/components/LanguageManager.tsx
import React, { useState } from "react";
import type { LanguageItem } from "../types/education.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Globe, Plus, Trash2, Mic, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  languages: LanguageItem[];
  onAddLanguage: (lang: Omit<LanguageItem, "id" | "userId" | "eduId">) => Promise<any>;
  onDeleteLanguage: (id: string) => Promise<void>;
}

export const LanguageManager: React.FC<Props> = ({
  languages,
  onAddLanguage,
  onDeleteLanguage,
}) => {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [reading, setReading] = useState<LanguageItem["readingLevel"]>("Native");
  const [writing, setWriting] = useState<LanguageItem["writingLevel"]>("Advanced");
  const [speaking, setSpeaking] = useState<LanguageItem["speakingLevel"]>("Advanced");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddLanguage({
        name: name.trim(),
        readingLevel: reading,
        writingLevel: writing,
        speakingLevel: speaking,
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
            <Globe className="h-5 w-5 text-cyan-600" /> Language Proficiencies ({languages.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synchronized with 🗣️ EduSpeak Spoken English & Voice Lab for speech drills and accent training.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setShowAdd(true)}
            className="rounded-2xl gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow"
          >
            <Plus className="h-4 w-4" /> Add Language
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/eduspeak")}
            className="rounded-2xl gap-1.5 text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
          >
            <Mic className="h-3.5 w-3.5" /> Practice in EduSpeak
          </Button>
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <Card
            key={lang.id}
            className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm hover:border-cyan-500/40 hover:shadow-sm transition-all"
          >
            <CardContent className="p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                    {lang.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-base text-foreground">{lang.name}</h4>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteLanguage(lang.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Levels Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                <div className="p-2 rounded-xl bg-muted/40 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Reading</span>
                  <span className="text-[11px] font-bold text-foreground block truncate">{lang.readingLevel}</span>
                </div>
                <div className="p-2 rounded-xl bg-muted/40 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Writing</span>
                  <span className="text-[11px] font-bold text-foreground block truncate">{lang.writingLevel}</span>
                </div>
                <div className="p-2 rounded-xl bg-muted/40 space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Speaking</span>
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block truncate">{lang.speakingLevel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md rounded-3xl border-border bg-card shadow-2xl overflow-hidden">
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add Language
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Language Name *</label>
                <Input
                  placeholder="e.g. English / Hindi / Marathi / German / French"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Reading</label>
                  <select
                    value={reading}
                    onChange={(e) => setReading(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-input bg-background text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Native">Native</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Writing</label>
                  <select
                    value={writing}
                    onChange={(e) => setWriting(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-input bg-background text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Native">Native</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Speaking</label>
                  <select
                    value={speaking}
                    onChange={(e) => setSpeaking(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-input bg-background text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Native">Native</option>
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
                  {isSubmitting ? "Adding..." : "Add Language"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
