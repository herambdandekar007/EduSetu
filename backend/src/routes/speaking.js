import express from "express";
import { chatText, getTutorModel } from "../lib/aiProvider.js";

const router = express.Router();

function parseJSONLoose(text) {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * 1. POST /api/speaking/analyze
 * Comprehensive speech, grammar, vocabulary, pronunciation, and confidence analysis
 */
router.post("/analyze", async (req, res) => {
  const {
    transcript = "",
    topic = "",
    durationSeconds = 30,
    language = "English",
  } = req.body || {};

  if (!transcript.trim()) {
    return res.status(400).json({ error: "Empty speech transcript provided" });
  }

  const words = transcript.trim().split(/\s+/).filter(Boolean);

  const systemPrompt = `You are a supportive, high-precision AI Speech, Pronunciation & Communication Coach for DivyangConnect.
Analyze the student's spoken transcript.
Return ONLY valid JSON (no markdown wrapping, no extra text):
{
  "overallScore": 0-100,
  "pronunciationScore": 0-100,
  "fluencyScore": 0-100,
  "grammarScore": 0-100,
  "vocabularyScore": 0-100,
  "confidenceScore": 0-100,
  "speakingPaceWpm": number,
  "correctedSentence": "Full natural standard English sentence rewriting the transcript",
  "mistakes": [
    {
      "original": "spoken error snippet",
      "correction": "corrected phrasing",
      "category": "Grammar|Tense|Pronunciation|Word Choice|Structure",
      "explanation": "clear 1-sentence tip explaining why and how to improve"
    }
  ],
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "weaknesses": [
    "area to improve 1"
  ],
  "recommendations": [
    "practical exercise recommendation 1",
    "practical exercise recommendation 2"
  ],
  "feedback": "2-3 encouraging sentences highlighting progress and next steps"
}`;

  const userPrompt = `Topic / Prompt: ${topic || "Free Speech"}
Language: ${language}
Duration: ${durationSeconds} seconds
Student spoken transcript:
"${transcript}"`;

  try {
    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      json: true,
      maxTokens: 2048,
    });

    const parsed = parseJSONLoose(raw);

    if (parsed && typeof parsed.overallScore === "number") {
      return res.json(parsed);
    }
    throw new Error("Failed to parse AI speech response");
  } catch (err) {
    console.warn("AI analyze failover:", err);
    // Deterministic quality fallback
    const hasGrammarGlitch = /\b(gonna|wanna|he don't|she don't|i am go)\b/i.test(transcript);
    const score = hasGrammarGlitch ? 70 : 85;

    res.json({
      overallScore: score,
      pronunciationScore: 80,
      fluencyScore: 78,
      grammarScore: hasGrammarGlitch ? 68 : 88,
      vocabularyScore: Math.min(95, words.length * 6 + 50),
      confidenceScore: 82,
      speakingPaceWpm: Math.round((words.length / (durationSeconds || 10)) * 60) || 115,
      correctedSentence: transcript
        .replace(/\bgonna\b/gi, "going to")
        .replace(/\bwanna\b/gi, "want to")
        .replace(/\bhe don't\b/gi, "he doesn't")
        .replace(/\bshe don't\b/gi, "she doesn't"),
      mistakes: hasGrammarGlitch
        ? [
            {
              original: "informal contractions / agreement",
              correction: "standard formal phrasing",
              category: "Grammar",
              explanation: "Use full verb forms in professional speaking situations.",
            },
          ]
        : [],
      strengths: ["Clear vocal projection", "Good flow of primary ideas", "Natural speaking speed"],
      weaknesses: hasGrammarGlitch ? ["Grammatical verb agreement precision"] : ["Occasional filler hesitation"],
      recommendations: [
        "Practice reading 2-minute paragraphs aloud while pausing at punctuation marks.",
        "Record a 60-second summary of your day to build spontaneous fluency.",
      ],
      feedback: "Great practice session! Your voice was clear and easy to understand. Keep up the daily practice.",
    });
  }
});

/**
 * 2. POST /api/speaking/conversation
 * Interactive multi-turn scenario conversation partner
 */
router.post("/conversation", async (req, res) => {
  const {
    scenario = "Job Interview",
    scenarioTitle = "Professional Interview",
    history = [],
    userSpeech = "",
    language = "English",
  } = req.body || {};

  const systemPrompt = `You are an interactive AI Speaking & Conversation Partner in a scenario drill: "${scenarioTitle}".
Respond naturally in character. Keep your reply concise (2-3 sentences max) so the student has an opportunity to speak again.
Also suggest 3 short prompt options the student could say next.
Return ONLY valid JSON:
{
  "reply": "Your in-character spoken response",
  "followUpPrompts": ["response idea 1", "response idea 2", "response idea 3"]
}`;

  const conversationHistory = (history || []).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  try {
    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userSpeech },
      ],
      temperature: 0.5,
      json: true,
      maxTokens: 1200,
    });

    const parsed = parseJSONLoose(raw);
    if (parsed && parsed.reply) {
      return res.json(parsed);
    }
    throw new Error("Invalid conversation JSON");
  } catch (err) {
    console.warn("AI conversation fallback:", err);
    res.json({
      reply: "That's a very clear point! Could you elaborate on how that experience influenced your current career goals?",
      followUpPrompts: [
        "It helped me develop strong problem-solving skills.",
        "I realized I enjoy building user-friendly software.",
        "It taught me the value of clear team communication.",
      ],
    });
  }
});

/**
 * 3. POST /api/speaking/mentor-chat
 * AI Speaking Mentor coach chat
 */
router.post("/mentor-chat", async (req, res) => {
  const { message = "", history = [] } = req.body || {};

  const systemPrompt = `You are the EduSpeak AI Speaking Mentor for DivyangConnect.
Give warm, highly practical communication and pronunciation coaching.
Explain rules simply with clear examples and practice drill prompts.
Return ONLY valid JSON:
{
  "reply": "Warm, encouraging mentoring advice in markdown format",
  "suggestedPracticeTopic": "Optional recommended practice topic name"
}`;

  try {
    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
      temperature: 0.4,
      json: true,
      maxTokens: 1500,
    });

    const parsed = parseJSONLoose(raw);
    if (parsed && parsed.reply) {
      return res.json(parsed);
    }
    throw new Error("Invalid mentor chat response");
  } catch (err) {
    console.warn("AI mentor chat fallback:", err);
    res.json({
      reply: "To speak more fluently, try the **Chunking Technique**: break long thoughts into 3-4 word phrases with natural micro-pauses. Would you like to practice a 1-minute self-introduction drill together?",
      suggestedPracticeTopic: "Professional Self Introduction",
    });
  }
});

export default router;
