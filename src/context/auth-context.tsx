"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import {
  mapAuthError,
  type SignInFormData,
  type SignUpFormData,
} from "@/lib/auth/validation";
import type { UserProfile } from "@/types/settings";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  signInWithPassword: (data: SignInFormData) => Promise<{ success: boolean; error?: string }>;
  signUpWithPassword: (data: SignUpFormData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error: fetchErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (fetchErr || !data) {
        return null;
      }

      const createdDate = data.created_at ? new Date(data.created_at) : new Date();
      const formattedMonth = createdDate.toLocaleString("en-US", { month: "long" });
      const formattedYear = createdDate.getFullYear();

      return {
        id: data.id,
        name: data.display_name,
        username: data.username,
        email: user?.email ?? "",
        avatarUrl: data.avatar_path ?? "",
        bio: data.bio ?? "",
        presenceStatus: (data.presence_status as UserProfile["presenceStatus"]) || "online",
        statusMessage: data.custom_status ?? "",
        role: "Member",
        joinedDate: `${formattedMonth} ${formattedYear}`,
      };
    } catch {
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!isMounted) return;
      setSession(initSession);
      const currUser = initSession?.user ?? null;
      setUser(currUser);

      if (currUser) {
        fetchProfile(currUser.id).then((p) => {
          if (isMounted) {
            setProfile(p);
            setIsLoading(false);
            setIsInitialized(true);
          }
        });
      } else {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      const newCurrUser = newSession?.user ?? null;
      setUser(newCurrUser);

      if (newCurrUser) {
        const p = await fetchProfile(newCurrUser.id);
        if (isMounted) setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (data: SignInFormData) => {
    setError(null);
    if (!supabase) {
      return { success: false, error: "Supabase environment configuration is missing." };
    }

    try {
      const { data: res, error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

      if (signInErr) {
        const cleanErr = mapAuthError(signInErr.message);
        setError(cleanErr);
        return { success: false, error: cleanErr };
      }

      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        const p = await fetchProfile(res.user.id);
        setProfile(p);
      }

      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Authentication request failed.";
      const cleanErr = mapAuthError(errMsg);
      setError(cleanErr);
      return { success: false, error: cleanErr };
    }
  };

  const signUpWithPassword = async (data: SignUpFormData) => {
    setError(null);
    if (!supabase) {
      return { success: false, error: "Supabase environment configuration is missing." };
    }

    try {
      // 1. Check duplicate username in profiles first
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", data.username.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        const dupErr = "This username is already taken. Please choose another username.";
        setError(dupErr);
        return { success: false, error: dupErr };
      }

      // 2. Register user with Supabase Auth
      const { data: authRes, error: signUpErr } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            display_name: data.displayName.trim(),
            username: data.username.trim().toLowerCase(),
          },
        },
      });

      if (signUpErr) {
        const cleanErr = mapAuthError(signUpErr.message);
        setError(cleanErr);
        return { success: false, error: cleanErr };
      }

      const createdUser = authRes.user;
      if (!createdUser) {
        const errStr = "User registration failed. No identity returned.";
        setError(errStr);
        return { success: false, error: errStr };
      }

      // 3. Create profiles table row for the new user
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: createdUser.id,
        display_name: data.displayName.trim(),
        username: data.username.trim().toLowerCase(),
        avatar_path: null,
        bio: "",
        presence_status: "online",
        custom_status: null,
      });

      if (profileErr) {
        const bootErr = `Profile initialization failed: ${profileErr.message}`;
        setError(bootErr);
        return { success: false, error: bootErr };
      }

      // 4. Set state & fetch profile
      setUser(createdUser);
      setSession(authRes.session);
      const now = new Date();
      const newProfile: UserProfile = {
        id: createdUser.id,
        name: data.displayName.trim(),
        username: data.username.trim().toLowerCase(),
        email: data.email.trim(),
        avatarUrl: "",
        bio: "",
        presenceStatus: "online",
        statusMessage: "",
        role: "Member",
        joinedDate: `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`,
      };
      setProfile(newProfile);

      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Registration request failed.";
      const cleanErr = mapAuthError(errMsg);
      setError(cleanErr);
      return { success: false, error: cleanErr };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isInitialized,
        error,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
