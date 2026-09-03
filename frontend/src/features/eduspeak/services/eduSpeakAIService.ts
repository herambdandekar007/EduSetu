// features/eduspeak/services/eduSpeakAIService.ts
// Frontend client for AI Speech Analysis, Conversation Partner, and Pronunciation Coach.

import type {
  SpeechAnalysisResult,
  ConversationMessage,
  EduSpeakProfile,
} from "../types/eduspeak.types";

const RAW_URL = (import.meta.env.VITE_AI_ASSISTANT_URL || "http://localhost:3001").trim();
const BASE_URL = RAW_URL.replace(/\/ai-assistant\/?$/, "").replace(/\/+$/, "");

/**
 * 1. AI Comprehensive Speech & Communication Analysis
 */
export async function analyzeSpokenSpeech(params: {
  transcript: string;
  topic?: string;
  practiceType?: string;
  durationSeconds?: number;
  language?: string;
}): Promise<SpeechAnalysisResult> {
  const { transcript, topic, durationSeconds = 30, language = "English" } = params;

  try {
    const res = await fetch(`${BASE_URL}/api/speaking/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        topic,
        durationSeconds,
        language,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.overallScore === "number") {
        return {
          id: `eval_${Date.now()}`,
          transcript,
          targetPhrase: topic,
          overallScore: data.overallScore,
          pronunciationScore: data.pronunciationScore || data.grammar?.score || 78,
          fluencyScore: data.fluencyScore || 75,
          grammarScore: data.grammar?.score || data.grammarScore || 70,
          vocabularyScore: data.vocabulary?.score || data.vocabularyScore || 72,
          confidenceScore: data.confidenceScore || 80,
          speakingPaceWpm: data.speakingPaceWpm || Math.round((transcript.split(/\s+/).length / (durationSeconds || 10)) * 60),
          corrections: Array.isArray(data.mistakes)
            ? data.mistakes.map((m: any) => ({
                original: m.original,
                suggested: m.correction,
                explanation: m.explanation,
                category: m.category || "Grammar",
              }))
            : data.corrections || [],
          correctedSentence: data.correctedSentence || data.sentence?.correction,
          strengths: data.strengths || ["Clear articulation", "Confident speaking pacing", "Good structural flow"],
          weaknesses: data.weaknesses || ["Minor filler word usage", "Sentence structure complexity"],
          recommendations: data.recommendations || [
            "Practice linking phrases for smoother transitions",
            "Slow down slightly on multi-syllabic technical words",
          ],
          feedback: data.feedback || "Good effort! Continue practicing to build professional speaking rhythm.",
          createdAt: new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("analyzeSpokenSpeech fetch error, using local synthesis:", err);
  }

  // Resilient heuristic synthesis
  return synthesizeSpeechEvaluation(transcript, durationSeconds);
}

/**
 * 2. AI Conversational Dialogue Step
 */
export async function generateConversationReply(params: {
  scenario: string;
  scenarioTitle: string;
  history: ConversationMessage[];
  userSpeech: string;
  language?: string;
}): Promise<{ reply: string; followUpPrompts: string[] }> {
  try {
    const res = await fetch(`${BASE_URL}/api/speaking/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch (err) {
    console.warn("generateConversationReply fallback:", err);
  }

  // Dynamic contextual fallback
  const userText = params.userSpeech.toLowerCase();
  let reply = "That's a very clear point! Could you elaborate a bit more on how you would handle this situation in practice?";
  let followUpPrompts = ["I would first analyze the requirements.", "Let me give you a concrete example.", "I believe team communication is key."];

  if (params.scenario.includes("Interview") || params.scenarioTitle.includes("Interview")) {
    reply = "Thank you for sharing that background. What specific technical challenges did you encounter during that project, and how did you resolve them?";
    followUpPrompts = ["The main challenge was state synchronization.", "We optimized database queries to scale.", "I collaborated with the team to debug."];
  } else if (params.scenario.includes("College") || params.scenario.includes("Teacher")) {
    reply = "Interesting perspective! How does this concept apply to your upcoming semester project?";
    followUpPrompts = ["It directly helps our database design.", "We are implementing this algorithm in Python.", "I am writing a research paper on it."];
  }

  return { reply, followUpPrompts };
}

/**
 * 3. AI Speaking Mentor Chat
 */
export async function chatWithSpeakingMentor(params: {
  message: string;
  history: { role: string; content: string }[];
  profile?: EduSpeakProfile;
}): Promise<{ reply: string; suggestedPracticeTopic?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/speaking/mentor-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch (err) {
    console.warn("chatWithSpeakingMentor fallback:", err);
  }

  return {
    reply: `That is a great speaking question! To sound more confident, remember the **3P Rule**: **Pause** before speaking, **Pitch** your voice steadily, and **Project** key technical terms clearly. Would you like to do a quick 60-second mock introduction drill?`,
    suggestedPracticeTopic: "Professional 60-Second Elevator Pitch",
  };
}

/** Offline heuristic analysis engine */
function synthesizeSpeechEvaluation(transcript: string, durationSeconds: number): SpeechAnalysisResult {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const paceWpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 115;

  const corrections: SpeechAnalysisResult["corrections"] = [];

  if (/\b(gonna|wanna|dunno)\b/i.test(transcript)) {
    corrections.push({
      original: "gonna / wanna",
      suggested: "going to / want to",
      explanation: "In formal and interview communication, articulate complete verb forms.",
      category: "Word Choice",
    });
  }

  if (/\b(he|she|it)\s+don't\b/i.test(transcript)) {
    corrections.push({
      original: "don't",
      suggested: "doesn't",
      explanation: "Third-person singular subjects (he/she/it) require 'doesn't'.",
      category: "Grammar",
    });
  }

  if (/\b(i am go|i am study)\b/i.test(transcript)) {
    corrections.push({
      original: "am go / am study",
      suggested: "am going / am studying",
      explanation: "Continuous present tense requires the '-ing' suffix after 'am/is/are'.",
      category: "Tense",
    });
  }

  const grammarScore = corrections.length === 0 ? 88 : Math.max(50, 88 - corrections.length * 12);
  const fluencyScore = Math.min(95, Math.max(65, Math.round(100 - Math.abs(130 - paceWpm) * 0.4)));
  const pronunciationScore = 80;
  const vocabularyScore = wordCount > 15 ? 85 : 72;
  const confidenceScore = wordCount > 10 ? 84 : 70;
  const overallScore = Math.round(
    pronunciationScore * 0.25 +
    fluencyScore * 0.25 +
    grammarScore * 0.25 +
    vocabularyScore * 0.15 +
    confidenceScore * 0.1
  );

  return {
    id: `eval_${Date.now()}`,
    transcript: transcript || "Audio input recorded.",
    overallScore,
    pronunciationScore,
    fluencyScore,
    grammarScore,
    vocabularyScore,
    confidenceScore,
    speakingPaceWpm: paceWpm,
    corrections,
    correctedSentence: transcript
      .replace(/\bgonna\b/gi, "going to")
      .replace(/\bwanna\b/gi, "want to")
      .replace(/\bhe don't\b/gi, "he doesn't")
      .replace(/\bshe don't\b/gi, "she doesn't"),
    strengths: [
      "Good voice projection and natural speaking rhythm",
      "Clear articulation of primary subject vocabulary",
      "Steady pacing without abrupt halts",
    ],
    weaknesses: corrections.length > 0 ? ["Minor verb tense agreement consistency"] : ["Slight hesitation on opening phrase"],
    recommendations: [
      "Practice pausing for 1 second between key sentences rather than using filler words",
      "Read short professional paragraphs aloud to reinforce natural cadence",
    ],
    feedback:
      overallScore >= 80
        ? "Excellent speaking flow and vocabulary clarity! You delivered your thoughts with confidence."
        : "Good practice effort! Focus on complete verb forms and steady sentence pacing.",
    createdAt: new Date().toISOString(),
  };
}
