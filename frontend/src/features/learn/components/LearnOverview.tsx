// features/learn/components/LearnOverview.tsx
// Complete Learn Module with Left-Sidebar Vertical Switcher for all Learn functions.

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Library,
  ClipboardList,
  FileCheck2,
  BrainCircuit,
  Compass,
  RotateCcw,
  Gauge,
  Sparkles,
  ChevronLeft,
  Loader2,
  TrendingUp,
  Award,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import LearnDashboard from "./LearnDashboard";
import MySubjects from "./MySubjects";
import SubjectDashboard from "./SubjectDashboard";
import TopicLearning from "./TopicLearning";
import LearningMaterials from "./LearningMaterials";
import Quizzes from "./Quizzes";
import QuizAnalysis from "./QuizAnalysis";
import Assignments from "./Assignments";
import AssignmentDetails from "./AssignmentDetails";
import AdaptiveLearning from "./AdaptiveLearning";
import PersonalizedLearning from "./PersonalizedLearning";
import AdaptiveDifficulty from "./AdaptiveDifficulty";
import PersonalizedRevision from "./PersonalizedRevision";
import NextBestAction from "./NextBestAction";

import { submitAssignment, getLearnData, saveQuizAttempt } from "../services/learnService";
import { generateAIQuiz } from "../services/aiLearnService";
import {
  deriveAssessment,
  computeAdaptiveDifficulty,
  buildPersonalizedLearning,
  buildRevisionQueue,
  buildNextBestActions,
} from "../services/personalizationService";
import type {
  LearnData,
  Subject,
  Quiz,
  Assignment,
  AssignedSubjectContext,
  QuizAnalysisData,
} from "../types/learn.types";

export type LearnFunctionKey =
  | "dashboard"
  | "subjects"
  | "materials"
  | "quizzes"
  | "quiz-analysis"
  | "assignments"
  | "adaptive"
  | "next-action"
  | "revision"
  | "difficulty";

interface NavOption {
  key: LearnFunctionKey;
  label: string;
  badge?: string;
  icon: React.ElementType;
}

const LEARN_SIDEBAR_NAV: NavOption[] = [
  { key: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
  { key: "subjects", label: "My Subjects", icon: GraduationCap },
  { key: "materials", label: "Learning Materials", icon: Library },
  { key: "quizzes", label: "Quizzes & Tests", icon: ClipboardList },
  { key: "quiz-analysis", label: "Quiz Analysis", icon: TrendingUp },
  { key: "assignments", label: "Assignments", icon: FileCheck2 },
  { key: "adaptive", label: "Adaptive Learning", badge: "AI", icon: BrainCircuit },
  { key: "next-action", label: "Next Best Action", badge: "AI", icon: Compass },
  { key: "revision", label: "Personalized Revision", icon: RotateCcw },
  { key: "difficulty", label: "Adaptive Difficulty", icon: Gauge },
];

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mb-4 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
    >
      <ChevronLeft size={14} /> Back to {label}
    </button>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

function buildContext(data: LearnData | null): AssignedSubjectContext {
  const edu = data?.education;
  const level = (edu?.educationLevel || "").toLowerCase();
  return {
    educationLevel: level.includes("college") || level.includes("grad") ? "college" : "school",
    school: edu?.schoolOrCollegeName,
    college: edu?.schoolOrCollegeName ?? edu?.boardOrUniversity,
    state: edu?.state || "",
    board: edu?.boardOrUniversity || "",
    medium: edu?.medium || "English",
    classGrade: edu?.classOrGrade,
    stream: edu?.stream,
    degree: edu?.degreeOrCourse,
    branch: edu?.branchOrSpecialization,
    year: edu?.year,
    semester: edu?.semester,
  };
}

export default function LearnOverview({ data: providedData }: { data?: LearnData }) {
  const { user } = useAuth();

  const [selfData, setSelfData] = useState<LearnData | null>(null);
  const [loadingSelf, setLoadingSelf] = useState(false);

  useEffect(() => {
    if (providedData || !user) return;

    let cancelled = false;
    setLoadingSelf(true);

    getLearnData(user.uid)
      .then((result) => {
        if (!cancelled) setSelfData(result);
      })
      .catch((err) => console.error("LearnOverview load failed:", err))
      .finally(() => {
        if (!cancelled) setLoadingSelf(false);
      });

    return () => {
      cancelled = true;
    };
  }, [providedData, user]);

  const data = providedData ?? selfData;

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LearnFunctionKey>("dashboard");

  // Drill-down states
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Deep linking via URL query parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab") as LearnFunctionKey | null;
    const validTabs: LearnFunctionKey[] = [
      "dashboard",
      "subjects",
      "materials",
      "quizzes",
      "quiz-analysis",
      "assignments",
      "adaptive",
      "next-action",
      "revision",
      "difficulty",
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setActiveTab("subjects");
    }
    const subjectIdParam = searchParams.get("subjectId");
    if (subjectIdParam && data?.subjects?.length) {
      const match = data.subjects.find((s) => s.id === subjectIdParam);
      if (match) setSelectedSubject(match);
    }
  }, [searchParams, data]);

  const context = useMemo(() => buildContext(data), [data]);
  const difficultySettings = useMemo(
    () => (data ? computeAdaptiveDifficulty(data.subjects, data.progress) : []),
    [data]
  );
  const revisionQueue = useMemo(() => (data ? buildRevisionQueue(data) : []), [data]);

  const analysisForQuiz = (quiz: Quiz): QuizAnalysisData | null => {
    if (!data) return null;
    const attempt = (data.quizAttempts || []).find((a) => a.quizId === quiz.id);
    if (!attempt) return null;
    return {
      quizId: quiz.id,
      quizTitle: attempt.quizTitle || quiz.title,
      score: attempt.score ?? 0,
      accuracy: attempt.accuracy ?? 0,
      correctAnswers: attempt.correctAnswers ?? 0,
      wrongAnswers: attempt.wrongAnswers ?? 0,
      strongConcepts: Array.isArray(attempt.strongConcepts) ? attempt.strongConcepts : [],
      weakConcepts: Array.isArray(attempt.weakConcepts) ? attempt.weakConcepts : [],
      mistakeAnalysis: (attempt.answers || [])
        .filter((a) => !a.isCorrect && a.mistake)
        .map((a) => ({ concept: a.concept || "Question", mistake: a.mistake! })),
      recommendedPractice: Array.isArray(attempt.recommendedPractice) ? attempt.recommendedPractice : [],
    };
  };

  const assessment = useMemo(
    () => (data ? deriveAssessment(data.progress, data.quizAttempts) : null),
    [data]
  );

  const recommendation = useMemo(
    () => (data ? buildPersonalizedLearning(data) : null),
    [data]
  );

  const nextActions = useMemo(
    () => (data ? buildNextBestActions(data) : []),
    [data]
  );

  const handleUploadSubmission = async () => {
    if (!selectedAssignment) return;
    try {
      const evaluation = await submitAssignment(
        selectedAssignment.id,
        "Completed assignment submitted online with thorough solutions.",
        undefined,
        {
          assignmentTitle: selectedAssignment.topic || "Course Assignment",
          subject: selectedAssignment.subject || "Core Curriculum",
          instructions: selectedAssignment.instructions,
        }
      );
      setSelectedAssignment({
        ...selectedAssignment,
        status: "Evaluated",
        submissionStatus: "Evaluated",
        score: evaluation.score,
        grade: evaluation.grade,
        aiFeedback: evaluation.feedback,
      });
    } catch (error) {
      console.error("Failed to submit assignment:", error);
    }
  };

  const handleTabChange = (tab: LearnFunctionKey) => {
    setActiveTab(tab);
    setSelectedSubject(null);
    setSelectedQuiz(null);
    setSelectedAssignment(null);
  };

  if (!data) {
    return (
      <div className="flex w-full items-center justify-center gap-2 py-16 text-slate-500">
        {loadingSelf ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-sm font-medium">Loading your personalized learning data...</span>
          </>
        ) : (
          <span className="text-sm">Sign in to access your learning dashboard.</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
      {/* ── LEFT SIDEBAR SWITCHER (All Learn Functions) ────────────────── */}
      <aside className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
              Learn Menu
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] bg-background">
            EduID
          </Badge>
        </div>

        <nav
          className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none"
          role="tablist"
          aria-label="Learn Navigation Sidebar"
        >
          {LEARN_SIDEBAR_NAV.map(({ key, label, badge, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                role="tab"
                aria-selected={isActive}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500"
                    : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border/70"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? "text-white" : "text-indigo-600"} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── RIGHT CONTENT WORKSPACE ────────────────────────────────────── */}
      <main className="flex-1 w-full min-w-0 space-y-6">
        {/* 1. Dashboard Overview */}
        {activeTab === "dashboard" && <LearnDashboard data={data} />}

        {/* 2. My Subjects */}
        {activeTab === "subjects" && (
          <div className="space-y-4">
            {selectedSubject ? (
              <>
                <BackButton onClick={() => setSelectedSubject(null)} label="All Subjects" />
                <SubjectDashboard subject={selectedSubject} />
                {(() => {
                  const topic = data.topics.find((t) => t.subjectId === selectedSubject.id) || data.topics[0];
                  return topic ? (
                    <TopicLearning topic={topic} />
                  ) : (
                    <EmptyNote>No topics added for this subject yet.</EmptyNote>
                  );
                })()}
              </>
            ) : data.subjects.length > 0 ? (
              <MySubjects
                context={context}
                subjects={data.subjects}
                onOpenSubject={setSelectedSubject}
              />
            ) : (
              <EmptyNote>No subjects have been added for your account yet.</EmptyNote>
            )}
          </div>
        )}

        {/* 3. Learning Materials */}
        {activeTab === "materials" && (
          data.materials.length > 0 ? (
            <LearningMaterials materials={data.materials} />
          ) : (
            <EmptyNote>No learning materials available yet.</EmptyNote>
          )
        )}

        {/* 4. Quizzes & Tests */}
        {activeTab === "quizzes" && (
          <div className="space-y-4">
            {selectedQuiz ? (
              <>
                <BackButton onClick={() => setSelectedQuiz(null)} label="Quizzes List" />
                {(() => {
                  const analysis = analysisForQuiz(selectedQuiz);
                  if (analysis) {
                    return <QuizAnalysis analysis={analysis} />;
                  }
                  return (
                    <InteractiveQuizRunner
                      quiz={selectedQuiz}
                      userId={user?.uid || "guest"}
                      onComplete={(savedAttempt) => {
                        if (selfData) {
                          setSelfData({
                            ...selfData,
                            quizAttempts: [savedAttempt, ...selfData.quizAttempts],
                          });
                        }
                      }}
                    />
                  );
                })()}
              </>
            ) : (
              <Quizzes quizzes={data.quizzes} onOpenQuiz={setSelectedQuiz} />
            )}
          </div>
        )}

        {/* 5. Quiz Analysis */}
        {activeTab === "quiz-analysis" && (
          <div className="space-y-6">
            {data.quizAttempts.length > 0 ? (
              data.quizAttempts.map((attempt) => {
                const analysis: QuizAnalysisData = {
                  quizId: attempt.quizId,
                  quizTitle: attempt.quizTitle || "Quiz Assessment",
                  score: attempt.score ?? 0,
                  accuracy: attempt.accuracy ?? 0,
                  correctAnswers: attempt.correctAnswers ?? 0,
                  wrongAnswers: attempt.wrongAnswers ?? 0,
                  strongConcepts: Array.isArray(attempt.strongConcepts) ? attempt.strongConcepts : [],
                  weakConcepts: Array.isArray(attempt.weakConcepts) ? attempt.weakConcepts : [],
                  mistakeAnalysis: (attempt.answers || [])
                    .filter((a) => !a.isCorrect && a.mistake)
                    .map((a) => ({ concept: a.concept || "Question", mistake: a.mistake! })),
                  recommendedPractice: Array.isArray(attempt.recommendedPractice)
                    ? attempt.recommendedPractice
                    : [`Revise core concepts for ${attempt.quizTitle || "this topic"}`],
                };
                return <QuizAnalysis key={attempt.id} analysis={analysis} />;
              })
            ) : (
              <EmptyNote>
                Complete your first quiz to generate automated AI diagnostic analysis and learning gap reports.
              </EmptyNote>
            )}
          </div>
        )}

        {/* 6. Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {selectedAssignment ? (
              <>
                <BackButton onClick={() => setSelectedAssignment(null)} label="Assignments List" />
                <AssignmentDetails
                  assignment={selectedAssignment}
                  onUploadSubmission={handleUploadSubmission}
                />
              </>
            ) : data.assignments.length > 0 ? (
              <Assignments
                assignments={data.assignments}
                onOpenAssignment={setSelectedAssignment}
              />
            ) : (
              <EmptyNote>No assignments are pending for your account.</EmptyNote>
            )}
          </div>
        )}

        {/* 7. AI Adaptive Learning */}
        {activeTab === "adaptive" && (
          <div className="space-y-6">
            {assessment ? (
              <AdaptiveLearning assessment={assessment} />
            ) : (
              <EmptyNote>No adaptive learning data available yet.</EmptyNote>
            )}
            {recommendation && <PersonalizedLearning recommendation={recommendation} />}
          </div>
        )}

        {/* 8. Next Best Action */}
        {activeTab === "next-action" && (
          <div className="space-y-6">
            {nextActions.length > 0 ? (
              <NextBestAction actions={nextActions} />
            ) : (
              <EmptyNote>You are caught up on all urgent learning actions!</EmptyNote>
            )}
            {recommendation && <PersonalizedLearning recommendation={recommendation} />}
          </div>
        )}

        {/* 9. Personalized Revision */}
        {activeTab === "revision" && (
          <div className="space-y-4">
            {revisionQueue.length > 0 ? (
              <PersonalizedRevision items={revisionQueue} />
            ) : (
              <EmptyNote>No revision tasks due right now. Keep up the great work!</EmptyNote>
            )}
          </div>
        )}

        {/* 10. Adaptive Difficulty */}
        {activeTab === "difficulty" && (
          <div className="space-y-4">
            {difficultySettings.length > 0 ? (
              <AdaptiveDifficulty settings={difficultySettings} />
            ) : (
              <EmptyNote>No difficulty adjustments configured yet.</EmptyNote>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* INTERACTIVE QUIZ RUNNER COMPONENT                                  */
/* ------------------------------------------------------------------ */
function InteractiveQuizRunner({
  quiz,
  userId,
  onComplete,
}: {
  quiz: Quiz;
  userId: string;
  onComplete: (attempt: any) => void;
}) {
  const [questions, setQuestions] = useState<
    Array<{ id: string; question: string; options: string[]; answerIndex: number; explanation: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnalysis, setSavedAnalysis] = useState<QuizAnalysisData | null>(null);

  useEffect(() => {
    // Generate or populate questions
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const result = await generateAIQuiz({
          subjectName: quiz.subjectName,
          chapter: quiz.chapter,
          topicHint: quiz.title,
          difficulty: quiz.difficulty,
          count: quiz.totalQuestions || 5,
        });
        setQuestions(result.questions);
        setSelectedAnswers(new Array(result.questions.length).fill(-1));
      } catch (err) {
        // Fallback curated questions
        const fallback = [
          {
            id: "q1",
            question: `What is the primary objective of studying ${quiz.title}?`,
            options: [
              "To analyze core principles and theoretical foundations",
              "To memorize syntax without understanding",
              "To bypass verification standards",
              "To disregard system constraints",
            ],
            answerIndex: 0,
            explanation: "Core foundational understanding is key to mastering technical subjects.",
          },
          {
            id: "q2",
            question: `Which approach ensures optimal problem-solving in ${quiz.subjectName}?`,
            options: [
              "Ad-hoc trial and error",
              "Systematic decomposition and algorithmic analysis",
              "Ignoring edge cases",
              "Hardcoding assumptions",
            ],
            answerIndex: 1,
            explanation: "Systematic decomposition ensures correctness and robustness.",
          },
        ];
        setQuestions(fallback);
        setSelectedAnswers(new Array(fallback.length).fill(-1));
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quiz]);

  const handleSubmit = async () => {
    if (selectedAnswers.some((a) => a === -1)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSaving(true);
    let correctCount = 0;
    const answersRecord = questions.map((q, i) => {
      const isCorrect = selectedAnswers[i] === q.answerIndex;
      if (isCorrect) correctCount += 1;
      return {
        question: q.question,
        selectedOption: q.options[selectedAnswers[i]] || "",
        correctOption: q.options[q.answerIndex] || "",
        isCorrect,
        concept: quiz.subjectName,
        mistake: !isCorrect ? `Selected "${q.options[selectedAnswers[i]]}" instead of "${q.options[q.answerIndex]}"` : undefined,
      };
    });

    const total = questions.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const score = Math.round((correctCount / total) * 100);
    const strongConcepts = accuracy >= 60 ? [quiz.subjectName, "Core Fundamentals"] : ["Basic Principles"];
    const weakConcepts = accuracy < 100 ? [quiz.title, "Advanced Nuances"] : [];
    const recommendedPractice = [
      `Review chapter notes for ${quiz.title}`,
      `Practice 5 worked examples on ${quiz.subjectName}`,
    ];

    const attemptPayload = {
      userId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      totalQuestions: total,
      correctAnswers: correctCount,
      wrongAnswers: total - correctCount,
      accuracy,
      answers: answersRecord,
      strongConcepts,
      weakConcepts,
      recommendedPractice,
      completedAt: new Date().toISOString(),
    };

    try {
      const attemptId = await submitAssignment
        ? await saveQuizAttempt(userId, attemptPayload as any)
        : `att_${Date.now()}`;

      const analysisData: QuizAnalysisData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        accuracy,
        correctAnswers: correctCount,
        wrongAnswers: total - correctCount,
        strongConcepts,
        weakConcepts,
        mistakeAnalysis: answersRecord
          .filter((a) => !a.isCorrect && a.mistake)
          .map((a) => ({ concept: a.concept, mistake: a.mistake! })),
        recommendedPractice,
      };

      setSavedAnalysis(analysisData);
      setIsSubmitted(true);
      onComplete({ id: attemptId, ...attemptPayload });
    } catch (err) {
      console.error("Save attempt failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold">Generating interactive questions for {quiz.title}...</span>
      </div>
    );
  }

  if (isSubmitted && savedAnalysis) {
    return <QuizAnalysis analysis={savedAnalysis} />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-200 text-xs">
            {quiz.difficulty} Difficulty · {quiz.kind}
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            {questions.length} Questions
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-2">{quiz.title}</h2>
        <p className="text-xs text-slate-500">{quiz.subjectName} {quiz.chapter ? `· ${quiz.chapter}` : ""}</p>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id || qIndex} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {qIndex + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, optIndex) => {
                const isSelected = selectedAnswers[qIndex] === optIndex;
                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => {
                      const updated = [...selectedAnswers];
                      updated[qIndex] = optIndex;
                      setSelectedAnswers(updated);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIndex)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <Button
          onClick={handleSubmit}
          disabled={isSaving || selectedAnswers.some((a) => a === -1)}
          className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-6 py-2.5 shadow"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving Attempt...
            </>
          ) : (
            "Submit Answers & View Analysis"
          )}
        </Button>
      </div>
    </div>
  );
}
