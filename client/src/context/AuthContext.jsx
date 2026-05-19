import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { unwrap } from "../lib/api";
<<<<<<< HEAD

const AuthContext = createContext(null);
const LOCAL_STORAGE_KEY = "lfc_user";
=======
import { isSupabaseEnabled, normalizeSupabaseProfile, supabase } from "../lib/supabase";

const AuthContext = createContext(null);
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
<<<<<<< HEAD
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
=======
  const [loading, setLoading] = useState(true);
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

  const saveUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (typeof window === "undefined") return;
    if (nextUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
<<<<<<< HEAD
  }, []);

  const clearSession = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const response = await api.get("/auth/me");
        const payload = unwrap(response);
        if (active) {
          saveUser(payload.user);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    };
=======
  }, [user]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        if (isSupabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;

          const authUser = data.session?.user;
          if (!authUser) {
            if (active) setUser(null);
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("id, role, full_name, email, phone")
            .eq("id", authUser.id)
            .maybeSingle();

          if (active) setUser(normalizeSupabaseProfile(profile, authUser));
          return;
        }

        const response = await api.get("/auth/me");
        if (active) setUser(unwrap(response).user || null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    let subscription;
    if (isSupabaseEnabled && supabase) {
      const listener = supabase.auth.onAuthStateChange(async (_event, session) => {
        const authUser = session?.user;
        if (!authUser) {
          setUser(null);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, full_name, email, phone")
          .eq("id", authUser.id)
          .maybeSingle();

        setUser(normalizeSupabaseProfile(profile, authUser));
      });
      subscription = listener.data.subscription;
    }

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      toast.error("Session expired. Please sign in again.");
    };
    window.addEventListener("lfc:session-expired", onSessionExpired);
    return () => window.removeEventListener("lfc:session-expired", onSessionExpired);
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password
        });
        if (error) throw error;

        const authUser = data.user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, full_name, email, phone")
          .eq("id", authUser.id)
          .maybeSingle();

        const authProfile = normalizeSupabaseProfile(profile, authUser);
        setUser(authProfile);
        toast.success(`Welcome back, ${authProfile.name}`);
        return authProfile;
      }

      const response = await api.post("/auth/login", payload);
      const authUser = unwrap(response).user;
      setUser(authUser);
      toast.success(`Welcome back, ${authUser.name}`);
      return authUser;
    } finally {
      setLoading(false);
    }
  };
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

    initialize();
    return () => {
      active = false;
    };
  }, [clearSession, saveUser]);

  useEffect(() => {
    const onSessionExpired = () => {
      clearSession();
      toast.error("Your session has expired. Please sign in again.");
    };

    window.addEventListener("lfc:session-expired", onSessionExpired);
    return () => window.removeEventListener("lfc:session-expired", onSessionExpired);
  }, [clearSession]);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await api.post("/auth/login", payload);
      const payloadData = unwrap(response);
      saveUser(payloadData.user);
      toast.success(`Welcome back, ${payloadData.user.name}`);
      return payloadData.user;
=======
      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              full_name: payload.name,
              phone: payload.phone
            }
          }
        });
        if (error) throw error;

        const authUser = data.user;
        if (authUser) {
          await supabase.from("profiles").upsert({
            id: authUser.id,
            role: "client",
            full_name: payload.name,
            email: payload.email,
            phone: payload.phone || null
          });
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, full_name, email, phone")
          .eq("id", authUser?.id)
          .maybeSingle();

        const authProfile = normalizeSupabaseProfile(profile, authUser);
        setUser(authProfile);
        toast.success("Your secure client workspace is ready");
        return authProfile;
      }

      const response = await api.post("/auth/register", payload);
      const authUser = unwrap(response).user;
      setUser(authUser);
      toast.success("Your secure client workspace is ready");
      return authUser;
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

<<<<<<< HEAD
  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", payload);
      const payloadData = unwrap(response);
      saveUser(payloadData.user);
      toast.success("Client account created successfully");
      return payloadData.user;
    } finally {
      setLoading(false);
    }
  }, [saveUser]);
=======
  const logout = async () => {
    try {
      if (isSupabaseEnabled && supabase) {
        await supabase.auth.signOut();
      }
      await api.post("/auth/logout");
    } catch {
      // Clear local state even if API logout fails.
    }
    setUser(null);
    toast.success("Signed out securely");
  };
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch {
      // Best-effort logout even if backend fails.
    } finally {
      clearSession();
      setLoading(false);
      toast.success("Signed out securely");
    }
  }, [clearSession]);

  const contextValue = useMemo(
    () => ({
      user,
      loading: initializing || loading,
      isAuthenticated: Boolean(user),
      hasRole: (...roles) => roles.includes(user?.role?.slug || user?.role),
      login,
      register,
      logout
    }),
    [user, initializing, loading, login, logout, register]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
