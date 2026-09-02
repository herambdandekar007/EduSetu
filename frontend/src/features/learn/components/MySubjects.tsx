// features/learn/components/MySubjects.tsx
import React from "react";
import { BookOpen, ChevronRight, User2, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { Subject, AssignedSubjectContext } from "../types/learn.types";
import { subjects as mockSubjects, assignedContext } from "../data/learnData";

interface MySubjectsProps {
  context?: AssignedSubjectContext;
  subjects?: Subject[];
  onOpenSubject?: (subject: Subject) => void;
}

export default function MySubjects({
  context = assignedContext,
  subjects = mockSubjects,
  onOpenSubject,
}: MySubjectsProps) {
  return (
    <section className="w-full space-y-4">
      {/* Context Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
          {context.classGrade ?? context.degree ?? "Academic Course"}
        </span>
        {context.board && <span className="rounded-full bg-slate-100 px-3 py-1">{context.board}</span>}
        {context.medium && <span className="rounded-full bg-slate-100 px-3 py-1">{context.medium} medium</span>}
        {context.state && <span className="rounded-full bg-slate-100 px-3 py-1">{context.state}</span>}
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onOpenSubject?.(subject)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: subject.color ?? "#3B4CCA" }}
                >
                  <BookOpen size={18} />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    Quiz: {subject.quizPerformance}%
                  </span>
                  <ChevronRight
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                    size={18}
                  />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{subject.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <User2 size={12} /> {subject.teacher}
              </p>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">{subject.completionPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${subject.completionPercentage}%`,
                      backgroundColor: subject.color ?? "#3B4CCA",
                    }}
                  />
                </div>
              </div>

              {/* Chapters & Topics Stats */}
              <div className="mt-3 flex gap-3 text-xs text-slate-500 font-mono">
                <span>📚 {subject.chapters} Chapters</span>
                <span>📖 {subject.topics} Topics</span>
              </div>

              {/* Strong & Weak Topics Snippets */}
              {(subject.strongTopics.length > 0 || subject.weakTopics.length > 0) && (
                <div className="mt-3.5 space-y-1.5 pt-2.5 border-t border-slate-100 text-[11px]">
                  {subject.strongTopics.length > 0 && (
                    <div className="flex items-center gap-1 text-emerald-700 truncate">
                      <TrendingUp size={12} className="shrink-0" />
                      <span className="truncate">
                        <strong>Strong: </strong>
                        {subject.strongTopics.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  )}
                  {subject.weakTopics.length > 0 && (
                    <div className="flex items-center gap-1 text-rose-700 truncate">
                      <AlertTriangle size={12} className="shrink-0 text-amber-500" />
                      <span className="truncate">
                        <strong>Needs Improvement: </strong>
                        {subject.weakTopics.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}