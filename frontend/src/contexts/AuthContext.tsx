import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { loginWithEduId, loginWithGoogle } from "@/features/auth/services/authService";
import { generateUniqueEduId } from "@/features/auth/services/eduIdService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithEduId: (eduId: string, password: string) => Promise<{ error: any; eduId?: string }>;
  signInWithGoogle: () => Promise<{ error: any; eduId?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const applyA11yPreferencesIfPresent = (profileData: any) => {
    if (profileData && profileData.accessibilityPreferences) {
      try {
        const prefs = profileData.accessibilityPreferences;
        const currentSaved = localStorage.getItem("pwd_a11y_v1");
        const parsed = currentSaved ? JSON.parse(currentSaved) : {};

        const merged = {
          ...parsed,
          highContrast: prefs.highContrast ?? parsed.highContrast ?? false,
          textSize: prefs.largeText ? "large" : (parsed.textSize ?? "normal"),
          dyslexiaFont: prefs.dyslexiaFont ?? parsed.dyslexiaFont ?? false,
          ttsEnabled: prefs.textToSpeech ?? parsed.ttsEnabled ?? false,
          focusIndicators: prefs.focusIndicators ?? parsed.focusIndicators ?? false,
        };

        localStorage.setItem("pwd_a11y_v1", JSON.stringify(merged));
      } catch (e) {
        console.warn("Failed to sync a11y preferences to local storage:", e);
      }
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const ref = doc(db, "profiles", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProfile(data);
        applyA11yPreferencesIfPresent(data);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.warn("Error fetching user profile:", e);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setTimeout(() => fetchProfile(firebaseUser.uid), 300);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateFirebaseProfile(newUser, { displayName: fullName.trim() });
      
      const eduId = await generateUniqueEduId();
      const profileData = {
        userId: newUser.uid,
        user_id: newUser.uid,
        fullName: fullName.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        eduId,
        profileCompleted: false,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "profiles", newUser.uid), profileData);
      setProfile(profileData);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleSignInWithEduId = async (eduId: string, password: string) => {
    const result = await loginWithEduId(eduId, password);
    if (!result.success) {
      return { error: { message: result.error } };
    }
    return { error: null, eduId: result.eduId };
  };

  const handleSignInWithGoogle = async () => {
    const result = await loginWithGoogle();
    if (!result.success) {
      return { error: { message: result.error } };
    }
    return { error: null, eduId: result.eduId };
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        signUp,
        signIn,
        signInWithEduId: handleSignInWithEduId,
        signInWithGoogle: handleSignInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
