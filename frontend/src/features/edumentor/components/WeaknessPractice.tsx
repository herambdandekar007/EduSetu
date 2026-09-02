// features/edumentor/components/WeaknessPractice.tsx
// Weakness detection and adaptive AI practice question generator with instant explanations and score tracking.

import React, { useState } from "react";
import {
  AlertTriangle,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Trophy,
  X,
  Bot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  StudentLearningContext,
  WeakTopicItem,
  PracticeQuestion,
} from "../types/mentor.types";
import { getWeakTopicsList, savePracticeSession } from "../services/mentorService";
import { generatePracticeQuestions } from "../services/mentorAIService";

interface WeaknessPracticeProps {
  context: StudentLearningContext;
  onAskMentorAboutConcept: (topic: string) => void;
}

export const WeaknessPractice: React.FC<WeaknessPracticeProps> = ({
  context,
  onAskMentorAboutConcept,
}) => {
  const weakTopics = getWeakTopicsList(context);

  // Active Practice Modal State
  const [activePracticeTopic, setActivePracticeTopic] = useState<WeakTopicItem | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [conceptSummary, setConceptSummary] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const startPractice = async (item: WeakTopicItem) => {
    setActivePracticeTopic(item);
    setIsLoadingQuestions(true);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealedHints({});
    setIsCompleted(false);

    try {
      const data = await generatePracticeQuestions({
        subject: item.subject,
        topic: item.topic,
        difficulty: item.difficultyLevel,
        count: 4,
        studentContext: context,
      });

      setQuestions(data.questions);
      setConceptSummary(data.conceptSummary);
    } catch (err) {
      console.error("Practice questions error:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // locked once answered

    const updated = { ...selectedAnswers, [currentIndex]: optIndex };
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score & save session
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) correct++;
      });
      const scorePct = Math.round((correct / questions.length) * 100);
      setIsCompleted(true);

      if (activePracticeTopic) {
        savePracticeSession({
          id: `practice_${context.userId}_${Date.now()}`,
          userId: context.userId,
          subject: activePracticeTopic.subject,
          topic: activePracticeTopic.topic,
          difficulty: activePracticeTopic.difficultyLevel,
          conceptSummary,
          questions,
          userAnswers: selectedAnswers,
          score: scorePct,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
      }
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });
    return { correct, total: questions.length, pct: Math.round((correct / questions.length) * 100) };
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Header Banner ───────────────────────────────────────────── */}
      <Card className="rounded-2xl border-border/70 bg-gradient-to-r from-rose-500/10 via-background to-orange-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Weakness → Adaptive Practice
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                EduMentor analyzes your quiz attempts and mistake patterns to identify high-priority learning gaps. Practice targeted questions to raise your mastery level.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Weak Topics Grid ────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Detected Learning Gaps ({weakTopics.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weakTopics.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl border border-border/70 hover:border-rose-300 dark:hover:border-rose-800 transition-all bg-card flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground mb-1">
                      {item.subject}
                    </Badge>
                    <h4 className="text-base font-bold text-foreground">{item.topic}</h4>
                  </div>
                  <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 text-xs">
                    {item.masteryPct}% Mastery
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Topic Mastery</span>
                    <span className="font-semibold">{item.masteryPct}%</span>
                  </div>
                  <Progress value={item.masteryPct} className="h-2 rounded-full" />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">💡 Learning Gap:</p>
                  <p>{item.learningGapDescription}</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => startPractice(item)}
                    className="flex-1 gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs h-9 shadow hover:shadow-md"
                  >
                    <Target className="h-3.5 w-3.5" />
                    Practice Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onAskMentorAboutConcept(item.topic)}
                    className="rounded-xl text-xs h-9 border-border"
                    title="Ask EduMentor to explain"
                  >
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 3. Interactive Practice Modal ───────────────────────────────── */}
      {activePracticeTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card shadow-2xl animate-in fade-in zoom-in-95">
            <CardContent className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {activePracticeTopic.topic} Practice
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activePracticeTopic.subject} • {activePracticeTopic.difficultyLevel} Difficulty
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActivePracticeTopic(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Loading State */}
              {isLoadingQuestions && (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="h-8 w-8 text-primary mx-auto animate-spin" />
                  <p className="text-sm font-semibold text-foreground">
                    Generating adaptive diagnostic questions...
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    EduMentor is targeting your specific mistake patterns in {activePracticeTopic.topic}.
                  </p>
                </div>
              )}

              {/* Question Flow */}
              {!isLoadingQuestions && questions.length > 0 && !isCompleted && (
                <div className="space-y-5">
                  {/* Progress info */}
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {questions[currentIndex]?.conceptTested}
                    </Badge>
                  </div>

                  {/* Question Text */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-sm md:text-base font-semibold text-foreground leading-relaxed">
                    {questions[currentIndex]?.question}
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {questions[currentIndex]?.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentIndex] === optIdx;
                      const hasAnswered = selectedAnswers[currentIndex] !== undefined;
                      const isCorrect = optIdx === questions[currentIndex].correctIndex;

                      let btnStyle = "border-border/70 hover:border-primary/40 bg-background text-foreground";
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                        } else {
                          btnStyle = "opacity-50 border-border bg-background";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          disabled={hasAnswered}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs md:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="h-6 w-6 rounded-full border border-border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {hasAnswered && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          )}
                          {hasAnswered && isSelected && !isCorrect && (
                            <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hint Toggle */}
                  {questions[currentIndex]?.hint && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setRevealedHints((prev) => ({
                            ...prev,
                            [currentIndex]: !prev[currentIndex],
                          }))
                        }
                        className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        {revealedHints[currentIndex] ? "Hide Hint" : "Need a Hint?"}
                      </button>
                      {revealedHints[currentIndex] && (
                        <p className="mt-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-300 text-xs text-amber-900 dark:text-amber-200">
                          💡 <strong>Hint:</strong> {questions[currentIndex].hint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Explanation (Shown after answering) */}
                  {selectedAnswers[currentIndex] !== undefined && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs text-foreground animate-in fade-in">
                      <p className="font-bold flex items-center gap-1.5 text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Concept Explanation:
                      </p>
                      <p className="leading-relaxed">{questions[currentIndex].explanation}</p>
                    </div>
                  )}

                  {/* Next / Submit Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleNext}
                      disabled={selectedAnswers[currentIndex] === undefined}
                      className="gap-2 rounded-xl bg-primary text-primary-foreground px-6"
                    >
                      {currentIndex < questions.length - 1 ? "Next Question" : "Complete Practice"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Completion Screen */}
              {isCompleted && (
                <div className="py-8 text-center space-y-5">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                    <Trophy className="h-8 w-8" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Practice Session Completed!
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Great effort practicing {activePracticeTopic.topic}.
                    </p>
                  </div>

                  {/* Score Card */}
                  <div className="p-5 rounded-2xl bg-muted/50 border border-border/70 max-w-sm mx-auto space-y-2">
                    <div className="text-3xl font-black text-primary">
                      {calculateScore().pct}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {calculateScore().correct} of {calculateScore().total} questions correct
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => startPractice(activePracticeTopic)}
                      className="gap-2 rounded-xl"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Try Another Set
                    </Button>
                    <Button
                      onClick={() => setActivePracticeTopic(null)}
                      className="rounded-xl bg-primary text-primary-foreground"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WeaknessPractice;
