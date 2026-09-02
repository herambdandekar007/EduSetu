// features/learn/components/Quizzes.tsx
// Quiz list + fully working AI Quiz Generator (backend /learn-ai/quiz).
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  ListChecks,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { Quiz, Difficulty } from "../types/learn.types";
import { quizzes as mockQuizzes } from "../data/learnData";
import { generateAIQuiz, type AIQuiz, type AIQuizQuestion } from "../services/aiLearnService";
import { submitQuizAttempt } from "../services/learnService";

interface QuizzesProps {
  quizzes?: Quiz[];
  onOpenQuiz?: (quiz: Quiz) => void;
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

export default function Quizzes({ quizzes = mockQuizzes, onOpenQuiz }: QuizzesProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "All">("All");

  const filtered =
    difficultyFilter === "All" ? quizzes : quizzes.filter((q) => q.difficulty === difficultyFilter);

  return (
    <section className="w-full space-y-5">
      <AIQuizGenerator defaultSubject={quizzes[0]?.subjectName || "General"} />

      <div className="flex gap-2">
        {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              difficultyFilter === d ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => onOpenQuiz?.(quiz)}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-600">{quiz.kind}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${DIFFICULTY_STYLE[quiz.difficulty]}`}>
                {quiz.difficulty}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{quiz.title}</h3>
            <p className="text-xs text-slate-500">
              {quiz.subjectName}
              {quiz.chapter ? ` · ${quiz.chapter}` : ""}
            </p>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ListChecks size={13} /> {quiz.totalQuestions} Qs
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> {quiz.durationMinutes} min
              </span>
              <span className="flex items-center gap-1">
                {quiz.attempted ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-500" /> {quiz.scorePercent}%
                  </>
                ) : (
                  <>
                    <Circle size={13} /> Not attempted
                  </>
                )}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* AI QUIZ GENERATOR                                                   */
/* ------------------------------------------------------------------ */

function AIQuizGenerator({ defaultSubject }: { defaultSubject: string }) {
  // Generator controls
  const [subject, setSubject] = useState(defaultSubject);
  const [topicHint, setTopicHint] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<AIQuiz | null>(null);
  const [attempt, setAttempt] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { user } = useAuth();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setSubmitted(false);
    setAttemptSaved(false);
    setSaveError(null);
    try {
      const result = await generateAIQuiz({
        subjectName: subject.trim() || "General",
        topicHint: topicHint.trim() || undefined,
        difficulty,
        count,
      });
      setQuiz(result);
      setAttempt(new Array(result.questions.length).fill(-1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-800">
        <Sparkles size={16} /> Generate an AI Quiz instantly
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (e.g. Science)"
          aria-label="Subject"
          className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <input
          value={topicHint}
          onChange={(e) => setTopicHint(e.target.value)}
          placeholder="Topic (optional)"
          aria-label="Topic"
          className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          aria-label="Difficulty"
          className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles size={15} /> Generate {count} Qs
            </>
          )}
        </button>
      </div>

      {/* Question count selector */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        Questions:
        {[5, 8, 10].map((c) => (
          <button
            key={c}
            onClick={() => setCount(c)}
            className={`rounded-full px-2.5 py-0.5 font-medium ${
              count === c ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>
      )}

      {saveError && (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          {saveError}
        </p>
      )}

      {attemptSaved && (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          Quiz attempt saved successfully to your learning history.
        </p>
      )}

      {quiz && attempt.length === quiz.questions.length && (
        <QuizPlayer
          quiz={quiz}
          attempt={attempt}
          submitted={submitted}
          savingAttempt={savingAttempt}
          onSelect={(qi, oi) =>
            !submitted &&
            setAttempt((prev) => prev.map((v, i) => (i === qi ? oi : v)))
          }
          onSubmit={async () => {
            if (!user) {
              setSaveError("Please log in before submitting the quiz.");
              return;
            }

            if (!quiz || attempt.some((answer) => answer < 0)) {
              return;
            }

            try {
              setSavingAttempt(true);
              setSaveError(null);

              const correctAnswers = quiz.questions.reduce(
                (total, question, index) =>
                  total + (attempt[index] === question.answerIndex ? 1 : 0),
                0
              );

              const totalQuestions = quiz.questions.length;
              const wrongAnswers = totalQuestions - correctAnswers;
              const accuracy =
                totalQuestions > 0
                  ? Math.round((correctAnswers / totalQuestions) * 100)
                  : 0;

              // Use a question-level concept when the AI returns one.
              // Otherwise fall back to the selected topic/subject.
              const answers = quiz.questions.map((question, index) => {
                const qWithConcept = question as AIQuizQuestion & {
                  concept?: string;
                };

                const concept =
                  qWithConcept.concept?.trim() ||
                  topicHint.trim() ||
                  subject.trim() ||
                  "General";

                const isCorrect = attempt[index] === question.answerIndex;

                return {
                  questionId: question.id,
                  concept,
                  isCorrect,
                  ...(isCorrect
                    ? {}
                    : {
                        mistake: `Selected option ${
                          attempt[index] >= 0
                            ? String.fromCharCode(65 + attempt[index])
                            : "none"
                        }; correct option ${String.fromCharCode(
                          65 + question.answerIndex
                        )}.`,
                      }),
                };
              });

              const strongConcepts = [
                ...new Set(
                  answers
                    .filter((answer) => answer.isCorrect)
                    .map((answer) => answer.concept)
                ),
              ];

              const weakConcepts = [
                ...new Set(
                  answers
                    .filter((answer) => !answer.isCorrect)
                    .map((answer) => answer.concept)
                ),
              ];

              const recommendedPractice =
                weakConcepts.length > 0
                  ? weakConcepts.map(
                      (concept) => `Revise and practise ${concept}`
                    )
                  : ["Continue with a harder quiz to strengthen mastery"];

              const attemptId = await submitQuizAttempt({
                userId: user.uid,
                quizId: `ai-${quiz.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`,
                quizTitle: quiz.title,
                score: correctAnswers,
                totalQuestions,
                correctAnswers,
                wrongAnswers,
                accuracy,
                answers,
                strongConcepts,
                weakConcepts,
                recommendedPractice,
              });

              console.log("✅ Quiz attempt saved to Firestore:", attemptId);

              setSubmitted(true);
              setAttemptSaved(true);
            } catch (err) {
              console.error("❌ Failed to save quiz attempt:", err);
              setSaveError(
                err instanceof Error
                  ? err.message
                  : "Failed to save quiz attempt."
              );
            } finally {
              setSavingAttempt(false);
            }
          }}
          onReset={() => {
            setSubmitted(false);
            setAttemptSaved(false);
            setSaveError(null);
            setAttempt(new Array(quiz.questions.length).fill(-1));
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QUIZ PLAYER                                                         */
/* ------------------------------------------------------------------ */

function QuizPlayer({
  quiz,
  attempt,
  submitted,
  savingAttempt,
  onSelect,
  onSubmit,
  onReset,
}: {
  quiz: AIQuiz;
  attempt: number[];
  submitted: boolean;
  savingAttempt: boolean;
  onSelect: (questionIndex: number, optionIndex: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const allAnswered = attempt.every((a) => a >= 0);
  const score = quiz.questions.reduce(
    (acc, q, i) => acc + (attempt[i] === q.answerIndex ? 1 : 0),
    0
  );
  const percent = Math.round((score / quiz.questions.length) * 100);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">{quiz.title}</h4>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          <RotateCcw size={13} /> Restart
        </button>
      </div>

      {submitted && (
        <div
          className={`rounded-xl p-4 text-sm font-medium ${
            percent >= 70
              ? "bg-emerald-50 text-emerald-700"
              : percent >= 40
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-700"
          }`}
        >
          You scored {score}/{quiz.questions.length} ({percent}%).{" "}
          {percent >= 70
            ? "Excellent work! 🎉"
            : percent >= 40
              ? "Good try — review the explanations below."
              : "Keep practising — read the explanations below."}
        </div>
      )}

      <ol className="space-y-4">
        {quiz.questions.map((q: AIQuizQuestion, qi) => {
          const chosen = attempt[qi];
          const isCorrect = chosen === q.answerIndex;
          return (
            <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-slate-900">
                {qi + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  let style =
                    "border-slate-200 bg-white text-slate-700 hover:border-indigo-300";
                  if (!submitted && chosen === oi) {
                    style = "border-indigo-500 bg-indigo-50 text-indigo-800 font-medium";
                  } else if (submitted) {
                    if (oi === q.answerIndex) {
                      style = "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium";
                    } else if (chosen === oi) {
                      style = "border-rose-400 bg-rose-50 text-rose-700";
                    }
                  }
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => onSelect(qi, oi)}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${style} disabled:cursor-default`}
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span>
                      <span>{opt}</span>
                      {submitted && oi === q.answerIndex && (
                        <CheckCircle2 size={15} className="ml-auto shrink-0 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  {isCorrect ? "✔ Correct. " : `✘ Correct answer: ${String.fromCharCode(65 + q.answerIndex)}. `}
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={!allAnswered || savingAttempt}
          title={
            savingAttempt
              ? "Saving your quiz attempt"
              : allAnswered
                ? undefined
                : "Answer every question first"
          }
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
        >
          {savingAttempt ? "Saving attempt..." : "Submit answers"}
        </button>
      )}
    </div>
  );
}
