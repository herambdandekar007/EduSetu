// frontend/src/features/education/components/EducationTimeline.tsx
import React, { useState } from "react";
import type { EducationHistoryItem, TimelineStatus } from "../types/education.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  School,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  MapPin,
  Sparkles,
} from "lucide-react";

interface Props {
  history: EducationHistoryItem[];
  onAddHistory: (item: Omit<EducationHistoryItem, "id" | "userId" | "eduId">) => Promise<any>;
  onDeleteHistory: (id: string) => Promise<void>;
}

const STATUS_BADGES: Record<TimelineStatus, { label: string; class: string }> = {
  Completed: { label: "Completed", class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  Current: { label: "Currently Enrolled", class: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  Paused: { label: "Paused", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  Transferred: { label: "Transferred", class: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export const EducationTimeline: React.FC<Props> = ({
  history,
  onAddHistory,
  onDeleteHistory,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [institution, setInstitution] = useState("");
  const [boardOrUniversity, setBoardOrUniversity] = useState("");
  const [courseOrClass, setCourseOrClass] = useState("");
  const [streamOrBranch, setStreamOrBranch] = useState("");
  const [startDate, setStartDate] = useState("2022");
  const [endDate, setEndDate] = useState("2024");
  const [scoreOrGrade, setScoreOrGrade] = useState("");
  const [status, setStatus] = useState<TimelineStatus>("Completed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !courseOrClass.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddHistory({
        educationLevel: "school",
        institution: institution.trim(),
        boardOrUniversity: boardOrUniversity.trim(),
        courseOrClass: courseOrClass.trim(),
        streamOrBranch: streamOrBranch.trim(),
        startDate,
        endDate,
        scoreOrGrade: scoreOrGrade.trim(),
        status,
      });
      setInstitution("");
      setBoardOrUniversity("");
      setCourseOrClass("");
      setStreamOrBranch("");
      setScoreOrGrade("");
      setShowAddModal(false);
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
            <Clock className="h-5 w-5 text-primary" /> Lifelong Educational Timeline
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your verified academic journey across schools, junior colleges, universities, and degrees.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="rounded-2xl gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow"
        >
          <Plus className="h-4 w-4" /> Add Timeline Stage
        </Button>
      </div>

      {/* Timeline Items */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
        {history.map((item, index) => {
          const badge = STATUS_BADGES[item.status] || STATUS_BADGES.Completed;
          return (
            <div key={item.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-6 top-1.5 h-5 w-5 rounded-full border-4 border-background flex items-center justify-center ${
                  item.status === "Current"
                    ? "bg-blue-600 ring-4 ring-blue-500/20"
                    : "bg-emerald-500"
                }`}
              />

              <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-primary font-mono">
                          {item.startDate} – {item.endDate}
                        </span>
                        <Badge variant="outline" className={`text-[10px] font-bold ${badge.class}`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-base text-foreground">
                        {item.courseOrClass}
                      </h4>
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {item.institution} {item.boardOrUniversity ? `• ${item.boardOrUniversity}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.scoreOrGrade && (
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Score / CGPA</span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {item.scoreOrGrade}
                          </span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteHistory(item.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 rounded-lg"
                        title="Remove Stage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {item.streamOrBranch && (
                    <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Specialization:</span> {item.streamOrBranch}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md rounded-3xl border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add Educational Timeline Stage
              </CardTitle>
              <CardDescription className="text-xs">
                Record a completed or current stage of your educational journey.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAdd} className="p-6 pt-3 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Course / Degree / Class *</label>
                <Input
                  placeholder="e.g. Higher Secondary (Class 12) / B.E. Computer Engineering"
                  value={courseOrClass}
                  onChange={(e) => setCourseOrClass(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Institution / School / College *</label>
                <Input
                  placeholder="e.g. XYZ Junior Science College / ABC Public School"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Board / University</label>
                  <Input
                    placeholder="e.g. CBSE / State Board"
                    value={boardOrUniversity}
                    onChange={(e) => setBoardOrUniversity(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Stream / Branch</label>
                  <Input
                    placeholder="e.g. Science / Commerce"
                    value={streamOrBranch}
                    onChange={(e) => setStreamOrBranch(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Start Year</label>
                  <Input
                    placeholder="e.g. 2022"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">End Year</label>
                  <Input
                    placeholder="e.g. 2024 / Present"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Marks / CGPA</label>
                  <Input
                    placeholder="e.g. 91.2%"
                    value={scoreOrGrade}
                    onChange={(e) => setScoreOrGrade(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Stage Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TimelineStatus)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium"
                >
                  <option value="Completed">Completed</option>
                  <option value="Current">Currently Enrolled</option>
                  <option value="Paused">Paused</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
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
                  {isSubmitting ? "Adding..." : "Add Stage"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
