// frontend/src/features/education/components/ProfileCompletion.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

interface Props {
  percentage: number;
  missingFields: string[];
  onCompleteClick?: () => void;
}

export const ProfileCompletion: React.FC<Props> = ({
  percentage,
  missingFields,
  onCompleteClick,
}) => {
  const isComplete = percentage >= 100;

  return (
    <Card className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-sm overflow-hidden">
      <CardContent className="p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-bold text-sm text-foreground">
                Education Profile Completeness
              </h4>
              <Badge
                variant="outline"
                className={`text-xs font-bold ${
                  isComplete
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {percentage}% Completed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isComplete
                ? "Your academic profile is 100% complete! All AI personalized learning models are fully synchronized."
                : "Complete missing academic details to unlock precision AI syllabus alignment and career roadmap matches."}
            </p>
          </div>

          {onCompleteClick && !isComplete && (
            <Button
              size="sm"
              onClick={onCompleteClick}
              className="rounded-xl gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow shrink-0"
            >
              Complete Profile <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isComplete
                ? "bg-emerald-500"
                : percentage > 50
                ? "bg-primary"
                : "bg-amber-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Missing Fields Checklist */}
        {!isComplete && missingFields.length > 0 && (
          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Missing:
            </span>
            {missingFields.map((field) => (
              <Badge
                key={field}
                variant="secondary"
                className="text-[10px] font-medium bg-muted/50 text-foreground"
              >
                • {field}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
