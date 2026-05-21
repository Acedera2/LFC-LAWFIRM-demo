import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { unwrap } from "../lib/api";

const AuthContext = createContext(null);
const LOCAL_STORAGE_KEY = "lfc_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const saveUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (typeof window === "undefined") return;
    if (nextUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const clearSession = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  useEffect(() => {
    let active = true;
    const protectedPrefixes = ["/client", "/lawyer", "/staff", "/admin", "/appointments", "/notifications", "/clients", "/analytics", "/settings"];
    const shouldValidateSession = protectedPrefixes.some((prefix) => window.location.pathname.startsWith(prefix));

    const initialize = async () => {
      if (!shouldValidateSession) {
        if (active) {
          setInitializing(false);
        }
        return;
      }

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
      const response = await api.post("/auth/login", payload);
      const payloadData = unwrap(response);
      saveUser(payloadData.user);
      toast.success(`Welcome back, ${payloadData.user.name}`);
      return payloadData.user;
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

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
