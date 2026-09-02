
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_API_KEY) || (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY) as string,
  authDomain: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || (typeof process !== "undefined" && process.env?.VITE_FIREBASE_AUTH_DOMAIN) as string,
  projectId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || (typeof process !== "undefined" && process.env?.VITE_FIREBASE_PROJECT_ID) as string,
  storageBucket: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || (typeof process !== "undefined" && process.env?.VITE_FIREBASE_STORAGE_BUCKET) as string,
  messagingSenderId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || (typeof process !== "undefined" && process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) as string,
  appId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_APP_ID) || (typeof process !== "undefined" && process.env?.VITE_FIREBASE_APP_ID) as string,
};

// Prevent re-initialization in dev/hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;