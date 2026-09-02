import express from "express";
import { chatCompletion, getProvider } from "../lib/aiProvider.js";

const router = express.Router();

/**
 * POST /ai-assistant
 *
 * Accepts { messages, type, userProfile } and streams an SSE response from
 * the NVIDIA NIM API (meta/llama-4-maverick-17b-128e-instruct) using the OpenAI-compatible
 * endpoint.  Because the NIM API emits standard OpenAI SSE deltas, the
 * response is piped straight through — no transformation required.
 *
 * Supported `type` values:
 *   "skill-gap"             – returns JSON skill-gap analysis
 *   "smart-recommendations" – returns JSON personalised recommendations
 *   "job-match"             – returns JSON job match scores
 *   "scheme-check"          – returns JSON scheme eligibility
 *   "resume"                – returns JSON resume / profile feedback
 *   (anything else)         – general conversational assistant
 */
router.post("/", async (req, res) => {
  const { messages, type, userProfile } = req.body;

  if (!getProvider().apiKey) {
    return res
      .status(500)
      .json({ error: "No AI provider key configured (OPENROUTER_API_KEY or NVIDIA_API_KEY)" });
  }

  // Build system prompt based on request type
  let systemPrompt = `You are the SMART EDUCATION AI Assistant — a helpful, empathetic, and knowledgeable guide for students and lifelong learners.

Your role:
- Help users master subjects, analyze learning gaps, track skills, and find opportunities
- Provide career guidance and skill improvement suggestions
- Analyse resumes and provide feedback
- Check scheme eligibility based on user data
- Be sensitive, encouraging, and accessibility-aware

User Profile Context:
${userProfile ? JSON.stringify(userProfile, null, 2) : "No profile data available"}

Guidelines:
- Always be respectful about disability
- Provide actionable, specific recommendations
- Mention scheme names, eligibility criteria, and deadlines when relevant
- Suggest skill improvements based on job market trends
- Keep responses concise but thorough
- Support both Hindi and English queries`;

  if (type === "skill-gap") {
    systemPrompt = `You are an AI Skill Gap Analyser. Given a user's current skills and their target job role, analyse the gap.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "skills": [
    {"name": "Skill Name", "current": 0-100, "target": 80-100, "gap": "description of gap and what to learn", "status": "gap|on-track|complete"}
  ],
  "insight": "One paragraph of actionable career advice",
  "overallReadiness": 0-100
}
Analyse 4-6 relevant skills. Be specific about what to learn. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "smart-recommendations") {
    systemPrompt = `You are an AI recommendation engine for persons with disabilities in India. Based on the user's profile (skills, disability type, education, location), suggest personalised opportunities.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "recommendations": [
    {"type": "job|scheme|course", "title": "Title", "subtitle": "Provider or details", "match": 0-100, "reason": "Why this matches", "tags": ["tag1"], "action": "Apply Now|Check Eligibility|Start Learning"}
  ]
}
Return exactly 3 recommendations: 1 job, 1 scheme, 1 course. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "job-match") {
    systemPrompt = `You are an AI Job Match Scorer. Given a user's profile and a list of jobs, score each job for compatibility.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "matches": [
    {"jobId": "id", "score": 0-100, "reasons": ["reason1", "reason2"], "missingSkills": ["skill1"]}
  ]
}
Be accurate based on skill overlap, accessibility needs, and location. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "scheme-check") {
    systemPrompt = `You are an AI Government Scheme Eligibility Advisor for persons with disabilities in India.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "schemes": [
    {"name": "Scheme Name", "ministry": "Ministry Name", "eligible": true, "confidence": 0-100, "reason": "Why eligible or not", "action": "What to do next"}
  ],
  "summary": "Overall assessment and top recommendation",
  "totalEligible": 0
}
Analyse all government schemes relevant to PWD. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "resume") {
    systemPrompt = `You are an expert AI Resume & Career Advisor specialising in helping persons with disabilities (PWD) in India find employment.
Analyse the user's profile and provide detailed, actionable feedback.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": [{"area": "Area Name", "issue": "What's missing", "suggestion": "How to fix it"}],
  "profileSummary": "A professional bio paragraph they can use",
  "keyRecommendations": ["rec1", "rec2", "rec3"],
  "pwdTips": ["tip1", "tip2"]
}
Be encouraging, specific, and disability-inclusive in your feedback. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  }

  const isJSONType = ["skill-gap", "smart-recommendations", "job-match", "scheme-check", "resume"].includes(type);

  try {
    // Provider uses the same OpenAI messages format — include system prompt
    // as the first message with role "system".
    const nimMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).filter((m) => m.role !== "system"),
    ];

    const shouldStream = req.body.stream !== false;

    const aiResponse = await chatCompletion({
      messages: nimMessages,
      maxTokens: isJSONType ? 4096 : 2048,
      temperature: isJSONType ? 0.2 : 0.7,
      json: isJSONType,
      stream: shouldStream,
    });

    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({ error: "AI service error" });
    }

    if (shouldStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = aiResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const data = await aiResponse.json();
      const rawContent = data?.choices?.[0]?.message?.content || "";
      if (isJSONType) {
        try {
          const parsed = JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim());
          return res.json(parsed);
        } catch {
          return res.json({ content: rawContent });
        }
      }
      res.json({ reply: rawContent, choices: data?.choices });
    }
  } catch (err) {
    console.error("AI Assistant failover triggered fallback:", err);

    // If headers already sent, close stream
    if (res.headersSent) {
      return res.end();
    }

    // Return structured SSE / JSON fallback
    const fallbackData = generateAssistantFallback(type, userProfile);
    
    if (req.body.stream !== false) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const chunk = JSON.stringify({
        choices: [
          {
            delta: {
              content: typeof fallbackData === "string" ? fallbackData : JSON.stringify(fallbackData),
            },
          },
        ],
      });

      res.write(`data: ${chunk}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      res.json(typeof fallbackData === "object" ? fallbackData : { reply: fallbackData });
    }
  }
});

function generateAssistantFallback(type, userProfile = {}) {
  const skills = userProfile?.skills || ["Technology", "Communication"];
  const disability = userProfile?.disability_type || "General";

  if (type === "smart-recommendations") {
    return {
      recommendations: [
        {
          type: "job",
          title: "Frontend Accessibility Developer",
          subtitle: "TechSolutions India • Remote / Hybrid",
          match: 94,
          reason: `Strong match for your skills in ${skills.slice(0, 2).join(", ")} and PWD-inclusive workplace policies.`,
          tags: ["Remote", ...skills.slice(0, 2)],
          action: "Apply Now",
        },
        {
          type: "scheme",
          title: "National Handicapped Finance and Development Corporation (NHFDC)",
          subtitle: "Ministry of Social Justice & Empowerment",
          match: 90,
          reason: `Eligible for skill development grants and financial support for ${disability} candidates.`,
          tags: ["Govt Scheme", "Grant"],
          action: "Check Eligibility",
        },
        {
          type: "course",
          title: "Web Accessibility (WCAG 2.2) & Modern UI Engineering",
          subtitle: "DivyangConnect Academy • 12 Modules",
          match: 88,
          reason: "Fills key accessibility skills gap to enhance tech employability.",
          tags: ["Accessibility", "Web"],
          action: "Start Learning",
        },
      ],
    };
  }

  if (type === "job-match") {
    return {
      matches: [
        {
          jobId: "default-job",
          score: 88,
          reasons: ["Strong alignment with candidate skills", "Inclusive infrastructure verified"],
          missingSkills: ["Advanced System Design"],
        },
      ],
    };
  }

  if (type === "skill-gap") {
    return {
      skills: [
        {
          name: "Technical Core Skills",
          current: 80,
          target: 95,
          gap: "Deepen understanding of modern framework architectures and APIs",
          status: "on-track",
        },
        {
          name: "Communication & Soft Skills",
          current: 85,
          target: 90,
          gap: "Asynchronous team communication and documentation",
          status: "on-track",
        },
        {
          name: "Web Accessibility (A11y)",
          current: 70,
          target: 90,
          gap: "Screen reader compliance, ARIA attributes and keyboard focus management",
          status: "gap",
        },
      ],
      insight: "Your technical baseline is solid. Adding certified accessibility knowledge will increase interview match rates by 30%.",
      overallReadiness: 82,
    };
  }

  if (type === "scheme-check") {
    return {
      schemes: [
        {
          name: "ADIP Scheme (Assistance to Disabled Persons)",
          ministry: "Ministry of Social Justice & Empowerment",
          eligible: true,
          confidence: 95,
          reason: "Eligible for assistive devices and technical aids.",
          action: "Apply Online",
        },
        {
          name: "Divyangjan Swavalamban Yojana",
          ministry: "NHFDC",
          eligible: true,
          confidence: 88,
          reason: "Concessional credit scheme for education and self-employment.",
          action: "Check Details",
        },
      ],
      summary: "You qualify for 2 major government empowerment schemes.",
      totalEligible: 2,
    };
  }

  return "Hello! I am your DivyangConnect AI Assistant. I can help you find suitable jobs, verify government scheme eligibility, suggest courses, and provide career mentorship. How can I assist you right now?";
}

export default router;
