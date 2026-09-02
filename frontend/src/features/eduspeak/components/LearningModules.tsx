import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SPEAKING_MODULES } from "../data/eduspeakData";

export const LearningModules: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-foreground">Learning Modules</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SPEAKING_MODULES.map((mod) => (
          <Card key={mod.id} className={`rounded-2xl border transition-all ${mod.completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/70 bg-card/60"}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{mod.icon}</span>
                <Badge variant={mod.completed ? "default" : "secondary"} className="text-[10px]">
                  {mod.level}
                </Badge>
              </div>
              <h5 className="text-sm font-bold text-foreground leading-snug">{mod.title}</h5>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{mod.lessonsCount} lessons</span>
                <span>{mod.duration}</span>
              </div>
              {mod.completed && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Completed</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
