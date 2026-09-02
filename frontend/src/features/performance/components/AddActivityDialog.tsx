// features/performance/components/AddActivityDialog.tsx
// Dialog for recording student activities (workshops, hackathons, seminars, sports, volunteering)

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
import type { ActivityItem, ActivityCategory } from "../types/performance.types";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityToEdit?: ActivityItem | null;
  onSave: (activity: Omit<ActivityItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  saving: boolean;
}

export const AddActivityDialog: React.FC<AddActivityDialogProps> = ({
  open,
  onOpenChange,
  activityToEdit,
  onSave,
  saving,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("Workshop");
  const [organizer, setOrganizer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [role, setRole] = useState("Participant");
  const [description, setDescription] = useState("");
  const [evidenceDocumentUrl, setEvidenceDocumentUrl] = useState("");
  const [hoursSpent, setHoursSpent] = useState<number>(8);

  useEffect(() => {
    if (activityToEdit) {
      setName(activityToEdit.name);
      setCategory(activityToEdit.category);
      setOrganizer(activityToEdit.organizer);
      setDate(activityToEdit.date);
      setRole(activityToEdit.role);
      setDescription(activityToEdit.description);
      setEvidenceDocumentUrl(activityToEdit.evidenceDocumentUrl || "");
      setHoursSpent(activityToEdit.hoursSpent || 8);
    } else {
      setName("");
      setCategory("Workshop");
      setOrganizer("");
      setDate(new Date().toISOString().split("T")[0]);
      setRole("Participant");
      setDescription("");
      setEvidenceDocumentUrl("");
      setHoursSpent(8);
    }
  }, [activityToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organizer.trim()) return;

    await onSave({
      id: activityToEdit?.id,
      name: name.trim(),
      category,
      organizer: organizer.trim(),
      date,
      role: role.trim(),
      description: description.trim(),
      evidenceDocumentUrl: evidenceDocumentUrl.trim() || undefined,
      hoursSpent: Number(hoursSpent) || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {activityToEdit ? "Edit Activity Record" : "Add Co-Curricular & Extracurricular Activity"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Log participation in workshops, technical seminars, hackathons, sports, or volunteer leadership.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Activity Name / Event Title</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & Cloud Architecture Workshop, Youth Leadership Summit"
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
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
                  <SelectItem value="Competition">Competition</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural Activity">Cultural Activity</SelectItem>
                  <SelectItem value="Volunteer Work">Volunteer Work</SelectItem>
                  <SelectItem value="Club Activity">Club Activity</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Role</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Participant, Team Lead, Speaker..."
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Organizer / Host Institution</Label>
              <Input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. IEEE Student Branch, College Dept, NGO"
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>

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
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Description & Takeaways</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you learned, hands-on tasks completed, community impact..."
              className="rounded-xl text-xs min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Hours Invested</Label>
              <Input
                type="number"
                min={1}
                value={hoursSpent}
                onChange={(e) => setHoursSpent(Number(e.target.value))}
                className="rounded-xl h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Evidence / Certificate Link (Optional)</Label>
              <Input
                value={evidenceDocumentUrl}
                onChange={(e) => setEvidenceDocumentUrl(e.target.value)}
                placeholder="EduVault Doc URL or external proof"
                className="rounded-xl h-9 text-xs"
              />
            </div>
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
              {saving ? "Saving..." : activityToEdit ? "Update Activity" : "Save Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
