// features/learn/services/personalizationService.ts
// Modular personalization engine for the Learn section.
//
// Every function derives its output ONLY from real student data stored in
// Firestore (subjects, quiz attempts, assignments, progress, recommendations,
// profile). The heuristics below are intentionally simple and isolated so a
// real AI model can replace them later without touching any UI code.

import type {
  LearnData,
  Subject,
  QuizAttempt,
  LearningProgress,
  LearningAssessment,
  PersonalizedLearningRecommendation,
  AdaptiveDifficultySetting,
  PersonalizedRevisionItem,
  NextBestActionItem,
} from "../types/learn.types";

/* =========================================================
   LEARNING ASSESSMENT
========================================================= */

export const deriveAssessment = (
  progress: LearningProgress | null,
  attempts: QuizAttempt[]
): LearningAssessment | null => {
  if (!progress && attempts.length === 0) return null;

  const avgAccuracy = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length)
    : (progress?.quizPerformance ?? 0);

  const masteryValues = Object.values(progress?.topicMastery ?? {});
  const topicMastery = masteryValues.length
    ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
    : 0;

  // Mistake patterns aggregated across all stored quiz attempts
  const mistakeCounts = new Map<string, number>();
  (attempts || []).forEach((a) =>
    (a.answers || []).forEach((ans) => {
      if (!ans.isCorrect && ans.mistake) {
        mistakeCounts.set(ans.mistake, (mistakeCounts.get(ans.mistake) || 0) + 1);
      }
    })
  );
  const mistakePatternDetection = [...mistakeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mistake]) => mistake);

  // Learning gaps = weak concepts that appear in more than one attempt
  const weakConceptCounts = new Map<string, number>();
  (attempts || []).forEach((a) =>
    (a.weakConcepts || []).forEach((c) =>
      weakConceptCounts.set(c, (weakConceptCounts.get(c) || 0) + 1)
    )
  );
  const learningGapDetection = [...weakConceptCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([concept]) => `Recurring difficulty with "${concept}"`);

  return {
    knowledgeLevel:
      avgAccuracy >= 75 ? "Hard" : avgAccuracy >= 50 ? "Medium" : "Easy",
    topicMastery,
    strengthDetection: progress?.strongTopics ?? [],
    weaknessDetection: progress?.weakTopics ?? [],
    learningGapDetection,
    mistakePatternDetection,
    // Learning speed heuristic: accuracy relative to time invested
    learningSpeed:
      avgAccuracy >= 70 ? "Fast" : avgAccuracy >= 45 ? "Average" : "Slow",
    accuracy: avgAccuracy,
    studyTimeMinutesPerWeek: progress?.studyTimeMinutes ?? 0,
  };
};

/* =========================================================
   ADAPTIVE DIFFICULTY
   Low accuracy -> Easy | Medium -> Medium | High -> Hard
========================================================= */

const levelFromScore = (score: number): AdaptiveDifficultySetting["currentLevel"] =>
  score >= 75 ? "Hard" : score >= 50 ? "Medium" : "Easy";

export const computeAdaptiveDifficulty = (
  subjects: Subject[],
  progress: LearningProgress | null
): AdaptiveDifficultySetting[] => {
  if (subjects.length === 0) return [];

  return subjects.map((s) => {
    const stored = progress?.subjectProgress.find(
      (p) => p.subjectName === s.name
    );

    const avg = Math.round(
      ((stored?.progress ?? s.progress) +
        s.quizPerformance +
        s.assignmentPerformance) /
        3
    );

    return {
      subjectName: s.name,
      currentLevel: levelFromScore(avg),
      autoAdjust: true,
      reason: `Derived from ${avg}% combined progress, quiz and assignment performance`,
    };
  });
};

/* =========================================================
   PERSONALIZED RECOMMENDATIONS
   Prefers teacher/system recommendations stored in Firestore;
   falls back to weak topics and unattempted quizzes.
========================================================= */

export const buildPersonalizedLearning = (
  data: LearnData
): PersonalizedLearningRecommendation | null => {
  const byKind = (kind: string) =>
    data.recommendations.find((r) => r.kind === kind)?.title;

  const weakestSubject = [...data.subjects].sort(
    (a, b) => a.quizPerformance - b.quizPerformance
  )[0];

  const weakestTopic =
    data.progress?.weakTopics[0] ?? weakestSubject?.weakTopics[0];

  const nextQuiz = data.quizzes.find(
    (q) => !q.attempted && q.difficulty !== "Hard"
  );

  const result: PersonalizedLearningRecommendation = {
    recommendedTopic:
      byKind("topic") ?? weakestTopic ?? "-",
    recommendedMaterial:
      byKind("material") ??
      data.materials.find((m) => m.subjectName === weakestSubject?.name)?.title ??
      "-",
    recommendedVideo:
      byKind("video") ??
      data.materials.find(
        (m) => m.type === "Video" && m.subjectName === weakestSubject?.name
      )?.title ??
      "-",
    recommendedPractice: byKind("practice") ?? "-",
    recommendedQuiz:
      byKind("quiz") ??
      nextQuiz?.title ??
      data.quizzes.find((q) => !q.attempted)?.title ??
      "-",
    recommendedRevision:
      byKind("revision") ??
      data.progress?.weakTopics[0] ??
      "-",
  };

  const hasAny = Object.values(result).some((v) => v !== "-");
  return hasAny ? result : null;
};

/* =========================================================
   PERSONALIZED REVISION QUEUE
   Sources: weak topics, past mistakes, spaced revision.
========================================================= */

export const buildRevisionQueue = (
  data: LearnData
): PersonalizedRevisionItem[] => {
  const items: PersonalizedRevisionItem[] = [];

  // Weak topics per subject
  data.subjects.forEach((s) =>
    s.weakTopics.forEach((topic, i) =>
      items.push({
        id: `${s.id}-weak-${i}`,
        topic,
        subjectName: s.name,
        reason: "Weak Topic",
        dueIn: "Today",
      })
    )
  );

  // Past mistakes from quiz attempts
  data.quizAttempts.slice(0, 5).forEach((attempt, i) => {
    attempt.weakConcepts.slice(0, 2).forEach((concept, j) => {
      const id = `${attempt.id ?? attempt.quizId}-mistake-${i}-${j}`;
      if (!items.some((item) => item.topic === concept)) {
        items.push({
          id,
          topic: concept,
          subjectName: attempt.quizTitle.split(" – ")[0],
          reason: "Past Mistake",
          dueIn: "Today",
        });
      }
    });
  });

  // Spaced revision: strong topics revisited to prevent forgetting
  (data.progress?.strongTopics ?? []).slice(0, 3).forEach((topic, i) =>
    items.push({
      id: `spaced-${i}`,
      topic,
      subjectName: "",
      reason: "Spaced Revision",
      dueIn: `In ${i + 2} days`,
    })
  );

  return items;
};

/* =========================================================
   NEXT BEST ACTION
   Priority: overdue assignment > weak topic practice >
   unattempted matching quiz > recommended items.
========================================================= */

export const buildNextBestActions = (
  data: LearnData
): NextBestActionItem[] => {
  const actions: NextBestActionItem[] = [];
  let n = 0;
  const id = () => `nba-${n++}`;

  // 1. Overdue assignments first
  const overdue = data.assignments.find((a) => a.status === "Overdue");
  if (overdue) {
    actions.push({
      id: id(),
      question: "What should I practice?",
      actionLabel: `Submit overdue: ${overdue.topic}`,
      target: overdue.id,
      subjectName: overdue.subject,
    });
  }

  // 2. Weakest subject / topic
  const weakestSubject = [...data.subjects].sort(
    (a, b) => a.progress - b.progress
  )[0];
  if (weakestSubject) {
    actions.push({
      id: id(),
      question: "What should I learn?",
      actionLabel: weakestSubject.weakTopics[0]
        ? `Focus on ${weakestSubject.weakTopics[0]} (${weakestSubject.name})`
        : `Continue ${weakestSubject.name}`,
      target: weakestSubject.id,
      subjectName: weakestSubject.name,
    });
  }

  // 3. Revision from weak topics
  const weakTopic = data.progress?.weakTopics[0];
  if (weakTopic) {
    actions.push({
      id: id(),
      question: "What should I revise?",
      actionLabel: `Revise: ${weakTopic}`,
      target: weakTopic,
      subjectName: "",
    });
  }

  // 4. Unattempted quiz matching difficulty level
  const assessmentAccuracy =
    data.quizAttempts.length
      ? Math.round(
          data.quizAttempts.reduce((s, a) => s + a.accuracy, 0) /
            data.quizAttempts.length
        )
      : 0;
  const suggestedDifficulty =
    assessmentAccuracy >= 75 ? "Hard" : assessmentAccuracy >= 50 ? "Medium" : "Easy";
  const quiz =
    data.quizzes.find(
      (q) => !q.attempted && q.difficulty === suggestedDifficulty
    ) ?? data.quizzes.find((q) => !q.attempted);
  if (quiz) {
    actions.push({
      id: id(),
      question: "Which quiz should I take?",
      actionLabel: `Take: ${quiz.title} (${quiz.difficulty})`,
      target: quiz.id,
      subjectName: quiz.subjectName,
    });
  }

  // 5. Stored recommendations fill remaining slots
  data.recommendations
    .filter((r) => !actions.some((a) => a.target === r.targetId))
    .slice(0, Math.max(0, 5 - actions.length))
    .forEach((r) => {
      actions.push({
        id: id(),
        question:
          r.kind === "practice"
            ? "What should I practice?"
            : r.kind === "revision"
            ? "What should I revise?"
            : "What should I learn next?",
        actionLabel: r.title,
        target: r.targetId || r.kind,
        subjectName: "",
      });
    });

  return actions.slice(0, 5);
};

/* =========================================================
   OVERALL PROGRESS
========================================================= */

export const computeOverallProgress = (data: LearnData): number => {
  if (data.progress?.subjectProgress.length) {
    return Math.round(
      data.progress.subjectProgress.reduce((s, p) => s + p.progress, 0) /
        data.progress.subjectProgress.length
    );
  }
  if (data.subjects.length) {
    return Math.round(
      data.subjects.reduce((s, sub) => s + sub.progress, 0) / data.subjects.length
    );
  }
  return 0;
};
