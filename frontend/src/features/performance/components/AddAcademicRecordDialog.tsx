// features/performance/components/AddAcademicRecordDialog.tsx
// Dialog for adding or editing an academic marksheet/semester examination record

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
import type { AcademicRecord } from "../types/performance.types";

interface AddAcademicRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordToEdit?: AcademicRecord | null;
  onSave: (record: Omit<AcademicRecord, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  saving: boolean;
}

export const AddAcademicRecordDialog: React.FC<AddAcademicRecordDialogProps> = ({
  open,
  onOpenChange,
  recordToEdit,
  onSave,
  saving,
}) => {
  const [educationLevel, setEducationLevel] = useState<AcademicRecord["educationLevel"]>("Undergraduate");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [semester, setSemester] = useState("Semester 3");
  const [subject, setSubject] = useState("");
  const [examName, setExamName] = useState("Semester Final Examination");
  const [maximumMarks, setMaximumMarks] = useState<number>(100);
  const [obtainedMarks, setObtainedMarks] = useState<number>(85);
  const [cgpa, setCgpa] = useState<string>("8.8");
  const [sgpa, setSgpa] = useState<string>("9.0");
  const [resultDate, setResultDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (recordToEdit) {
      setEducationLevel(recordToEdit.educationLevel || "Undergraduate");
      setAcademicYear(recordToEdit.academicYear || "2025-2026");
      setSemester(recordToEdit.semester || "Semester 3");
      setSubject(recordToEdit.subject || "");
      setExamName(recordToEdit.examName || "");
      setMaximumMarks(recordToEdit.maximumMarks || 100);
      setObtainedMarks(recordToEdit.obtainedMarks || 85);
      setCgpa(recordToEdit.cgpa ? String(recordToEdit.cgpa) : "");
      setSgpa(recordToEdit.sgpa ? String(recordToEdit.sgpa) : "");
      setResultDate(recordToEdit.resultDate || new Date().toISOString().split("T")[0]);
      setRemarks(recordToEdit.remarks || "");
    } else {
      setSubject("");
      setExamName("Semester Final Examination");
      setMaximumMarks(100);
      setObtainedMarks(85);
      setRemarks("");
    }
  }, [recordToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !examName.trim()) return;

    const percentage = maximumMarks > 0 ? Math.round((obtainedMarks / maximumMarks) * 100) : 0;
    const grade =
      percentage >= 90 ? "O" : percentage >= 80 ? "A+" : percentage >= 70 ? "A" : percentage >= 60 ? "B+" : percentage >= 50 ? "B" : "C";

    await onSave({
      id: recordToEdit?.id,
      educationLevel,
      academicYear,
      semester,
      subject,
      examName,
      maximumMarks: Number(maximumMarks),
      obtainedMarks: Number(obtainedMarks),
      percentage,
      grade,
      cgpa: cgpa ? Number(cgpa) : undefined,
      sgpa: sgpa ? Number(sgpa) : undefined,
      resultDate,
      remarks,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {recordToEdit ? "Edit Academic Record" : "Add Academic Examination Record"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record institutional exam marks, semester grades, and CGPA for permanent lifelong tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Education Level</Label>
              <Select value={educationLevel} onValueChange={(val: any) => setEducationLevel(val)}>
                <SelectTrigger className="rounded-xl h-9 text-xs">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="High School">High School (10+2)</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate / College</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Doctorate">Doctorate / PhD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Academic Year</Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025-2026"
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Semester / Term</Label>
              <Input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Semester 3 / Term 1"
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Result Date</Label>
              <Input
                type="date"
                value={resultDate}
                onChange={(e) => setResultDate(e.target.value)}
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Subject / Course Name</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics & Statistics / Data Structures"
              className="rounded-xl h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Examination Name</Label>
            <Input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. Mid-Semester Exam, Final University Exam, Practical Lab"
              className="rounded-xl h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Maximum Marks</Label>
              <Input
                type="number"
                min={1}
                value={maximumMarks}
                onChange={(e) => setMaximumMarks(Number(e.target.value))}
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Obtained Marks</Label>
              <Input
                type="number"
                min={0}
                max={maximumMarks}
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(Number(e.target.value))}
                className="rounded-xl h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">SGPA (Optional)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={sgpa}
                onChange={(e) => setSgpa(e.target.value)}
                placeholder="e.g. 9.1"
                className="rounded-xl h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Cumulative CGPA (Optional)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g. 8.9"
                className="rounded-xl h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Remarks / Faculty Feedback</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes or teacher evaluation..."
              className="rounded-xl text-xs min-h-[60px]"
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
              {saving ? "Saving..." : recordToEdit ? "Update Record" : "Save Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
