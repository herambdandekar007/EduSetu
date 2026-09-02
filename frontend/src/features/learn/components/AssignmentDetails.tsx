// features/learn/components/AssignmentDetails.tsx
import React from "react";
import { CalendarClock, FileText, UploadCloud, MessageSquare, Sparkles, Award } from "lucide-react";
import { Assignment } from "../types/learn.types";
import { assignments } from "../data/learnData";

interface AssignmentDetailsProps {
  assignment?: Assignment;
  onUploadSubmission?: () => void;
}

export default function AssignmentDetails({
  assignment = assignments[2],
  onUploadSubmission,
}: AssignmentDetailsProps) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-indigo-600">
            {assignment.subject} · {assignment.chapter}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{assignment.topic}</h2>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          <CalendarClock size={13} /> Due {assignment.dueDate}
        </span>
      </div>

      <div className="mb-4 rounded-xl bg-slate-50 p-4">
        <p className="mb-1 text-xs font-medium text-slate-500">Instructions</p>
        <p className="text-sm text-slate-700">{assignment.instructions}</p>
      </div>

      {assignment.referenceMaterial && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
          <FileText size={16} className="text-slate-400" /> {assignment.referenceMaterial}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-xl border border-dashed border-slate-300 p-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Submission status: {assignment.submissionStatus}</p>
          <p className="text-xs text-slate-500">Accepted formats: PDF, JPG, DOCX</p>
        </div>
        <button
          onClick={onUploadSubmission}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <UploadCloud size={15} /> Upload
        </button>
      </div>

      {assignment.marks && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <Award size={18} />
          <p className="text-sm font-medium">
            Marks: {assignment.marks.obtained} / {assignment.marks.total}
          </p>
        </div>
      )}

      {assignment.teacherFeedback && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-slate-50 p-4">
          <MessageSquare size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-medium text-slate-500">Teacher feedback</p>
            <p className="text-sm text-slate-700">{assignment.teacherFeedback}</p>
          </div>
        </div>
      )}

      {assignment.aiLearningFeedback && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-medium text-amber-700">AI learning feedback</p>
            <p className="text-sm text-amber-900">{assignment.aiLearningFeedback}</p>
          </div>
        </div>
      )}
    </section>
  );
}