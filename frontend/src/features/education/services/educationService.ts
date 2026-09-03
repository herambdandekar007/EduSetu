// frontend/src/features/education/services/educationService.ts
// Permanent Firestore Data Service for SMART EDUCATION AI — Education System

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type {
  EducationProfile,
  EducationHistoryItem,
  EducationSubject,
  SkillItem,
  LanguageItem,
} from "../types/education.types";

/**
 * Generate a lifelong standardized EduID: EDU-IND-2026-XXXXXX
 */
export const generateEduId = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EDU-IND-2026-${randomPart}`;
};

/**
 * Ensure the student has a valid lifelong EduID persisted to their profile
 */
export const ensureStudentEduId = async (
  userId: string,
  existingEduId?: string
): Promise<string> => {
  if (existingEduId && existingEduId.startsWith("EDU-")) {
    return existingEduId;
  }

  try {
    const profileRef = doc(db, "profiles", userId);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.eduId || data.edu_id) {
        return data.eduId || data.edu_id;
      }
    }

    const newEduId = generateEduId();
    await setDoc(
      profileRef,
      {
        eduId: newEduId,
        edu_id: newEduId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return newEduId;
  } catch (err) {
    console.warn("ensureStudentEduId fallback:", err);
    return existingEduId || generateEduId();
  }
};

/**
 * Calculate the completeness percentage of the education profile
 */
export const calculateProfileCompletion = (
  profile: Partial<EducationProfile> | null
): { percentage: number; missingFields: string[] } => {
  if (!profile) return { percentage: 0, missingFields: ["Education Level", "Institution Name", "Board/University", "Course/Class"] };

  const fieldsToCheck: { key: keyof EducationProfile; label: string }[] = [
    { key: "educationLevel", label: "Education Level" },
    { key: "institutionName", label: "Institution Name" },
    { key: "boardOrUniversity", label: "Board or University" },
    { key: "state", label: "State" },
    { key: "city", label: "City" },
  ];

  if (profile.educationLevel === "school") {
    fieldsToCheck.push({ key: "classOrGrade", label: "Class / Grade" });
    fieldsToCheck.push({ key: "medium", label: "Medium of Instruction" });
  } else {
    fieldsToCheck.push({ key: "course", label: "Course / Degree" });
    fieldsToCheck.push({ key: "branch", label: "Branch / Specialization" });
    fieldsToCheck.push({ key: "year", label: "Academic Year" });
    fieldsToCheck.push({ key: "semester", label: "Semester" });
  }

  const missingFields: string[] = [];
  let filledCount = 0;

  for (const item of fieldsToCheck) {
    const val = profile[item.key];
    if (val && String(val).trim().length > 0) {
      filledCount++;
    } else {
      missingFields.push(item.label);
    }
  }

  const percentage = Math.round((filledCount / fieldsToCheck.length) * 100);
  return { percentage, missingFields };
};

/* =========================================================
   1. EDUCATION PROFILE (educationProfiles/{eduId})
========================================================= */

export const getEducationProfile = async (
  userId: string,
  eduId?: string
): Promise<EducationProfile | null> => {
  try {
    const validEduId = await ensureStudentEduId(userId, eduId);

    // 1. Try fetching from educationProfiles/{eduId}
    const eduRef = doc(db, "educationProfiles", validEduId);
    const eduSnap = await getDoc(eduRef);

    if (eduSnap.exists()) {
      const data = eduSnap.data() as EducationProfile;
      const { percentage } = calculateProfileCompletion(data);
      return { ...data, id: eduSnap.id, eduId: validEduId, userId, profileCompletion: percentage };
    }

    // 2. Fallback to profiles/{userId}
    const userRef = doc(db, "profiles", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const uData = userSnap.data();
      const legacyEdu = uData.educationProfile || {};
      const fallback: EducationProfile = {
        eduId: validEduId,
        userId,
        fullName: uData.fullName || uData.full_name || "Student",
        email: uData.email || "",
        educationLevel: uData.educationLevel || legacyEdu.educationLevel || "college",
        institutionName: legacyEdu.institutionName || legacyEdu.schoolOrCollegeName || "Government College of Engineering",
        institutionType: "College",
        boardOrUniversity: legacyEdu.boardOrUniversity || "State Technical University",
        medium: legacyEdu.medium || "English",
        classOrGrade: legacyEdu.classOrGrade || "",
        stream: legacyEdu.stream || "Science",
        degree: legacyEdu.degree || "B.E.",
        course: legacyEdu.course || legacyEdu.degreeOrCourse || "Engineering",
        branch: legacyEdu.branch || legacyEdu.branchOrSpecialization || "Computer Engineering",
        specialization: legacyEdu.specialization || "AI & Software Systems",
        year: legacyEdu.year ? String(legacyEdu.year) : "3",
        semester: legacyEdu.semester ? String(legacyEdu.semester) : "6",
        academicYear: "2025-2026",
        state: uData.state || legacyEdu.state || "Maharashtra",
        city: uData.city || legacyEdu.city || "Pune",
        country: "India",
        skills: uData.skills || ["Python", "Algorithms", "SQL", "Web Development"],
        languages: uData.languages || ["English", "Hindi", "Marathi"],
        profileCompletion: 85,
      };

      // Persist fallback to educationProfiles collection
      await setDoc(eduRef, { ...fallback, updatedAt: serverTimestamp() }, { merge: true });
      return fallback;
    }

    return null;
  } catch (err) {
    console.error("❌ getEducationProfile error:", err);
    throw err;
  }
};

export const saveEducationProfile = async (
  profileData: Partial<EducationProfile> & { userId: string }
): Promise<EducationProfile> => {
  try {
    const validEduId = await ensureStudentEduId(profileData.userId, profileData.eduId);
    const { percentage } = calculateProfileCompletion(profileData);

    const docPayload: Partial<EducationProfile> = {
      ...profileData,
      eduId: validEduId,
      profileCompletion: percentage,
      updatedAt: serverTimestamp(),
    };

    // 1. Save to educationProfiles/{eduId}
    const eduRef = doc(db, "educationProfiles", validEduId);
    await setDoc(eduRef, docPayload, { merge: true });

    // 2. Mirror essential fields to profiles/{userId} for cross-module sync
    const profileRef = doc(db, "profiles", profileData.userId);
    await setDoc(
      profileRef,
      {
        eduId: validEduId,
        edu_id: validEduId,
        educationLevel: profileData.educationLevel,
        education_level: profileData.educationLevel,
        school_college: profileData.institutionName,
        board_university: profileData.boardOrUniversity,
        course: profileData.course || profileData.degree,
        specialization: profileData.branch || profileData.specialization,
        skills: profileData.skills || [],
        languages: profileData.languages || [],
        state: profileData.state,
        city: profileData.city,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { ...profileData, eduId: validEduId, profileCompletion: percentage } as EducationProfile;
  } catch (err) {
    console.error("❌ saveEducationProfile error:", err);
    throw err;
  }
};

/* =========================================================
   2. EDUCATIONAL TIMELINE & PREVIOUS EDUCATION
========================================================= */

export const getEducationHistory = async (
  userId: string
): Promise<EducationHistoryItem[]> => {
  try {
    const coll = collection(db, "educationHistory");
    const q = query(coll, where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Seed default initial timeline if none exists
      const defaultHistory: Omit<EducationHistoryItem, "id">[] = [
        {
          userId,
          eduId: "EDU-STU-2026",
          educationLevel: "school",
          institution: "Kendriya Vidyalaya Public School",
          boardOrUniversity: "CBSE",
          courseOrClass: "Secondary School (Class 10)",
          streamOrBranch: "General Science & Maths",
          startDate: "2018",
          endDate: "2022",
          scoreOrGrade: "92.4%",
          status: "Completed",
        },
        {
          userId,
          eduId: "EDU-STU-2026",
          educationLevel: "school",
          institution: "Shivaji Junior Science College",
          boardOrUniversity: "Maharashtra State Board",
          courseOrClass: "Higher Secondary (Class 12)",
          streamOrBranch: "Science (PCMB)",
          startDate: "2022",
          endDate: "2024",
          scoreOrGrade: "88.6%",
          status: "Completed",
        },
        {
          userId,
          eduId: "EDU-STU-2026",
          educationLevel: "college",
          institution: "Government College of Engineering",
          boardOrUniversity: "Savitribai Phule Pune University",
          courseOrClass: "Bachelor of Engineering (B.E.)",
          streamOrBranch: "Computer Engineering",
          startDate: "2024",
          endDate: "2028",
          scoreOrGrade: "8.7 CGPA",
          status: "Current",
        },
      ];

      const created: EducationHistoryItem[] = [];
      for (const item of defaultHistory) {
        const docRef = await addDoc(coll, { ...item, createdAt: serverTimestamp() });
        created.push({ id: docRef.id, ...item });
      }
      return created;
    }

    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EducationHistoryItem));
  } catch (err) {
    console.error("❌ getEducationHistory error:", err);
    return [];
  }
};

export const addEducationHistory = async (
  item: Omit<EducationHistoryItem, "id">
): Promise<EducationHistoryItem> => {
  const coll = collection(db, "educationHistory");
  const docRef = await addDoc(coll, { ...item, createdAt: serverTimestamp() });
  return { id: docRef.id, ...item };
};

export const updateEducationHistory = async (
  id: string,
  updates: Partial<EducationHistoryItem>
): Promise<void> => {
  const docRef = doc(db, "educationHistory", id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteEducationHistory = async (id: string): Promise<void> => {
  const docRef = doc(db, "educationHistory", id);
  await deleteDoc(docRef);
};

/* =========================================================
   3. SUBJECT MANAGEMENT
========================================================= */

export const getStudentSubjects = async (
  userId: string
): Promise<EducationSubject[]> => {
  try {
    const coll = collection(db, "subjects");
    const q = query(coll, where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const defaultSubjects: Omit<EducationSubject, "id">[] = [
        {
          userId,
          eduId: "EDU-STU-2026",
          name: "Database Management Systems",
          subjectCode: "CS-301",
          teacher: "Prof. S. Kulkarni",
          educationLevel: "college",
          year: "3",
          semester: "6",
          credits: 4,
          status: "Active",
          isFavorite: true,
          progress: 82,
        },
        {
          userId,
          eduId: "EDU-STU-2026",
          name: "Data Structures & Algorithms",
          subjectCode: "CS-302",
          teacher: "Dr. R. Sharma",
          educationLevel: "college",
          year: "3",
          semester: "6",
          credits: 4,
          status: "Active",
          isFavorite: true,
          progress: 68,
        },
        {
          userId,
          eduId: "EDU-STU-2026",
          name: "Operating Systems & Concurrency",
          subjectCode: "CS-303",
          teacher: "Prof. A. Verma",
          educationLevel: "college",
          year: "3",
          semester: "6",
          credits: 3,
          status: "Active",
          isFavorite: false,
          progress: 74,
        },
        {
          userId,
          eduId: "EDU-STU-2026",
          name: "Discrete Mathematics & Applied Statistics",
          subjectCode: "MA-201",
          teacher: "Dr. P. Nair",
          educationLevel: "college",
          year: "3",
          semester: "6",
          credits: 3,
          status: "Active",
          isFavorite: false,
          progress: 60,
        },
      ];

      const created: EducationSubject[] = [];
      for (const s of defaultSubjects) {
        const docRef = await addDoc(coll, { ...s, createdAt: serverTimestamp() });
        created.push({ id: docRef.id, ...s });
      }
      return created;
    }

    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EducationSubject));
  } catch (err) {
    console.error("❌ getStudentSubjects error:", err);
    return [];
  }
};

export const addStudentSubject = async (
  subject: Omit<EducationSubject, "id">
): Promise<EducationSubject> => {
  const coll = collection(db, "subjects");
  const docRef = await addDoc(coll, { ...subject, createdAt: serverTimestamp() });
  return { id: docRef.id, ...subject };
};

export const updateStudentSubject = async (
  id: string,
  updates: Partial<EducationSubject>
): Promise<void> => {
  const docRef = doc(db, "subjects", id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteStudentSubject = async (id: string): Promise<void> => {
  const docRef = doc(db, "subjects", id);
  await deleteDoc(docRef);
};

/* =========================================================
   4. SKILLS & LANGUAGES MANAGEMENT
========================================================= */

export const getStudentSkills = async (userId: string): Promise<SkillItem[]> => {
  try {
    const coll = collection(db, "studentSkills");
    const q = query(coll, where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const defaultSkills: Omit<SkillItem, "id">[] = [
        { userId, eduId: "EDU-STU-2026", name: "Python Programming", category: "Technical", level: "Advanced", status: "Mastered" },
        { userId, eduId: "EDU-STU-2026", name: "SQL & Database Design", category: "Technical", level: "Advanced", status: "Mastered" },
        { userId, eduId: "EDU-STU-2026", name: "Data Structures (DSA)", category: "Academic", level: "Intermediate", status: "Learning" },
        { userId, eduId: "EDU-STU-2026", name: "Problem Solving & Logic", category: "Soft", level: "Advanced", status: "Mastered" },
        { userId, eduId: "EDU-STU-2026", name: "Technical Communication", category: "Soft", level: "Intermediate", status: "Learning" },
      ];

      const created: SkillItem[] = [];
      for (const sk of defaultSkills) {
        const docRef = await addDoc(coll, { ...sk, createdAt: serverTimestamp() });
        created.push({ id: docRef.id, ...sk });
      }
      return created;
    }

    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SkillItem));
  } catch (err) {
    console.error("❌ getStudentSkills error:", err);
    return [];
  }
};

export const addStudentSkill = async (skill: Omit<SkillItem, "id">): Promise<SkillItem> => {
  const coll = collection(db, "studentSkills");
  const docRef = await addDoc(coll, { ...skill, createdAt: serverTimestamp() });
  return { id: docRef.id, ...skill };
};

export const deleteStudentSkill = async (id: string): Promise<void> => {
  const docRef = doc(db, "studentSkills", id);
  await deleteDoc(docRef);
};

export const getStudentLanguages = async (userId: string): Promise<LanguageItem[]> => {
  try {
    const coll = collection(db, "studentLanguages");
    const q = query(coll, where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const defaultLangs: Omit<LanguageItem, "id">[] = [
        { userId, eduId: "EDU-STU-2026", name: "English", readingLevel: "Native", writingLevel: "Advanced", speakingLevel: "Advanced" },
        { userId, eduId: "EDU-STU-2026", name: "Hindi", readingLevel: "Native", writingLevel: "Native", speakingLevel: "Native" },
        { userId, eduId: "EDU-STU-2026", name: "Marathi", readingLevel: "Advanced", writingLevel: "Intermediate", speakingLevel: "Advanced" },
      ];

      const created: LanguageItem[] = [];
      for (const lg of defaultLangs) {
        const docRef = await addDoc(coll, { ...lg, createdAt: serverTimestamp() });
        created.push({ id: docRef.id, ...lg });
      }
      return created;
    }

    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LanguageItem));
  } catch (err) {
    console.error("❌ getStudentLanguages error:", err);
    return [];
  }
};

export const addStudentLanguage = async (lang: Omit<LanguageItem, "id">): Promise<LanguageItem> => {
  const coll = collection(db, "studentLanguages");
  const docRef = await addDoc(coll, { ...lang, createdAt: serverTimestamp() });
  return { id: docRef.id, ...lang };
};

export const deleteStudentLanguage = async (id: string): Promise<void> => {
  const docRef = doc(db, "studentLanguages", id);
  await deleteDoc(docRef);
};
