// features/performance/components/AddAchievementDialog.tsx
// Dialog for recording high-tier honors, competitions, hackathons, and research achievements

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
import type {
  AchievementItem,
  AchievementCategory,
  AchievementLevel,
  VerificationStatus,
} from "../types/performance.types";

interface AddAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievementToEdit?: AchievementItem | null;
  onSave: (achievement: Omit<AchievementItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  saving: boolean;
}

export const AddAchievementDialog: React.FC<AddAchievementDialogProps> = ({
  open,
  onOpenChange,
  achievementToEdit,
  onSave,
  saving,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AchievementCategory>("Innovation Achievement");
  const [level, setLevel] = useState<AchievementLevel>("National Level");
  const [organizer, setOrganizer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [position, setPosition] = useState("Finalist");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("Verified");

  useEffect(() => {
    if (achievementToEdit) {
      setTitle(achievementToEdit.title);
      setCategory(achievementToEdit.category);
      setLevel(achievementToEdit.level);
      setOrganizer(achievementToEdit.organizer);
      setDate(achievementToEdit.date);
      setPosition(achievementToEdit.position || "");
      setDescription(achievementToEdit.description);
      setEvidenceUrl(achievementToEdit.evidenceUrl || "");
      setVerificationStatus(achievementToEdit.verificationStatus || "Verified");
    } else {
      setTitle("");
      setCategory("Innovation Achievement");
      setLevel("National Level");
      setOrganizer("");
      setDate(new Date().toISOString().split("T")[0]);
      setPosition("Finalist");
      setDescription("");
      setEvidenceUrl("");
      setVerificationStatus("Verified");
    }
  }, [achievementToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organizer.trim()) return;

    await onSave({
      id: achievementToEdit?.id,
      title: title.trim(),
      category,
      level,
      organizer: organizer.trim(),
      date,
      position: position.trim() || undefined,
      description: description.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
      verificationStatus,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {achievementToEdit ? "Edit Milestone Achievement" : "Record New Milestone Achievement"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Document national competitions, hackathons, academic medals, and research publications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Achievement Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart India Hackathon Finalist, National Math Olympiad Silver"
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
                  <SelectItem value="Academic Achievement">Academic Achievement</SelectItem>
                  <SelectItem value="Hackathon Achievement">Hackathon Achievement</SelectItem>
                  <SelectItem value="Competition Achievement">Competition Achievement</SelectItem>
                  <SelectItem value="Innovation Achievement">Innovation Achievement</SelectItem>
                  <SelectItem value="Leadership Achievement">Leadership Achievement</SelectItem>
                  <SelectItem value="Research Achievement">Research Achievement</SelectItem>
                  <SelectItem value="Sports Achievement">Sports Achievement</SelectItem>
                  <SelectItem value="Cultural Achievement">Cultural Achievement</SelectItem>
                  <SelectItem value="Community Achievement">Community Achievement</SelectItem>
                  <SelectItem value="Other Achievement">Other Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Achievement Level</Label>
              <Select value={level} onValueChange={(val: any) => setLevel(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Institution Level">Institution Level</SelectItem>
                  <SelectItem value="District Level">District Level</SelectItem>
                  <SelectItem value="State Level">State Level</SelectItem>
                  <SelectItem value="National Level">National Level</SelectItem>
                  <SelectItem value="International Level">International Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Organizer / Awarding Body</Label>
              <Input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. AICTE, Ministry of Education, IEEE"
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Position / Rank Secured</Label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. 1st Place, Finalist, Top 10"
                className="rounded-xl h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Verification Status</Label>
              <Select value={verificationStatus} onValueChange={(val: any) => setVerificationStatus(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending Verification</SelectItem>
                  <SelectItem value="Unverified">Self-Reported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Description & Impact</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Selected for the final stage among 50,000+ applicants..."
              className="rounded-xl text-xs min-h-[60px]"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Evidence Document / EduVault Certificate Link</Label>
            <Input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="EduVault Certificate link or public verification URL"
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
              {saving ? "Saving..." : achievementToEdit ? "Update Achievement" : "Save Achievement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
