// features/edumentor/services/mentorAIService.ts
// Frontend client for EduMentor AI endpoints with resilient fallbacks.

import type {
  StudentLearningContext,
  MentorResponseMode,
  DailyStudyPlan,
  PracticeQuestion,
  ExamPrepPlan,
} from "../types/mentor.types";

const RAW_URL = (import.meta.env.VITE_AI_ASSISTANT_URL || "http://localhost:3001").trim();
const BASE_URL = RAW_URL.replace(/\/ai-assistant\/?$/, "").replace(/\/+$/, "");

/**
 * 1. AI Chat Request
 */
export async function sendMentorChatMessage(params: {
  message: string;
  history?: { role: string; content: string }[];
  studentContext: StudentLearningContext;
  responseMode?: MentorResponseMode;
}): Promise<{
  reply: string;
  mode: MentorResponseMode;
  followUps: string[];
}> {
  try {
    const res = await fetch(`${BASE_URL}/api/edumentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("sendMentorChatMessage fetch failed, using fallback:", err);
    return getLocalChatFallback(params.message, params.studentContext, params.responseMode || "detailed");
  }
}

/**
 * 2. Generate AI Study Plan
 */
export async function generateAIStudyPlan(params: {
  studentContext: StudentLearningContext;
  days?: number;
  availableHoursPerDay?: number;
  targetExam?: string;
  focusSubjects?: string[];
  weakTopics?: string[];
}): Promise<DailyStudyPlan> {
  try {
    const res = await fetch(`${BASE_URL}/api/edumentor/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const todayStr = new Date().toISOString().split("T")[0];
    const planId = `${params.studentContext.userId}_${todayStr}`;

    const tasks = (data.dailyPlans?.[0]?.tasks || []).map((t: any, idx: number) => ({
      id: t.id || `task-${idx + 1}`,
      taskName: t.taskName || `Study Session ${idx + 1}`,
      subject: t.subject || params.studentContext.subjects[0] || "General",
      topic: t.topic || "Core Topic",
      durationMinutes: t.durationMinutes || 45,
      difficulty: t.difficulty || "Medium",
      priority: t.priority || "High",
      isCompleted: false,
      learningObjective: t.learningObjective || "Understand core principles and practice problems",
    }));

    return {
      id: planId,
      userId: params.studentContext.userId,
      eduId: params.studentContext.eduId,
      date: todayStr,
      title: data.title || "Personalized Daily Study Plan",
      summary: data.summary || "Tailored study plan based on your weak areas and curriculum goals.",
      estimatedTotalHours: data.estimatedTotalHours || params.availableHoursPerDay || 3,
      tasks,
      completionPercentage: 0,
      mentorTips: data.mentorTips || [
        "Use active recall after reading each concept.",
        "Take a 5-minute break every 25 minutes (Pomodoro technique).",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("generateAIStudyPlan fallback:", err);
    return getLocalPlanFallback(params.studentContext, params.availableHoursPerDay || 3);
  }
}

/**
 * 3. Generate Weak Topic Practice Questions
 */
export async function generatePracticeQuestions(params: {
  subject: string;
  topic: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  count?: number;
  studentContext: StudentLearningContext;
}): Promise<{
  subject: string;
  topic: string;
  difficulty: string;
  conceptSummary: string;
  questions: PracticeQuestion[];
}> {
  try {
    const res = await fetch(`${BASE_URL}/api/edumentor/practice-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("generatePracticeQuestions fallback:", err);
    return getLocalQuestionsFallback(params.subject, params.topic, params.difficulty || "Medium");
  }
}

/**
 * 4. Generate AI Exam Preparation Roadmap
 */
export async function generateExamPrepRoadmap(params: {
  examName: string;
  examDate: string;
  subjects: string[];
  importantTopics: string[];
  studentContext: StudentLearningContext;
}): Promise<ExamPrepPlan> {
  try {
    const res = await fetch(`${BASE_URL}/api/edumentor/exam-prep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      id: `exam_${params.studentContext.userId}_${Date.now()}`,
      userId: params.studentContext.userId,
      eduId: params.studentContext.eduId,
      examName: params.examName,
      examDate: params.examDate,
      daysRemaining: data.daysRemaining || 14,
      readinessScore: data.readinessScore || 70,
      subjects: params.subjects,
      highYieldTopics: data.highYieldTopics || [],
      phaseStrategy: data.phaseStrategy || [],
      revisionPlan: data.revisionPlan || [],
      mentorExamAdvice: data.mentorExamAdvice || [],
      practiceScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("generateExamPrepRoadmap fallback:", err);
    return getLocalExamPrepFallback(params);
  }
}

// ── Fallback Generators ──────────────────────────────────────────────────

function getLocalChatFallback(
  msg: string,
  ctx: StudentLearningContext,
  mode: MentorResponseMode
) {
  const weak = ctx.weakTopics[0] || "Data Structures";
  const name = ctx.name || "Aditya";

  const lower = msg.toLowerCase();
  let reply = "";

  if (lower.includes("what should i study") || lower.includes("recommend")) {
    reply = `### 🎯 Your Recommended Study Focus for Today\n\nHello **${name}**! Based on your learning history and recent diagnostic accuracy of **${ctx.recentAccuracy}%**, here is my top recommendation:\n\n1. **Priority 1 (Weak Area):** Revise **${weak}** (30 mins).\n2. **Priority 2 (Practice):** Solve 5-10 targeted multiple-choice questions on your active syllabus.\n3. **Priority 3 (Consolidation):** Review summary cheat-sheets and flashcards.\n\nWould you like me to generate a 3-question diagnostic quiz right now to check your mastery in **${weak}**?`;
  } else if (lower.includes("plan") || lower.includes("schedule")) {
    reply = `### 📅 Smart Daily Study Plan\n\nHere is a balanced 3-hour learning schedule customized for **${ctx.course || "your course"}**:\n\n- **Block 1 (45 mins):** ${ctx.subjects[0] || "Core Theory"} – Concept review\n- **Block 2 (45 mins):** ${weak} – Practice problems & mistake analysis\n- **Break (15 mins):** Hydrate & rest your eyes\n- **Block 3 (45 mins):** Practical exercises & Quiz assessment\n- **Wrap-up (15 mins):** Log revision notes\n\nClick the **Today's Plan** tab to track each task interactively!`;
  } else {
    reply = `### 🤖 EduMentor Insights for ${name}\n\nI have reviewed your learning parameters:\n\n- **Active Subjects:** ${ctx.subjects.join(", ")}\n- **Identified Weak Topic:** ${weak}\n- **Study Streak:** 🔥 ${ctx.studyStreakDays} Days\n\nRegarding your question: *"**${msg}**"*\n\n> **Key Concept:** To master this, start by breaking down the foundational axioms into simple sub-problems. Connect this directly with ${ctx.strongTopics[0] || "your existing strong concepts"} to bridge the cognitive gap.\n\nLet me know if you want a **Step-by-Step** breakdown, a **Code Example**, or an **Exam-focused** summary!`;
  }

  return {
    reply,
    mode,
    followUps: [
      "Explain this in simple terms",
      "Give me a step-by-step example",
      "Generate 5 practice questions for me",
      "How do I prepare for my upcoming exam?",
    ],
  };
}

function getLocalPlanFallback(ctx: StudentLearningContext, hours: number): DailyStudyPlan {
  const todayStr = new Date().toISOString().split("T")[0];
  const weak = ctx.weakTopics[0] || "Core Fundamentals";
  const sub1 = ctx.subjects[0] || "Mathematics";
  const sub2 = ctx.subjects[1] || "Computer Science";

  return {
    id: `${ctx.userId}_${todayStr}`,
    userId: ctx.userId,
    eduId: ctx.eduId,
    date: todayStr,
    title: "Today's Adaptive Study Plan",
    summary: `Tailored for ${ctx.name} with focus on ${weak} and active practice.`,
    estimatedTotalHours: hours,
    tasks: [
      {
        id: "task-1",
        taskName: `Revise ${weak}`,
        subject: sub1,
        topic: weak,
        durationMinutes: 40,
        difficulty: "Medium",
        priority: "High",
        isCompleted: false,
        learningObjective: `Review core concepts and formulas in ${weak}`,
      },
      {
        id: "task-2",
        taskName: "Targeted Problem Practice",
        subject: sub1,
        topic: weak,
        durationMinutes: 45,
        difficulty: "Hard",
        priority: "High",
        isCompleted: false,
        learningObjective: "Solve 10 practice questions and review mistakes",
      },
      {
        id: "task-3",
        taskName: `Advance in ${sub2}`,
        subject: sub2,
        topic: "Next Curriculum Topic",
        durationMinutes: 45,
        difficulty: "Medium",
        priority: "Medium",
        isCompleted: false,
        learningObjective: "Complete lecture notes and summary",
      },
      {
        id: "task-4",
        taskName: "Diagnostic Self-Quiz",
        subject: sub1,
        topic: "Topic Mastery Quiz",
        durationMinutes: 20,
        difficulty: "Easy",
        priority: "Low",
        isCompleted: false,
        learningObjective: "Assess retention with 5 quick MCQs",
      },
    ],
    completionPercentage: 0,
    mentorTips: [
      "Review the concepts you found difficult yesterday before starting new material.",
      "Track your mistakes in a dedicated error log notebook.",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getLocalQuestionsFallback(subject: string, topic: string, difficulty: string) {
  return {
    subject,
    topic,
    difficulty,
    conceptSummary: `Core principles of ${topic} in ${subject}. Focus on logical derivation and edge cases.`,
    questions: [
      {
        id: "q-1",
        question: `What is the primary operational advantage or key property of ${topic}?`,
        options: [
          `It guarantees optimal asymptotic time complexity for typical search operations.`,
          `It requires zero memory overhead compared to sequential arrays.`,
          `It only functions on sorted inputs in static memory.`,
          `It eliminates all recursion stacks automatically.`,
        ],
        correctIndex: 0,
        hint: "Think about the asymptotic time bounds and balanced hierarchical structures.",
        explanation: `${topic} is designed to provide optimal time complexity across operations by structuring elements hierarchically or dynamically.`,
        conceptTested: "Fundamental Properties",
      },
      {
        id: "q-2",
        question: `When analyzing edge cases in ${topic}, which condition must always be validated first?`,
        options: [
          `Base case termination or null/boundary pointers.`,
          `The maximum integer limit of the system.`,
          `Hardware cache alignment constraints.`,
          `File I/O disk buffer capacity.`,
        ],
        correctIndex: 0,
        hint: "Consider what stops infinite loops or memory access violations.",
        explanation: "Validating base cases and null/boundary guards prevents stack overflows and undefined memory behavior.",
        conceptTested: "Boundary & Edge Cases",
      },
      {
        id: "q-3",
        question: `Which optimization technique is most effective when working with ${topic}?`,
        options: [
          `Memoization / caching previously computed sub-problems.`,
          `Increasing thread count indefinitely without synchronization.`,
          `Converting all variables to global variables.`,
          `Avoiding function calls completely.`,
        ],
        correctIndex: 0,
        hint: "Think about avoiding redundant recalculations.",
        explanation: "Memoization caches results of expensive computations, reducing exponential time to polynomial.",
        conceptTested: "Algorithmic Optimization",
      },
    ],
  };
}

function getLocalExamPrepFallback(params: any): ExamPrepPlan {
  const daysLeft = params.examDate
    ? Math.max(1, Math.ceil((new Date(params.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  return {
    id: `exam_${params.studentContext.userId}_${Date.now()}`,
    userId: params.studentContext.userId,
    eduId: params.studentContext.eduId,
    examName: params.examName || "Semester Exam",
    examDate: params.examDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    daysRemaining: daysLeft,
    readinessScore: 68,
    subjects: params.subjects || ["Mathematics", "Computer Science", "Database Systems"],
    highYieldTopics: [
      { subject: "Computer Science", topic: "Data Structures & Trees", weightage: "25%", priority: "High" },
      { subject: "Mathematics", topic: "Calculus & Linear Algebra", weightage: "30%", priority: "High" },
      { subject: "Database Systems", topic: "Normalization & SQL Queries", weightage: "20%", priority: "Medium" },
    ],
    phaseStrategy: [
      { phaseName: "Phase 1: Concept Mastery", daysSpan: `Days 1 to ${Math.floor(daysLeft * 0.5)}`, focus: "Cover all high-yield topics and solve practice problems", milestone: "Complete chapter-wise notes" },
      { phaseName: "Phase 2: Intensive Revision", daysSpan: `Days ${Math.floor(daysLeft * 0.5) + 1} to ${Math.floor(daysLeft * 0.8)}`, focus: "Review weak topics, mistake patterns, and formula sheets", milestone: "Score 80%+ on mock quizzes" },
      { phaseName: "Phase 3: Mock Exams & Polish", daysSpan: `Days ${Math.floor(daysLeft * 0.8) + 1} to ${daysLeft}`, focus: "Timed full-length mock papers and confidence building", milestone: "Full syllabus exam readiness" },
    ],
    revisionPlan: [
      { day: 1, subject: "Computer Science", tasks: ["Revise Trees & Graph Traversals", "Solve 10 practice questions"] },
      { day: 2, subject: "Mathematics", tasks: ["Calculus integration rules", "Solve 5 past paper questions"] },
      { day: 3, subject: "Database Systems", tasks: ["SQL joins and indexing", "Self-assessment quiz"] },
    ],
    mentorExamAdvice: [
      "Do not study new difficult topics in the last 48 hours before the exam.",
      "Review your mistake journal every morning.",
      "Practice writing answers under timed exam conditions.",
    ],
    practiceScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
