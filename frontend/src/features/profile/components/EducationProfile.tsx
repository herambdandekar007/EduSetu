// frontend/src/features/profile/components/EducationProfile.tsx
// Pure Minimalist White & Grayscale Education Profile for SMART EDUCATION AI

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  GraduationCap,
  School,
  Building2,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import type {
  EducationDetails,
  EducationTimelineItem,
  EducationLevelType,
} from "../types/profile.types";
import { toast } from "sonner";

interface EducationProfileProps {
  education: EducationDetails | null;
  timeline: EducationTimelineItem[];
  saving: boolean;
  onSaveEducation: (data: Partial<EducationDetails>) => Promise<void>;
  onAddTimeline: (item: Omit<EducationTimelineItem, "id">) => Promise<void>;
  onRemoveTimeline: (id: string) => Promise<void>;
}

const EDUCATION_LEVELS: EducationLevelType[] = [
  "School",
  "High School",
  "Diploma",
  "Undergraduate / College",
  "Postgraduate",
  "PhD / Doctorate",
  "Vocational / Certification",
  "Other",
];

const SCHOOL_BOARDS = ["CBSE", "ICSE / ISC", "State Board", "NIOS", "IB / Cambridge", "Other"];
const MEDIUMS = ["English", "Hindi", "Marathi", "Regional Language", "Other"];

export const EducationProfile: React.FC<EducationProfileProps> = ({
  education,
  timeline,
  saving,
  onSaveEducation,
  onAddTimeline,
  onRemoveTimeline,
}) => {
  const [eduData, setEduData] = useState<EducationDetails>(
    education || {
      eduId: "",
      userId: "",
      educationLevel: "Undergraduate / College",
      institutionName: "",
      collegeName: "",
      university: "",
      degree: "",
      course: "",
      branch: "",
      year: "1st Year",
      semester: "Semester 1",
    }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [newTimeline, setNewTimeline] = useState<Omit<EducationTimelineItem, "id">>({
    userId: "",
    institution: "",
    educationType: "College",
    courseOrClass: "",
    streamOrBranch: "",
    startYear: "2023",
    endYear: "2027",
    status: "Pursuing",
    scoreOrGrade: "",
    description: "",
  });

  useEffect(() => {
    if (education) {
      setEduData(education);
    }
  }, [education]);

  const handleCancel = () => {
    if (education) setEduData(education);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveEducation(eduData);
    setIsEditing(false);
  };

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeline.institution.trim()) {
      toast.error("Institution name is required");
      return;
    }
    await onAddTimeline(newTimeline);
    setTimelineModalOpen(false);
    setNewTimeline({
      userId: "",
      institution: "",
      educationType: "College",
      courseOrClass: "",
      streamOrBranch: "",
      startYear: "2023",
      endYear: "2027",
      status: "Pursuing",
      scoreOrGrade: "",
      description: "",
    });
  };

  const isSchool = eduData.educationLevel === "School" || eduData.educationLevel === "High School";

  return (
    <div className="space-y-6">
      {/* ── Main Education Information Form ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gray-700" />
              Education Profile
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Academic details, institution affiliations, and current degree progress.
            </p>
          </div>

          <div>
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-gray-300 bg-white text-xs font-semibold text-black hover:bg-gray-50"
              >
                <Edit className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                Edit Education
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="h-9 rounded-lg bg-black text-xs font-semibold text-white hover:bg-gray-800"
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Education Level Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">Education Category</Label>
            <Select
              value={eduData.educationLevel}
              disabled={!isEditing}
              onValueChange={(val: EducationLevelType) =>
                setEduData({ ...eduData, educationLevel: val })
              }
            >
              <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-black text-xs">
                {EDUCATION_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Fields for School vs College */}
          {isSchool ? (
            /* ── School Student Fields ── */
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                School Student Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">School Name</Label>
                  <Input
                    value={eduData.institutionName || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, institutionName: e.target.value })}
                    placeholder="Delhi Public School / Kendriya Vidyalaya"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Board</Label>
                  <Select
                    value={eduData.schoolBoard || "CBSE"}
                    disabled={!isEditing}
                    onValueChange={(val) => setEduData({ ...eduData, schoolBoard: val })}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-black text-xs">
                      {SCHOOL_BOARDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Class / Grade</Label>
                  <Input
                    value={eduData.schoolClass || "Class 10"}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, schoolClass: e.target.value })}
                    placeholder="Class 10"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Medium of Instruction</Label>
                  <Select
                    value={eduData.schoolMedium || "English"}
                    disabled={!isEditing}
                    onValueChange={(val) => setEduData({ ...eduData, schoolMedium: val })}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-black text-xs">
                      {MEDIUMS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Stream (For Class 11/12)</Label>
                  <Input
                    value={eduData.schoolStream || "Science"}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, schoolStream: e.target.value })}
                    placeholder="Science / Commerce / Arts"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── College / University Student Fields ── */
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                College / Higher Education Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">College / Institute Name</Label>
                  <Input
                    value={eduData.institutionName || eduData.collegeName || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setEduData({
                        ...eduData,
                        institutionName: e.target.value,
                        collegeName: e.target.value,
                      })
                    }
                    placeholder="COEP Technological University, Pune"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Affiliated University</Label>
                  <Input
                    value={eduData.university || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, university: e.target.value })}
                    placeholder="State Technological University"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Degree / Program</Label>
                  <Input
                    value={eduData.degree || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, degree: e.target.value })}
                    placeholder="B.Tech / B.Sc / BCA"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Course / Major</Label>
                  <Input
                    value={eduData.course || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, course: e.target.value })}
                    placeholder="Computer Engineering"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Branch / Specialization</Label>
                  <Input
                    value={eduData.branch || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, branch: e.target.value })}
                    placeholder="Artificial Intelligence"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Current Year</Label>
                  <Input
                    value={eduData.year || "3rd Year"}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, year: e.target.value })}
                    placeholder="3rd Year"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">Semester</Label>
                  <Input
                    value={eduData.semester || "Semester 6"}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, semester: e.target.value })}
                    placeholder="Semester 6"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-900">CGPA / Percentage</Label>
                  <Input
                    value={eduData.cgpaOrPercentage || "9.2 CGPA"}
                    disabled={!isEditing}
                    onChange={(e) => setEduData({ ...eduData, cgpaOrPercentage: e.target.value })}
                    placeholder="9.2 CGPA"
                    className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ── Academic Milestones Timeline ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-700" />
              Academic Journey & Milestones
            </h3>
            <p className="text-xs text-gray-500">
              Verified historical institutions and qualifications recorded under your EduID.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setTimelineModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-gray-300 bg-white text-xs font-semibold text-black hover:bg-gray-50"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Milestone
          </Button>
        </div>

        {timeline.length > 0 ? (
          <div className="space-y-3">
            {timeline.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-black">{item.institution}</h4>
                    <span className="rounded border border-gray-300 bg-white px-1.5 py-0.2 text-[10px] font-medium text-gray-700">
                      {item.educationType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {item.courseOrClass} {item.streamOrBranch ? `· ${item.streamOrBranch}` : ""}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {item.startYear} – {item.endYear} · {item.scoreOrGrade || item.status}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-600 pt-1 italic">{item.description}</p>
                  )}
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemoveTimeline(item.id)}
                  className="h-7 w-7 text-gray-400 hover:text-black hover:bg-gray-200"
                  title="Remove Milestone"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No timeline milestones added yet.</p>
        )}
      </div>

      {/* Add Milestone Dialog */}
      <Dialog open={timelineModalOpen} onOpenChange={setTimelineModalOpen}>
        <DialogContent className="rounded-xl border border-gray-200 bg-white p-6 text-black sm:max-w-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-black">Add Academic Milestone</DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Record a completed school, college, or university milestone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTimeline} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-900">Institution Name</Label>
              <Input
                value={newTimeline.institution}
                onChange={(e) => setNewTimeline({ ...newTimeline, institution: e.target.value })}
                placeholder="COEP Technological University"
                required
                className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Degree / Qualification</Label>
                <Input
                  value={newTimeline.courseOrClass}
                  onChange={(e) => setNewTimeline({ ...newTimeline, courseOrClass: e.target.value })}
                  placeholder="B.Tech Computer Science"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Grade / CGPA</Label>
                <Input
                  value={newTimeline.scoreOrGrade}
                  onChange={(e) => setNewTimeline({ ...newTimeline, scoreOrGrade: e.target.value })}
                  placeholder="9.2 CGPA / 94%"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Start Year</Label>
                <Input
                  value={newTimeline.startYear}
                  onChange={(e) => setNewTimeline({ ...newTimeline, startYear: e.target.value })}
                  placeholder="2023"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">End Year</Label>
                <Input
                  value={newTimeline.endYear}
                  onChange={(e) => setNewTimeline({ ...newTimeline, endYear: e.target.value })}
                  placeholder="2027"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTimelineModalOpen(false)}
                className="border-gray-300 bg-white text-black text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-black text-white text-xs font-semibold">
                Add Milestone
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
