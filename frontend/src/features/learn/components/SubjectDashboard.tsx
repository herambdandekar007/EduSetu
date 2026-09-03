// features/learn/components/SubjectDashboard.tsx

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  PencilLine,
  BookOpen,
  User,
} from "lucide-react";

import type { Subject } from "../types/learn.types";

interface SubjectDashboardProps {
  subject?: Subject | null;
}

function Stat({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {Number.isFinite(value) ? value : 0}

        <span className="text-sm font-normal text-slate-400">
          {suffix}
        </span>
      </p>
    </div>
  );
}

export default function SubjectDashboard({
  subject,
}: SubjectDashboardProps) {
  /* =========================================================
     NO SUBJECT
  ========================================================= */

  if (!subject) {
    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
          <BookOpen className="mb-3 h-10 w-10 text-slate-300" />

          <h2 className="text-lg font-semibold text-slate-800">
            No subject found
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            No subjects are currently assigned to your account.
            Please check your learning data in Firebase.
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     SAFE VALUES
     
     Firebase data may contain missing fields.
     These defaults prevent the UI from showing NaN/errors.
  ========================================================= */

  const chapters = Number(subject.chapters ?? 0);
  const topics = Number(subject.topics ?? 0);
  const subtopics = Number(subject.subtopics ?? 0);

  const progress = Number(subject.progress ?? 0);
  const completionPercentage = Number(
    subject.completionPercentage ?? 0
  );

  const quizPerformance = Number(
    subject.quizPerformance ?? 0
  );

  const assignmentPerformance = Number(
    subject.assignmentPerformance ?? 0
  );

  const strongTopics = Array.isArray(subject.strongTopics)
    ? subject.strongTopics
    : [];

  const weakTopics = Array.isArray(subject.weakTopics)
    ? subject.weakTopics
    : [];

  /* =========================================================
     FIREBASE SUBJECT
  ========================================================= */

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-600" />

            <h2 className="text-xl font-semibold text-slate-900">
              {subject.name || "Unnamed Subject"}
            </h2>
          </div>

          {subject.teacher ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <User className="h-4 w-4" />
              Taught by {subject.teacher}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              Teacher information not available
            </p>
          )}
        </div>

        {/* =================================================
            SUBJECT STRUCTURE
        ================================================= */}

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {chapters} chapters
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1">
            {topics} topics
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1">
            {subtopics} subtopics
          </span>
        </div>
      </div>

      {/* =====================================================
          PERFORMANCE STATS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Subject progress"
          value={progress}
        />

        <Stat
          label="Completion"
          value={completionPercentage}
        />

        <Stat
          label="Quiz performance"
          value={quizPerformance}
        />

        <Stat
          label="Assignment performance"
          value={assignmentPerformance}
        />
      </div>

      {/* =====================================================
          TOPIC ANALYSIS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ===================================================
            STRONG TOPICS
        =================================================== */}

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <TrendingUp size={16} />

            Strong topics
          </p>

          {strongTopics.length > 0 ? (
            <ul className="space-y-1 text-sm text-emerald-900">
              {strongTopics.map((topic, index) => (
                <li
                  key={`${topic}-${index}`}
                  className="flex items-center gap-2"
                >
                  <ClipboardCheck
                    size={14}
                    className="text-emerald-500"
                  />

                  {topic}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-700/70">
              No strong topics recorded yet.
            </p>
          )}
        </div>

        {/* ===================================================
            WEAK TOPICS
        =================================================== */}

        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-700">
            <TrendingDown size={16} />

            Weak topics
          </p>

          {weakTopics.length > 0 ? (
            <ul className="space-y-1 text-sm text-rose-900">
              {weakTopics.map((topic, index) => (
                <li
                  key={`${topic}-${index}`}
                  className="flex items-center gap-2"
                >
                  <PencilLine
                    size={14}
                    className="text-rose-500"
                  />

                  {topic}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-rose-700/70">
              No weak topics recorded yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}