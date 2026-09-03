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
 * Recursively cleans any objects or nested objects passed to Firestore,
 * ensuring no keys with `undefined` values exist. Preserves Firestore FieldValues,
 * serverTimestamp(), and Dates.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === "object" && item !== null ? cleanFirestoreData(item) : item)) as any;
  }
  const res: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === "object") {
      // Check if it's a Firestore FieldValue (e.g. serverTimestamp) or Date
      if (value instanceof Date || ("_methodName" in value) || ("toMillis" in value)) {
        res[key] = value;
      } else if (Array.isArray(value)) {
        res[key] = value.map((item) => (typeof item === "object" && item !== null ? cleanFirestoreData(item) : item));
      } else {
        res[key] = cleanFirestoreData(value);
      }
    } else {
      res[key] = value;
    }
  }
  return res as T;
}

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
    return createInitialStudentProfile(userId || "guest_student", userEmail, userDisplayName);
  }

  try {
    const profileRef = doc(db, "profiles", userId);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = snap.data();
      const eduId = data.eduId || data.edu_id || generateUniqueEduId();

      // Detect if user has auto-seeded legacy dummy data from earlier template
      const isLegacyDummy =
        (data.guardianName === "Sunil Wargade" && data.phone === "+91 98220 12345") ||
        (data.address === "Model Colony, Shivaji Nagar" && (data.phone === "+91 98765 43210" || data.phone === "+91 98220 12345")) ||
        (data.bio === "Computer Science student specializing in Artificial Intelligence and Web Technologies.");

      const parsedAge = typeof data.age === "number" && !isNaN(data.age) && data.age > 0
        ? data.age
        : (typeof data.age_years === "number" && !isNaN(data.age_years) && data.age_years > 0 ? data.age_years : undefined);

      const normalized: StudentPersonalProfile = {
        userId,
        eduId,
        fullName: isLegacyDummy ? (userDisplayName || "") : (data.fullName || data.full_name || userDisplayName || ""),
        email: data.email || userEmail || "",
        phone: isLegacyDummy ? "" : (data.phone || data.mobile || ""),
        photoURL: data.photoURL || data.avatarUrl || data.avatar_url || "",
        avatarUrl: data.avatarUrl || data.photoURL || data.avatar_url || "",
        dateOfBirth: isLegacyDummy ? "" : (data.dateOfBirth || data.date_of_birth || ""),
        age: isLegacyDummy ? undefined : parsedAge,
        gender: isLegacyDummy ? "" : (data.gender || ""),
        nationality: data.nationality || "Indian",
        address: isLegacyDummy ? "" : (data.address || ""),
        city: isLegacyDummy ? "" : (data.city || ""),
        state: isLegacyDummy ? "" : (data.state || ""),
        district: isLegacyDummy ? "" : (data.district || ""),
        pincode: isLegacyDummy ? "" : (data.pincode || ""),
        bio: isLegacyDummy ? "" : (data.bio || ""),
        
        studentType: (data.studentType || (data.disabilityType || data.disability_type ? "pwd" : "general")) as StudentType,
        accessibilityRequired: data.accessibilityRequired ?? (Boolean(data.disabilityType || data.disability_type)),
        
        disabilityType: data.disabilityType || data.disability_type || "",
        disabilityPercentage: data.disabilityPercentage ?? data.disability_percentage ?? 0,
        udidNumber: data.udidNumber || data.udid_number || "",
        assistiveTech: data.assistiveTech || data.assistive_tech || "",
        
        guardianName: isLegacyDummy ? "" : (data.guardianName || data.guardian_name || ""),
        guardianPhone: isLegacyDummy ? "" : (data.guardianPhone || data.guardian_phone || ""),
        emergencyContactName: isLegacyDummy ? "" : (data.emergencyContactName || data.emergency_contact_name || ""),
        emergencyContactPhone: isLegacyDummy ? "" : (data.emergencyContactPhone || data.emergency_contact_phone || ""),
        
        careerGoals: isLegacyDummy ? "" : (data.careerGoals || data.career_goals || ""),
        preferredJobType: isLegacyDummy ? "Full-time" : (data.preferredJobType || data.preferred_job_type || "Full-time"),
        preferredLocations: isLegacyDummy ? [] : (data.preferredLocations || data.preferred_locations || []),
        workExperienceYears: isLegacyDummy ? 0 : (data.workExperienceYears ?? data.work_experience_years ?? 0),
        linkedinUrl: data.linkedinUrl || data.linkedin_url || "",
        githubUrl: data.githubUrl || data.github_url || "",
        portfolioUrl: data.portfolioUrl || data.portfolio_url || "",
        languages: isLegacyDummy ? [] : (data.languages || []),
        
        profileCompleted: isLegacyDummy ? false : Boolean(data.profileCompleted || data.profile_completed),
        profileCompletion: isLegacyDummy ? 0 : (typeof data.profileCompletion === "number" ? data.profileCompletion : (typeof data.profile_completion === "number" ? data.profile_completion : 0)),
        verifiedStatus: Boolean(data.verifiedStatus || false),
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
        
        // Mirror fields
        full_name: isLegacyDummy ? (userDisplayName || "") : (data.fullName || data.full_name || userDisplayName || ""),
        education_level: isLegacyDummy ? "" : (data.educationLevel || data.education_level || ""),
      };

      if (!data.eduId) {
        await updateDoc(profileRef, { eduId, updatedAt: serverTimestamp() }).catch(() => {});
      }

      return normalized;
    }

    const freshProfile = createInitialStudentProfile(userId, userEmail, userDisplayName);
    await setDoc(profileRef, cleanFirestoreData({
      ...freshProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })).catch(() => {});
    return freshProfile;
  } catch (err) {
    console.warn("getStudentProfile fallback:", err);
    return createInitialStudentProfile(userId, userEmail, userDisplayName);
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

  const sanitized = cleanFirestoreData(payload);
  await setDoc(profileRef, sanitized, { merge: true });
}

/**
 * 3. Education Profile Data
 */
export async function getEducationProfile(
  eduId: string,
  userId?: string
): Promise<EducationDetails> {
  const initial = createInitialEducationProfile(eduId, userId || "");
  if (!eduId && !userId) return initial;

  try {
    const docId = userId || eduId || "default";
    const ref = doc(db, "educationProfiles", docId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const isLegacyDummy =
        data.institutionName === "COEP Technological University" &&
        data.specialization === "AI & Distributed Systems" &&
        data.cgpaOrPercentage === "9.2 CGPA";

      if (isLegacyDummy) {
        return initial;
      }

      return {
        ...initial,
        ...data,
        eduId: eduId || data.eduId || "",
        userId: userId || data.userId || "",
      } as EducationDetails;
    }

    if (userId) {
      const q = query(collection(db, "educationProfiles"), where("userId", "==", userId));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const data = querySnap.docs[0].data();
        const isLegacyDummy =
          data.institutionName === "COEP Technological University" &&
          data.specialization === "AI & Distributed Systems" &&
          data.cgpaOrPercentage === "9.2 CGPA";

        if (isLegacyDummy) {
          return initial;
        }

        return {
          ...initial,
          ...data,
          eduId: eduId || data.eduId || "",
          userId: userId || data.userId || "",
        } as EducationDetails;
      }
    }

    return initial;
  } catch (err) {
    console.warn("getEducationProfile error:", err);
    return initial;
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
    cleanFirestoreData({
      ...data,
      eduId,
      userId,
      updatedAt: serverTimestamp(),
    }),
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
  if (!userId || userId === "guest_student") return [];
  try {
    const q = query(collection(db, "educationTimeline"), where("userId", "==", userId));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return [];
    }

    const items = snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((d: any) => !(d.id === "tl_1" && d.institution === "COEP Technological University")) as EducationTimelineItem[];

    return items.sort((a, b) => (parseInt(b.endYear || "2030") - parseInt(a.endYear || "2030")));
  } catch (err) {
    return [];
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
    cleanFirestoreData({
      ...item,
      id: itemId,
      userId,
      updatedAt: serverTimestamp(),
      createdAt: item.createdAt || new Date().toISOString(),
    }),
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
  if (!userId || userId === "guest_student") return [];
  try {
    const q = query(collection(db, "userSkills"), where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      return [];
    }

    return snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((s: any) => !(s.id?.startsWith("sk_") && s.name === "React & TypeScript")) as SkillItem[];
  } catch (err) {
    return [];
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
    cleanFirestoreData({
      ...skill,
      id: skillId,
      userId,
      createdAt: skill.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }),
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
  if (!userId || userId === "guest_student") return [];
  try {
    const q = query(collection(db, "userLanguages"), where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      return [];
    }

    return snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((l: any) => !(l.id?.startsWith("lang_") && l.name === "English" && l.reading === "Fluent")) as UserLanguage[];
  } catch (err) {
    return [];
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
    cleanFirestoreData({
      ...language,
      id: langId,
      userId,
      createdAt: language.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }),
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
  if (!userId || userId === "guest_student") return [];
  try {
    const q = query(collection(db, "userPortfolio"), where("userId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      return [];
    }

    return snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((p: any) => !(p.id?.startsWith("port_") && p.title?.includes("Smart Education AI"))) as PortfolioItem[];
  } catch (err) {
    return [];
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
    cleanFirestoreData({
      ...item,
      id: itemId,
      userId,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }),
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
  await updateDoc(ref, cleanFirestoreData({
    accessibilityPreferences: settings,
    updatedAt: serverTimestamp(),
  })).catch(() => {});
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

  // 1. Personal Information (25% total)
  // Evaluates actual presence of user-entered personal profile fields
  let personalScore = 0;
  const hasName = Boolean(personal?.fullName && personal.fullName.trim().length > 0);
  const hasEmail = Boolean(personal?.email && personal.email.trim().length > 0);
  const hasPhone = Boolean(personal?.phone && personal.phone.trim().length >= 7);
  const hasLocation = Boolean(
    (personal?.city && personal.city.trim().length > 0) ||
    (personal?.state && personal.state.trim().length > 0) ||
    (personal?.address && personal.address.trim().length > 0)
  );
  const hasBioOrGoal = Boolean(
    (personal?.bio && personal.bio.trim().length > 5) ||
    (personal?.careerGoals && personal.careerGoals.trim().length > 0)
  );

  if (hasName) personalScore += 5;
  if (hasEmail) personalScore += 5;
  if (hasPhone) personalScore += 5;
  if (hasLocation) personalScore += 5;
  if (hasBioOrGoal) personalScore += 5;

  score += personalScore;
  const isPersonalComplete = personalScore >= 20;
  sections.push({
    title: "Personal Information",
    completed: isPersonalComplete,
    weight: 25,
    actionTab: "personal",
  });

  // 2. Education Information (25% total)
  // Evaluates level (10%), institution (10%), course/stream/grade (5%)
  let eduScore = 0;
  const hasLevel = Boolean(education?.educationLevel && education.educationLevel.trim().length > 0);
  const hasInst = Boolean(
    (education?.institutionName && education.institutionName.trim().length > 0) ||
    (education?.collegeName && education.collegeName.trim().length > 0) ||
    (education?.schoolBoard && education.schoolBoard.trim().length > 0)
  );
  const hasProgram = Boolean(
    (education?.degree && education.degree.trim().length > 0) ||
    (education?.course && education.course.trim().length > 0) ||
    (education?.branch && education.branch.trim().length > 0) ||
    (education?.schoolClass && education.schoolClass.trim().length > 0)
  );

  if (hasLevel) eduScore += 10;
  if (hasInst) eduScore += 10;
  if (hasProgram) eduScore += 5;

  score += eduScore;
  const isEduComplete = eduScore >= 20;
  sections.push({
    title: "Education Information",
    completed: isEduComplete,
    weight: 25,
    actionTab: "education",
  });

  // 3. Skills (20% total)
  // 0 skills: 0%, 1 skill: 6%, 2 skills: 12%, >= 3 skills: 20%
  const validSkills = (skills || []).filter((s) => s && s.name && s.name.trim().length > 0);
  let skillsScore = 0;
  if (validSkills.length >= 3) {
    skillsScore = 20;
  } else if (validSkills.length > 0) {
    skillsScore = validSkills.length * 6;
  }
  score += skillsScore;
  sections.push({
    title: "Skills",
    completed: validSkills.length >= 3,
    weight: 20,
    actionTab: "skills",
  });

  // 4. Languages (15% total)
  const validLanguages = (languages || []).filter((l) => l && l.name && l.name.trim().length > 0);
  const langScore = validLanguages.length >= 1 ? 15 : 0;
  score += langScore;
  sections.push({
    title: "Languages",
    completed: validLanguages.length >= 1,
    weight: 15,
    actionTab: "languages",
  });

  // 5. EduPortfolio (15% total)
  const validPortfolio = (portfolio || []).filter((p) => p && p.title && p.title.trim().length > 0);
  const portScore = validPortfolio.length >= 1 ? 15 : 0;
  score += portScore;
  sections.push({
    title: "EduPortfolio",
    completed: validPortfolio.length >= 1,
    weight: 15,
    actionTab: "portfolio",
  });

  const finalScore = Math.min(100, Math.round(score));

  const recommendations: string[] = [];
  if (!isPersonalComplete) {
    if (!hasPhone) recommendations.push("Add a contact phone number.");
    if (!hasLocation) recommendations.push("Add your city/state location.");
    if (!hasBioOrGoal) recommendations.push("Add a brief bio or career goal.");
  }
  if (!isEduComplete) {
    recommendations.push("Complete your Education Profile (select education level & institution).");
  }
  if (validSkills.length < 3) {
    recommendations.push("Add at least 3 skills to demonstrate your capabilities.");
  }
  if (validLanguages.length === 0) {
    recommendations.push("Add languages you speak, read, or write.");
  }
  if (validPortfolio.length === 0) {
    recommendations.push("Add projects, certifications, or achievements to EduPortfolio.");
  }

  return {
    overallPercentage: finalScore,
    isComplete: finalScore >= 85,
    sections,
    recommendations,
  };
}

// Initial Clean Profile Generators
export function createInitialStudentProfile(
  userId: string,
  userEmail?: string,
  userDisplayName?: string
): StudentPersonalProfile {
  return {
    userId,
    eduId: generateUniqueEduId(),
    fullName: userDisplayName || "",
    email: userEmail || "",
    phone: "",
    photoURL: "",
    avatarUrl: "",
    dateOfBirth: "",
    age: undefined,
    gender: "",
    nationality: "Indian",
    address: "",
    city: "",
    state: "",
    district: "",
    pincode: "",
    bio: "",
    studentType: "general",
    accessibilityRequired: false,
    disabilityType: "",
    disabilityPercentage: 0,
    udidNumber: "",
    assistiveTech: "",
    guardianName: "",
    guardianPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    careerGoals: "",
    preferredJobType: "Full-time",
    preferredLocations: [],
    workExperienceYears: 0,
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    languages: [],
    profileCompleted: false,
    profileCompletion: 0,
    verifiedStatus: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    full_name: userDisplayName || "",
    education_level: "",
  };
}

export function createInitialEducationProfile(eduId: string, userId: string): EducationDetails {
  return {
    eduId,
    userId,
    educationLevel: "",
    institutionName: "",
    collegeName: "",
    university: "",
    degree: "",
    course: "",
    branch: "",
    specialization: "",
    year: "",
    semester: "",
    academicYear: "",
    mediumOfEducation: "",
    cgpaOrPercentage: "",
  };
}
