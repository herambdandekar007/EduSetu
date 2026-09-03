// features/eduroadmap/services/roadmapAIService.ts
// Frontend client for AI Roadmap generation, adaptive recalibration, and next best steps.

import type {
  RoadmapStep,
  SkillProgressItem,
  SkillGapItem,
  NextBestStep,
  RoadmapProject,
} from "../types/roadmap.types";

const RAW_URL = (import.meta.env.VITE_AI_ASSISTANT_URL || "http://localhost:3001").trim();
const BASE_URL = RAW_URL.replace(/\/ai-assistant\/?$/, "").replace(/\/+$/, "");

/**
 * 1. Request AI-generated personalized roadmap dataset
 */
export async function generateAIRoadmap(params: {
  careerName: string;
  educationLevel?: string;
  course?: string;
  currentSkills?: string[];
  weakTopics?: string[];
  strongTopics?: string[];
  learningGaps?: string[];
  targetDuration?: string;
}): Promise<{
  careerName: string;
  currentStage: string;
  overallProgress: number;
  currentMilestone: string;
  nextMilestone: string;
  steps: RoadmapStep[];
  skills: SkillProgressItem[];
  skillGaps: SkillGapItem[];
  projects: RoadmapProject[];
}> {
  try {
    const res = await fetch(`${BASE_URL}/api/eduroadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.steps && Array.isArray(data.steps)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("generateAIRoadmap backend fetch failed, using fallback:", err);
  }

  // Fallback generation
  return getFallbackRoadmapPayload(params.careerName);
}

/**
 * 2. Request AI Next Best Steps
 */
export async function fetchAINextSteps(params: {
  careerName: string;
  currentStage: string;
  completedStepTitles: string[];
  weakTopics: string[];
}): Promise<NextBestStep[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/eduroadmap/next-steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        return data;
      }
    }
  } catch (err) {
    console.warn("fetchAINextSteps backend fetch failed, using fallback:", err);
  }

  return [
    {
      id: "step-rec-1",
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
      id: "step-rec-2",
      type: "practice",
      title: "Weak Area Reinforcement Drill",
      subjectOrSkill: params.weakTopics?.[0] || "Foundational Algorithms",
      reason: "Identified gap in recent quiz diagnostic. Solidify key concepts before advanced modules.",
      estimatedTime: "2 Hours",
      priority: 2,
      recommendedActions: [
        "Take the 5-question adaptive diagnostic quiz",
        "Review step-by-step solution explanations",
      ],
      status: "active",
    },
    {
      id: "step-rec-3",
      type: "quiz",
      title: "Self-Check Milestone Assessment",
      subjectOrSkill: "Core Curriculum",
      reason: "Verify topic retention and update your overall roadmap progress score.",
      estimatedTime: "30 Mins",
      priority: 3,
      recommendedActions: [
        "Take the 10-question milestone quiz",
        "Review mistake patterns in EduMentor",
      ],
      status: "active",
    },
    {
      id: "step-rec-4",
      type: "project",
      title: "Build Milestone Practical Project",
      subjectOrSkill: "Applied Skills",
      reason: "Hands-on project development reinforces theoretical foundations into verified portfolio assets.",
      estimatedTime: "1 Week",
      priority: 4,
      recommendedActions: [
        "Initialize Git repository and architecture layout",
        "Implement core application logic and test cases",
      ],
      status: "active",
    },
  ];
}

/**
 * 3. Request Adaptive Roadmap Recalibration
 */
export async function recalibrateAdaptiveRoadmap(params: {
  strugglingTopic: string;
  subject: string;
  currentSteps: RoadmapStep[];
}): Promise<{ action: string; message: string; insertedStep: RoadmapStep }> {
  try {
    const res = await fetch(`${BASE_URL}/api/eduroadmap/adapt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.insertedStep) {
        return data;
      }
    }
  } catch (err) {
    console.warn("recalibrateAdaptiveRoadmap backend fetch failed, using fallback:", err);
  }

  return {
    action: "inserted_reinforcement_step",
    message: `Added a dedicated revision milestone for ${params.strugglingTopic || "core concepts"}.`,
    insertedStep: {
      id: `remedial-${Date.now()}`,
      title: `Deep-Dive Revision: ${params.strugglingTopic || "Key Concepts"}`,
      description: `Targeted conceptual reinforcement and guided practice drills to eliminate learning gaps.`,
      stage: "Practice & Assessment",
      order: 3,
      status: "recommended",
      progress: 0,
      skillsRequired: [params.strugglingTopic || "Foundations", "Problem Solving"],
      estimatedDuration: "2 Days",
      learningResources: [
        { title: `${params.strugglingTopic || "Concept"} Visual Primer`, type: "video", duration: "20 min" },
        { title: "Summary Cheatsheet & Common Pitfalls", type: "article", duration: "15 min" },
      ],
      practiceTasks: [
        { id: "task-rem-1", title: "Complete 5 guided practice exercises", completed: false, difficulty: "Easy" },
        { id: "task-rem-2", title: "Pass mini diagnostic check", completed: false, difficulty: "Medium" },
      ],
    },
  };
}

function getFallbackRoadmapPayload(careerName = "Software Engineer") {
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
        status: "completed" as const,
        progress: 100,
        skillsRequired: ["Programming Basics", "Logic Building"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Introduction to Computer Science & Logic", type: "course" as const, duration: "4 hours" },
          { title: "Clean Code & Functional Style Guide", type: "article" as const, duration: "30 min" },
        ],
        practiceTasks: [
          { id: "p1", title: "Build CLI Calculator & Number Guessing Game", completed: true, difficulty: "Easy" as const },
          { id: "p2", title: "Implement 10 Basic Array & String Utilities", completed: true, difficulty: "Easy" as const },
        ],
        quizAssessment: { title: "Programming Basics Assessment", questionsCount: 10, passed: true, score: 90 },
      },
      {
        id: "step-2",
        title: "Object-Oriented Programming (OOP)",
        description: "Learn classes, inheritance, polymorphism, encapsulation, and interface abstraction.",
        stage: "Core Knowledge",
        order: 2,
        status: "completed" as const,
        progress: 100,
        skillsRequired: ["OOP", "Design Patterns"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "OOP Architecture in Practice", type: "video" as const, duration: "2.5 hours" },
          { title: "SOLID Principles Breakdown", type: "doc" as const, duration: "45 min" },
        ],
        practiceTasks: [
          { id: "p3", title: "Design a Bank Account Hierarchy System", completed: true, difficulty: "Medium" as const },
          { id: "p4", title: "Implement Polymorphic Shape Calculators", completed: true, difficulty: "Medium" as const },
        ],
        quizAssessment: { title: "OOP Principles Quiz", questionsCount: 10, passed: true, score: 85 },
      },
      {
        id: "step-3",
        title: "Data Structures & Core Algorithms",
        description: "Deep dive into Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Searching/Sorting.",
        stage: "Technical Skills",
        order: 3,
        status: "in_progress" as const,
        progress: 55,
        skillsRequired: ["Data Structures", "Algorithm Analysis"],
        estimatedDuration: "3 Weeks",
        learningResources: [
          { title: "Data Structures Masterclass & Big-O Notation", type: "course" as const, duration: "6 hours" },
          { title: "Visual Tree & Graph Traversal Guide", type: "article" as const, duration: "40 min" },
        ],
        practiceTasks: [
          { id: "p5", title: "Implement Singly & Doubly Linked Lists", completed: true, difficulty: "Medium" as const },
          { id: "p6", title: "Solve Balanced Parentheses with Stack", completed: true, difficulty: "Medium" as const },
          { id: "p7", title: "Implement Binary Search Tree Traversals", completed: false, difficulty: "Hard" as const },
        ],
        quizAssessment: { title: "DSA Diagnostic Milestone Quiz", questionsCount: 12 },
      },
      {
        id: "step-4",
        title: "Database Design & SQL Systems",
        description: "Relational database models, schema design, normalization, ACID properties, and complex queries.",
        stage: "Technical Skills",
        order: 4,
        status: "recommended" as const,
        progress: 0,
        skillsRequired: ["SQL", "Relational Databases", "Schema Design"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Modern SQL for Developers", type: "video" as const, duration: "3 hours" },
          { title: "Database Indexing & Query Optimization", type: "doc" as const, duration: "50 min" },
        ],
        practiceTasks: [
          { id: "p8", title: "Design E-Commerce Database Schema", completed: false, difficulty: "Medium" as const },
          { id: "p9", title: "Write Multi-Table JOINs & Aggregations", completed: false, difficulty: "Medium" as const },
        ],
      },
      {
        id: "step-5",
        title: "Operating Systems & Networking Foundations",
        description: "Processes, threads, memory management, TCP/IP, HTTP/HTTPS protocols, and REST APIs.",
        stage: "Core Knowledge",
        order: 5,
        status: "not_started" as const,
        progress: 0,
        skillsRequired: ["Operating Systems", "Networking", "APIs"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Computer Systems & Architecture Essentials", type: "article" as const, duration: "2 hours" },
        ],
        practiceTasks: [
          { id: "p10", title: "Build Simple HTTP Server & REST Endpoints", completed: false, difficulty: "Hard" as const },
        ],
      },
      {
        id: "step-6",
        title: "Fullstack Project: Capstone Architecture",
        description: "Build a production-ready web application with frontend UI, backend API, database, and auth.",
        stage: "Projects",
        order: 6,
        status: "locked" as const,
        progress: 0,
        skillsRequired: ["Fullstack Dev", "Git", "Deployment"],
        estimatedDuration: "4 Weeks",
        learningResources: [
          { title: "Fullstack Architecture Blueprint", type: "course" as const, duration: "5 hours" },
        ],
        practiceTasks: [
          { id: "p11", title: "Develop & Deploy Capstone Portal", completed: false, difficulty: "Hard" as const },
        ],
      },
      {
        id: "step-7",
        title: "Portfolio & Technical Interview Readiness",
        description: "System design basics, mock technical interview drills, resume polishing, and open-source contributions.",
        stage: "Career Readiness",
        order: 7,
        status: "locked" as const,
        progress: 0,
        skillsRequired: ["System Design", "Interview Prep", "Portfolio"],
        estimatedDuration: "2 Weeks",
        learningResources: [
          { title: "Technical Interview Success Playbook", type: "article" as const, duration: "1.5 hours" },
        ],
        practiceTasks: [
          { id: "p12", title: "Complete 3 Mock Coding Interviews", completed: false, difficulty: "Hard" as const },
        ],
      },
    ],
    skills: [
      { id: "s1", name: "Programming Fundamentals", category: "Core", currentLevel: 90, requiredLevel: 80, priority: "Low" as const, group: "strong" as const },
      { id: "s2", name: "Object-Oriented Design", category: "Architecture", currentLevel: 85, requiredLevel: 80, priority: "Medium" as const, group: "strong" as const },
      { id: "s3", name: "Data Structures & Algorithms", category: "Computer Science", currentLevel: 55, requiredLevel: 85, priority: "Critical" as const, group: "improve" as const },
      { id: "s4", name: "SQL & Relational Databases", category: "Data", currentLevel: 30, requiredLevel: 75, priority: "High" as const, group: "improve" as const },
      { id: "s5", name: "Operating Systems & Concurrency", category: "Systems", currentLevel: 20, requiredLevel: 70, priority: "High" as const, group: "missing" as const },
      { id: "s6", name: "Computer Networks & Protocols", category: "Systems", currentLevel: 25, requiredLevel: 70, priority: "Medium" as const, group: "missing" as const },
      { id: "s7", name: "Web Accessibility (WCAG)", category: "Frontend", currentLevel: 75, requiredLevel: 80, priority: "Medium" as const, group: "current" as const },
    ],
    skillGaps: [
      {
        id: "sg1",
        skill: "Data Structures & Algorithms",
        category: "Computer Science",
        currentLevel: 55,
        requiredLevel: 85,
        gapPercentage: 30,
        priority: "Critical" as const,
        recommendation: "Complete Binary Trees and Graph Traversals before starting advanced algorithm patterns.",
      },
      {
        id: "sg2",
        skill: "SQL & Relational Databases",
        category: "Data",
        currentLevel: 30,
        requiredLevel: 75,
        gapPercentage: 45,
        priority: "High" as const,
        recommendation: "Practice multi-table normalization and indexing optimization queries.",
      },
      {
        id: "sg3",
        skill: "Operating Systems & Networking",
        category: "Systems",
        currentLevel: 25,
        requiredLevel: 70,
        gapPercentage: 45,
        priority: "High" as const,
        recommendation: "Review process scheduling, virtual memory, and TCP 3-way handshake mechanics.",
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "Student Task & Grade Tracker CLI",
        category: "Beginner" as const,
        difficulty: "Easy" as const,
        requiredSkills: ["OOP", "Data Structures", "File I/O"],
        description: "Command-line productivity tool to manage student tasks, calculate GPAs, and export reports.",
        estimatedDuration: "1 Week",
        relatedCareer: careerName,
        relatedRoadmapStep: "Programming Fundamentals & Syntax",
        status: "Completed" as const,
        progress: 100,
      },
      {
        id: "proj-2",
        title: "Interactive Data Structure Visualizer",
        category: "Intermediate" as const,
        difficulty: "Medium" as const,
        requiredSkills: ["JavaScript / TypeScript", "Data Structures", "DOM Manipulation"],
        description: "Visual simulation demonstrating Stack, Queue, and Binary Tree animations with step execution.",
        estimatedDuration: "2 Weeks",
        relatedCareer: careerName,
        relatedRoadmapStep: "Data Structures & Core Algorithms",
        status: "In Progress" as const,
        progress: 60,
      },
      {
        id: "proj-3",
        title: "Fullstack E-Learning & Assessment Portal",
        category: "Advanced" as const,
        difficulty: "Hard" as const,
        requiredSkills: ["React", "Express / Node.js", "SQL / Firestore", "Authentication"],
        description: "End-to-end learning management portal featuring automated quiz grading and student analytics.",
        estimatedDuration: "3 Weeks",
        relatedCareer: careerName,
        relatedRoadmapStep: "Fullstack Project: Capstone Architecture",
        status: "Recommended" as const,
        progress: 0,
      },
      {
        id: "proj-4",
        title: "Accessible Real-time Collaboration Workspace",
        category: "Portfolio" as const,
        difficulty: "Hard" as const,
        requiredSkills: ["WebSockets", "WCAG 2.2", "System Design", "Cloud Hosting"],
        description: "Inclusive team collaboration tool designed with full screen-reader compliance and keyboard shortcuts.",
        estimatedDuration: "4 Weeks",
        relatedCareer: careerName,
        relatedRoadmapStep: "Portfolio & Technical Interview Readiness",
        status: "Recommended" as const,
        progress: 0,
      },
    ],
  };
}
