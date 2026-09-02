// features/performance/components/AssignmentPerformance.tsx
// Assignment Performance tracking with status filters, marks, and teacher/AI feedback

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PerformanceOverviewStats } from "../types/performance.types";

interface AssignmentPerformanceProps {
  stats: PerformanceOverviewStats;
}

export const AssignmentPerformance: React.FC<AssignmentPerformanceProps> = ({ stats }) => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const sampleAssignments = [
    {
      id: "asg1",
      title: "Implement AVL Tree Self-Balancing In C++",
      subject: "Data Structures & Algorithms",
      dueDate: "2026-08-25",
      submittedDate: "2026-08-24",
      status: "Evaluated",
      marksObtained: 28,
      maxMarks: 30,
      percentage: 93,
      teacherFeedback: "Excellent pointer manipulation and rotation edge case handling. Thorough memory management.",
      aiFeedback: "Clean recursive balance-factor calculation. Complexity is strictly O(log n).",
    },
    {
      id: "asg2",
      title: "E-Commerce Database Schema Design & 3NF Normalization",
      subject: "Database Management Systems",
      dueDate: "2026-08-28",
      submittedDate: "2026-08-27",
      status: "Evaluated",
      marksObtained: 48,
      maxMarks: 50,
      percentage: 96,
      teacherFeedback: "Very comprehensive ER diagram and functional dependency mapping.",
      aiFeedback: "Composite foreign keys properly resolved without duplicate tuple hazards.",
    },
    {
      id: "asg3",
      title: "Process Scheduling Simulation (Round Robin & Priority)",
      subject: "Operating Systems",
      dueDate: "2026-09-02",
      submittedDate: "2026-08-29",
      status: "Submitted",
      marksObtained: null,
      maxMarks: 25,
      percentage: null,
      teacherFeedback: null,
      aiFeedback: "Gantt chart generation verified. Waiting for professor rubric review.",
    },
    {
      id: "asg4",
      title: "Responsive Accessible Dashboard in React & Tailwind",
      subject: "Web Technologies",
      dueDate: "2026-09-05",
      submittedDate: null,
      status: "In Progress",
      marksObtained: null,
      maxMarks: 40,
      percentage: null,
      teacherFeedback: null,
      aiFeedback: "Ensure WCAG 2.1 AA keyboard navigation accessibility guidelines are fulfilled.",
    },
  ];

  const filtered =
    filterStatus === "all"
      ? sampleAssignments
      : sampleAssignments.filter((a) => a.status.toLowerCase() === filterStatus.toLowerCase());

  const evaluatedCount = sampleAssignments.filter((a) => a.status === "Evaluated").length;
  const pendingCount = sampleAssignments.filter((a) => a.status === "In Progress" || a.status === "Pending").length;
  const submittedCount = sampleAssignments.filter((a) => a.status === "Submitted").length;

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Total Tracked
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {sampleAssignments.length}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Evaluated
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {evaluatedCount}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Submitted (Reviewing)
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {submittedCount}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Pending / Active
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {pendingCount}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Filter Bar & Quick Jump */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {["all", "evaluated", "submitted", "in progress"].map((st) => (
            <Button
              key={st}
              variant={filterStatus === st ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs rounded-xl capitalize shrink-0"
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={() => navigate("/learn")}
          className="rounded-xl text-xs gap-1.5 h-8"
        >
          View Assignments in Learn <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* 3. Assignment Cards */}
      <div className="space-y-3">
        {filtered.map((asg) => (
          <Card
            key={asg.id}
            className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {asg.subject}
                    </Badge>
                    <Badge
                      variant={
                        asg.status === "Evaluated"
                          ? "default"
                          : asg.status === "Submitted"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {asg.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{asg.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Due: {asg.dueDate}
                    </span>
                    {asg.submittedDate && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Submitted: {asg.submittedDate}
                      </span>
                    )}
                  </div>
                </div>

                {asg.marksObtained !== null && (
                  <div className="flex flex-col items-end shrink-0 bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Awarded Marks
                    </span>
                    <span className="text-base font-black text-primary">
                      {asg.marksObtained} / {asg.maxMarks} ({asg.percentage}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Feedback Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                {asg.teacherFeedback && (
                  <div className="p-3 rounded-xl bg-muted/60 space-y-1">
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> Faculty Review
                    </span>
                    <p className="text-muted-foreground italic">"{asg.teacherFeedback}"</p>
                  </div>
                )}

                {asg.aiFeedback && (
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                    <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="h-3.5 w-3.5 text-purple-500" /> AI Code / Concept Audit
                    </span>
                    <p className="text-purple-900/80 dark:text-purple-200/80">
                      {asg.aiFeedback}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
