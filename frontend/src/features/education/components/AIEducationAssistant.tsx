// frontend/src/features/education/components/AIEducationAssistant.tsx
import React, { useState } from "react";
import type { EducationProfile } from "../types/education.types";
import { generateEducationSuggestions, speakText, stopSpeech } from "../services/educationAIService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  BookOpen,
  Target,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  profile: EducationProfile | null;
}

export const AIEducationAssistant: React.FC<Props> = ({ profile }) => {
  const navigate = useNavigate();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const suggestions = generateEducationSuggestions(profile);

  const handleReadAloud = async () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const script = `AI Education Assistant Analysis. Based on your current education level in ${
      profile?.branch || profile?.course || "your degree"
    }: ${suggestions.adviceSummary}. Recommended focus areas are: ${suggestions.focusAreas.join(
      ", "
    )}.`;
    await speakText(script);
    setIsPlayingAudio(false);
  };

  return (
    <Card className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-card to-background shadow-md overflow-hidden">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-600 text-white tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> SMART EDUCATION AI ADVISOR
              </span>
              <Badge variant="outline" className="text-xs bg-background/80">
                {profile?.course || "Academic Track"}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Personalized AI Curriculum & Career Strategy
            </CardTitle>
            <CardDescription className="text-xs max-w-xl leading-relaxed">
              {suggestions.adviceSummary}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReadAloud}
              className={`rounded-2xl gap-1.5 text-xs font-semibold ${
                isPlayingAudio
                  ? "border-rose-500 text-rose-500 bg-rose-500/10 animate-pulse"
                  : "border-violet-500/30 text-violet-600 dark:text-violet-400"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" /> Stop Voice
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" /> Read Aloud (EduAccess)
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/edumentor")}
              className="rounded-2xl gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow"
            >
              <Bot className="h-4 w-4" /> Ask 24/7 AI Mentor
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Focus Areas */}
          <div className="p-4 rounded-2xl bg-card/80 border border-border/70 space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Target className="h-4 w-4 text-violet-500" /> Recommended Focus Areas
            </h4>
            <div className="space-y-1.5">
              {suggestions.focusAreas.map((area) => (
                <div
                  key={area}
                  className="flex items-start gap-2 text-xs p-2 rounded-xl bg-muted/40 text-foreground font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Subjects */}
          <div className="p-4 rounded-2xl bg-card/80 border border-border/70 space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-500" /> Suggested Subjects
            </h4>
            <div className="space-y-1.5">
              {suggestions.recommendedSubjects.map((sub) => (
                <div
                  key={sub}
                  className="flex items-start gap-2 text-xs p-2 rounded-xl bg-muted/40 text-foreground font-medium"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Future Pathways */}
          <div className="p-4 rounded-2xl bg-card/80 border border-border/70 space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Next Milestone Pathways
            </h4>
            <div className="space-y-1.5">
              {suggestions.futureEducationPaths.map((path) => (
                <div
                  key={path}
                  className="flex items-start gap-2 text-xs p-2 rounded-xl bg-muted/40 text-foreground font-medium"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{path}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
