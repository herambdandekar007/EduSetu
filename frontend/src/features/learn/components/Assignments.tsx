// features/learn/components/Assignments.tsx
import React, { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Assignment, AssignmentStatus } from "../types/learn.types";
import { assignments as mockAssignments } from "../data/learnData";

interface AssignmentsProps {
  assignments?: Assignment[];
  onOpenAssignment?: (assignment: Assignment) => void;
}

const STATUS_TABS: AssignmentStatus[] = [
  "Pending",
  "Upcoming",
  "In Progress",
  "Submitted",
  "Evaluated",
  "Overdue",
];

const STATUS_STYLE: Record<AssignmentStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Upcoming: "bg-indigo-100 text-indigo-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Submitted: "bg-teal-100 text-teal-700",
  Evaluated: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-rose-100 text-rose-700",
};

export default function Assignments({ assignments = mockAssignments, onOpenAssignment }: AssignmentsProps) {
  const [status, setStatus] = useState<AssignmentStatus>("Pending");
  const filtered = assignments.filter((a) => a.status === status);

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => {
          const count = assignments.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {s} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No {status.toLowerCase()} assignments.</p>
        )}
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => onOpenAssignment?.(a)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{a.topic}</p>
              <p className="text-xs text-slate-500">
                {a.subject} · {a.chapter}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarClock size={13} /> {a.dueDate}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[a.status]}`}>
                {a.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}