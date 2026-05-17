import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

// Mock users for demo
const mockUsers = {
  "admin@lfcfirm.com": {
    id: 1,
    name: "Admin User",
    email: "admin@lfcfirm.com",
    role: { slug: "admin" }
  },
  "staff@lfcfirm.com": {
    id: 2,
    name: "Staff User",
    email: "staff@lfcfirm.com",
    role: { slug: "staff" }
  },
  "attorney.rivera@lfcfirm.com": {
    id: 3,
    name: "Atty. Elena Rivera",
    email: "attorney.rivera@lfcfirm.com",
    role: { slug: "lawyer" }
  },
  "client@demo.com": {
    id: 4,
    name: "Demo Client",
    email: "client@demo.com",
    role: { slug: "client" }
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lfc_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("lfc_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("lfc_user");
    }
  }, [user]);

  // For static demo, skip API check and just use stored user
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = mockUsers[payload.email];
      if (!mockUser) {
        throw new Error("Invalid credentials");
      }
      
      setUser(mockUser);
      toast.success(`Welcome back, ${mockUser.name}`);
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        role: { slug: "client" }
      };
      
      setUser(mockUser);
      toast.success("Your secure client workspace is ready");
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    setUser(null);
    toast.success("Signed out securely");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      isAuthenticated: Boolean(user),
      hasRole: (...roles) => roles.includes(user?.role?.slug || user?.role),
      login,
      register,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
