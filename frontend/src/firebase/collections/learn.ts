import { db } from "../firebase.config.ts";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type {
  Subject,
  Topic,
  LearningMaterial,
  Quiz,
  Assignment,
} from "../../features/learn/types/learn.types.ts";

/* =========================================================
   LEARN COLLECTIONS
   =========================================================

   Firestore structure created by this file:

   subjects/{subjectId}            userId
   topics/{topicId}                userId
   learningMaterials/{materialId}  userId
   quizzes/{quizId}                userId
   assignments/{assignmentId}      userId
   learningProgress/{userId}       one doc per student
   recommendations/{id}            userId

   quizAttempts/{attemptId}        created at runtime by learnService
   ========================================================= */

/* =========================================================
   SEED LEARN DATA FOR ONE STUDENT
   Creates one document per item, all tagged with userId.
   Skips seeding if the student already has subjects.
   ========================================================= */

export const seedLearnData = async (userId: string): Promise<void> => {
  // -------------------------------------------------------
  // Idempotency check - don't duplicate on repeated runs
  // -------------------------------------------------------

  const existing = await getDocs(
    query(collection(db, "subjects"), where("userId", "==", userId))
  );

  if (!existing.empty) {
    console.log(`⏭️  Learn collections already seeded for ${userId}, skipping.`);
    return;
  }

  /* =====================================================
     SUBJECTS
  ===================================================== */

  const subjects: Omit<Subject, "id">[] = [
    {
      name: "Mathematics",
      icon: "Sigma",
      color: "#3B4CCA",
      teacher: "Mrs. Anjali Rao",
      chapters: 14,
      topics: 92,
      subtopics: 210,
      progress: 35,
      completionPercentage: 35,
      quizPerformance: 58,
      assignmentPerformance: 70,
      strongTopics: ["Linear Equations"],
      weakTopics: ["Quadratic Equations", "Coordinate Geometry"],
    },
    {
      name: "Science",
      icon: "FlaskConical",
      color: "#1C9C86",
      teacher: "Mr. Rohan Mehta",
      chapters: 16,
      topics: 104,
      subtopics: 240,
      progress: 20,
      completionPercentage: 20,
      quizPerformance: 45,
      assignmentPerformance: 55,
      strongTopics: ["Light – Reflection"],
      weakTopics: ["Electricity", "Life Processes"],
    },
    {
      name: "English",
      icon: "BookOpen",
      color: "#E8A33D",
      teacher: "Ms. Fatima Khan",
      chapters: 10,
      topics: 58,
      subtopics: 120,
      progress: 65,
      completionPercentage: 65,
      quizPerformance: 82,
      assignmentPerformance: 88,
      strongTopics: ["Grammar", "Letter Writing"],
      weakTopics: ["Poetry Analysis"],
    },
  ];

  const subjectIds: Record<string, string> = {};

  console.log("\n📌 Seeding Subjects...");
  for (const subject of subjects) {
    const ref = doc(collection(db, "subjects"));
    subjectIds[subject.name] = ref.id;
    await setDoc(ref, { ...subject, userId });
  }

  /* =====================================================
     TOPICS
  ===================================================== */

  const topics: Omit<Topic, "id">[] = [
    {
      subjectId: subjectIds["Mathematics"],
      chapter: "Quadratic Equations",
      name: "Nature of Roots",
      concept:
        "The discriminant tells us how many real roots a quadratic equation has.",
      explanation:
        "For ax² + bx + c = 0, the discriminant D = b² - 4ac decides whether the roots are real & distinct, real & equal, or imaginary.",
      examples: [
        "x² - 5x + 6 = 0 → D = 1 → two real roots",
        "x² + 4x + 4 = 0 → D = 0 → equal roots",
      ],
      activities: [
        "Plot 3 quadratic graphs and mark the roots",
        "Discriminant sorting card game",
      ],
      practiceQuestions: 18,
      aiExplanationAvailable: true,
      mastery: 40,
    },
    {
      subjectId: subjectIds["Science"],
      chapter: "Electricity",
      name: "Ohm's Law",
      concept:
        "Current through a conductor is proportional to the voltage across it.",
      explanation:
        "V = IR, where R (resistance) stays constant at a fixed temperature.",
      examples: ["A 2Ω resistor with 4V across it carries 2A of current."],
      activities: ["Build a simple circuit and verify V = IR with a multimeter"],
      practiceQuestions: 22,
      aiExplanationAvailable: true,
      mastery: 30,
    },
  ];

  console.log("📌 Seeding Topics...");
  for (const topic of topics) {
    const ref = doc(collection(db, "topics"));
    await setDoc(ref, { ...topic, userId });
  }

  /* =====================================================
     LEARNING MATERIALS
  ===================================================== */

  const materials: Omit<LearningMaterial, "id">[] = [
    {
      subjectId: subjectIds["Mathematics"],
      subjectName: "Mathematics",
      chapter: "Quadratic Equations",
      title: "NCERT Chapter 4 – Quadratic Equations",
      type: "Textbook",
      durationOrPages: "18 pages",
      addedOn: new Date().toISOString().slice(0, 10),
    },
    {
      subjectId: subjectIds["Science"],
      subjectName: "Science",
      chapter: "Electricity",
      title: "Ohm's Law – Explainer Video",
      type: "Video",
      durationOrPages: "12 min",
      addedOn: new Date().toISOString().slice(0, 10),
    },
    {
      subjectId: subjectIds["English"],
      subjectName: "English",
      chapter: "Poetry",
      title: "Poetry Analysis – Worksheet",
      type: "Worksheet",
      durationOrPages: "4 pages",
      addedOn: new Date().toISOString().slice(0, 10),
    },
  ];

  console.log("📌 Seeding Learning Materials...");
  for (const material of materials) {
    const ref = doc(collection(db, "learningMaterials"));
    await setDoc(ref, { ...material, userId });
  }

  /* =====================================================
     QUIZZES
  ===================================================== */

  const quizzes: Omit<Quiz, "id">[] = [
    {
      title: "Quadratic Equations – Topic Quiz",
      subjectName: "Mathematics",
      chapter: "Quadratic Equations",
      kind: "Topic Quiz",
      difficulty: "Medium",
      questionTypes: ["MCQ", "Short Answer"],
      totalQuestions: 10,
      durationMinutes: 15,
      attempted: false,
    },
    {
      title: "Electricity – Chapter Quiz",
      subjectName: "Science",
      chapter: "Electricity",
      kind: "Chapter Quiz",
      difficulty: "Easy",
      questionTypes: ["MCQ", "Fill in the Blanks"],
      totalQuestions: 15,
      durationMinutes: 20,
      attempted: false,
    },
    {
      title: "English Grammar – Practice Test",
      subjectName: "English",
      kind: "Practice Test",
      difficulty: "Easy",
      questionTypes: ["MCQ", "True / False"],
      totalQuestions: 12,
      durationMinutes: 10,
      attempted: false,
    },
  ];

  console.log("📌 Seeding Quizzes...");
  for (const quiz of quizzes) {
    const ref = doc(collection(db, "quizzes"));
    await setDoc(ref, { ...quiz, userId });
  }

  /* =====================================================
     ASSIGNMENTS
  ===================================================== */

  const today = new Date();
  const daysFromNow = (n: number) =>
    new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);

  const assignments: Omit<Assignment, "id">[] = [
    {
      subject: "Mathematics",
      chapter: "Quadratic Equations",
      topic: "Nature of Roots",
      instructions: "Solve all 10 problems from the worksheet showing full working.",
      referenceMaterial: "NCERT Chapter 4",
      dueDate: daysFromNow(3),
      status: "Pending",
      submissionStatus: "Not Submitted",
    },
    {
      subject: "Science",
      chapter: "Electricity",
      topic: "Ohm's Law",
      instructions: "Draw and label 3 circuit diagrams with calculations.",
      dueDate: daysFromNow(-2),
      status: "Overdue",
      submissionStatus: "Not Submitted",
    },
    {
      subject: "Social Science",
      chapter: "Federalism",
      topic: "Federalism in India",
      instructions: "Prepare short notes comparing federal and unitary systems.",
      dueDate: daysFromNow(7),
      status: "Upcoming",
      submissionStatus: "Not Submitted",
    },
  ];

  console.log("📌 Seeding Assignments...");
  for (const assignment of assignments) {
    const ref = doc(collection(db, "assignments"));
    await setDoc(ref, { ...assignment, userId });
  }

  /* =====================================================
     LEARNING PROGRESS (one doc per student)
  ===================================================== */

  console.log("📌 Creating Learning Progress...");

  await setDoc(
    doc(db, "learningProgress", userId),
    {
      userId,
      subjectProgress: [
        { subjectName: "Mathematics", progress: 35 },
        { subjectName: "Science", progress: 20 },
        { subjectName: "English", progress: 65 },
      ],
      topicMastery: {
        "Nature of Roots": 40,
        "Ohm's Law": 30,
        Grammar: 80,
      },
      quizPerformance: 0,
      assignmentPerformance: 0,
      studyTimeMinutes: 0,
      completedMaterials: [],
      weakTopics: ["Quadratic Equations", "Electricity"],
      strongTopics: ["Grammar", "Linear Equations"],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  /* =====================================================
     RECOMMENDATIONS
  ===================================================== */

  const recommendations = [
    {
      kind: "topic",
      title: "Discriminant – Nature of Roots (Mathematics)",
      reason: "Weak topic detected in Quadratic Equations",
      targetId: "",
      priority: 1,
    },
    {
      kind: "video",
      title: "Ohm's Law – Explainer Video",
      reason: "Low quiz performance in Electricity",
      targetId: "",
      priority: 2,
    },
    {
      kind: "quiz",
      title: "Electricity – Chapter Quiz",
      reason: "Match your current Easy difficulty level",
      targetId: "",
      priority: 3,
    },
    {
      kind: "revision",
      title: "Revise: Coordinate Geometry basics",
      reason: "Spaced revision schedule",
      targetId: "",
      priority: 4,
    },
  ] as const;

  console.log("📌 Seeding Recommendations...");
  for (const recommendation of recommendations) {
    const ref = doc(collection(db, "recommendations"));
    await setDoc(ref, { ...recommendation, userId, createdAt: serverTimestamp() });
  }

  console.log(`\n✅ Learn collections seeded successfully for user: ${userId}`);
};
