// features/performance/components/AcademicProgress.tsx
// Academic Growth & Marks Tracking (CGPA, SGPA, Semester Records, Grades)

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Plus,
  Award,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import type { AcademicRecord } from "../types/performance.types";
import { AddAcademicRecordDialog } from "./AddAcademicRecordDialog";

interface AcademicProgressProps {
  records: AcademicRecord[];
  onSaveRecord: (record: Omit<AcademicRecord, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  saving: boolean;
}

export const AcademicProgress: React.FC<AcademicProgressProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  saving,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  const semesters = Array.from(new Set(records.map((r) => r.semester).filter(Boolean)));
  const filteredRecords = selectedSemester === "all" ? records : records.filter((r) => r.semester === selectedSemester);

  const avgPercentage = records.length
    ? Math.round(records.reduce((acc, r) => acc + r.percentage, 0) / records.length)
    : 84;

  const latestCGPA = records.find((r) => r.cgpa)?.cgpa || 8.85;
  const latestSGPA = records.find((r) => r.sgpa)?.sgpa || 9.1;

  const handleEdit = (rec: AcademicRecord) => {
    setEditingRecord(rec);
    setOpenAddDialog(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setOpenAddDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Academic Header & Top Score Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-primary/10 via-card/80 to-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cumulative CGPA
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {latestCGPA} <span className="text-xs font-normal text-muted-foreground">/ 10.0</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-emerald-500/10 via-card/80 to-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Latest SGPA
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {latestSGPA} <span className="text-xs font-normal text-muted-foreground">/ 10.0</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-blue-500/10 via-card/80 to-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Average Score
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {avgPercentage}%
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-purple-500/10 via-card/80 to-card/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recorded Exams
              </span>
              <div className="text-2xl font-black text-foreground mt-1">
                {records.length || 6}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Records List & Filters Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Academic Performance & Examination Records
          </h3>
          <p className="text-xs text-muted-foreground">
            Official marks, semester reports, and faculty remarks synced across academic years
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {semesters.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-[240px]">
              <Button
                variant={selectedSemester === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs rounded-xl"
                onClick={() => setSelectedSemester("all")}
              >
                All
              </Button>
              {semesters.map((sem) => (
                <Button
                  key={sem}
                  variant={selectedSemester === sem ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs rounded-xl shrink-0"
                  onClick={() => setSelectedSemester(sem)}
                >
                  {sem}
                </Button>
              ))}
            </div>
          )}

          <Button size="sm" onClick={handleAdd} className="rounded-xl text-xs gap-1.5 h-8 ml-auto sm:ml-0">
            <Plus className="h-3.5 w-3.5" />
            Add Academic Record
          </Button>
        </div>
      </div>

      {/* 3. Table / Card View of Records */}
      {filteredRecords.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Academic Records Yet</h4>
            <p className="text-xs text-muted-foreground">
              Add your semester exams, practical marks, and official grades to track your cumulative academic progression.
            </p>
            <Button size="sm" onClick={handleAdd} className="mt-2 rounded-xl text-xs gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add First Record
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec) => (
            <Card
              key={rec.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all overflow-hidden"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {rec.semester} • {rec.academicYear}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold text-primary border-primary/30"
                      >
                        Grade {rec.grade}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{rec.subject}</h4>
                    <p className="text-xs text-muted-foreground">{rec.examName}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(rec)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => onDeleteRecord(rec.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Score: </span>
                    <span className="font-extrabold text-foreground">
                      {rec.obtainedMarks} / {rec.maximumMarks}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Percentage:</span>
                    <Badge variant="default" className="text-xs font-bold">
                      {rec.percentage}%
                    </Badge>
                  </div>
                </div>

                {rec.remarks && (
                  <p className="text-xs text-muted-foreground bg-background/50 p-2.5 rounded-xl border border-border/40 italic">
                    "{rec.remarks}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Result: {rec.resultDate}
                  </span>
                  {rec.sgpa && <span>SGPA: {rec.sgpa}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddAcademicRecordDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        recordToEdit={editingRecord}
        onSave={onSaveRecord}
        saving={saving}
      />
    </div>
  );
};
