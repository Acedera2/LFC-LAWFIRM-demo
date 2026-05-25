import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { unwrap } from "../lib/api";
import { publishRefresh } from "../lib/refreshBus";

const AuthContext = createContext(null);
const LOCAL_STORAGE_KEY = "lfc_user";
const AUTH_PREFIXES = ["/auth", "/api/auth"];

async function requestAuth(method, path, data) {
  let lastError;

  // If a MockApi is available in the browser, prefer it for auth calls
  try {
    if (typeof window !== "undefined" && window.MockApi) {
      return await window.MockApi.request({ method, url: `/auth${path}`, data });
    }
  } catch (error) {
    lastError = error;
    // fall through to try network endpoints
  }

  for (const prefix of AUTH_PREFIXES) {
    try {
      return await api.request({ method, url: `${prefix}${path}`, data });
    } catch (error) {
      lastError = error;
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      // support both shapes: { user: {...} } and legacy raw user object
      return parsed.user || parsed;
    } catch {
      return null;
    }
  });
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const saveUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (typeof window === "undefined") return;
    if (nextUser) {
      // persist as { user: ... } to be compatible with MockApi and MockStore
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: nextUser }));
        try { publishRefresh('profile:updated'); } catch (err) { void err; }
      } catch {
        // ignore storage failures
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const clearSession = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  const updateProfile = useCallback((nextUser) => {
    saveUser(nextUser);
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
        const response = await requestAuth("get", "/me");
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
      const response = await requestAuth("post", "/login", payload);
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
      const response = await requestAuth("post", "/register", payload);
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
      await requestAuth("post", "/logout");
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
      logout,
      updateProfile
    }),
    [user, initializing, loading, login, logout, register, updateProfile]
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
