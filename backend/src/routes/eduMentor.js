import express from "express";
import { chatText, chatCompletion, getTutorModel } from "../lib/aiProvider.js";

const router = express.Router();

function parseJSONLoose(text) {
  if (!text || typeof text !== "string") return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  } else {
    const arrStart = cleaned.indexOf("[");
    const arrEnd = cleaned.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      cleaned = cleaned.slice(arrStart, arrEnd + 1);
    }
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Build personalized system prompt for EduMentor persona
 */
function buildMentorSystemPrompt(studentContext = {}, responseMode = "detailed") {
  const {
    name = "Student",
    eduId = "",
    educationLevel = "",
    schoolOrCollege = "",
    course = "",
    branch = "",
    semester = "",
    subjects = [],
    skills = [],
    weakTopics = [],
    strongTopics = [],
    learningGaps = [],
    recentAccuracy = null,
    careerInterests = [],
  } = studentContext;

  const modeInstructions = {
    simple: "EXPLAIN SIMPLY: Use concise, elementary language, ELI5 style analogies, and clear short bullet points without unnecessary jargon.",
    detailed: "EXPLAIN IN-DEPTH: Provide a comprehensive academic explanation covering underlying principles, mathematical/logical basis, and nuances.",
    with_examples: "PROVIDE CONCRETE EXAMPLES: Ground the explanation with 2-3 practical, real-world examples and code snippets or step-by-step problem illustrations.",
    step_by_step: "STEP-BY-STEP BREAKDOWN: Break down the concept into structured numbered steps (Step 1, Step 2, Step 3), with intermediate sanity checks.",
    exam_focused: "EXAM-FOCUSED: Highlight high-yield points, common board/university exam traps, typical marking scheme expectations, and quick-revision formulas.",
  };

  const selectedModePrompt = modeInstructions[responseMode] || modeInstructions.detailed;

  return `You are 🤖 EduMentor, the student's personal, highly intelligent AI Education Mentor in the DivyangConnect SMART EDUCATION AI platform.

STUDENT PROFILE & CONTEXT:
- Student Name: ${name} ${eduId ? `(EduID: ${eduId})` : ""}
- Academic Level: ${educationLevel || "Undergraduate / School"}
- Institution: ${schoolOrCollege || "Not specified"}
- Course & Branch: ${course || "General"} ${branch ? `(${branch})` : ""} ${semester ? `- Semester ${semester}` : ""}
- Active Subjects: ${Array.isArray(subjects) ? subjects.join(", ") : subjects || "None"}
- Known Skills: ${Array.isArray(skills) ? skills.join(", ") : skills || "General"}
- Topics Needing Improvement (Weak Topics): ${Array.isArray(weakTopics) && weakTopics.length ? weakTopics.join(", ") : "None detected yet"}
- Topics with High Mastery (Strong Topics): ${Array.isArray(strongTopics) && strongTopics.length ? strongTopics.join(", ") : "None detected yet"}
- Learning Gaps: ${Array.isArray(learningGaps) && learningGaps.length ? learningGaps.join("; ") : "None"}
- Recent Quiz Accuracy: ${recentAccuracy != null ? `${recentAccuracy}%` : "Not recorded"}
- Career Aspirations: ${Array.isArray(careerInterests) ? careerInterests.join(", ") : "Technology & Higher Studies"}

MENTOR PERSONA & GUIDELINES:
1. Be encouraging, empathetic, motivating, and intellectually rigorous.
2. ALWAYS relate your advice to the student's actual subjects, syllabus, weak areas, and progress.
3. If the student asks what to study or revise, explicitly check their weak topics and recent gaps to suggest the single highest-impact Next Best Action.
4. Response Mode Constraint: ${selectedModePrompt}
5. Format your output nicely using clean Markdown headers, bullet points, bold highlights, and code blocks where applicable.
6. Always end with an actionable encouragement or a 2-3 question quick check to reinforce learning.`;
}

/**
 * 1. POST /api/edumentor/chat
 * Main AI Mentor conversation endpoint
 */
router.post("/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      studentContext = {},
      responseMode = "detailed",
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required" });
    }

    const systemPrompt = buildMentorSystemPrompt(studentContext, responseMode);

    // Format conversation history for LLM
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const replyText = await chatText({
      model: getTutorModel(),
      messages,
      maxTokens: 2048,
      temperature: 0.6,
    });

    // Suggest follow-up prompts
    const followUps = [
      "Can you give me an example problem on this?",
      "How do I practice this weak topic today?",
      "Create a quick 3-question quiz for me",
      "What is the next topic I should learn?",
    ];

    res.json({
      reply: replyText,
      mode: responseMode,
      followUps,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("EduMentor chat error:", error);
    res.status(500).json({
      error: "EduMentor is temporarily unavailable. Please try again.",
      details: error.message,
    });
  }
});

/**
 * 2. POST /api/edumentor/generate-plan
 * Generates structured daily or multi-day study schedule
 */
router.post("/generate-plan", async (req, res) => {
  try {
    const {
      studentContext = {},
      days = 1,
      availableHoursPerDay = 3,
      targetExam = "Upcoming Semester Exams",
      focusSubjects = [],
      weakTopics = [],
    } = req.body;

    const systemPrompt = `You are EduMentor AI Study Planner. Return ONLY a valid JSON object with no markdown formatting.
Schema:
{
  "title": string,
  "summary": string,
  "estimatedTotalHours": number,
  "dailyPlans": [
    {
      "dayNumber": number,
      "dateLabel": string,
      "focusTheme": string,
      "tasks": [
        {
          "id": string,
          "taskName": string,
          "subject": string,
          "topic": string,
          "durationMinutes": number,
          "difficulty": "Easy" | "Medium" | "Hard",
          "priority": "High" | "Medium" | "Low",
          "learningObjective": string
        }
      ]
    }
  ],
  "mentorTips": [string]
}`;

    const userPrompt = `Generate a ${days}-day personalized study plan for:
Student: ${studentContext.name || "Student"}
Education Level: ${studentContext.educationLevel || "College"}
Target Exam / Goal: ${targetExam}
Available Daily Study Time: ${availableHoursPerDay} hours/day
Focus Subjects: ${focusSubjects.length ? focusSubjects.join(", ") : "All current subjects"}
Weak Areas to prioritze: ${weakTopics.length ? weakTopics.join(", ") : studentContext.weakTopics?.join(", ") || "Core topics"}
Include specific review intervals, practical problem-solving tasks, and short quiz sessions.`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 2500,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed || !parsed.dailyPlans) {
      throw new Error("Failed to parse study plan JSON");
    }

    res.json(parsed);
  } catch (error) {
    console.error("EduMentor generate-plan error:", error);
    // Fallback deterministic plan if LLM is unavailable
    const fallback = {
      title: "Personalized Daily Study Plan",
      summary: "Balanced schedule focusing on active revision, weak topics reinforcement, and practice.",
      estimatedTotalHours: 3,
      dailyPlans: [
        {
          dayNumber: 1,
          dateLabel: "Today",
          focusTheme: "Core Concepts & Weak Area Practice",
          tasks: [
            {
              id: "task-1",
              taskName: "Revise Fundamental Concepts",
              subject: req.body.focusSubjects?.[0] || "Mathematics",
              topic: req.body.weakTopics?.[0] || "Core Theory",
              durationMinutes: 45,
              difficulty: "Medium",
              priority: "High",
              learningObjective: "Review key formulas and conceptual foundations.",
            },
            {
              id: "task-2",
              taskName: "Interactive Problem Solving",
              subject: req.body.focusSubjects?.[0] || "Programming",
              topic: "Problem Practice",
              durationMinutes: 45,
              difficulty: "Hard",
              priority: "High",
              learningObjective: "Solve 10 targeted practice questions.",
            },
            {
              id: "task-3",
              taskName: "Topic Mastery Assessment",
              subject: req.body.focusSubjects?.[1] || "Computer Science",
              topic: "Self-Check Quiz",
              durationMinutes: 30,
              difficulty: "Medium",
              priority: "Medium",
              learningObjective: "Take a 5-question diagnostic quiz.",
            },
          ],
        },
      ],
      mentorTips: [
        "Take a 5-minute break every 30 minutes (Pomodoro technique).",
        "Write down mistake patterns immediately after solving questions.",
      ],
    };
    res.json(fallback);
  }
});

/**
 * 3. POST /api/edumentor/practice-questions
 * Generates personalized practice questions for weak topics
 */
router.post("/practice-questions", async (req, res) => {
  try {
    const {
      subject = "General",
      topic = "Key Concept",
      difficulty = "Medium",
      count = 5,
      studentContext = {},
    } = req.body;

    const systemPrompt = `You are an AI assessment specialist. Return ONLY valid JSON.
Schema:
{
  "subject": string,
  "topic": string,
  "difficulty": string,
  "conceptSummary": string,
  "questions": [
    {
      "id": string,
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number,
      "hint": string,
      "explanation": string,
      "conceptTested": string
    }
  ]
}`;

    const userPrompt = `Generate ${count} high-quality diagnostic practice multiple-choice questions for:
Subject: ${subject}
Topic: ${topic}
Target Difficulty: ${difficulty}
Student Level: ${studentContext.educationLevel || "Undergraduate"}

Make each question test conceptual understanding, clear reasoning, and include actionable hints and explanations.`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 2500,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed || !parsed.questions) {
      throw new Error("Failed to parse practice questions JSON");
    }

    res.json(parsed);
  } catch (error) {
    console.error("EduMentor practice-questions error:", error);
    res.status(500).json({
      error: "Unable to generate practice questions right now.",
      details: error.message,
    });
  }
});

/**
 * 4. POST /api/edumentor/exam-prep
 * Generates full exam preparation roadmap and high yield checklist
 */
router.post("/exam-prep", async (req, res) => {
  try {
    const {
      examName = "Semester Exam",
      examDate = "",
      subjects = [],
      importantTopics = [],
      studentContext = {},
    } = req.body;

    const daysRemaining = examDate
      ? Math.max(1, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 14;

    const systemPrompt = `You are EduMentor Exam Preparation Coach. Return ONLY valid JSON.
Schema:
{
  "examName": string,
  "daysRemaining": number,
  "readinessScore": number,
  "highYieldTopics": [
    { "subject": string, "topic": string, "weightage": string, "priority": "High" | "Medium" }
  ],
  "phaseStrategy": [
    { "phaseName": string, "daysSpan": string, "focus": string, "milestone": string }
  ],
  "revisionPlan": [
    { "day": number, "subject": string, "tasks": [string] }
  ],
  "mentorExamAdvice": [string]
}`;

    const userPrompt = `Create an exam sprint roadmap for:
Exam: ${examName}
Days Left: ${daysRemaining}
Subjects: ${subjects.join(", ") || "Curriculum subjects"}
Key Topics: ${importantTopics.join(", ") || "All core topics"}
Student Weak Areas: ${studentContext.weakTopics?.join(", ") || "General"}
Student Strong Areas: ${studentContext.strongTopics?.join(", ") || "General"}`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 2500,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed) throw new Error("Failed to parse exam prep JSON");

    res.json(parsed);
  } catch (error) {
    console.error("EduMentor exam-prep error:", error);
    res.status(500).json({
      error: "Unable to generate exam prep roadmap.",
      details: error.message,
    });
  }
});

export default router;
