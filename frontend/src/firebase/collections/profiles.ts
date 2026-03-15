import { db } from "../firebase.config.ts";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "profiles"
// Document ID: Firebase Auth UID (user.uid)

export interface ProfileDocument {
  // File 1 Fields
  userId: string;                        // Firebase Auth UID
  fullName: string;                      // default: ''
  email: string;                         // default: ''
  disabilityType: string;                // default: ''
  disabilityPercentage: number;          // default: 0
  educationLevel: string;                // default: ''
  skills: string[];                      // default: []
  city: string;                          // default: ''
  state: string;                         // default: ''
  age: number | null;                    // default: null
  income: number | null;                 // default: null
  resumeUrl: string;                     // default: ''
  disabilityCertificateUrl: string;      // default: ''
  avatarUrl: string;                     // default: ''
  createdAt: any;                        // serverTimestamp()
  updatedAt: any;                        // serverTimestamp()

  // File 3 Extra Fields
  phone: string;                         // default: ''
  gender: string;                        // default: ''
  dateOfBirth: string | null;            // default: null (ISO string)
  languages: string[];                   // default: []
  udidNumber: string;                    // default: ''
  guardianName: string;                  // default: ''
  guardianPhone: string;                 // default: ''
  workExperienceYears: number;           // default: 0
  preferredJobType: string;              // default: ''
  preferredLocations: string[];          // default: []
  bio: string;                           // default: ''
  linkedinUrl: string;                   // default: ''
  assistiveTech: string;                 // default: ''
  emergencyContactName: string;          // default: ''
  emergencyContactPhone: string;         // default: ''
  maritalStatus: string;                 // default: ''
  pincode: string;                       // default: ''
}

// Auto-create profile on signup (call this after Firebase Auth signup)
export const createProfile = async (userId: string, email: string, fullName: string) => {
  const profileRef = doc(db, "profiles", userId);
  await setDoc(profileRef, {
    userId,
    fullName: fullName || '',
    email: email || '',
    disabilityType: '',
    disabilityPercentage: 0,
    educationLevel: '',
    skills: [],
    city: '',
    state: '',
    age: null,
    income: null,
    resumeUrl: '',
    disabilityCertificateUrl: '',
    avatarUrl: '',
    // File 3 extra fields
    phone: '',
    gender: '',
    dateOfBirth: null,
    languages: [],
    udidNumber: '',
    guardianName: '',
    guardianPhone: '',
    workExperienceYears: 0,
    preferredJobType: '',
    preferredLocations: [],
    bio: '',
    linkedinUrl: '',
    assistiveTech: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    maritalStatus: '',
    pincode: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as ProfileDocument);
};

// Get profile
export const getProfile = async (userId: string) => {
  const profileRef = doc(db, "profiles", userId);
  const snap = await getDoc(profileRef);
  return snap.exists() ? snap.data() as ProfileDocument : null;
};

// Update profile
export const updateProfile = async (userId: string, data: Partial<ProfileDocument>) => {
  const profileRef = doc(db, "profiles", userId);
  await updateDoc(profileRef, { ...data, updatedAt: serverTimestamp() });
};