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

  return `You are 🤖 EduMentor, the student's personal, highly intelligent AI Education Mentor in the EduSetu SMART EDUCATION AI platform.

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

    const regenNonce = Date.now();
    const userPrompt = `Generate a ${days}-day personalized study plan for:
Student: ${studentContext.name || "Student"}
Education Level: ${studentContext.educationLevel || "College"}
Course/Major: ${studentContext.course || "Engineering / Science"}
Target Exam / Goal: ${targetExam}
Available Daily Study Time: ${availableHoursPerDay} hours/day
Focus Subjects: ${focusSubjects.length ? focusSubjects.join(", ") : (studentContext.subjects?.length ? studentContext.subjects.join(", ") : "All current subjects")}
Weak Areas to prioritize: ${weakTopics.length ? weakTopics.join(", ") : (studentContext.weakTopics?.length ? studentContext.weakTopics.join(", ") : "Core topics")}
Regeneration Nonce: ${regenNonce}-${Math.random()}
Instruction: Ensure the plan is unique, creative, and action-oriented. Rotate subjects, provide varied task names, realistic durations (25-50 mins), specific conceptual learning objectives, and 2 helpful mentor study tips.`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 2500,
      temperature: 0.7,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed || !parsed.dailyPlans) {
      throw new Error("Failed to parse study plan JSON");
    }

    res.json(parsed);
  } catch (error) {
    console.error("EduMentor generate-plan error:", error);
    // Dynamic rotating fallback plan if LLM is unavailable
    const subs = req.body.focusSubjects?.length ? req.body.focusSubjects : (req.body.studentContext?.subjects?.length ? req.body.studentContext.subjects : ["Data Structures", "Mathematics", "Operating Systems"]);
    const weaks = req.body.weakTopics?.length ? req.body.weakTopics : (req.body.studentContext?.weakTopics?.length ? req.body.studentContext.weakTopics : ["Dynamic Programming", "Calculus", "Trees & Graphs"]);
    const studentName = req.body.studentContext?.name || "Student";
    const rand = Math.floor(Math.random() * 4);
    const sub1 = subs[rand % subs.length] || "Core Subject";
    const sub2 = subs[(rand + 1) % subs.length] || subs[0] || "Secondary Subject";
    const weak1 = weaks[rand % weaks.length] || "Key Principles";
    const weak2 = weaks[(rand + 1) % weaks.length] || "Problem Solving";

    const dynamicTemplates = [
      {
        title: "Personalized Daily Study & Revision Plan",
        summary: `Balanced schedule customized for ${studentName}, emphasizing active recall in ${weak1} and hands-on practice.`,
        focusTheme: "Core Concept Mastery & Weakness Elimination",
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            taskName: `Revise Key Formulas & Theory: ${weak1}`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 40,
            difficulty: "Medium",
            priority: "High",
            learningObjective: `Review high-yield conceptual foundations and definitions in ${weak1}.`,
          },
          {
            id: `task-${Date.now()}-2`,
            taskName: `Targeted Problem Solving Drill: ${weak1}`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 50,
            difficulty: "Hard",
            priority: "High",
            learningObjective: "Solve 8-10 analytical problem sets and analyze edge cases.",
          },
          {
            id: `task-${Date.now()}-3`,
            taskName: `Advance & Consolidate: ${sub2}`,
            subject: sub2,
            topic: weak2,
            durationMinutes: 40,
            difficulty: "Medium",
            priority: "Medium",
            learningObjective: `Complete structured summary notes and worked examples for ${weak2}.`,
          },
          {
            id: `task-${Date.now()}-4`,
            taskName: `Self-Check Diagnostic Quiz: ${sub1}`,
            subject: sub1,
            topic: "Retention Check",
            durationMinutes: 20,
            difficulty: "Easy",
            priority: "Low",
            learningObjective: "Take a quick 5-question diagnostic quiz to verify retention.",
          },
        ],
      },
      {
        title: "Intensive Practice & Problem Sprint",
        summary: `High-yield problem solving sprint tailored for ${studentName}, focusing on ${sub1} and ${sub2}.`,
        focusTheme: "Analytical Problem Solving & Speed Drills",
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            taskName: `Worked Examples Breakdown: ${sub1}`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 45,
            difficulty: "Medium",
            priority: "High",
            learningObjective: `Deconstruct 5 standard university/exam questions step-by-step in ${weak1}.`,
          },
          {
            id: `task-${Date.now()}-2`,
            taskName: `Timed Mock Exercise: ${weak1}`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 45,
            difficulty: "Hard",
            priority: "High",
            learningObjective: "Practice solving multi-step questions under 45-minute timed exam constraints.",
          },
          {
            id: `task-${Date.now()}-3`,
            taskName: `Concept Mapping & Flashcards: ${sub2}`,
            subject: sub2,
            topic: weak2,
            durationMinutes: 30,
            difficulty: "Easy",
            priority: "Medium",
            learningObjective: `Review active recall flashcards and create a 1-page formula cheat sheet.`,
          },
        ],
      },
      {
        title: "Exam Readiness & Mistake Elimination Plan",
        summary: `Focused session targeting error logs, tricky concepts in ${weak1}, and syllabus milestones for ${studentName}.`,
        focusTheme: "Mistake Log Review & High-Weightage Revision",
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            taskName: `Mistake Journal & Error Review: ${weak1}`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 35,
            difficulty: "Medium",
            priority: "High",
            learningObjective: `Analyze past quiz mistakes and solidify correct problem patterns in ${weak1}.`,
          },
          {
            id: `task-${Date.now()}-2`,
            taskName: `Core Derivation & Theorem Mastery: ${sub2}`,
            subject: sub2,
            topic: weak2,
            durationMinutes: 50,
            difficulty: "Hard",
            priority: "High",
            learningObjective: `Write out complete mathematical/logical derivations without referencing notes.`,
          },
          {
            id: `task-${Date.now()}-3`,
            taskName: `Diagnostic Self-Assessment: ${sub1}`,
            subject: sub1,
            topic: "Diagnostic Check",
            durationMinutes: 25,
            difficulty: "Medium",
            priority: "Medium",
            learningObjective: "Complete a 10-question mixed multiple-choice assessment with instant review.",
          },
        ],
      },
      {
        title: "Applied Concept & Comprehensive Review Plan",
        summary: `Holistic schedule for ${studentName} combining theoretical depth in ${sub1} with rapid practice in ${sub2}.`,
        focusTheme: "Theoretical Depth & Rapid Active Recall",
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            taskName: `Deep Concept Synthesis: ${sub1}`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 45,
            difficulty: "Medium",
            priority: "High",
            learningObjective: `Break down the governing equations, constraints, and architecture of ${weak1}.`,
          },
          {
            id: `task-${Date.now()}-2`,
            taskName: `Practical Implementation & Coding Drill`,
            subject: sub1,
            topic: weak1,
            durationMinutes: 45,
            difficulty: "Hard",
            priority: "High",
            learningObjective: "Implement core algorithms or solve complex applied scenario exercises.",
          },
          {
            id: `task-${Date.now()}-3`,
            taskName: `Active Recall Drill & Summary: ${sub2}`,
            subject: sub2,
            topic: weak2,
            durationMinutes: 30,
            difficulty: "Medium",
            priority: "Medium",
            learningObjective: `Synthesize chapter takeaways into concise bullet points and review flashcards.`,
          },
        ],
      },
    ];

    const chosen = dynamicTemplates[rand % dynamicTemplates.length];
    const tips = [
      "Use the Pomodoro technique: 25 minutes of intense focus followed by a 5-minute break.",
      "Review mistakes immediately after solving practice questions.",
      "Explain key concepts out loud as if teaching someone else (Feynman Technique).",
      "Interleave practice between two subjects to boost long-term retention.",
    ];

    const fallback = {
      title: chosen.title,
      summary: chosen.summary,
      estimatedTotalHours: req.body.availableHoursPerDay || 3,
      dailyPlans: [
        {
          dayNumber: 1,
          dateLabel: "Today",
          focusTheme: chosen.focusTheme,
          tasks: chosen.tasks,
        },
      ],
      mentorTips: [tips[rand % tips.length], tips[(rand + 1) % tips.length]],
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
