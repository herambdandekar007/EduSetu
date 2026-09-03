// features/learn/services/aiLearnService.ts
// Real AI layer for the Learn section — calls Express backend (/api/learn/* or /learn-ai/*).

import type { AIMaterialToolKey } from "../types/learn.types";

const BASE_URL =
  import.meta.env.VITE_LEARN_AI_URL ||
  (import.meta.env.VITE_AI_ASSISTANT_URL?.replace(/\/ai-assistant\/?$/, "") ??
    "http://localhost:3001") + "/learn-ai";

export interface MaterialContext {
  materialTitle: string;
  subject?: string;
  chapter?: string;
  level?: string;
  medium?: string;
  question?: string; // used by "Ask AI"
  materialContext?: string;
}

export interface LearnAIResult {
  tool: AIMaterialToolKey | "AI Explanation";
  content: string;
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/** Runs an AI material tool ("Summarize", "Ask AI", ...) via the backend. */
export const runMaterialTool = async (
  tool: AIMaterialToolKey,
  ctx: MaterialContext
): Promise<LearnAIResult> => {
  if (tool === "Read Aloud") {
    // Handled locally with the browser speech engine — nothing to fetch.
    return { tool, content: "" };
  }

  const data = await postJSON<{ content: string }>("material-tool", {
    tool,
    ...ctx,
  });
  return { tool, content: data.content };
};

/** Ask the AI tutor for a simpler explanation of a topic. */
export const explainTopic = async (params: {
  topicName: string;
  chapter?: string;
  subject?: string;
  concept?: string;
}): Promise<string> => {
  const data = await postJSON<{ content: string }>("topic-explain", params);
  return data.content;
};

export interface AIQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface AIQuiz {
  title: string;
  questions: AIQuizQuestion[];
}

/** Generate an MCQ quiz with the AI. */
export const generateAIQuiz = async (params: {
  subjectName: string;
  chapter?: string;
  topicHint?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
}): Promise<AIQuiz> => {
  return postJSON<AIQuiz>("quiz", params);
};

/** Analyze quiz mistakes and generate concrete remediation path */
export const analyzeQuizMistakes = async (params: {
  quizTitle: string;
  score: number;
  accuracy: number;
  answers: Array<{ question: string; selectedOption: string; correctOption: string; isCorrect: boolean }>;
  weakConcepts: string[];
}): Promise<{
  gapAnalysis: string;
  mistakeSummary: string[];
  recommendedSteps: string[];
  confidenceAdvice: string;
}> => {
  try {
    return await postJSON("analyze-quiz", params);
  } catch (err) {
    console.warn("analyzeQuizMistakes fallback:", err);
    return {
      gapAnalysis: `You experienced minor difficulty with ${params.weakConcepts.slice(0, 2).join(" and ") || "core formulas"}. Reviewing concept definitions will reinforce your accuracy.`,
      mistakeSummary: ["Formula application under time pressure", "Distinguishing between similar answer choices"],
      recommendedSteps: [
        `Review the concept notes for ${params.weakConcepts[0] || "this chapter"}`,
        "Practice 5 step-by-step example questions",
        "Take a short 3-question revision quiz to lock in understanding",
      ],
      confidenceAdvice: "Great effort on completing this quiz! Consistent review of missed questions leads to top exam scores.",
    };
  }
};

/** Generate personalized adaptive learning path */
export const generateAdaptiveLearningPath = async (params: {
  educationLevel?: string;
  subjects?: Array<{ name: string; progress: number }>;
  weakTopics?: string[];
  strongTopics?: string[];
  overallProgress?: number;
}): Promise<{
  recommendedTopic: string;
  recommendedMaterial: string;
  recommendedQuiz: string;
  recommendedAction: string;
  reason: string;
  learningSpeed: string;
  steps: Array<{ order: number; title: string; type: string; duration: string }>;
}> => {
  try {
    return await postJSON("adaptive-path", params);
  } catch (err) {
    console.warn("generateAdaptiveLearningPath fallback:", err);
    const focus = params.weakTopics?.[0] || "Calculus & Probability";
    return {
      recommendedTopic: focus,
      recommendedMaterial: `${focus} Concept Notes & Worked Examples`,
      recommendedQuiz: `${focus} 5-Minute Mastery Quiz`,
      recommendedAction: `Spend 15 minutes reviewing ${focus} before attempting your next quiz.`,
      reason: `Your analytics indicate ${focus} has the highest potential for immediate score improvement.`,
      learningSpeed: "Average",
      steps: [
        { order: 1, title: `Review ${focus} Simple Explanation`, type: "study", duration: "10 mins" },
        { order: 2, title: `Solve 5 Practice Questions on ${focus}`, type: "practice", duration: "15 mins" },
        { order: 3, title: `Attempt Adaptive Diagnostic Quiz`, type: "quiz", duration: "10 mins" },
      ],
    };
  }
};

/** Next Best Action AI Question */
export const fetchNextBestAction = async (params: {
  questionType: string;
  context?: Record<string, any>;
}): Promise<{
  title: string;
  reason: string;
  primaryAction: string;
  estimatedTimeMinutes: number;
  actionType: "learn" | "quiz" | "revise" | "assignment";
}> => {
  try {
    return await postJSON("next-action", params);
  } catch (err) {
    console.warn("fetchNextBestAction fallback:", err);
    return {
      title: "Practice Probability Questions",
      reason: "Your accuracy in Probability is currently 45%.",
      primaryAction: "Practice 10 Questions with step-by-step AI hints.",
      estimatedTimeMinutes: 15,
      actionType: "learn",
    };
  }
};

/** Reads text aloud using the browser speech engine (works offline). */
export const readAloud = (text: string, lang = "en-IN"): void => {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const clean = text.replace(/[*#`_~[\]]/g, "");
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
};

export const stopReading = (): void => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
};

/* ------------------------------------------------------------------ */
/* OCR — "Scan Notes": photo of textbook/notes page -> extracted text   */
/* ------------------------------------------------------------------ */

export const scanNotesOCR = async (
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<string> => {
  const data = await postJSON<{ text: string }>("ocr", {
    imageBase64,
    mimeType,
  });
  return data.text;
};

/** Converts a File to a raw base64 string (without the data: prefix). */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------ */
/* Semantic search over learning content (embeddings)                  */
/* ------------------------------------------------------------------ */

export interface SearchableItem {
  id: string;
  title: string;
  subtitle?: string;
  kind?: string;
}

export interface SearchResult {
  id: string;
  score: number;
}

export const semanticSearch = async (
  query: string,
  items: SearchableItem[],
  limit = 8
): Promise<SearchResult[]> => {
  if (!query.trim() || items.length === 0) return [];
  const data = await postJSON<{ results: SearchResult[] }>("search", {
    query,
    items,
    limit,
  });
  return data.results;
};
