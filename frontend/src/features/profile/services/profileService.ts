// frontend/src/features/profile/services/profileService.ts
// Pure Minimalist, Robust Firestore Service for SMART EDUCATION AI Profile

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
  StudentPersonalProfile,
  EducationDetails,
  EducationTimelineItem,
  SkillItem,
  UserLanguage,
  PortfolioItem,
  AccessibilityProfileSettings,
  ProfileCompletionSummary,
  StudentType,
} from "../types/profile.types";

/**
 * Generates unique permanent EduID
 * Format: EDU-IND-XXXXXX
 */
export function generateUniqueEduId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EDU-IND-${random}`;
}

/**
 * 1. Get Student Personal Profile
 */
export async function getStudentProfile(
  userId: string,
  userEmail?: string,
  userDisplayName?: string
): Promise<StudentPersonalProfile> {
  if (!userId || userId === "guest_student") {
    return createDefaultStudentProfile(userId || "guest_student", userEmail, userDisplayName);
  }

  try {
    const profileRef = doc(db, "profiles", userId);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = snap.data();
      const eduId = data.eduId || data.edu_id || generateUniqueEduId();

      const normalized: StudentPersonalProfile = {
        userId,
        eduId,
        fullName: data.fullName || data.full_name || userDisplayName || "Student",
        email: data.email || userEmail || "",
        phone: data.phone || data.mobile || "",
        photoURL: data.photoURL || data.avatarUrl || data.avatar_url || "",
        avatarUrl: data.avatarUrl || data.photoURL || data.avatar_url || "",
        dateOfBirth: data.dateOfBirth || data.date_of_birth || "",
        age: data.age ?? (data.age_years || undefined),
        gender: data.gender || "Prefer not to say",
        nationality: data.nationality || "Indian",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "Maharashtra",
        district: data.district || "",
        pincode: data.pincode || "",
        bio: data.bio || "",
        
        studentType: (data.studentType || (data.disabilityType || data.disability_type ? "pwd" : "general")) as StudentType,
        accessibilityRequired: data.accessibilityRequired ?? (Boolean(data.disabilityType || data.disability_type)),
        
        disabilityType: data.disabilityType || data.disability_type || "",
        disabilityPercentage: data.disabilityPercentage ?? data.disability_percentage ?? 0,
        udidNumber: data.udidNumber || data.udid_number || "",
        assistiveTech: data.assistiveTech || data.assistive_tech || "",
        
        guardianName: data.guardianName || data.guardian_name || "",
        guardianPhone: data.guardianPhone || data.guardian_phone || "",
        emergencyContactName: data.emergencyContactName || data.emergency_contact_name || "",
        emergencyContactPhone: data.emergencyContactPhone || data.emergency_contact_phone || "",
        
        careerGoals: data.careerGoals || data.career_goals || "",
        preferredJobType: data.preferredJobType || data.preferred_job_type || "Full-time",
        preferredLocations: data.preferredLocations || data.preferred_locations || [],
        workExperienceYears: data.workExperienceYears ?? data.work_experience_years ?? 0,
        linkedinUrl: data.linkedinUrl || data.linkedin_url || "",
        githubUrl: data.githubUrl || data.github_url || "",
        portfolioUrl: data.portfolioUrl || data.portfolio_url || "",
        languages: data.languages || ["English", "Hindi"],
        
        profileCompleted: Boolean(data.profileCompleted || data.profile_completed),
        profileCompletion: data.profileCompletion || data.profile_completion || 75,
        verifiedStatus: Boolean(data.verifiedStatus ?? true),
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
        
        // Mirror fields
        full_name: data.fullName || data.full_name || userDisplayName || "Student",
        education_level: data.educationLevel || data.education_level || "College",
      };

      if (!data.eduId) {
        await updateDoc(profileRef, { eduId, updatedAt: serverTimestamp() }).catch(() => {});
      }

      return normalized;
    }

    const defaultProfile = createDefaultStudentProfile(userId, userEmail, userDisplayName);
    await setDoc(profileRef, {
      ...defaultProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
    return defaultProfile;
  } catch (err) {
    console.warn("getStudentProfile fallback:", err);
    return createDefaultStudentProfile(userId, userEmail, userDisplayName);
  }
}

/**
 * 2. Save Student Profile
 */
export async function saveStudentProfile(
  userId: string,
  data: Partial<StudentPersonalProfile>
): Promise<void> {
  if (!userId || userId === "guest_student") return;

  const profileRef = doc(db, "profiles", userId);
  
  const payload: Record<string, any> = {
    ...data,
    userId,
    updatedAt: serverTimestamp(),
  };

  // Sync snake_case mirrors
  if (data.fullName !== undefined) payload.full_name = data.fullName;
  if (data.dateOfBirth !== undefined) payload.date_of_birth = data.dateOfBirth;
  if (data.disabilityType !== undefined) payload.disability_type = data.disabilityType;
  if (data.disabilityPercentage !== undefined) payload.disability_percentage = data.disabilityPercentage;
  if (data.udidNumber !== undefined) payload.udid_number = data.udidNumber;
  if (data.assistiveTech !== undefined) payload.assistive_tech = data.assistiveTech;
  if (data.guardianName !== undefined) payload.guardian_name = data.guardianName;
  if (data.guardianPhone !== undefined) payload.guardian_phone = data.guardianPhone;
  if (data.avatarUrl !== undefined) {
    payload.photoURL = data.avatarUrl;
    payload.avatar_url = data.avatarUrl;
  }

  await setDoc(profileRef, payload, { merge: true });
}

/**
 * 3. Education Profile Data
 */
export async function getEducationProfile(
  eduId: string,
  userId?: string
): Promise<EducationDetails> {
  const fallback = createDefaultEducationProfile(eduId, userId || "");
  if (!eduId && !userId) return fallback;

  try {
    const docId = userId || eduId || "default";
    const ref = doc(db, "educationProfiles", docId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return {
        ...fallback,
        ...snap.data(),
        eduId,
        userId: userId || snap.data().userId || "",
      } as EducationDetails;
    }

    if (userId) {
      const q = query(collection(db, "educationProfiles"), where("userId", "==", userId));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return {
          ...fallback,
          ...querySnap.docs[0].data(),
        } as EducationDetails;
      }
    }

    return fallback;
  } catch (err) {
    console.warn("getEducationProfile fallback:", err);
    return fallback;
  }
}

export async function saveEducationProfile(
  eduId: string,
  userId: string,
  data: Partial<EducationDetails>
): Promise<void> {
  if (!userId && !eduId) return;
  const docId = userId || eduId;
  const ref = doc(db, "educationProfiles", docId);

  await setDoc(
    ref,
    {
      ...data,
      eduId,
      userId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (data.educationLevel && userId) {
    await updateDoc(doc(db, "profiles", userId), {
      educationLevel: data.educationLevel,
      education_level: data.educationLevel,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }
}

/**
 * 4. Education Timeline
 */
export async function getEducationTimeline(
  userId: string
): Promise<EducationTimelineItem[]> {
  if (!userId || userId === "guest_student") return getDefaultTimeline(userId);
  try {
    const q = query(collection(db, "educationTimeline"), where("userId", "==", userId));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return getDefaultTimeline(userId);
    }

    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as EducationTimelineItem[];

    return items.sort((a, b) => (parseInt(b.endYear || "2030") - parseInt(a.endYear || "2030")));
  } catch (err) {
    return getDefaultTimeline(userId);
  }
}

export async function saveEducationTimelineItem(
  userId: string,
  item: Omit<EducationTimelineItem, "id"> & { id?: string }
): Promise<string> {
  const itemId = item.id || `timeline_${Date.now()}`;
  const ref = doc(db, "educationTimeline", itemId);

  await setDoc(
    ref,
    {
      ...item,
      id: itemId,
      userId,
      updatedAt: serverTimestamp(),
      createdAt: item.createdAt || new Date().toISOString(),
    },
    { merge: true }
  );

  return itemId;
}

export async function deleteEducationTimelineItem(itemId: string): Promise<void> {
  if (!itemId) return;
  await deleteDoc(doc(db, "educationTimeline", itemId)).catch(() => {});
}

/**
 * 5. Skills Management
 */
export async function getUserSkills(userId: string): Promise<SkillItem[]> {
  if (!userId || userId === "guest_student") return getDefaultSkills(userId);
  try {
    const q = query(collection(db, "userSkills"), where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      return getDefaultSkills(userId);
    }

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as SkillItem[];
  } catch (err) {
    return getDefaultSkills(userId);
  }
}

export async function saveSkillItem(
  userId: string,
  skill: Omit<SkillItem, "id"> & { id?: string }
): Promise<string> {
  const skillId = skill.id || `skill_${Date.now()}`;
  const ref = doc(db, "userSkills", skillId);

  await setDoc(
    ref,
    {
      ...skill,
      id: skillId,
      userId,
      createdAt: skill.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return skillId;
}

export async function deleteSkillItem(userId: string, skillId: string): Promise<void> {
  if (!skillId) return;
  await deleteDoc(doc(db, "userSkills", skillId)).catch(() => {});
}

/**
 * 6. Languages Management
 */
export async function getUserLanguages(userId: string): Promise<UserLanguage[]> {
  if (!userId || userId === "guest_student") return getDefaultLanguages(userId);
  try {
    const q = query(collection(db, "userLanguages"), where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      return getDefaultLanguages(userId);
    }

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as UserLanguage[];
  } catch (err) {
    return getDefaultLanguages(userId);
  }
}

export async function saveUserLanguage(
  userId: string,
  language: Omit<UserLanguage, "id"> & { id?: string }
): Promise<string> {
  const langId = language.id || `lang_${Date.now()}`;
  const ref = doc(db, "userLanguages", langId);

  await setDoc(
    ref,
    {
      ...language,
      id: langId,
      userId,
      createdAt: language.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return langId;
}

export async function deleteUserLanguage(langId: string): Promise<void> {
  if (!langId) return;
  await deleteDoc(doc(db, "userLanguages", langId)).catch(() => {});
}

/**
 * 7. Portfolio Management
 */
export async function getUserPortfolio(userId: string): Promise<PortfolioItem[]> {
  if (!userId || userId === "guest_student") return getDefaultPortfolio(userId);
  try {
    const q = query(collection(db, "userPortfolio"), where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      return getDefaultPortfolio(userId);
    }

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as PortfolioItem[];
  } catch (err) {
    return getDefaultPortfolio(userId);
  }
}

export async function savePortfolioItem(
  userId: string,
  item: Omit<PortfolioItem, "id"> & { id?: string }
): Promise<string> {
  const itemId = item.id || `portfolio_${Date.now()}`;
  const ref = doc(db, "userPortfolio", itemId);

  await setDoc(
    ref,
    {
      ...item,
      id: itemId,
      userId,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return itemId;
}

export async function deletePortfolioItem(itemId: string): Promise<void> {
  if (!itemId) return;
  await deleteDoc(doc(db, "userPortfolio", itemId)).catch(() => {});
}

/**
 * 8. Accessibility Profile
 */
export async function getAccessibilityProfile(
  userId: string
): Promise<AccessibilityProfileSettings> {
  const fallback: AccessibilityProfileSettings = {
    userId,
    enabled: false,
    highContrast: false,
    largeText: false,
    dyslexiaFont: false,
    screenReaderOptimized: false,
    textToSpeech: false,
    voiceControl: false,
    gestureControl: false,
    readingGuide: false,
    focusIndicators: true,
    hapticFeedback: false,
    colorFilter: "none",
  };

  if (!userId || userId === "guest_student") return fallback;

  try {
    const ref = doc(db, "profiles", userId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().accessibilityPreferences) {
      return { ...fallback, ...snap.data().accessibilityPreferences, userId };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function saveAccessibilityProfile(
  userId: string,
  settings: Partial<AccessibilityProfileSettings>
): Promise<void> {
  if (!userId || userId === "guest_student") return;
  const ref = doc(db, "profiles", userId);
  await updateDoc(ref, {
    accessibilityPreferences: settings,
    updatedAt: serverTimestamp(),
  }).catch(() => {});
}

/**
 * 9. Calculate Dynamic Profile Completion
 */
export function calculateProfileCompletion(
  personal: StudentPersonalProfile,
  education: EducationDetails,
  skills: SkillItem[],
  languages: UserLanguage[],
  portfolio: PortfolioItem[]
): ProfileCompletionSummary {
  let score = 0;
  const sections = [];

  // Personal Information (25%)
  const hasBasicPersonal = Boolean(personal.fullName && personal.email && personal.phone);
  const personalScore = hasBasicPersonal ? (personal.bio ? 25 : 20) : 10;
  score += personalScore;
  sections.push({
    title: "Personal Information",
    completed: hasBasicPersonal && Boolean(personal.bio),
    weight: 25,
    actionTab: "personal",
  });

  // Education Information (25%)
  const hasEdu = Boolean(
    education.educationLevel &&
      (education.institutionName || education.collegeName || education.schoolBoard)
  );
  const eduScore = hasEdu ? 25 : 0;
  score += eduScore;
  sections.push({
    title: "Education Information",
    completed: hasEdu,
    weight: 25,
    actionTab: "education",
  });

  // Skills (20%)
  const hasSkills = skills.length >= 3;
  const skillsScore = hasSkills ? 20 : Math.min(15, skills.length * 6);
  score += skillsScore;
  sections.push({
    title: "Skills",
    completed: hasSkills,
    weight: 20,
    actionTab: "skills",
  });

  // Languages (15%)
  const hasLanguages = languages.length >= 1;
  const langScore = hasLanguages ? 15 : 0;
  score += langScore;
  sections.push({
    title: "Languages",
    completed: hasLanguages,
    weight: 15,
    actionTab: "languages",
  });

  // Portfolio (15%)
  const hasPortfolio = portfolio.length >= 1;
  const portScore = hasPortfolio ? 15 : 0;
  score += portScore;
  sections.push({
    title: "EduPortfolio",
    completed: hasPortfolio,
    weight: 15,
    actionTab: "portfolio",
  });

  const finalScore = Math.min(100, score);

  return {
    overallPercentage: finalScore,
    isComplete: finalScore >= 85,
    sections,
    recommendations: [
      !hasEdu ? "Complete your Education Profile." : null,
      !hasSkills ? "Add your skills to reach full profile readiness." : null,
      !hasLanguages ? "Add your languages and proficiency levels." : null,
      !hasPortfolio ? "Add projects or certificates to build your EduPortfolio." : null,
      !personal.bio ? "Add a brief personal bio." : null,
    ].filter(Boolean) as string[],
  };
}

// Defaults
function createDefaultStudentProfile(
  userId: string,
  userEmail?: string,
  userDisplayName?: string
): StudentPersonalProfile {
  return {
    userId,
    eduId: generateUniqueEduId(),
    fullName: userDisplayName || "Aditya Wargade",
    email: userEmail || "student@education.gov.in",
    phone: "+91 98765 43210",
    photoURL: "",
    avatarUrl: "",
    dateOfBirth: "2003-05-15",
    age: 21,
    gender: "Male",
    nationality: "Indian",
    address: "Model Colony, Shivaji Nagar",
    city: "Pune",
    state: "Maharashtra",
    district: "Pune",
    pincode: "411016",
    bio: "Computer Science student specializing in Artificial Intelligence and Web Technologies.",
    studentType: "general",
    accessibilityRequired: false,
    disabilityType: "",
    disabilityPercentage: 0,
    udidNumber: "",
    assistiveTech: "",
    guardianName: "Sunil Wargade",
    guardianPhone: "+91 98220 12345",
    emergencyContactName: "Sunil Wargade",
    emergencyContactPhone: "+91 98220 12345",
    careerGoals: "Software Engineer",
    preferredJobType: "Full-time",
    preferredLocations: ["Pune", "Mumbai", "Bangalore"],
    workExperienceYears: 1,
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    languages: ["English", "Hindi", "Marathi"],
    profileCompleted: true,
    profileCompletion: 85,
    verifiedStatus: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    full_name: userDisplayName || "Aditya Wargade",
    education_level: "College",
  };
}

function createDefaultEducationProfile(eduId: string, userId: string): EducationDetails {
  return {
    eduId,
    userId,
    educationLevel: "Undergraduate / College",
    institutionName: "COEP Technological University",
    collegeName: "COEP Technological University",
    university: "State Technological University",
    degree: "B.Tech",
    course: "Computer Engineering",
    branch: "Computer Science & Engineering",
    specialization: "AI & Distributed Systems",
    year: "3rd Year",
    semester: "Semester 6",
    academicYear: "2023-2027",
    mediumOfEducation: "English",
    cgpaOrPercentage: "9.2 CGPA",
  };
}

function getDefaultTimeline(userId: string): EducationTimelineItem[] {
  return [
    {
      id: "tl_1",
      userId,
      institution: "COEP Technological University",
      educationType: "Undergraduate (B.Tech)",
      courseOrClass: "B.Tech Computer Engineering",
      streamOrBranch: "Computer Science",
      startYear: "2023",
      endYear: "2027",
      status: "Pursuing",
      scoreOrGrade: "9.2 CGPA",
      description: "Core computer science, algorithms, operating systems, and AI systems.",
    },
    {
      id: "tl_2",
      userId,
      institution: "Fergusson Junior College",
      educationType: "Higher Secondary (Class 12)",
      courseOrClass: "Class 12 (HSC)",
      streamOrBranch: "Science (PCM)",
      startYear: "2021",
      endYear: "2023",
      status: "Completed",
      scoreOrGrade: "94.5%",
      description: "State Board Merit rank in Science stream.",
    },
  ];
}

function getDefaultSkills(userId: string): SkillItem[] {
  return [
    { id: "sk_1", userId, name: "React & TypeScript", category: "Technical", level: "Advanced" },
    { id: "sk_2", userId, name: "Python", category: "Technical", level: "Advanced" },
    { id: "sk_3", userId, name: "Data Structures & Algorithms", category: "Academic", level: "Intermediate" },
    { id: "sk_4", userId, name: "Technical Communication", category: "Communication", level: "Advanced" },
    { id: "sk_5", userId, name: "Team Leadership", category: "Leadership", level: "Intermediate" },
  ];
}

function getDefaultLanguages(userId: string): UserLanguage[] {
  return [
    { id: "lang_1", userId, name: "English", reading: "Fluent", writing: "Fluent", speaking: "Fluent" },
    { id: "lang_2", userId, name: "Hindi", reading: "Fluent", writing: "Fluent", speaking: "Fluent" },
    { id: "lang_3", userId, name: "Marathi", reading: "Fluent", writing: "Fluent", speaking: "Fluent" },
  ];
}

function getDefaultPortfolio(userId: string): PortfolioItem[] {
  return [
    {
      id: "port_1",
      userId,
      type: "project",
      title: "Smart Education AI — Educational Identity & Learning Platform",
      description: "Unified AI-powered education platform with permanent EduID verification, intelligent curriculum tutoring, and accessibility.",
      technologies: ["React", "TypeScript", "Firebase", "Tailwind CSS"],
      organization: "Smart Education AI",
      startDate: "2026-01-10",
      completionDate: "2026-08-30",
    },
    {
      id: "port_2",
      userId,
      type: "hackathon",
      title: "Smart India Hackathon 2026",
      description: "Selected as National Grand Finalist for inclusive AI education architecture.",
      organization: "Ministry of Education & AICTE",
      rankOrPosition: "Finalist",
      startDate: "2026-03-01",
      completionDate: "2026-08-30",
    },
  ];
}
