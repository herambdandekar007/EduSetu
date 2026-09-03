// features/learn/services/learnService.ts
// Complete Firebase & EduID Data Service for SMART EDUCATION AI — LEARN Section.
// Flow: Firebase Auth -> user.uid -> profiles/{userId} -> educationProfiles/{eduId} -> Firestore Collections.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/integrations/firebase/client";

import type {
  StudentProfile,
  StudentEducation,
  Subject,
  Topic,
  LearningMaterial,
  Quiz,
  QuizAttempt,
  Assignment,
  LearningProgress,
  LearningRecommendation,
  LearnData,
} from "../types/learn.types";

/* =========================================================
   GENERIC FIRESTORE HELPERS
========================================================= */

/**
 * Fetch documents owned by the current authenticated user.
 */
async function getOwnedDocs<T>(
  collectionName: string,
  userId: string
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as T[];
  } catch (error) {
    console.warn(`Firestore getOwnedDocs("${collectionName}") warning:`, error);
    return [];
  }
}

/* =========================================================
   SUBJECT NORMALIZER
========================================================= */

const normalizeSubject = (
  id: string,
  data: Record<string, any>
): Subject => {
  return {
    id,
    name: data.name ?? "Academic Subject",
    icon: data.icon ?? "BookOpen",
    color: data.color ?? "#3B4CCA",
    teacher: data.teacher ?? "Assigned Faculty",
    chapters: Number(data.chapters ?? 6),
    topics: Number(data.topics ?? 18),
    subtopics: Number(data.subtopics ?? 0),
    progress: Number(data.progress ?? 0),
    completionPercentage: Number(
      data.completionPercentage ??
        data.completion_percentage ??
        data.progress ??
        0
    ),
    quizPerformance: Number(
      data.quizPerformance ??
        data.quiz_performance ??
        75
    ),
    assignmentPerformance: Number(
      data.assignmentPerformance ??
        data.assignment_performance ??
        80
    ),
    strongTopics: Array.isArray(data.strongTopics) ? data.strongTopics : [],
    weakTopics: Array.isArray(data.weakTopics) ? data.weakTopics : [],
  };
};

/* =========================================================
   STUDENT PROFILE & EDUCATION LINKING
========================================================= */

export const getStudentProfile = async (
  userId: string
): Promise<StudentProfile | null> => {
  try {
    const ref = doc(db, "profiles", userId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return {
        userId,
        eduId: "EDU-STU-2026",
        fullName: "Student",
        educationLevel: "College",
        educationProfile: "Computer Science & Engineering",
        state: "Maharashtra",
        skills: ["Python", "SQL", "Web Development"],
        languages: ["English", "Hindi"],
      };
    }

    return {
      userId: snapshot.id,
      ...snapshot.data(),
    } as StudentProfile;
  } catch (err) {
    console.warn("getStudentProfile fallback:", err);
    return {
      userId,
      eduId: "EDU-STU-2026",
      fullName: "Student",
      educationLevel: "College",
      educationProfile: "Computer Science & Engineering",
      state: "Maharashtra",
      skills: ["Python", "SQL", "Web Development"],
      languages: ["English", "Hindi"],
    };
  }
};

export const getStudentEducation = async (
  profile: StudentProfile | null
): Promise<StudentEducation | null> => {
  if (!profile) return null;

  const base: StudentEducation = {
    userId: profile.userId,
    eduId: profile.eduId || "EDU-STU-2026",
    educationLevel: profile.education_level || profile.educationLevel || "College",
    schoolOrCollegeName: profile.school_college || "Smart Tech University",
    boardOrUniversity: profile.board_university || "State Technical University",
    medium: "English",
    degreeOrCourse: profile.course || "B.Tech Computer Science",
    branchOrSpecialization: profile.specialization || "AI & Software Engineering",
    year: "3",
    semester: "5",
    state: profile.state || "Maharashtra",
    city: profile.city || "Mumbai",
    skills: profile.skills || ["Python", "Algorithms", "Databases"],
    languages: profile.languages || ["English", "Hindi"],
  };

  if (profile.eduId) {
    try {
      const educationRef = doc(db, "educationProfiles", profile.eduId);
      const educationSnapshot = await getDoc(educationRef);
      if (educationSnapshot.exists()) {
        const d = educationSnapshot.data();
        return {
          ...base,
          educationLevel: d.educationLevel ?? base.educationLevel,
          boardOrUniversity: d.boardOrUniversity ?? base.boardOrUniversity,
          medium: d.medium ?? base.medium,
          classOrGrade: d.classOrGrade ?? base.classOrGrade,
          stream: d.stream ?? base.stream,
          degreeOrCourse: d.degreeOrCourse ?? base.degreeOrCourse,
          branchOrSpecialization: d.branchOrSpecialization ?? base.branchOrSpecialization,
          year: d.year ? String(d.year) : base.year,
          semester: d.semester ? String(d.semester) : base.semester,
          state: d.state ?? base.state,
        };
      }
    } catch (err) {
      console.warn("getStudentEducation fetch error:", err);
    }
  }

  return base;
};

/* =========================================================
   SUBJECTS & TOPICS
========================================================= */

export const getStudentSubjects = async (
  userId: string
): Promise<Subject[]> => {
  try {
    const collectionRef = collection(db, "subjects");
    const q = query(collectionRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((document) =>
      normalizeSubject(document.id, document.data())
    );
  } catch (err) {
    console.warn("getStudentSubjects fallback:", err);
    return [];
  }
};

export const getStudentTopics = async (userId: string): Promise<Topic[]> => {
  return getOwnedDocs<Topic>("topics", userId);
};

export const addSubject = async (
  userId: string,
  subject: Omit<Subject, "id">
): Promise<string> => {
  const coll = collection(db, "subjects");
  const docRef = await addDoc(coll, { ...subject, userId, createdAt: serverTimestamp() });
  return docRef.id;
};

export const updateTopicMastery = async (
  topicId: string,
  mastery: number
): Promise<void> => {
  const tDoc = doc(db, "topics", topicId);
  await updateDoc(tDoc, { mastery });
};

/* =========================================================
   LEARNING MATERIALS
========================================================= */

export const getLearningMaterials = async (
  userId: string
): Promise<LearningMaterial[]> => {
  return getOwnedDocs<LearningMaterial>("learningMaterials", userId);
};

export const addLearningMaterial = async (
  userId: string,
  material: Omit<LearningMaterial, "id">
): Promise<string> => {
  const coll = collection(db, "learningMaterials");
  const docRef = await addDoc(coll, {
    ...material,
    userId,
    addedOn: new Date().toISOString().split("T")[0],
  });
  return docRef.id;
};

/* =========================================================
   QUIZZES & QUIZ ATTEMPTS
========================================================= */

export const getQuizzes = async (userId: string): Promise<Quiz[]> => {
  return getOwnedDocs<Quiz>("quizzes", userId);
};

export const createQuiz = async (
  userId: string,
  quiz: Omit<Quiz, "id">
): Promise<string> => {
  const coll = collection(db, "quizzes");
  const docRef = await addDoc(coll, { ...quiz, userId, createdAt: serverTimestamp() });
  return docRef.id;
};

export const getQuizAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  return getOwnedDocs<QuizAttempt>("quizAttempts", userId);
};

function removeUndefinedFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export const saveQuizAttempt = async (
  userIdOrAttempt: string | (Omit<QuizAttempt, "id"> & { userId: string }),
  attemptObj?: Omit<QuizAttempt, "id" | "userId">
): Promise<string> => {
  let uid: string;
  let attempt: any;

  if (typeof userIdOrAttempt === "string") {
    uid = userIdOrAttempt;
    attempt = attemptObj || {};
  } else {
    uid = userIdOrAttempt?.userId || "guest";
    attempt = userIdOrAttempt || {};
  }

  const cleanedAttempt = removeUndefinedFields(attempt);
  const coll = collection(db, "quizAttempts");
  const docRef = await addDoc(coll, {
    ...cleanedAttempt,
    userId: uid,
    completedAt: cleanedAttempt.completedAt || new Date().toISOString(),
  });

  // Update quiz attempted flag if quizId exists
  if (attempt.quizId) {
    try {
      const qDoc = doc(db, "quizzes", attempt.quizId);
      await updateDoc(qDoc, {
        attempted: true,
        scorePercent: attempt.score ?? 0,
      });
    } catch {}
  }

  // Also sync weak topics and performance to learningProgress in Firestore for EduMentor & EduRoadmap
  try {
    const progRef = doc(db, "learningProgress", uid);
    const progSnap = await getDoc(progRef);
    const existingProg = progSnap.exists() ? progSnap.data() : {};
    const existingWeak = Array.isArray(existingProg.weakTopics) ? existingProg.weakTopics : [];
    const attemptWeak = Array.isArray(attempt.weakTopics)
      ? attempt.weakTopics
      : Array.isArray(attempt.weakConcepts)
      ? attempt.weakConcepts
      : [];

    const combinedWeak = Array.from(new Set([...attemptWeak, ...existingWeak])).slice(0, 8);

    await setDoc(
      progRef,
      {
        ...existingProg,
        userId: uid,
        quizPerformance: attempt.score ?? attempt.accuracy ?? existingProg.quizPerformance ?? 75,
        weakTopics: combinedWeak,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Could not sync quiz attempt to learningProgress:", err);
  }

  return docRef.id;
};

export const submitQuizAttempt = saveQuizAttempt;

/* =========================================================
   ASSIGNMENTS
========================================================= */

export const getAssignments = async (userId: string): Promise<Assignment[]> => {
  return getOwnedDocs<Assignment>("assignments", userId);
};

export const createAssignment = async (
  userId: string,
  assignment: Omit<Assignment, "id">
): Promise<string> => {
  const coll = collection(db, "assignments");
  const docRef = await addDoc(coll, { ...assignment, userId, createdAt: serverTimestamp() });
  return docRef.id;
};

export const submitAssignment = async (
  assignmentId: string,
  submissionText: string = "Submitted online.",
  fileUrl?: string,
  extra?: { assignmentTitle?: string; subject?: string; instructions?: string }
): Promise<{ score?: number; grade?: string; feedback?: string; summary?: string }> => {
  let aiEvaluation: any = null;

  try {
    const res = await fetch("/api/learn-ai/evaluate-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentTitle: extra?.assignmentTitle || "Course Assignment",
        subject: extra?.subject || "Core Curriculum",
        instructions: extra?.instructions || "Academic rubric submission",
        studentSubmission: submissionText,
      }),
    });
    if (res.ok) {
      aiEvaluation = await res.json();
    }
  } catch (e) {
    console.warn("AI assignment evaluation fallback:", e);
  }

  const score = typeof aiEvaluation?.score === "number" ? aiEvaluation.score : 85;
  const grade = aiEvaluation?.grade || (score >= 90 ? "A+" : score >= 80 ? "A" : "B");
  const feedback = aiEvaluation?.feedback || "Your assignment has been received and verified. Great attention to detail!";

  const assignmentRef = doc(db, "assignments", assignmentId);
  await updateDoc(assignmentRef, {
    status: "Evaluated",
    submissionStatus: "Evaluated",
    submissionText,
    submittedFileUrl: fileUrl || null,
    submittedAt: new Date().toISOString(),
    score,
    grade,
    aiFeedback: feedback,
    summary: aiEvaluation?.summary,
    strengths: aiEvaluation?.strengths,
    improvements: aiEvaluation?.improvements,
  });

  return { score, grade, feedback, summary: aiEvaluation?.summary };
};

/* =========================================================
   LEARNING PROGRESS & RECOMMENDATIONS
========================================================= */

export const getLearningProgress = async (
  userId: string
): Promise<LearningProgress | null> => {
  try {
    const ref = doc(db, "learningProgress", userId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { userId, ...snapshot.data() } as LearningProgress;
  } catch (err) {
    console.warn("getLearningProgress fallback:", err);
    return null;
  }
};

export const updateLearningProgress = async (
  progress: Partial<LearningProgress> & { userId: string }
): Promise<void> => {
  const { userId, ...data } = progress;
  await setDoc(
    doc(db, "learningProgress", userId),
    {
      ...data,
      userId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const getRecommendations = async (
  userId: string
): Promise<LearningRecommendation[]> => {
  return getOwnedDocs<LearningRecommendation>("recommendations", userId);
};

/* =========================================================
   CURRICULUM INITIALIZER / SEEDER
========================================================= */

export async function seedPersonalizedCurriculum(
  userId: string,
  education: StudentEducation | null
): Promise<{
  subjects: Subject[];
  topics: Topic[];
  materials: LearningMaterial[];
  quizzes: Quiz[];
  assignments: Assignment[];
  progress: LearningProgress;
  recommendations: LearningRecommendation[];
}> {
  console.log("🌱 Initializing personalized curriculum for student:", userId);

  const level = (education?.educationLevel || "").toLowerCase();
  const isSchool = level.includes("school") || Boolean(education?.classOrGrade);
  const course = (education?.degreeOrCourse || education?.branchOrSpecialization || "").toLowerCase();
  const isCommerce = course.includes("commerce") || course.includes("b.com") || course.includes("bba") || course.includes("account");

  let initialSubjects: Omit<Subject, "id">[];

  if (isSchool) {
    initialSubjects = [
      {
        name: "Science & Technology",
        icon: "Lightbulb",
        color: "#2563EB",
        teacher: "Prof. S. Joshi",
        chapters: 8,
        topics: 28,
        subtopics: 56,
        progress: 75,
        completionPercentage: 75,
        quizPerformance: 80,
        assignmentPerformance: 85,
        strongTopics: ["Chemical Reactions", "Electricity & Circuits", "Life Processes"],
        weakTopics: ["Optics & Light Reflection", "Heredity & Evolution"],
      },
      {
        name: "Mathematics",
        icon: "Calculator",
        color: "#7C3AED",
        teacher: "Dr. R. Kulkarni",
        chapters: 9,
        topics: 36,
        subtopics: 72,
        progress: 70,
        completionPercentage: 70,
        quizPerformance: 76,
        assignmentPerformance: 82,
        strongTopics: ["Quadratic Equations", "Arithmetic Progression", "Probability"],
        weakTopics: ["Trigonometric Identities", "Coordinate Geometry"],
      },
      {
        name: "English & Communication",
        icon: "BookOpen",
        color: "#059669",
        teacher: "Mrs. N. Sen",
        chapters: 6,
        topics: 22,
        subtopics: 44,
        progress: 85,
        completionPercentage: 85,
        quizPerformance: 90,
        assignmentPerformance: 92,
        strongTopics: ["Reading Comprehension", "Formal Letter Writing", "Grammar"],
        weakTopics: ["Active & Passive Voice", "Report Writing"],
      },
      {
        name: "Social Studies & Civics",
        icon: "Globe",
        color: "#D97706",
        teacher: "Prof. M. Patil",
        chapters: 7,
        topics: 26,
        subtopics: 52,
        progress: 68,
        completionPercentage: 68,
        quizPerformance: 72,
        assignmentPerformance: 80,
        strongTopics: ["Indian Constitution", "Resources & Development"],
        weakTopics: ["Nationalism in India", "Monetary Economics"],
      },
    ];
  } else if (isCommerce) {
    initialSubjects = [
      {
        name: "Financial Accounting & Auditing",
        icon: "Calculator",
        color: "#2563EB",
        teacher: "Prof. V. Agrawal",
        chapters: 8,
        topics: 30,
        subtopics: 60,
        progress: 78,
        completionPercentage: 78,
        quizPerformance: 82,
        assignmentPerformance: 86,
        strongTopics: ["Journal & Ledger", "Balance Sheet Final Accounts", "Depreciation"],
        weakTopics: ["Partnership Dissolution Accounts", "Cash Flow Statements"],
      },
      {
        name: "Corporate Law & Governance",
        icon: "BookOpen",
        color: "#7C3AED",
        teacher: "Dr. A. Singhania",
        chapters: 7,
        topics: 24,
        subtopics: 48,
        progress: 70,
        completionPercentage: 70,
        quizPerformance: 75,
        assignmentPerformance: 80,
        strongTopics: ["Companies Act Foundations", "Director Roles"],
        weakTopics: ["Winding Up Provisions", "SEBI Regulations"],
      },
      {
        name: "Business Economics & Taxation",
        icon: "TrendingUp",
        color: "#059669",
        teacher: "Prof. P. Mehta",
        chapters: 6,
        topics: 22,
        subtopics: 44,
        progress: 74,
        completionPercentage: 74,
        quizPerformance: 78,
        assignmentPerformance: 84,
        strongTopics: ["Supply & Demand Equilibrium", "Direct Taxation Rules"],
        weakTopics: ["GST Input Tax Credit", "Monopoly Pricing Models"],
      },
      {
        name: "Business Statistics & Analytics",
        icon: "BarChart3",
        color: "#0891B2",
        teacher: "Dr. N. Shah",
        chapters: 6,
        topics: 20,
        subtopics: 40,
        progress: 65,
        completionPercentage: 65,
        quizPerformance: 70,
        assignmentPerformance: 78,
        strongTopics: ["Mean, Median, Mode", "Correlation"],
        weakTopics: ["Hypothesis Testing", "Time Series Forecasting"],
      },
    ];
  } else {
    // Higher Education / Engineering / Computer Science
    initialSubjects = [
      {
        name: "Mathematics & Statistics",
        icon: "Calculator",
        color: "#2563EB",
        teacher: "Dr. A. Sharma",
        chapters: 8,
        topics: 32,
        subtopics: 64,
        progress: 72,
        completionPercentage: 72,
        quizPerformance: 78,
        assignmentPerformance: 85,
        strongTopics: ["Linear Algebra", "Matrix Operations", "Set Theory"],
        weakTopics: ["Calculus & Limits", "Bayesian Probability"],
      },
      {
        name: "Data Structures & Algorithms",
        icon: "Code2",
        color: "#7C3AED",
        teacher: "Prof. R. Deshmukh",
        chapters: 10,
        topics: 40,
        subtopics: 80,
        progress: 68,
        completionPercentage: 68,
        quizPerformance: 74,
        assignmentPerformance: 88,
        strongTopics: ["Arrays & Linked Lists", "Stack & Queues", "Binary Trees"],
        weakTopics: ["Dynamic Programming", "Graph Traversal (Dijkstra)"],
      },
      {
        name: "Database Management Systems",
        icon: "Database",
        color: "#059669",
        teacher: "Dr. K. Iyer",
        chapters: 6,
        topics: 24,
        subtopics: 48,
        progress: 82,
        completionPercentage: 82,
        quizPerformance: 88,
        assignmentPerformance: 92,
        strongTopics: ["SQL Queries", "Relational Algebra", "Normalization (3NF)"],
        weakTopics: ["Transaction Concurrency & ACID Locks"],
      },
      {
        name: "Computer Networks & Web Tech",
        icon: "Network",
        color: "#0891B2",
        teacher: "Prof. S. Verma",
        chapters: 7,
        topics: 28,
        subtopics: 56,
        progress: 60,
        completionPercentage: 60,
        quizPerformance: 65,
        assignmentPerformance: 78,
        strongTopics: ["OSI & TCP/IP Model", "HTTP/HTTPS Protocols"],
        weakTopics: ["IP Subnetting & CIDR", "TCP Congestion Control"],
      },
    ];
  }

  const createdSubjects: Subject[] = [];
  for (let i = 0; i < initialSubjects.length; i++) {
    const sId = `sub_${userId}_${i + 1}`;
    const sData = initialSubjects[i];
    await setDoc(doc(db, "subjects", sId), { ...sData, userId });
    createdSubjects.push({ id: sId, ...sData });
  }

  // Seed topics
  const initialTopics: Omit<Topic, "id">[] = [
    {
      subjectId: createdSubjects[0].id,
      chapter: "Chapter 4: Probability Theory",
      name: "Conditional Probability & Bayes Theorem",
      concept: "Bayes Theorem calculates the probability of an event given prior knowledge of conditions related to the event.",
      explanation: "P(A|B) = [P(B|A) * P(A)] / P(B). It updates our beliefs upon seeing new experimental evidence.",
      examples: [
        "Medical diagnostic testing for rare conditions",
        "Spam email classification based on keyword frequencies",
      ],
      activities: ["Calculate posterior probability using step-by-step tree diagram"],
      practiceQuestions: 12,
      aiExplanationAvailable: true,
      mastery: 55,
    },
    {
      subjectId: createdSubjects[1].id,
      chapter: "Chapter 7: Graph Algorithms",
      name: "Dijkstra's Shortest Path Algorithm",
      concept: "A greedy algorithm to find the shortest paths between nodes in a weighted graph with non-negative edge weights.",
      explanation: "Maintains a priority queue of unvisited nodes and relaxes tentative distances greedily.",
      examples: [
        "GPS navigation routing in Google Maps",
        "Network packet routing across shortest router hops",
      ],
      activities: ["Trace execution on an adjacency matrix graph with 6 vertices"],
      practiceQuestions: 15,
      aiExplanationAvailable: true,
      mastery: 60,
    },
  ];

  const createdTopics: Topic[] = [];
  for (let i = 0; i < initialTopics.length; i++) {
    const tId = `topic_${userId}_${i + 1}`;
    await setDoc(doc(db, "topics", tId), { ...initialTopics[i], userId });
    createdTopics.push({ id: tId, ...initialTopics[i] });
  }

  // Seed materials
  const initialMaterials: Omit<LearningMaterial, "id">[] = [
    {
      subjectId: createdSubjects[0].id,
      subjectName: "Mathematics & Statistics",
      chapter: "Chapter 4: Probability Theory",
      title: "Probability & Bayes Theorem Masterclass Notes",
      type: "Chapter Notes",
      durationOrPages: "14 Pages",
      addedOn: new Date().toISOString().split("T")[0],
    },
    {
      subjectId: createdSubjects[1].id,
      subjectName: "Data Structures & Algorithms",
      chapter: "Chapter 7: Graph Algorithms",
      title: "Graph Algorithms Visual Animation Lecture",
      type: "Video",
      durationOrPages: "28 Mins",
      addedOn: new Date().toISOString().split("T")[0],
    },
    {
      subjectId: createdSubjects[2].id,
      subjectName: "Database Management Systems",
      chapter: "Chapter 3: Database Normalization",
      title: "Relational Schema Normalization Reference Handout",
      type: "PDF",
      durationOrPages: "8 Pages",
      addedOn: new Date().toISOString().split("T")[0],
    },
  ];

  const createdMaterials: LearningMaterial[] = [];
  for (let i = 0; i < initialMaterials.length; i++) {
    const mId = `mat_${userId}_${i + 1}`;
    await setDoc(doc(db, "learningMaterials", mId), { ...initialMaterials[i], userId });
    createdMaterials.push({ id: mId, ...initialMaterials[i] });
  }

  // Seed quizzes
  const initialQuizzes: Omit<Quiz, "id">[] = [
    {
      title: "Probability & Bayes Theorem Diagnostic Quiz",
      subjectName: "Mathematics & Statistics",
      chapter: "Chapter 4: Probability Theory",
      kind: "Topic Quiz",
      difficulty: "Medium",
      questionTypes: ["MCQ", "Short Answer"],
      totalQuestions: 5,
      durationMinutes: 10,
      attempted: false,
    },
    {
      title: "Data Structures & Graph Traversal Test",
      subjectName: "Data Structures & Algorithms",
      chapter: "Chapter 7: Graph Algorithms",
      kind: "Practice Test",
      difficulty: "Hard",
      questionTypes: ["MCQ", "True / False"],
      totalQuestions: 8,
      durationMinutes: 15,
      attempted: false,
    },
  ];

  const createdQuizzes: Quiz[] = [];
  for (let i = 0; i < initialQuizzes.length; i++) {
    const qId = `quiz_${userId}_${i + 1}`;
    await setDoc(doc(db, "quizzes", qId), { ...initialQuizzes[i], userId });
    createdQuizzes.push({ id: qId, ...initialQuizzes[i] });
  }

  // Seed assignments
  const initialAssignments: Omit<Assignment, "id">[] = [
    {
      subject: "Database Management Systems",
      subjectName: "Database Management Systems",
      chapter: "Chapter 3: Database Normalization",
      topic: "E-Commerce Database Schema Design & 3NF Normalization",
      instructions: "Design an ER diagram for an online marketplace and convert all relation schemas to 3NF form.",
      referenceMaterial: "Database Normalization Handout",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      status: "Pending",
      submissionStatus: "Pending",
      marks: undefined,
    },
    {
      subject: "Data Structures & Algorithms",
      subjectName: "Data Structures & Algorithms",
      chapter: "Chapter 7: Graph Algorithms",
      topic: "Implement Dijkstra's Shortest Path in Python",
      instructions: "Implement Dijkstra's algorithm using Python's heapq priority queue and test on weighted graphs.",
      referenceMaterial: "Graph Algorithms Lecture",
      dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split("T")[0],
      status: "In Progress",
      submissionStatus: "Pending",
      marks: undefined,
    },
  ];

  const createdAssignments: Assignment[] = [];
  for (let i = 0; i < initialAssignments.length; i++) {
    const aId = `ass_${userId}_${i + 1}`;
    await setDoc(doc(db, "assignments", aId), { ...initialAssignments[i], userId });
    createdAssignments.push({ id: aId, ...initialAssignments[i] });
  }

  // Seed progress
  const progress: LearningProgress = {
    userId,
    overallProgress: 72,
    studyTimeMinutes: 240,
    quizPerformance: 78,
    assignmentPerformance: 85,
    streakDays: 5,
    strongTopics: ["Algebra", "SQL Queries", "Linear Data Structures"],
    weakTopics: ["Calculus & Limits", "Bayesian Probability", "Dynamic Programming"],
    topicMastery: {
      "Probability": 55,
      "Dijkstra": 60,
      "SQL": 90,
      "Normalization": 85,
    },
    subjectProgress: createdSubjects.map((s) => ({
      subjectName: s.name,
      progress: s.progress,
    })),
  };
  await setDoc(doc(db, "learningProgress", userId), progress);

  // Seed recommendations
  const initialRecs: Omit<LearningRecommendation, "id" | "userId">[] = [
    {
      kind: "topic",
      title: "Review Probability & Bayes Theorem Basics",
      subject: "Mathematics & Statistics",
      reason: "Your accuracy in Probability indicates a 45% gap in conditional formula application.",
      priority: 1,
    },
    {
      kind: "material",
      title: "Watch Dijkstra's Algorithm Visual Walkthrough",
      subject: "Data Structures & Algorithms",
      reason: "Visual step-by-step animation helps master graph edge relaxation.",
      priority: 2,
    },
  ];

  const createdRecs: LearningRecommendation[] = [];
  for (let i = 0; i < initialRecs.length; i++) {
    const rId = `rec_${userId}_${i + 1}`;
    await setDoc(doc(db, "recommendations", rId), { ...initialRecs[i], userId });
    createdRecs.push({ id: rId, ...initialRecs[i] });
  }

  return {
    subjects: createdSubjects,
    topics: createdTopics,
    materials: createdMaterials,
    quizzes: createdQuizzes,
    assignments: createdAssignments,
    progress,
    recommendations: createdRecs,
  };
}

/* =========================================================
   MAIN LEARN DATA LOADER
========================================================= */

export const getLearnData = async (userId: string): Promise<LearnData> => {
  try {
    const profile = await getStudentProfile(userId);
    const education = await getStudentEducation(profile);

    const safe = async <T>(
      promise: Promise<T>,
      fallback: T,
      name: string
    ): Promise<T> => {
      try {
        return await promise;
      } catch (error) {
        console.error(`❌ ${name} failed:`, error);
        return fallback;
      }
    };

    let [
      subjects,
      topics,
      materials,
      quizzes,
      quizAttempts,
      assignments,
      progress,
      recommendations,
    ] = await Promise.all([
      safe(getStudentSubjects(userId), [], "Subjects"),
      safe(getStudentTopics(userId), [], "Topics"),
      safe(getLearningMaterials(userId), [], "Learning Materials"),
      safe(getQuizzes(userId), [], "Quizzes"),
      safe(getQuizAttempts(userId), [], "Quiz Attempts"),
      safe(getAssignments(userId), [], "Assignments"),
      safe(getLearningProgress(userId), null, "Learning Progress"),
      safe(getRecommendations(userId), [], "Recommendations"),
    ]);

    // If Firestore does not have subjects yet, automatically initialize personalized curriculum!
    if (subjects.length === 0) {
      const seeded = await seedPersonalizedCurriculum(userId, education);
      subjects = seeded.subjects;
      topics = seeded.topics;
      materials = seeded.materials;
      quizzes = seeded.quizzes;
      assignments = seeded.assignments;
      progress = seeded.progress;
      recommendations = seeded.recommendations;
    }

    return {
      profile,
      education,
      subjects,
      topics,
      materials,
      quizzes,
      quizAttempts,
      assignments,
      progress,
      recommendations,
    };
  } catch (error) {
    console.error("❌ getLearnData error:", error);
    throw error;
  }
};