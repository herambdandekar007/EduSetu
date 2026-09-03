// features/eduroadmap/services/roadmapService.ts
// Real Firestore database persistence and calculations for 🗺️ EduRoadmap

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type {
  UserEduRoadmap,
  RoadmapStep,
  SkillProgressItem,
  SkillGapItem,
  NextBestStep,
  CareerPathOption,
  RoadmapProject,
  RoadmapStats,
} from "../types/roadmap.types";

/**
 * 1. Read complete roadmap & associated items from Firestore
 */
export async function getUserRoadmap(userId: string): Promise<{
  roadmap: UserEduRoadmap | null;
  steps: RoadmapStep[];
  skills: SkillProgressItem[];
  skillGaps: SkillGapItem[];
  nextSteps: NextBestStep[];
  projects: RoadmapProject[];
}> {
  if (!userId) {
    return { roadmap: null, steps: [], skills: [], skillGaps: [], nextSteps: [], projects: [] };
  }

  try {
    // 1. Fetch Main Roadmap Document
    const roadmapRef = doc(db, "eduRoadmaps", userId);
    const roadmapSnap = await getDoc(roadmapRef);

    let roadmap: UserEduRoadmap | null = null;
    let steps: RoadmapStep[] = [];
    let skills: SkillProgressItem[] = [];
    let skillGaps: SkillGapItem[] = [];
    let nextSteps: NextBestStep[] = [];
    let projects: RoadmapProject[] = [];

    if (roadmapSnap.exists()) {
      const data = roadmapSnap.data();
      roadmap = {
        id: roadmapSnap.id,
        userId,
        ...data,
      } as UserEduRoadmap;

      // In case steps, skills, skillGaps, projects are stored as embedded fields
      if (Array.isArray(data.steps)) steps = data.steps;
      if (Array.isArray(data.skills)) skills = data.skills;
      if (Array.isArray(data.skillGaps)) skillGaps = data.skillGaps;
      if (Array.isArray(data.nextSteps)) nextSteps = data.nextSteps;
      if (Array.isArray(data.projects)) projects = data.projects;
    }

    // 2. Fetch Subcollection Steps (if any)
    try {
      const stepsSnap = await getDocs(collection(db, "eduRoadmaps", userId, "steps"));
      if (!stepsSnap.empty) {
        const subSteps = stepsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as RoadmapStep[];
        // Sort by order
        steps = subSteps.sort((a, b) => a.order - b.order);
      }
    } catch {
      // Use embedded steps
    }

    // 3. Fetch Skills Document
    try {
      const skillsSnap = await getDoc(doc(db, "skillProgress", userId));
      if (skillsSnap.exists() && Array.isArray(skillsSnap.data().skills)) {
        skills = skillsSnap.data().skills;
      }
    } catch {
      // Use embedded skills
    }

    // 4. Fetch Next Best Steps
    try {
      const q = query(collection(db, "roadmapRecommendations"), where("userId", "==", userId));
      const recSnap = await getDocs(q);
      if (!recSnap.empty) {
        nextSteps = recSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as NextBestStep[];
      }
    } catch {
      // Use embedded next steps
    }

    return { roadmap, steps, skills, skillGaps, nextSteps, projects };
  } catch (err) {
    console.warn("getUserRoadmap error, returning empty state:", err);
    return { roadmap: null, steps: [], skills: [], skillGaps: [], nextSteps: [], projects: [] };
  }
}

/**
 * 2. Save / Replace complete Roadmap dataset in Firestore
 */
export async function saveUserRoadmap(
  userId: string,
  data: {
    roadmap: Partial<UserEduRoadmap>;
    steps: RoadmapStep[];
    skills: SkillProgressItem[];
    skillGaps: SkillGapItem[];
    projects: RoadmapProject[];
    nextSteps?: NextBestStep[];
  }
): Promise<void> {
  if (!userId) return;

  try {
    const roadmapRef = doc(db, "eduRoadmaps", userId);
    const now = new Date().toISOString();

    const completedCount = data.steps.filter((s) => s.status === "completed").length;
    const progressPct = data.steps.length
      ? Math.round((completedCount / data.steps.length) * 100)
      : data.roadmap.overallProgress || 0;

    const currentStep = data.steps.find((s) => s.status === "in_progress") || data.steps[0];
    const nextStep = data.steps.find((s) => s.status === "recommended" || s.status === "not_started");

    const payload = {
      userId,
      careerId: data.roadmap.careerId || "software-engineer",
      careerName: data.roadmap.careerName || "Software Engineer",
      currentStage: currentStep?.stage || data.roadmap.currentStage || "Foundation",
      overallProgress: progressPct,
      currentMilestone: currentStep?.title || "Core Foundations",
      nextMilestone: nextStep?.title || "Advanced Specialization",
      status: "active",
      totalSteps: data.steps.length,
      completedSteps: completedCount,
      steps: data.steps,
      skills: data.skills,
      skillGaps: data.skillGaps,
      projects: data.projects,
      nextSteps: data.nextSteps || [],
      updatedAt: now,
      createdAt: data.roadmap.createdAt || now,
    };

    await setDoc(roadmapRef, payload, { merge: true });

    // Also persist skills doc
    await setDoc(
      doc(db, "skillProgress", userId),
      {
        userId,
        skills: data.skills,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.error("saveUserRoadmap error:", err);
    throw err;
  }
}

/**
 * 3. Update single Roadmap Step status & progress
 */
export async function updateStepProgress(
  userId: string,
  stepId: string,
  updatedFields: Partial<RoadmapStep>,
  allSteps: RoadmapStep[]
): Promise<RoadmapStep[]> {
  const newSteps = allSteps.map((s) => {
    if (s.id === stepId) {
      const isCompleted = updatedFields.status === "completed" || updatedFields.progress === 100;
      return {
        ...s,
        ...updatedFields,
        status: isCompleted ? "completed" : updatedFields.status || s.status,
        progress: isCompleted ? 100 : (updatedFields.progress ?? s.progress),
        completedAt: isCompleted ? new Date().toISOString() : s.completedAt,
      } as RoadmapStep;
    }
    return s;
  });

  const completedCount = newSteps.filter((s) => s.status === "completed").length;
  const overallProgress = Math.round((completedCount / newSteps.length) * 100);

  try {
    await updateDoc(doc(db, "eduRoadmaps", userId), {
      steps: newSteps,
      overallProgress,
      completedSteps: completedCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("updateStepProgress firestore sync warning:", err);
  }

  return newSteps;
}

/**
 * 4. Toggle practice task within a roadmap step
 */
export async function toggleStepTask(
  userId: string,
  stepId: string,
  taskId: string,
  allSteps: RoadmapStep[]
): Promise<RoadmapStep[]> {
  const newSteps = allSteps.map((s) => {
    if (s.id === stepId) {
      const updatedTasks = s.practiceTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const doneCount = updatedTasks.filter((t) => t.completed).length;
      const stepProg = updatedTasks.length
        ? Math.round((doneCount / updatedTasks.length) * 100)
        : s.progress;
      const isCompleted = stepProg === 100;

      return {
        ...s,
        practiceTasks: updatedTasks,
        progress: stepProg,
        status: isCompleted ? "completed" : stepProg > 0 ? "in_progress" : s.status,
        completedAt: isCompleted ? new Date().toISOString() : s.completedAt,
      } as RoadmapStep;
    }
    return s;
  });

  const completedCount = newSteps.filter((s) => s.status === "completed").length;
  const overallProgress = Math.round((completedCount / newSteps.length) * 100);

  try {
    await updateDoc(doc(db, "eduRoadmaps", userId), {
      steps: newSteps,
      overallProgress,
      completedSteps: completedCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("toggleStepTask firestore sync warning:", err);
  }

  return newSteps;
}

/**
 * 5. Calculate live roadmap metrics
 */
export function calculateRoadmapStats(
  steps: RoadmapStep[] = [],
  skills: SkillProgressItem[] = [],
  projects: RoadmapProject[] = []
): RoadmapStats {
  const totalSteps = steps.length || 1;
  const completedMilestones = steps.filter((s) => s.status === "completed").length;
  const inProgressMilestones = steps.filter((s) => s.status === "in_progress").length;
  const remainingMilestones = steps.filter(
    (s) => s.status === "not_started" || s.status === "locked" || s.status === "recommended"
  ).length;

  const overallProgress = Math.round((completedMilestones / totalSteps) * 100);

  const completedSkills = skills.filter((s) => s.currentLevel >= s.requiredLevel).length;
  const skillsInProgress = skills.filter(
    (s) => s.currentLevel > 0 && s.currentLevel < s.requiredLevel
  ).length;

  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;
  const projectProgress = projects.length
    ? Math.round(((completedProjects + inProgressProjects * 0.5) / projects.length) * 100)
    : 45;

  const quizSteps = steps.filter((s) => s.quizAssessment);
  const quizPassed = quizSteps.filter((s) => s.quizAssessment?.passed).length;
  const quizProgress = quizSteps.length ? Math.round((quizPassed / quizSteps.length) * 100) : 75;

  return {
    overallProgress,
    completedMilestones,
    inProgressMilestones,
    remainingMilestones,
    totalSkills: skills.length || 7,
    completedSkills,
    skillsInProgress,
    quizProgress,
    projectProgress,
  };
}

/**
 * 6. Get popular career path tracks for exploration
 */
export function getAvailableCareerPaths(): CareerPathOption[] {
  return [
    {
      id: "software-engineer",
      title: "Software Engineering & Fullstack",
      category: "Software Development",
      description: "Design and build scalable client-server applications, distributed APIs, and performant web systems.",
      requiredSkills: ["Data Structures", "TypeScript/React", "Node.js/Express", "SQL & Database Design", "System Design"],
      difficulty: "Intermediate",
      estimatedStages: 7,
      readinessScore: 68,
      salaryRange: "₹8 – 24 LPA",
      marketDemand: "Very High",
      isPrimary: true,
    },
    {
      id: "ai-engineer",
      title: "AI & Machine Learning Specialist",
      category: "Artificial Intelligence",
      description: "Develop neural network architectures, LLM fine-tuning, RAG pipelines, and automated intelligence models.",
      requiredSkills: ["Python", "Linear Algebra & Calculus", "PyTorch / TensorFlow", "NLP & LLM Prompting", "Vector Databases"],
      difficulty: "Advanced",
      estimatedStages: 8,
      readinessScore: 48,
      salaryRange: "₹10 – 30 LPA",
      marketDemand: "Very High",
    },
    {
      id: "cybersecurity-analyst",
      title: "Cybersecurity & Information Defense",
      category: "Security",
      description: "Protect enterprise infrastructure through penetration testing, threat modeling, cryptography, and network defense.",
      requiredSkills: ["Network Protocols (TCP/IP)", "Linux Architecture", "Ethical Hacking", "Cryptography", "Security Audits"],
      difficulty: "Intermediate",
      estimatedStages: 7,
      readinessScore: 52,
      salaryRange: "₹7 – 20 LPA",
      marketDemand: "High",
    },
    {
      id: "cloud-devops",
      title: "Cloud & DevOps Architect",
      category: "Cloud Computing",
      description: "Deploy scalable cloud infrastructure, CI/CD pipelines, Kubernetes container orchestration, and serverless compute.",
      requiredSkills: ["Linux", "Docker & Kubernetes", "AWS / GCP", "CI/CD Pipelines", "Terraform / IaC"],
      difficulty: "Intermediate",
      estimatedStages: 7,
      readinessScore: 45,
      salaryRange: "₹8 – 22 LPA",
      marketDemand: "High",
    },
    {
      id: "data-scientist",
      title: "Data Science & Big Data Engineering",
      category: "Data",
      description: "Extract actionable predictive insights from complex datasets with statistical modeling and business intelligence.",
      requiredSkills: ["SQL", "Python / Pandas", "Statistics & Probability", "Tableau / PowerBI", "Data Warehousing"],
      difficulty: "Intermediate",
      estimatedStages: 6,
      readinessScore: 58,
      salaryRange: "₹8 – 25 LPA",
      marketDemand: "High",
    },
    {
      id: "embedded-iot",
      title: "Embedded Systems & IoT Engineering",
      category: "Hardware & Systems",
      description: "Program microcontrollers, real-time operating systems (RTOS), and smart sensor networks.",
      requiredSkills: ["Embedded C/C++", "Microcontrollers", "RTOS", "UART/SPI/I2C", "Circuit Design"],
      difficulty: "Advanced",
      estimatedStages: 8,
      readinessScore: 40,
      salaryRange: "₹6 – 18 LPA",
      marketDemand: "Emerging",
    },
  ];
}
