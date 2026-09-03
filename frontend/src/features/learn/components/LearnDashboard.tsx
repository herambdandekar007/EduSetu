// features/learn/components/LearnDashboard.tsx
// Overview dashboard for the Learn section.
// Renders ONLY real student data passed in via LearnData (no mock values).

import React, { useMemo } from "react";
import {
  User,
  GraduationCap,
  TrendingUp,
  PlayCircle,
  Clock,
  AlertTriangle,
  Trophy,
  ClipboardList,
  FileCheck2,
  Languages,
} from "lucide-react";
import type { LearnData } from "../types/learn.types";
import {
  computeOverallProgress,
  buildPersonalizedLearning,
  buildNextBestActions,
} from "../services/personalizationService";
import PersonalizedLearning from "./PersonalizedLearning";
import NextBestAction from "./NextBestAction";

function Card({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Icon size={15} className="text-indigo-600" aria-hidden="true" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Chip({ label, tone = "slate" }: { label: string; tone?: "slate" | "emerald" | "rose" | "amber" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{label}</span>
  );
}

export default function LearnDashboard({ data }: { data: LearnData }) {
  const overall = useMemo(() => computeOverallProgress(data), [data]);
  const recommendation = useMemo(() => buildPersonalizedLearning(data), [data]);
  const nextActions = useMemo(() => buildNextBestActions(data), [data]);

  const { profile, education } = data;

  const studentName =
    profile?.fullName || profile?.full_name || profile?.email || "Student";

  // Continue learning: subject started but not finished
  const continueSubject = [...data.subjects]
    .filter((s) => s.progress > 0 && s.progress < 100)
    .sort((a, b) => b.progress - a.progress)[0];

  // Recent learning: latest materials and attempts
  const recentMaterials = [...data.materials]
    .sort((a, b) => (b.addedOn || "").localeCompare(a.addedOn || ""))
    .slice(0, 3);
  const recentAttempts = [...data.quizAttempts].slice(-3).reverse();

  const weakTopics = data.progress?.weakTopics.length
    ? data.progress.weakTopics
    : data.subjects.flatMap((s) => s.weakTopics).slice(0, 6);

  const strongTopics = data.progress?.strongTopics.length
    ? data.progress.strongTopics
    : data.subjects.flatMap((s) => s.strongTopics).slice(0, 6);

  const avgQuizPerf = data.quizAttempts.length
    ? Math.round(
        data.quizAttempts.reduce((s, a) => s + a.accuracy, 0) / data.quizAttempts.length
      )
    : data.subjects.length
    ? Math.round(
        data.subjects.reduce((s, sub) => s + sub.quizPerformance, 0) / data.subjects.length
      )
    : 0;

  const assignmentCounts = data.assignments.reduce<Record<string, number>>(
    (acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }),
    {}
  );
  const openAssignments =
    (assignmentCounts["Pending"] || 0) +
    (assignmentCounts["In Progress"] || 0) +
    (assignmentCounts["Overdue"] || 0);

  const eduChips = [
    education?.educationLevel,
    education?.classOrGrade,
    education?.degreeOrCourse,
    education?.branchOrSpecialization,
    education?.stream,
    education?.boardOrUniversity,
    education?.medium ? `${education.medium} medium` : "",
    education?.year ? `Year ${education.year}` : "",
    education?.semester ? `Sem ${education.semester}` : "",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      {/* Student & education summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card icon={User} title="Student information">
          <p className="text-lg font-semibold text-slate-900">{studentName}</p>
          <p className="text-sm text-slate-500">{profile?.email}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile?.eduId && <Chip label={profile.eduId} tone="amber" />}
            {(education?.skills ?? []).map((s) => (
              <Chip key={s} label={s} />
            ))}
            {(education?.languages ?? []).map((l) => (
              <Chip key={l} label={l} tone="emerald" />
            ))}
          </div>
          {(education?.skills ?? []).length === 0 &&
            (education?.languages ?? []).length === 0 && (
              <p className="mt-2 text-xs text-slate-400">Add skills and languages to your profile for better personalization.</p>
            )}
        </Card>

        <Card icon={GraduationCap} title="Education information">
          {eduChips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {eduChips.map((chip, i) => (
                <Chip key={`${chip}-${i}`} label={chip} />
              ))}
              {education?.state && (
                <>
                  <span className="sr-only">State:</span>
                  <Chip label={education.state} />
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Education details appear here once you complete your profile.
            </p>
          )}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <TrendingUp size={13} aria-hidden="true" /> Overall learning progress
              </span>
              <span className="font-semibold text-slate-800">{overall}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={overall}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall learning progress"
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Continue learning + performance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={PlayCircle} title="Continue learning" className="sm:col-span-2">
          {continueSubject ? (
            <button
              onClick={() =>
                document.getElementById("learn-tabs")?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex w-full items-center justify-between rounded-xl bg-indigo-50 p-4 text-left transition hover:bg-indigo-100"
            >
              <span>
                <span className="block text-sm font-semibold text-indigo-900">
                  {continueSubject.name}
                </span>
                <span className="text-xs text-indigo-600">{continueSubject.progress}% complete</span>
              </span>
              <PlayCircle size={20} className="text-indigo-600" aria-hidden="true" />
            </button>
          ) : (
            <p className="text-xs text-slate-400">Start a subject to see it here.</p>
          )}

          {recentAttempts.length > 0 && (
            <ul className="mt-3 space-y-1.5" aria-label="Recent quiz activity">
              {recentAttempts.map((a) => (
                <li key={a.id ?? a.quizId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="truncate">{a.quizTitle}</span>
                  <span className="ml-2 shrink-0 font-medium text-slate-800">{a.accuracy}%</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card icon={Trophy} title="Quiz performance">
          <p className="text-3xl font-semibold text-slate-900">
            {avgQuizPerf}
            <span className="text-base font-normal text-slate-400">%</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data.quizAttempts.length
              ? `Across ${data.quizAttempts.length} attempt${data.quizAttempts.length > 1 ? "s" : ""}`
              : "No attempts yet"}
          </p>
          <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} aria-hidden="true" />
            {Math.round((data.progress?.studyTimeMinutes ?? 0) / 60)}h study time tracked
          </p>
        </Card>

        <Card icon={FileCheck2} title="Assignments">
          <p className="text-3xl font-semibold text-slate-900">
            {openAssignments}
            <span className="text-base font-normal text-slate-400"> open</span>
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-500" aria-label="Assignment status counts">
            <li>Evaluated: {assignmentCounts["Evaluated"] || 0}</li>
            <li>Submitted: {assignmentCounts["Submitted"] || 0}</li>
            <li className="flex items-center gap-1">
              <AlertTriangle size={11} className="text-rose-500" aria-hidden="true" />
              Overdue: {assignmentCounts["Overdue"] || 0}
            </li>
          </ul>
          <p className="mt-2 flex items-center gap-1 text-xs">
            <ClipboardList size={12} className="text-indigo-500" aria-hidden="true" />
            {data.assignments.length} total assigned
          </p>
        </Card>
      </div>

      {/* Weak / strong topics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card icon={AlertTriangle} title="Weak topics">
          {weakTopics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {weakTopics.map((t) => (
                <Chip key={t} label={t} tone="rose" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No weak topics detected yet.</p>
          )}
        </Card>

        <Card icon={Trophy} title="Strong topics">
          {strongTopics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {strongTopics.map((t) => (
                <Chip key={t} label={t} tone="emerald" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Complete quizzes and assignments to reveal your strengths.</p>
          )}
        </Card>
      </div>

      {/* Recent learning */}
      {recentMaterials.length > 0 && (
        <Card icon={ClipboardList} title="Recent learning materials">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {recentMaterials.map((m) => (
              <li key={m.id} className="rounded-xl bg-slate-50 p-3">
                <p className="truncate text-sm font-medium text-slate-800">{m.title}</p>
                <p className="text-xs text-slate-500">
                  {m.subjectName} · {m.type}
                  <span className="flex items-center gap-1 text-slate-400">
                    <Languages size={10} aria-hidden="true" /> {m.addedOn}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* AI recommendations */}
      {recommendation && (
        <section aria-labelledby="ai-recs-heading">
          <h2 id="ai-recs-heading" className="mb-2 text-sm font-semibold text-slate-800">
            AI recommendations
          </h2>
          <PersonalizedLearning recommendation={recommendation} />
        </section>
      )}

      {/* Next best action */}
      {nextActions.length > 0 && (
        <section aria-labelledby="nba-heading">
          <h2 id="nba-heading" className="sr-only">
            Next best action
          </h2>
          <NextBestAction actions={nextActions} />
        </section>
      )}
    </div>
  );
}
