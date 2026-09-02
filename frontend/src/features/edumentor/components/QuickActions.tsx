// features/edumentor/components/QuickActions.tsx
// Quick action trigger cards for rapid interaction with EduMentor AI.

import React from "react";
import {
  BookOpen,
  HelpCircle,
  FileQuestion,
  CalendarDays,
  RotateCcw,
  Target,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
  onSelectAction: (prompt: string, initialMode?: string) => void;
}

const ACTION_ITEMS = [
  {
    icon: BookOpen,
    title: "What Should I Study?",
    desc: "Get personalized guidance based on your weak topics",
    prompt: "What should I study today based on my weak topics and recent quiz performance?",
    color: "from-blue-500/20 to-indigo-500/10 text-blue-600 border-blue-200 dark:border-blue-800/40",
    badge: "Recommended",
  },
  {
    icon: HelpCircle,
    title: "Explain a Topic",
    desc: "Break down any complex syllabus concept simply",
    prompt: "Explain recursion and dynamic programming in simple terms with real-life analogies.",
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/40",
  },
  {
    icon: FileQuestion,
    title: "Generate Questions",
    desc: "Practice with targeted multiple choice questions",
    prompt: "Generate 5 practice multiple-choice questions on Trees and Graphs with explanations.",
    color: "from-amber-500/20 to-orange-500/10 text-amber-600 border-amber-200 dark:border-amber-800/40",
  },
  {
    icon: CalendarDays,
    title: "Create Study Plan",
    desc: "Generate a realistic daily or weekly schedule",
    prompt: "Create a 7-day study plan allocating 3 hours per day to prepare for my upcoming exam.",
    color: "from-purple-500/20 to-pink-500/10 text-purple-600 border-purple-200 dark:border-purple-800/40",
  },
  {
    icon: RotateCcw,
    title: "What Should I Revise?",
    desc: "Smart spaced-repetition reminder for retention",
    prompt: "Which topics have I not revised recently that have the highest exam weightage?",
    color: "from-cyan-500/20 to-sky-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800/40",
  },
  {
    icon: Target,
    title: "Prepare for Exam",
    desc: "High-yield topics, sprint strategy & countdown",
    prompt: "Help me create an intensive exam preparation roadmap for my semester examinations.",
    color: "from-rose-500/20 to-red-500/10 text-rose-600 border-rose-200 dark:border-rose-800/40",
  },
  {
    icon: Briefcase,
    title: "Career Guidance",
    desc: "Connect academic subjects with industry roles",
    prompt: "What real-world projects and technical skills should I build for software engineering roles?",
    color: "from-violet-500/20 to-indigo-500/10 text-violet-600 border-violet-200 dark:border-violet-800/40",
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          ⚡ Quick AI Mentorship Actions
        </h3>
        <span className="text-xs text-muted-foreground">Click to ask instantly</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ACTION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              onClick={() => onSelectAction(item.prompt)}
              className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group relative overflow-hidden border border-border/70"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} border`}
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
