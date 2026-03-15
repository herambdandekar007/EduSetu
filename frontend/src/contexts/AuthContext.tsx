import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
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

  const fetchProfile = async (userId: string) => {
    const ref = doc(db, "profiles", userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setProfile({ id: snap.id, ...snap.data() });
    } else {
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
        setTimeout(() => fetchProfile(firebaseUser.uid), 500);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName: fullName });
      await setDoc(doc(db, "profiles", newUser.uid), {
        user_id: newUser.uid,
        full_name: fullName,
        email,
        created_at: new Date().toISOString(),
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, profile, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
