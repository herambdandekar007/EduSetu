import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = `You are the Smart Portal AI Assistant — a helpful, empathetic, and knowledgeable guide for persons with disabilities (PWD) in India.

Your role:
- Help users find suitable jobs, government schemes, courses, and services
- Provide career guidance and skill improvement suggestions
- Analyze resumes and provide feedback
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
      systemPrompt = `You are an AI Skill Gap Analyzer. Given a user's current skills and their target job role, analyze the gap.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "skills": [
    {"name": "Skill Name", "current": 0-100, "target": 80-100, "gap": "description of gap and what to learn", "status": "gap|on-track|complete"}
  ],
  "insight": "One paragraph of actionable career advice",
  "overallReadiness": 0-100
}
Analyze 4-6 relevant skills. Be specific about what to learn. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
    } else if (type === "smart-recommendations") {
      systemPrompt = `You are an AI recommendation engine for persons with disabilities in India. Based on the user's profile (skills, disability type, education, location), suggest personalized opportunities.
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
      systemPrompt += `\n\nYou are checking government scheme eligibility. Based on the user's disability type, income, age, and education, determine which schemes they qualify for.`;
    } else if (type === "resume") {
      systemPrompt += `\n\nYou are reviewing the user's resume. Provide constructive feedback on improving it for PWD-friendly job applications.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
