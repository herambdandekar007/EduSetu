// frontend/src/features/profile/components/LanguagesSection.tsx
// Pure Minimalist White & Grayscale Languages Section for SMART EDUCATION AI

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Globe, Plus, Trash2, Edit2 } from "lucide-react";
import type { UserLanguage, LanguageProficiency } from "../types/profile.types";
import { toast } from "sonner";

interface LanguagesSectionProps {
  languages: UserLanguage[];
  onAddOrUpdateLanguage: (lang: Omit<UserLanguage, "id"> & { id?: string }) => Promise<void>;
  onRemoveLanguage: (langId: string) => Promise<void>;
}

const PROFICIENCY_LEVELS: LanguageProficiency[] = ["Beginner", "Intermediate", "Advanced", "Fluent"];

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  onAddOrUpdateLanguage,
  onRemoveLanguage,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<UserLanguage | null>(null);

  const [formState, setFormState] = useState<{
    name: string;
    reading: LanguageProficiency;
    writing: LanguageProficiency;
    speaking: LanguageProficiency;
  }>({
    name: "",
    reading: "Fluent",
    writing: "Fluent",
    speaking: "Fluent",
  });

  const handleOpenAdd = () => {
    setEditingLang(null);
    setFormState({
      name: "",
      reading: "Fluent",
      writing: "Fluent",
      speaking: "Fluent",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (lang: UserLanguage) => {
    setEditingLang(lang);
    setFormState({
      name: lang.name,
      reading: lang.reading,
      writing: lang.writing,
      speaking: lang.speaking,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast.error("Language name is required");
      return;
    }

    await onAddOrUpdateLanguage({
      id: editingLang?.id,
      userId: editingLang?.userId || "",
      name: formState.name.trim(),
      reading: formState.reading,
      writing: formState.writing,
      speaking: formState.speaking,
    });

    setDialogOpen(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-700" />
            Languages Known
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add reading, writing, and speaking competencies for Indian and international languages.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenAdd}
          className="h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Language
        </Button>
      </div>

      {/* Languages List */}
      {languages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300"
            >
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-black">{lang.name}</h3>

                <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                  <span className="rounded border border-gray-200 bg-white px-2 py-0.5">
                    Reading: <strong className="text-black font-semibold">{lang.reading}</strong>
                  </span>
                  <span className="rounded border border-gray-200 bg-white px-2 py-0.5">
                    Writing: <strong className="text-black font-semibold">{lang.writing}</strong>
                  </span>
                  <span className="rounded border border-gray-200 bg-white px-2 py-0.5">
                    Speaking: <strong className="text-black font-semibold">{lang.speaking}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOpenEdit(lang)}
                  className="h-7 w-7 text-gray-400 hover:text-black"
                  title="Edit Language"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemoveLanguage(lang.id)}
                  className="h-7 w-7 text-gray-400 hover:text-black"
                  title="Remove Language"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 py-4 text-center">No languages added yet.</p>
      )}

      {/* Add / Edit Language Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl border border-gray-200 bg-white p-6 text-black sm:max-w-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-black">
              {editingLang ? "Edit Language" : "Add Language"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Specify your reading, writing, and speaking proficiencies.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Language Name</Label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="English, Hindi, Marathi, etc."
                required
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Reading</Label>
                <Select
                  value={formState.reading}
                  onValueChange={(val: LanguageProficiency) =>
                    setFormState({ ...formState, reading: val })
                  }
                >
                  <SelectTrigger className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Writing</Label>
                <Select
                  value={formState.writing}
                  onValueChange={(val: LanguageProficiency) =>
                    setFormState({ ...formState, writing: val })
                  }
                >
                  <SelectTrigger className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Speaking</Label>
                <Select
                  value={formState.speaking}
                  onValueChange={(val: LanguageProficiency) =>
                    setFormState({ ...formState, speaking: val })
                  }
                >
                  <SelectTrigger className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black">
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
                {editingLang ? "Save" : "Add Language"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
