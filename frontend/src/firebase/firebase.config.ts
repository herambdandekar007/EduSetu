
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Client SDK config (for React/Next/Vite apps).
 * Put these values in .env and read via import.meta.env / process.env.
 *
 * Example (Vite):
 *  VITE_FIREBASE_API_KEY=...
 *  VITE_FIREBASE_AUTH_DOMAIN=...
 *  VITE_FIREBASE_PROJECT_ID=...
 *  VITE_FIREBASE_STORAGE_BUCKET=...
 *  VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *  VITE_FIREBASE_APP_ID=...
 */

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY as string,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.VITE_FIREBASE_APP_ID as string,
};

// Prevent re-initialization in dev/hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;