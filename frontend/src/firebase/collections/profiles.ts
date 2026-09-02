import { db } from "../firebase.config.ts";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* =========================================================
   EDUCATION PROFILE
   ========================================================= */

export interface EducationProfile {
  educationLevel: string;       // School / College / University
  state: string;
  boardOrUniversity: string;
  medium: string;
  classOrGrade: string;
  stream: string;
  degreeOrCourse: string;
  branchOrSpecialization: string;
  year: string;
  semester: string;
}

/* =========================================================
   PROFILE DOCUMENT
   Firestore Collection: profiles
   Document ID: Firebase Auth UID
   ========================================================= */

export interface ProfileDocument {
  // Basic
  userId: string;
  fullName: string;
  email: string;

  // Permanent EduID
  eduId: string;
  profileCompleted: boolean;

  // Disability
  disabilityType: string;
  disabilityPercentage: number;

  // Education
  educationLevel: string;
  educationProfile: EducationProfile;

  // Skills
  skills: string[];

  // Location
  city: string;
  state: string;
  pincode: string;

  // Personal
  age: number | null;
  income: number | null;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  languages: string[];

  // Disability documents
  udidNumber: string;
  disabilityCertificateUrl: string;

  // Guardian
  guardianName: string;
  guardianPhone: string;

  // Career
  workExperienceYears: number;
  preferredJobType: string;
  preferredLocations: string[];
  resumeUrl: string;
  linkedinUrl: string;

  // Other
  bio: string;
  assistiveTech: string;

  // Emergency
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Personal status
  maritalStatus: string;

  // Profile image
  avatarUrl: string;

  // Timestamps
  createdAt: any;
  updatedAt: any;
}

/* =========================================================
   GENERATE EDU ID
   =========================================================
   
   Example:
   EDU-8F4K29XM
   
   This ID is generated only once and then permanently
   stored inside the user's profile document.
*/

const generateEduId = (): string => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let randomPart = "";

  for (let i = 0; i < 8; i++) {
    randomPart += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return `EDU-${randomPart}`;
};

/* =========================================================
   CHECK WHETHER PROFILE IS COMPLETE
   ========================================================= */

export const isProfileComplete = (
  profile: Partial<ProfileDocument>
): boolean => {
  const requiredFields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.disabilityType,
    profile.educationLevel,
    profile.city,
    profile.state,
  ];

  return requiredFields.every(
    (field) => field !== undefined && field !== null && field !== ""
  );
};

/* =========================================================
   CREATE PROFILE
   Called after Firebase Authentication signup
   ========================================================= */

export const createProfile = async (
  userId: string,
  email: string,
  fullName: string
) => {
  const profileRef = doc(db, "profiles", userId);

  const existingProfile = await getDoc(profileRef);

  // Don't overwrite an existing profile
  if (existingProfile.exists()) {
    return existingProfile.data() as ProfileDocument;
  }

  const profileData: Omit<ProfileDocument, "createdAt" | "updatedAt"> = {
    userId,

    fullName: fullName || "",
    email: email || "",

    // EduID is empty until profile is completed
    eduId: "",
    profileCompleted: false,

    // Disability
    disabilityType: "",
    disabilityPercentage: 0,

    // Education
    educationLevel: "",

    educationProfile: {
      educationLevel: "",
      state: "",
      boardOrUniversity: "",
      medium: "",
      classOrGrade: "",
      stream: "",
      degreeOrCourse: "",
      branchOrSpecialization: "",
      year: "",
      semester: "",
    },

    // Skills
    skills: [],

    // Location
    city: "",
    state: "",
    pincode: "",

    // Personal
    age: null,
    income: null,
    phone: "",
    gender: "",
    dateOfBirth: null,
    languages: [],

    // Disability documents
    udidNumber: "",
    disabilityCertificateUrl: "",

    // Guardian
    guardianName: "",
    guardianPhone: "",

    // Career
    workExperienceYears: 0,
    preferredJobType: "",
    preferredLocations: [],
    resumeUrl: "",
    linkedinUrl: "",

    // Other
    bio: "",
    assistiveTech: "",

    // Emergency
    emergencyContactName: "",
    emergencyContactPhone: "",

    // Personal status
    maritalStatus: "",

    // Avatar
    avatarUrl: "",
  };

  await setDoc(profileRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profileData as ProfileDocument;
};

/* =========================================================
   GET PROFILE
   ========================================================= */

export const getProfile = async (
  userId: string
): Promise<ProfileDocument | null> => {
  const profileRef = doc(db, "profiles", userId);

  const snap = await getDoc(profileRef);

  if (!snap.exists()) {
    return null;
  }

  return snap.data() as ProfileDocument;
};

/* =========================================================
   UPDATE PROFILE
   ========================================================= */

export const updateProfile = async (
  userId: string,
  data: Partial<ProfileDocument>
) => {
  const profileRef = doc(db, "profiles", userId);

  await updateDoc(profileRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/* =========================================================
   COMPLETE PROFILE + GENERATE EDU ID
   =========================================================
   
   IMPORTANT:
   This function should be called when the user clicks
   "Submit Profile".

   If EduID already exists:
      → DO NOT generate another one.

   If EduID does not exist:
      → Generate it
      → Save it permanently
      → Mark profileCompleted = true
*/

export const completeProfile = async (
  userId: string,
  profileData: Partial<ProfileDocument>
): Promise<string> => {
  const profileRef = doc(db, "profiles", userId);

  const existingProfileSnap = await getDoc(profileRef);

  let existingEduId = "";

  if (existingProfileSnap.exists()) {
    const existingData =
      existingProfileSnap.data() as Partial<ProfileDocument>;

    existingEduId = existingData.eduId || "";
  }

  // -------------------------------------------------------
  // If EduID already exists, reuse it
  // -------------------------------------------------------

  const eduId = existingEduId || generateEduId();

  // -------------------------------------------------------
  // Update educationProfile if education data is provided
  // -------------------------------------------------------

  const educationProfile: EducationProfile = {
    educationLevel:
      profileData.educationProfile?.educationLevel ||
      profileData.educationLevel ||
      "",

    state:
      profileData.educationProfile?.state ||
      profileData.state ||
      "",

    boardOrUniversity:
      profileData.educationProfile?.boardOrUniversity || "",

    medium:
      profileData.educationProfile?.medium || "",

    classOrGrade:
      profileData.educationProfile?.classOrGrade || "",

    stream:
      profileData.educationProfile?.stream || "",

    degreeOrCourse:
      profileData.educationProfile?.degreeOrCourse || "",

    branchOrSpecialization:
      profileData.educationProfile?.branchOrSpecialization || "",

    year:
      profileData.educationProfile?.year || "",

    semester:
      profileData.educationProfile?.semester || "",
  };

  // -------------------------------------------------------
  // Save everything
  // -------------------------------------------------------

  await setDoc(
    profileRef,
    {
      ...profileData,

      userId,

      // Permanent EduID
      eduId,

      // Profile completion status
      profileCompleted: true,

      // Education information
      educationProfile,

      // Keep main education level synchronized
      educationLevel: educationProfile.educationLevel,

      // Keep location synchronized
      state: educationProfile.state,

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return eduId;
};

/* =========================================================
   GET EDU ID
   ========================================================= */

export const getEduId = async (
  userId: string
): Promise<string | null> => {
  const profile = await getProfile(userId);

  if (!profile || !profile.eduId) {
    return null;
  }

  return profile.eduId;
};

/* =========================================================
   CHECK PROFILE COMPLETION
   ========================================================= */

export const checkProfileCompleted = async (
  userId: string
): Promise<boolean> => {
  const profile = await getProfile(userId);

  return profile?.profileCompleted === true;
};

/* =========================================================
   GET EDUCATION PROFILE
   =========================================================
   
   Education page can use this function directly.
*/

export const getEducationProfile = async (
  userId: string
): Promise<EducationProfile | null> => {
  const profile = await getProfile(userId);

  if (!profile) {
    return null;
  }

  return profile.educationProfile || null;
};