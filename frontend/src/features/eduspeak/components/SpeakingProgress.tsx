import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Award, Zap } from "lucide-react";

export const SpeakingProgress: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl border border-border/70 bg-card/60">
          <div className="flex items-center gap-2 text-cyan-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold">Weekly Speaking Time</span>
          </div>
          <p className="text-2xl font-black text-foreground">42 Mins</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card/60">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Award className="h-4 w-4" />
            <span className="text-xs font-semibold">Average Pronunciation</span>
          </div>
          <p className="text-2xl font-black text-foreground">84%</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card/60">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-semibold">Speaking Streak</span>
          </div>
          <p className="text-2xl font-black text-foreground">5 Days</p>
        </div>
      </div>
    </div>
  );
};