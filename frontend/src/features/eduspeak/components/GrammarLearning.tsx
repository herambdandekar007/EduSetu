import React, { useState } from "react";
import { GRAMMAR_RULES } from "../data/eduspeakData";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Lightbulb, ChevronDown } from "lucide-react";

export const GrammarLearning: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(GRAMMAR_RULES[0].id);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground">Speech Grammar & Syntax Rules</h3>
        <p className="text-xs text-muted-foreground">Master natural spoken phrasing and correct tense matching</p>
      </div>

      <div className="space-y-3">
        {GRAMMAR_RULES.map((rule) => {
          const isExpanded = expandedId === rule.id;
          return (
            <Card
              key={rule.id}
              className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    {rule.category}
                  </span>
                  <h4 className="text-base font-bold text-foreground">{rule.title}</h4>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <CardContent className="px-5 pb-5 pt-0 space-y-3 border-t border-border/40 mt-2">
                  <p className="text-xs text-muted-foreground mt-3">{rule.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct Spoken Form
                      </div>
                      <p className="text-foreground">{rule.exampleCorrect}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 mb-1">
                        <XCircle className="h-3.5 w-3.5" /> Common Mistake
                      </div>
                      <p className="text-foreground">{rule.exampleIncorrect}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>AI Oratory Tip:</strong> {rule.tips}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};