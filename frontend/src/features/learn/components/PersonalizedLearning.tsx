// features/learn/components/PersonalizedLearning.tsx
import React from "react";
import { BookOpen, FileStack, PlayCircle, Dumbbell, ListChecks, RefreshCcw, ArrowRight } from "lucide-react";
import { PersonalizedLearningRecommendation } from "../types/learn.types";
import { personalizedLearning } from "../data/learnData";

interface PersonalizedLearningProps {
  recommendation?: PersonalizedLearningRecommendation;
  onSelect?: (kind: keyof PersonalizedLearningRecommendation) => void;
}

export default function PersonalizedLearning({
  recommendation = personalizedLearning,
  onSelect,
}: PersonalizedLearningProps) {
  const items: { key: keyof PersonalizedLearningRecommendation; label: string; icon: React.ElementType }[] = [
    { key: "recommendedTopic", label: "Recommended Topic", icon: BookOpen },
    { key: "recommendedMaterial", label: "Recommended Material", icon: FileStack },
    { key: "recommendedVideo", label: "Recommended Video", icon: PlayCircle },
    { key: "recommendedPractice", label: "Recommended Practice", icon: Dumbbell },
    { key: "recommendedQuiz", label: "Recommended Quiz", icon: ListChecks },
    { key: "recommendedRevision", label: "Recommended Revision", icon: RefreshCcw },
  ];

  return (
    <section className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSelect?.(key)}
          className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-indigo-300 hover:shadow-md"
        >
          <div>
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon size={16} />
            </span>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-900 leading-snug">
              {recommendation?.[key] || "Explore topic in syllabus"}
            </p>
          </div>
          <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 transition group-hover:translate-x-0.5">
            Start learning <ArrowRight size={12} />
          </span>
        </button>
      ))}
    </section>
  );
}