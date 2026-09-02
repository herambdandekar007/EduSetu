// frontend/src/features/auth/services/authService.ts
// Real Firebase Authentication and Firestore Profile Provisioning for SMART EDUCATION AI

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { generateUniqueEduId, findEmailByEduId } from "./eduIdService";
import type { SignupFormData } from "../types/auth.types";
import { seedLearnData } from "@/firebase/collections/learn";

export interface AuthActionResult {
  success: boolean;
  user?: any;
  eduId?: string;
  error?: string;
}

/**
 * Sign in with standard Email & Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<AuthActionResult> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    
    // Check & fetch profile
    const profileRef = doc(db, "profiles", cred.user.uid);
    const snap = await getDoc(profileRef);
    const eduId = snap.exists() ? snap.data()?.eduId : undefined;

    return {
      success: true,
      user: cred.user,
      eduId,
    };
  } catch (err: any) {
    let message = "Failed to sign in. Please check your credentials.";
    if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
      message = "The password or email you entered is incorrect.";
    } else if (err?.code === "auth/user-not-found") {
      message = "No Smart Education AI account was found with this email.";
    } else if (err?.code === "auth/too-many-requests") {
      message = "Too many failed attempts. Please reset your password or try again later.";
    } else if (err?.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Sign in with EduID + Password
 * Resolves EduID to verified email via Firestore, then authenticates via Firebase Auth
 */
export async function loginWithEduId(eduIdInput: string, pass: string): Promise<AuthActionResult> {
  try {
    const record = await findEmailByEduId(eduIdInput);
    if (!record || !record.email) {
      return {
        success: false,
        error: `We couldn't find an account matching EduID "${eduIdInput}". Please double check your EduID or log in with your email.`,
      };
    }

    const cred = await signInWithEmailAndPassword(auth, record.email, pass);
    return {
      success: true,
      user: cred.user,
      eduId: eduIdInput.trim().toUpperCase(),
    };
  } catch (err: any) {
    let message = "Failed to authenticate with this EduID.";
    if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
      message = "The password you entered is incorrect for this EduID.";
    } else if (err?.code === "auth/too-many-requests") {
      message = "Access temporarily blocked due to repeated attempts. Please wait or reset password.";
    } else if (err?.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Sign in or Sign up with Google OAuth
 */
export async function loginWithGoogle(): Promise<AuthActionResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const uid = cred.user.uid;

    const profileRef = doc(db, "profiles", uid);
    const snap = await getDoc(profileRef);

    let eduId = "";

    if (!snap.exists()) {
      // First-time Google user - generate permanent EduID & create profile
      eduId = await generateUniqueEduId();
      await setDoc(profileRef, {
        userId: uid,
        user_id: uid,
        fullName: cred.user.displayName || "Smart Education Student",
        full_name: cred.user.displayName || "Smart Education Student",
        email: cred.user.email || "",
        eduId,
        avatarUrl: cred.user.photoURL || "",
        profileCompleted: false,
        educationLevel: "Undergraduate",
        skills: ["Digital Literacy", "Problem Solving"],
        accessibilityPreferences: {
          enabled: false,
          voiceControl: false,
          textToSpeech: false,
          highContrast: false,
          largeText: false,
          dyslexiaFont: false,
          reducedMotion: false,
          screenReader: false,
          gestureControl: false,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Seed initial subjects/topics for new student
      try {
        await seedLearnData(uid);
      } catch (e) {
        console.warn("Auto-seeding learn data:", e);
      }
    } else {
      const data = snap.data();
      eduId = data?.eduId || "";
      if (!eduId) {
        eduId = await generateUniqueEduId();
        await setDoc(profileRef, { eduId }, { merge: true });
      }
    }

    return {
      success: true,
      user: cred.user,
      eduId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Google sign-in was cancelled or failed.",
    };
  }
}

/**
 * Full Step-by-Step Student Registration
 * Creates Firebase Auth User, permanent unique EduID, full profile, and seeds curriculum
 */
export async function registerNewStudent(data: SignupFormData): Promise<AuthActionResult> {
  try {
    // 1. Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    const uid = cred.user.uid;

    // 2. Update display name in Firebase Auth
    if (data.fullName) {
      await updateFirebaseProfile(cred.user, { displayName: data.fullName.trim() });
    }

    // 3. Generate permanent lifelong EduID
    const state = data.education.state || "IN";
    const permanentEduId = await generateUniqueEduId(state);

    // 4. Construct complete Firestore profile document
    const profileRef = doc(db, "profiles", uid);
    const profileData = {
      userId: uid,
      user_id: uid,
      fullName: data.fullName.trim(),
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim() || "",
      eduId: permanentEduId,
      profileCompleted: true,
      
      // Accessibility Settings
      accessibilityPreferences: data.accessibilityPreferences,

      // Education Structure
      educationLevel: data.education.educationLevel || "Undergraduate",
      educationProfile: {
        educationLevel: data.education.educationLevel || "Undergraduate",
        state: data.education.state || "",
        boardOrUniversity: data.education.university || data.education.board || "",
        medium: data.education.medium || "English",
        classOrGrade: data.education.classOrGrade || "",
        stream: "",
        degreeOrCourse: data.education.degreeOrCourse || "",
        branchOrSpecialization: data.education.branchOrSpecialization || "",
        year: data.education.year || "1st Year",
        semester: data.education.semester || "Semester 1",
      },

      // Default foundation skills
      skills: ["Problem Solving", "Digital Literacy", "Foundational Science"],

      // Initial Gamification & Stats
      workExperienceYears: 0,
      bio: `Student at ${data.education.institutionName || "Smart Education AI"} pursuing ${data.education.educationLevel}.`,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(profileRef, profileData);

    // 5. Initialize user points / level
    try {
      const pointsRef = doc(db, "user_points", uid);
      await setDoc(pointsRef, {
        user_id: uid,
        total_points: 100, // Welcome signup bonus!
        level: 1,
        streak_days: 1,
        last_active: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Points init:", e);
    }

    // 6. Seed default curriculum
    try {
      await seedLearnData(uid);
    } catch (e) {
      console.warn("Curriculum seed:", e);
    }

    return {
      success: true,
      user: cred.user,
      eduId: permanentEduId,
    };
  } catch (err: any) {
    let message = "Registration failed. Please try again.";
    if (err?.code === "auth/email-already-in-use") {
      message = "An account with this email address already exists. Try signing in instead.";
    } else if (err?.code === "auth/weak-password") {
      message = "Password is too weak. Please use at least 6 characters with mixed characters.";
    } else if (err?.code === "auth/invalid-email") {
      message = "Please enter a valid email address.";
    } else if (err?.message) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

/**
 * Send Password Reset Email
 */
export async function sendResetEmail(emailInput: string): Promise<{ success: boolean; message: string }> {
  try {
    await sendPasswordResetEmail(auth, emailInput.trim());
    return {
      success: true,
      message: "Password reset link sent! Please check your email inbox and spam folder.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Failed to send password reset email.",
    };
  }
}
