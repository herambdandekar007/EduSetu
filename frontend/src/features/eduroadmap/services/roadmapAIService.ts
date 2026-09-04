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
      body: JSON.stringify({
        ...params,
        regenerationNonce: Date.now(),
      }),
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
      body: JSON.stringify({
        ...params,
        regenerationNonce: Date.now(),
      }),
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

  const ts = Date.now();
  return [
    {
      id: `step-rec-${ts}-1`,
      type: "learn",
      title: `Master Core Pillars for ${params.careerName || "your career"}`,
      subjectOrSkill: params.careerName || "Core Discipline",
      reason: "Required foundational pillar for algorithmic problem solving and technical interviews.",
      estimatedTime: "3 Days",
      priority: 1,
      recommendedActions: [
        "Study foundational architecture documentation",
        "Read technical guides and best practices",
        "Solve 5 practice problems",
      ],
      status: "active",
    },
    {
      id: `step-rec-${ts}-2`,
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
      id: `step-rec-${ts}-3`,
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
      id: `step-rec-${ts}-4`,
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

  const ts = Date.now();
  return {
    action: "inserted_reinforcement_step",
    message: `Added a dedicated revision milestone for ${params.strugglingTopic || "core concepts"}.`,
    insertedStep: {
      id: `remedial-${ts}`,
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
        { id: `task-rem-${ts}-1`, title: "Complete 5 guided practice exercises", completed: false, difficulty: "Easy" },
        { id: `task-rem-${ts}-2`, title: "Pass mini diagnostic check", completed: false, difficulty: "Medium" },
      ],
    },
  };
}

function getFallbackRoadmapPayload(careerName = "Software Engineering & Fullstack") {
  const ts = Date.now();
  const lower = careerName.toLowerCase();

  // 1. AI & Machine Learning Specialist
  if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("artificial intelligence") || lower.includes("ml")) {
    return {
      careerName: "AI & Machine Learning Specialist",
      currentStage: "Foundation",
      overallProgress: 29,
      currentMilestone: "Python for Data & Linear Algebra Foundations",
      nextMilestone: "Deep Learning & Neural Architectures (PyTorch)",
      steps: [
        {
          id: `step-${ts}-1`,
          title: "Python for Data Science & Math Foundations",
          description: "Master NumPy, Pandas vectorization, linear algebra matrices, and calculus gradients.",
          stage: "Foundation",
          order: 1,
          status: "completed" as const,
          progress: 100,
          skillsRequired: ["Python", "NumPy", "Linear Algebra", "Calculus"],
          estimatedDuration: "2 Weeks",
          learningResources: [
            { title: "Linear Algebra & Matrix Operations for ML", type: "course" as const, duration: "4 hours" },
            { title: "Vectorized Operations with NumPy & Pandas", type: "article" as const, duration: "45 min" },
          ],
          practiceTasks: [
            { id: `p-${ts}-1`, title: "Implement Matrix Multiplication & Eigenvalues in NumPy", completed: true, difficulty: "Easy" as const },
            { id: `p-${ts}-2`, title: "Compute Gradient Descent from Scratch for Linear Regression", completed: true, difficulty: "Medium" as const },
          ],
          quizAssessment: { title: "Math & NumPy Fundamentals Quiz", questionsCount: 10, passed: true, score: 92 },
        },
        {
          id: `step-${ts}-2`,
          title: "Classical Machine Learning & Statistical Modeling",
          description: "Supervised and unsupervised algorithms: SVMs, Decision Trees, Random Forests, Clustering, and PCA.",
          stage: "Core Knowledge",
          order: 2,
          status: "completed" as const,
          progress: 100,
          skillsRequired: ["Scikit-Learn", "Feature Engineering", "Model Evaluation"],
          estimatedDuration: "3 Weeks",
          learningResources: [
            { title: "Applied Machine Learning with Scikit-Learn", type: "course" as const, duration: "6 hours" },
            { title: "Bias-Variance Tradeoff & Cross-Validation Guide", type: "doc" as const, duration: "40 min" },
          ],
          practiceTasks: [
            { id: `p-${ts}-3`, title: "Train & Hyperparameter-Tune XGBoost Classifier", completed: true, difficulty: "Medium" as const },
            { id: `p-${ts}-4`, title: "Perform K-Means Customer Clustering with PCA Visuals", completed: true, difficulty: "Medium" as const },
          ],
          quizAssessment: { title: "Machine Learning Algorithms Check", questionsCount: 12, passed: true, score: 88 },
        },
        {
          id: `step-${ts}-3`,
          title: "Deep Learning & Neural Architectures (PyTorch)",
          description: "Build Multi-Layer Perceptrons, Convolutional Networks (CNNs), and Recurrent Networks in PyTorch.",
          stage: "Technical Skills",
          order: 3,
          status: "in_progress" as const,
          progress: 45,
          skillsRequired: ["PyTorch", "Backpropagation", "CNNs", "Optimization"],
          estimatedDuration: "3 Weeks",
          learningResources: [
            { title: "Deep Learning with PyTorch from Zero to Mastery", type: "video" as const, duration: "5 hours" },
            { title: "Loss Functions, Adam Optimizer & Regularization", type: "article" as const, duration: "50 min" },
          ],
          practiceTasks: [
            { id: `p-${ts}-5`, title: "Build Image Classifier using ResNet-18 Transfer Learning", completed: true, difficulty: "Medium" as const },
            { id: `p-${ts}-6`, title: "Implement Custom PyTorch Dataset & DataLoader Pipeline", completed: false, difficulty: "Hard" as const },
          ],
          quizAssessment: { title: "Deep Learning & Backprop Quiz", questionsCount: 10 },
        },
        {
          id: `step-${ts}-4`,
          title: "Natural Language Processing & Transformer Models",
          description: "Word embeddings, Attention mechanisms, BERT, GPT architectures, and HuggingFace pipelines.",
          stage: "Specialization",
          order: 4,
          status: "recommended" as const,
          progress: 0,
          skillsRequired: ["HuggingFace", "Attention Mechanisms", "Transformers", "Tokenization"],
          estimatedDuration: "3 Weeks",
          learningResources: [
            { title: "Attention Is All You Need: Transformer Deconstruction", type: "doc" as const, duration: "1.5 hours" },
            { title: "Hugging Face Transformers Masterclass", type: "video" as const, duration: "4 hours" },
          ],
          practiceTasks: [
            { id: `p-${ts}-7`, title: "Fine-tune BERT for Domain Sentiment & Entity Recognition", completed: false, difficulty: "Hard" as const },
          ],
        },
        {
          id: `step-${ts}-5`,
          title: "LLM Engineering, RAG Systems & Vector Databases",
          description: "LangChain/LlamaIndex, Retrieval-Augmented Generation, Pinecone/ChromaDB, embeddings, and prompt orchestration.",
          stage: "Advanced Learning",
          order: 5,
          status: "not_started" as const,
          progress: 0,
          skillsRequired: ["LangChain", "Vector DBs", "RAG Pipelines", "Prompt Engineering"],
          estimatedDuration: "3 Weeks",
          learningResources: [
            { title: "Production RAG Architecture Blueprint", type: "course" as const, duration: "4 hours" },
          ],
          practiceTasks: [
            { id: `p-${ts}-8`, title: "Build Multi-Document Semantic Search RAG Bot", completed: false, difficulty: "Hard" as const },
          ],
        },
        {
          id: `step-${ts}-6`,
          title: "MLOps, Model Serving & Cloud Inference",
          description: "Deploy models as REST APIs using FastAPI, Docker containers, ONNX runtime, and AWS SageMaker / GCP Vertex AI.",
          stage: "Projects",
          order: 6,
          status: "locked" as const,
          progress: 0,
          skillsRequired: ["FastAPI", "Docker", "Model Monitoring", "Cloud Deployment"],
          estimatedDuration: "3 Weeks",
          learningResources: [
            { title: "Production MLOps & Model Deployment Pipeline", type: "video" as const, duration: "3 hours" },
          ],
          practiceTasks: [
            { id: `p-${ts}-9`, title: "Deploy Quantized LLM Container with Prometheus Monitoring", completed: false, difficulty: "Hard" as const },
          ],
        },
        {
          id: `step-${ts}-7`,
          title: "AI Research Capstone & Portfolio Review",
          description: "End-to-end autonomous multi-agent system, benchmarking paper, and AI engineering portfolio.",
          stage: "Career Readiness",
          order: 7,
          status: "locked" as const,
          progress: 0,
          skillsRequired: ["System Design", "Autonomous Agents", "Portfolio", "Benchmarking"],
          estimatedDuration: "2 Weeks",
          learningResources: [
            { title: "AI Engineer Portfolio & Technical Interview Guide", type: "article" as const, duration: "1.5 hours" },
          ],
          practiceTasks: [
            { id: `p-${ts}-10`, title: "Complete 2 Mock AI System Design Interviews", completed: false, difficulty: "Hard" as const },
          ],
        },
      ],
      skills: [
        { id: `s-${ts}-1`, name: "Python & Scientific Libraries", category: "Core", currentLevel: 92, requiredLevel: 85, priority: "Low" as const, group: "strong" as const },
        { id: `s-${ts}-2`, name: "Linear Algebra & Calculus", category: "Mathematics", currentLevel: 80, requiredLevel: 85, priority: "Medium" as const, group: "strong" as const },
        { id: `s-${ts}-3`, name: "PyTorch & Deep Learning", category: "AI Frameworks", currentLevel: 50, requiredLevel: 85, priority: "Critical" as const, group: "improve" as const },
        { id: `s-${ts}-4`, name: "Transformers & LLMs", category: "NLP", currentLevel: 30, requiredLevel: 80, priority: "High" as const, group: "improve" as const },
        { id: `s-${ts}-5`, name: "RAG & Vector Databases", category: "Applied AI", currentLevel: 25, requiredLevel: 75, priority: "High" as const, group: "missing" as const },
        { id: `s-${ts}-6`, name: "MLOps & Container Serving", category: "Production", currentLevel: 15, requiredLevel: 70, priority: "Medium" as const, group: "missing" as const },
      ],
      skillGaps: [
        {
          id: `sg-${ts}-1`,
          skill: "PyTorch & Neural Networks",
          category: "AI Frameworks",
          currentLevel: 50,
          requiredLevel: 85,
          gapPercentage: 35,
          priority: "Critical" as const,
          recommendation: "Build custom neural network training loops with learning rate schedulers and tensorboard logging.",
        },
        {
          id: `sg-${ts}-2`,
          skill: "Transformers & HuggingFace",
          category: "NLP",
          currentLevel: 30,
          requiredLevel: 80,
          gapPercentage: 50,
          priority: "High" as const,
          recommendation: "Deconstruct multi-head self-attention mechanisms and fine-tune pre-trained language models.",
        },
      ],
      projects: [
        {
          id: `proj-${ts}-1`,
          title: "End-to-End Real Estate Price Prediction Engine",
          category: "Beginner" as const,
          difficulty: "Easy" as const,
          requiredSkills: ["Scikit-Learn", "Pandas", "Feature Engineering"],
          description: "Full regression pipeline predicting home valuations with residual analysis and interactive dashboard.",
          estimatedDuration: "1 Week",
          relatedCareer: "AI & Machine Learning Specialist",
          relatedRoadmapStep: "Classical Machine Learning & Statistical Modeling",
          status: "Completed" as const,
          progress: 100,
        },
        {
          id: `proj-${ts}-2`,
          title: "Medical Image X-Ray Diagnosis with Transfer Learning",
          category: "Intermediate" as const,
          difficulty: "Medium" as const,
          requiredSkills: ["PyTorch", "Torchvision", "CNNs"],
          description: "Fine-tune DenseNet-121 on chest X-ray scans with Grad-CAM heatmaps for visual explainability.",
          estimatedDuration: "2 Weeks",
          relatedCareer: "AI & Machine Learning Specialist",
          relatedRoadmapStep: "Deep Learning & Neural Architectures (PyTorch)",
          status: "In Progress" as const,
          progress: 50,
        },
        {
          id: `proj-${ts}-3`,
          title: "Autonomous Multi-Agent Research Assistant with RAG",
          category: "Advanced" as const,
          difficulty: "Hard" as const,
          requiredSkills: ["LangChain", "Vector DBs", "FastAPI", "OpenAI / Gemini API"],
          description: "Intelligent agent pipeline capable of searching arXiv papers, summarizing findings, and citing sources.",
          estimatedDuration: "3 Weeks",
          relatedCareer: "AI & Machine Learning Specialist",
          relatedRoadmapStep: "LLM Engineering, RAG Systems & Vector Databases",
          status: "Recommended" as const,
          progress: 0,
        },
      ],
    };
  }

  // 2. Default: Software Engineering & Fullstack
  return {
    careerName: "Software Engineering & Fullstack",
    currentStage: "Foundation",
    overallProgress: 38,
    currentMilestone: "Data Structures & Core Algorithms",
    nextMilestone: "Database Design & SQL Mastery",
    steps: [
      {
        id: `step-${ts}-1`,
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
          { id: `p-${ts}-1`, title: "Build CLI Calculator & Number Guessing Game", completed: true, difficulty: "Easy" as const },
          { id: `p-${ts}-2`, title: "Implement 10 Basic Array & String Utilities", completed: true, difficulty: "Easy" as const },
        ],
        quizAssessment: { title: "Programming Basics Assessment", questionsCount: 10, passed: true, score: 90 },
      },
      {
        id: `step-${ts}-2`,
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
          { id: `p-${ts}-3`, title: "Design a Bank Account Hierarchy System", completed: true, difficulty: "Medium" as const },
          { id: `p-${ts}-4`, title: "Implement Polymorphic Shape Calculators", completed: true, difficulty: "Medium" as const },
        ],
        quizAssessment: { title: "OOP Principles Quiz", questionsCount: 10, passed: true, score: 85 },
      },
      {
        id: `step-${ts}-3`,
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
          { id: `p-${ts}-5`, title: "Implement Singly & Doubly Linked Lists", completed: true, difficulty: "Medium" as const },
          { id: `p-${ts}-6`, title: "Solve Balanced Parentheses with Stack", completed: true, difficulty: "Medium" as const },
          { id: `p-${ts}-7`, title: "Implement Binary Search Tree Traversals", completed: false, difficulty: "Hard" as const },
        ],
        quizAssessment: { title: "DSA Diagnostic Milestone Quiz", questionsCount: 12 },
      },
      {
        id: `step-${ts}-4`,
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
          { id: `p-${ts}-8`, title: "Design E-Commerce Database Schema", completed: false, difficulty: "Medium" as const },
          { id: `p-${ts}-9`, title: "Write Multi-Table JOINs & Aggregations", completed: false, difficulty: "Medium" as const },
        ],
      },
      {
        id: `step-${ts}-5`,
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
          { id: `p-${ts}-10`, title: "Build Simple HTTP Server & REST Endpoints", completed: false, difficulty: "Hard" as const },
        ],
      },
      {
        id: `step-${ts}-6`,
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
          { id: `p-${ts}-11`, title: "Develop & Deploy Capstone Portal", completed: false, difficulty: "Hard" as const },
        ],
      },
      {
        id: `step-${ts}-7`,
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
          { id: `p-${ts}-12`, title: "Complete 3 Mock Coding Interviews", completed: false, difficulty: "Hard" as const },
        ],
      },
    ],
    skills: [
      { id: `s-${ts}-1`, name: "Programming Fundamentals", category: "Core", currentLevel: 90, requiredLevel: 80, priority: "Low" as const, group: "strong" as const },
      { id: `s-${ts}-2`, name: "Object-Oriented Design", category: "Architecture", currentLevel: 85, requiredLevel: 80, priority: "Medium" as const, group: "strong" as const },
      { id: `s-${ts}-3`, name: "Data Structures & Algorithms", category: "Computer Science", currentLevel: 55, requiredLevel: 85, priority: "Critical" as const, group: "improve" as const },
      { id: `s-${ts}-4`, name: "SQL & Relational Databases", category: "Data", currentLevel: 30, requiredLevel: 75, priority: "High" as const, group: "improve" as const },
      { id: `s-${ts}-5`, name: "Operating Systems & Concurrency", category: "Systems", currentLevel: 20, requiredLevel: 70, priority: "High" as const, group: "missing" as const },
      { id: `s-${ts}-6`, name: "Web Accessibility (WCAG)", category: "Frontend", currentLevel: 75, requiredLevel: 80, priority: "Medium" as const, group: "current" as const },
    ],
    skillGaps: [
      {
        id: `sg-${ts}-1`,
        skill: "Data Structures & Algorithms",
        category: "Computer Science",
        currentLevel: 55,
        requiredLevel: 85,
        gapPercentage: 30,
        priority: "Critical" as const,
        recommendation: "Complete Binary Trees and Graph Traversals before starting advanced algorithm patterns.",
      },
      {
        id: `sg-${ts}-2`,
        skill: "SQL & Relational Databases",
        category: "Data",
        currentLevel: 30,
        requiredLevel: 75,
        gapPercentage: 45,
        priority: "High" as const,
        recommendation: "Practice multi-table normalization and indexing optimization queries.",
      },
    ],
    projects: [
      {
        id: `proj-${ts}-1`,
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
        id: `proj-${ts}-2`,
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
    ],
  };
}

