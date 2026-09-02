// frontend/src/features/education/components/EducationLevelSelector.tsx
import React from "react";
import type { EducationLevel } from "../types/education.types";
import { School, GraduationCap, Building2, Scroll, Briefcase } from "lucide-react";

interface Props {
  value: EducationLevel;
  onChange: (level: EducationLevel) => void;
  disabled?: boolean;
}

interface LevelOption {
  id: EducationLevel;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
}

const OPTIONS: LevelOption[] = [
  {
    id: "school",
    label: "School",
    sublabel: "Primary, Secondary, Class 11-12",
    icon: <School className="h-5 w-5" />,
    color: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5",
    activeColor: "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30",
  },
  {
    id: "college",
    label: "College",
    sublabel: "Undergraduate (B.E., B.Tech, B.Sc, B.Com, B.A.)",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5",
    activeColor: "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30",
  },
  {
    id: "university",
    label: "University",
    sublabel: "Postgraduate, Master's, PhD, Research",
    icon: <Building2 className="h-5 w-5" />,
    color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
    activeColor: "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30",
  },
  {
    id: "diploma",
    label: "Diploma / Polytechnic",
    sublabel: "Technical Diploma & Vocational Training",
    icon: <Scroll className="h-5 w-5" />,
    color: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5",
    activeColor: "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30",
  },
  {
    id: "other",
    label: "Other / Professional",
    sublabel: "Certifications, Bootcamps, Online Tracks",
    icon: <Briefcase className="h-5 w-5" />,
    color: "border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5",
    activeColor: "border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/30",
  },
];

export const EducationLevelSelector: React.FC<Props> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
        What is your current education level?
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 shadow-sm ${
                isSelected ? opt.activeColor : opt.color + " hover:bg-muted/60"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-background/80 shadow-sm shrink-0">
                {opt.icon}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-foreground block truncate">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground block leading-relaxed mt-0.5 line-clamp-2">
                  {opt.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
