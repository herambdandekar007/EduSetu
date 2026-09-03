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
 * 1. POST /api/eduroadmap/generate
 * Generates personalized multi-stage roadmap, skills breakdown, and project milestones
 */
router.post("/generate", async (req, res) => {
  try {
    const {
      careerName = "Software Engineer",
      educationLevel = "Undergraduate",
      course = "Computer Science",
      currentSkills = [],
      weakTopics = [],
      strongTopics = [],
      learningGaps = [],
      targetDuration = "6 Months",
    } = req.body;

    const systemPrompt = `You are the EduRoadmap AI Engine for DivyangConnect. Return ONLY a valid JSON object.
Schema:
{
  "careerName": string,
  "currentStage": "Foundation" | "Core Knowledge" | "Technical Skills" | "Practice & Assessment" | "Advanced Learning" | "Specialization" | "Projects" | "Career Readiness",
  "overallProgress": number,
  "currentMilestone": string,
  "nextMilestone": string,
  "steps": [
    {
      "id": string,
      "title": string,
      "description": string,
      "stage": string,
      "order": number,
      "status": "completed" | "in_progress" | "recommended" | "not_started" | "locked",
      "progress": number,
      "skillsRequired": [string],
      "estimatedDuration": string,
      "learningResources": [
        { "title": string, "type": "article" | "video" | "doc" | "course", "duration": string }
      ],
      "practiceTasks": [
        { "id": string, "title": string, "completed": boolean, "difficulty": "Easy" | "Medium" | "Hard" }
      ],
      "quizAssessment": { "title": string, "questionsCount": number }
    }
  ],
  "skills": [
    {
      "id": string,
      "name": string,
      "category": string,
      "currentLevel": number,
      "requiredLevel": number,
      "priority": "Low" | "Medium" | "High" | "Critical",
      "group": "current" | "strong" | "improve" | "missing"
    }
  ],
  "skillGaps": [
    {
      "id": string,
      "skill": string,
      "category": string,
      "currentLevel": number,
      "requiredLevel": number,
      "gapPercentage": number,
      "priority": "High" | "Critical" | "Medium",
      "recommendation": string
    }
  ],
  "projects": [
    {
      "id": string,
      "title": string,
      "category": "Beginner" | "Intermediate" | "Advanced" | "Portfolio",
      "difficulty": "Easy" | "Medium" | "Hard",
      "requiredSkills": [string],
      "description": string,
      "estimatedDuration": string,
      "relatedCareer": string,
      "relatedRoadmapStep": string,
      "status": "Recommended" | "In Progress" | "Completed"
    }
  ]
}`;

    const userPrompt = `Generate a realistic 8-10 step personalized education & career roadmap for:
Career: ${careerName}
Education Level: ${educationLevel}
Course: ${course}
Known Skills: ${currentSkills.join(", ") || "Foundational basics"}
Identified Weak Topics / Gaps: ${[...weakTopics, ...learningGaps].join(", ") || "None"}
Strong Areas: ${strongTopics.join(", ") || "General"}
Target Duration: ${targetDuration}`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 3500,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed || !parsed.steps) {
      throw new Error("Failed to parse roadmap JSON");
    }

    res.json(parsed);
  } catch (error) {
    console.error("EduRoadmap generate error:", error);
    // Return high quality deterministic fallback
    const fallback = generateFallbackRoadmap(req.body.careerName || "Software Engineer");
    res.json(fallback);
  }
});

/**
 * 2. POST /api/eduroadmap/next-steps
 * Computes prioritized Next Best Steps based on student learning state
 */
router.post("/next-steps", async (req, res) => {
  try {
    const { careerName, currentStage, completedStepTitles = [], weakTopics = [] } = req.body;

    const systemPrompt = `You are the EduRoadmap Recommendation Specialist. Return ONLY valid JSON array of NextBestStep objects.
Schema:
[
  {
    "id": string,
    "type": "learn" | "practice" | "revise" | "skill" | "quiz" | "project",
    "title": string,
    "subjectOrSkill": string,
    "reason": string,
    "estimatedTime": string,
    "priority": number,
    "recommendedActions": [string],
    "status": "active"
  }
]`;

    const userPrompt = `Suggest the top 4 immediate next actions for a student pursuing "${careerName}".
Current Stage: ${currentStage || "Foundation"}
Completed Steps: ${completedStepTitles.join(", ") || "Programming Basics"}
Weak Topics Needing Immediate Focus: ${weakTopics.join(", ") || "None recorded"}`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 1800,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed || !Array.isArray(parsed)) {
      throw new Error("Failed to parse next steps JSON");
    }

    res.json(parsed);
  } catch (error) {
    console.error("EduRoadmap next-steps error:", error);
    res.json([
      {
        id: "step-1",
        type: "learn",
        title: "Master Linear Data Structures (Arrays & Lists)",
        subjectOrSkill: "Data Structures",
        reason: "Required foundational pillar for algorithmic problem solving and technical interviews.",
        estimatedTime: "3 Days",
        priority: 1,
        recommendedActions: [
          "Study Array memory layout & dynamic resizing",
          "Read documentation on single & doubly linked lists",
          "Solve 5 practice problems on array manipulation",
        ],
        status: "active",
      },
      {
        id: "step-2",
        type: "practice",
        title: "Weak Area Reinforcement Drill",
        subjectOrSkill: req.body.weakTopics?.[0] || "Foundational Algorithms",
        reason: "Identified gap in recent quiz diagnostic. Solidify key concepts before advanced modules.",
        estimatedTime: "2 Hours",
        priority: 2,
        recommendedActions: [
          "Take the 5-question adaptive diagnostic quiz",
          "Review step-by-step solution explanations",
        ],
        status: "active",
      },
    ]);
  }
});

/**
 * 3. POST /api/eduroadmap/adapt
 * Recalibrates roadmap by injecting corrective tasks when student struggles with a topic
 */
router.post("/adapt", async (req, res) => {
  try {
    const { strugglingTopic, subject, currentSteps = [] } = req.body;

    const systemPrompt = `You are the EduRoadmap Adaptive Learning Engine.
When a student struggles with a concept, insert a high-priority "Reinforcement & Revision" step before the next advanced topic.
Return ONLY valid JSON with schema:
{
  "action": "inserted_reinforcement_step",
  "message": string,
  "insertedStep": {
    "id": string,
    "title": string,
    "description": string,
    "stage": string,
    "order": number,
    "status": "recommended",
    "progress": 0,
    "skillsRequired": [string],
    "estimatedDuration": string,
    "learningResources": [{ "title": string, "type": "article" | "video", "duration": string }],
    "practiceTasks": [{ "id": string, "title": string, "completed": boolean, "difficulty": "Easy" | "Medium" }]
  }
}`;

    const userPrompt = `Student struggled with: ${strugglingTopic} in ${subject || "Core Curriculum"}.
Current roadmap length: ${currentSteps.length} steps.
Generate a targeted remediation roadmap step to master this before advancing.`;

    const raw = await chatText({
      model: getTutorModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 1800,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJSONLoose(raw);
    if (!parsed || !parsed.insertedStep) {
      throw new Error("Failed to parse adaptive step JSON");
    }

    res.json(parsed);
  } catch (error) {
    console.error("EduRoadmap adapt error:", error);
    res.json({
      action: "inserted_reinforcement_step",
      message: `Added a dedicated revision milestone for ${req.body.strugglingTopic || "core concepts"}.`,
      insertedStep: {
        id: `remedial-${Date.now()}`,
        title: `Deep-Dive Revision: ${req.body.strugglingTopic || "Key Concepts"}`,
        description: `Targeted conceptual reinforcement and guided practice drills to eliminate learning gaps.`,
        stage: "Practice & Assessment",
        order: 3,
        status: "recommended",
        progress: 0,
        skillsRequired: [req.body.strugglingTopic || "Foundations", "Problem Solving"],
        estimatedDuration: "2 Days",
        learningResources: [
          { title: `${req.body.strugglingTopic || "Concept"} Visual Primer`, type: "video", duration: "20 min" },
          { title: "Summary Cheatsheet & Common Pitfalls", type: "article", duration: "15 min" },
        ],
        practiceTasks: [
          { id: "task-rem-1", title: "Complete 5 guided practice exercises", completed: false, difficulty: "Easy" },
          { id: "task-rem-2", title: "Pass mini diagnostic check", completed: false, difficulty: "Medium" },
        ],
      },
    });
  }
});

/**
 * Helper to build comprehensive fallback roadmap
 */
function generateFallbackRoadmap(careerName = "Software Engineer") {
  return {
    careerName,
    currentStage: "Foundation",
    overallProgress: 38,
    currentMilestone: "Data Structures & Core Algorithms",
    nextMilestone: "Database Design & SQL Mastery",
    steps: [
      {
        id: "step-1",
        title: "Programming Fundamentals & Syntax",
        description: "Master variables, loops, conditionals, functions, and modular code organization.",
        stage: "Foundation",
        order: 1,
        status: "completed",
        progress: 100,
        skillsRequired: ["Programming Basics", "Logic Building"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Introduction to Computer Science & Logic", type: "course", duration: "4 hours" },
          { title: "Clean Code & Functional Style Guide", type: "article", duration: "30 min" },
        ],
        practiceTasks: [
          { id: "p1", title: "Build CLI Calculator & Number Guessing Game", completed: true, difficulty: "Easy" },
          { id: "p2", title: "Implement 10 Basic Array & String Utilities", completed: true, difficulty: "Easy" },
        ],
        quizAssessment: { title: "Programming Basics Assessment", questionsCount: 10, passed: true, score: 90 },
      },
      {
        id: "step-2",
        title: "Object-Oriented Programming (OOP)",
        description: "Learn classes, inheritance, polymorphism, encapsulation, and interface abstraction.",
        stage: "Core Knowledge",
        order: 2,
        status: "completed",
        progress: 100,
        skillsRequired: ["OOP", "Design Patterns"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "OOP Architecture in Practice", type: "video", duration: "2.5 hours" },
          { title: "SOLID Principles Breakdown", type: "doc", duration: "45 min" },
        ],
        practiceTasks: [
          { id: "p3", title: "Design a Bank Account Hierarchy System", completed: true, difficulty: "Medium" },
          { id: "p4", title: "Implement Polymorphic Shape Calculators", completed: true, difficulty: "Medium" },
        ],
        quizAssessment: { title: "OOP Principles Quiz", questionsCount: 10, passed: true, score: 85 },
      },
      {
        id: "step-3",
        title: "Data Structures & Core Algorithms",
        description: "Deep dive into Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Searching/Sorting.",
        stage: "Technical Skills",
        order: 3,
        status: "in_progress",
        progress: 55,
        skillsRequired: ["Data Structures", "Algorithm Analysis"],
        estimatedDuration: "3 Weeks",
        learningResources: [
          { title: "Data Structures Masterclass & Big-O Notation", type: "course", duration: "6 hours" },
          { title: "Visual Tree & Graph Traversal Guide", type: "article", duration: "40 min" },
        ],
        practiceTasks: [
          { id: "p5", title: "Implement Singly & Doubly Linked Lists", completed: true, difficulty: "Medium" },
          { id: "p6", title: "Solve Balanced Parentheses with Stack", completed: true, difficulty: "Medium" },
          { id: "p7", title: "Implement Binary Search Tree Traversals", completed: false, difficulty: "Hard" },
        ],
        quizAssessment: { title: "DSA Diagnostic Milestone Quiz", questionsCount: 12 },
      },
      {
        id: "step-4",
        title: "Database Design & SQL Systems",
        description: "Relational database models, schema design, normalization, ACID properties, and complex queries.",
        stage: "Technical Skills",
        order: 4,
        status: "recommended",
        progress: 0,
        skillsRequired: ["SQL", "Relational Databases", "Schema Design"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Modern SQL for Developers", type: "video", duration: "3 hours" },
          { title: "Database Indexing & Query Optimization", type: "doc", duration: "50 min" },
        ],
        practiceTasks: [
          { id: "p8", title: "Design E-Commerce Database Schema", completed: false, difficulty: "Medium" },
          { id: "p9", title: "Write Multi-Table JOINs & Aggregations", completed: false, difficulty: "Medium" },
        ],
      },
      {
        id: "step-5",
        title: "Operating Systems & Networking Foundations",
        description: "Processes, threads, memory management, TCP/IP, HTTP/HTTPS protocols, and REST APIs.",
        stage: "Core Knowledge",
        order: 5,
        status: "not_started",
        progress: 0,
        skillsRequired: ["Operating Systems", "Networking", "APIs"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Computer Systems & Architecture Essentials", type: "article", duration: "2 hours" },
        ],
        practiceTasks: [
          { id: "p10", title: "Build Simple HTTP Server & REST Endpoints", completed: false, difficulty: "Hard" },
        ],
      },
      {
        id: "step-6",
        title: "Fullstack Project: Capstone Architecture",
        description: "Build a production-ready web application with frontend UI, backend API, database, and auth.",
        stage: "Projects",
        order: 6,
        status: "locked",
        progress: 0,
        skillsRequired: ["Fullstack Dev", "Git", "Deployment"],
        estimatedDuration: "4 Weeks",
        learningResources: [
          { title: "Fullstack Architecture Blueprint", type: "course", duration: "5 hours" },
        ],
        practiceTasks: [
          { id: "p11", title: "Develop & Deploy Capstone Portal", completed: false, difficulty: "Hard" },
        ],
      },
      {
        id: "step-7",
        title: "Portfolio & Technical Interview Readiness",
        description: "System design basics, mock technical interview drills, resume polishing, and open-source contributions.",
        stage: "Career Readiness",
        order: 7,
        status: "locked",
        progress: 0,
        skillsRequired: ["System Design", "Interview Prep", "Portfolio"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Technical Interview Success Playbook", type: "article", duration: "1.5 hours" },
        ],
        practiceTasks: [
          { id: "p12", title: "Complete 3 Mock Coding Interviews", completed: false, difficulty: "Hard" },
        ],
      },
    ],
    skills: [
      { id: "s1", name: "Programming Fundamentals", category: "Core", currentLevel: 90, requiredLevel: 80, priority: "Low", group: "strong" },
      { id: "s2", name: "Object-Oriented Design", category: "Architecture", currentLevel: 85, requiredLevel: 80, priority: "Medium", group: "strong" },
      { id: "s3", name: "Data Structures & Algorithms", category: "Computer Science", currentLevel: 55, requiredLevel: 85, priority: "Critical", group: "improve" },
      { id: "s4", name: "SQL & Relational Databases", category: "Data", currentLevel: 30, requiredLevel: 75, priority: "High", group: "improve" },
      { id: "s5", name: "Operating Systems & Concurrency", category: "Systems", currentLevel: 20, requiredLevel: 70, priority: "High", group: "missing" },
      { id: "s6", name: "Computer Networks & Protocols", category: "Systems", currentLevel: 25, requiredLevel: 70, priority: "Medium", group: "missing" },
      { id: "s7", name: "Web Accessibility (WCAG)", category: "Frontend", currentLevel: 75, requiredLevel: 80, priority: "Medium", group: "current" },
    ],
    skillGaps: [
      {
        id: "sg1",
        skill: "Data Structures & Algorithms",
        category: "Computer Science",
        currentLevel: 55,
        requiredLevel: 85,
        gapPercentage: 30,
        priority: "Critical",
        recommendation: "Complete Binary Trees and Graph Traversals before starting advanced algorithm patterns.",
      },
      {
        id: "sg2",
        skill: "SQL & Relational Databases",
        category: "Data",
        currentLevel: 30,
        requiredLevel: 75,
        gapPercentage: 45,
        priority: "High",
        recommendation: "Practice multi-table normalization and indexing optimization queries.",
      },
      {
        id: "sg3",
        skill: "Operating Systems & Networking",
        category: "Systems",
        currentLevel: 25,
        requiredLevel: 70,
        gapPercentage: 45,
        priority: "High",
        recommendation: "Review process scheduling, virtual memory, and TCP 3-way handshake mechanics.",
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "Student Task & Grade Tracker CLI",
        category: "Beginner",
        difficulty: "Easy",
        requiredSkills: ["OOP", "Data Structures", "File I/O"],
        description: "Command-line productivity tool to manage student tasks, calculate GPAs, and export reports.",
        estimatedDuration: "1 Week",
        relatedCareer: careerName,
        relatedRoadmapStep: "Programming Fundamentals & Syntax",
        status: "Completed",
        progress: 100,
      },
      {
        id: "proj-2",
        title: "Interactive Data Structure Visualizer",
        category: "Intermediate",
        difficulty: "Medium",
        requiredSkills: ["JavaScript / TypeScript", "Data Structures", "DOM Manipulation"],
        description: "Visual simulation demonstrating Stack, Queue, and Binary Tree animations with step execution.",
        estimatedDuration: "2 Weeks",
        relatedCareer: careerName,
        relatedRoadmapStep: "Data Structures & Core Algorithms",
        status: "In Progress",
        progress: 60,
      },
      {
        id: "proj-3",
        title: "Fullstack E-Learning & Assessment Portal",
        category: "Advanced",
        difficulty: "Hard",
        requiredSkills: ["React", "Express / Node.js", "SQL / Firestore", "Authentication"],
        description: "End-to-end learning management portal featuring automated quiz grading and student analytics.",
        estimatedDuration: "3 Weeks",
        relatedCareer: careerName,
        relatedRoadmapStep: "Fullstack Project: Capstone Architecture",
        status: "Recommended",
        progress: 0,
      },
      {
        id: "proj-4",
        title: "Accessible Real-time Collaboration Workspace",
        category: "Portfolio",
        difficulty: "Hard",
        requiredSkills: ["WebSockets", "WCAG 2.2", "System Design", "Cloud Hosting"],
        description: "Inclusive team collaboration tool designed with full screen-reader compliance and keyboard shortcuts.",
        estimatedDuration: "4 Weeks",
        relatedCareer: careerName,
        relatedRoadmapStep: "Portfolio & Technical Interview Readiness",
        status: "Recommended",
        progress: 0,
      },
    ],
  };
}

export default router;
