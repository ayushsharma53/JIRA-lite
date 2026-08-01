import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import type { User } from "../../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("jira_lite_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      // Fetch workspaces as a cheap way to verify session
      await api.get("/api/workspaces");
      return true;
    } catch (error) {
      // Session is invalid
      localStorage.removeItem("jira_lite_user");
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const verify = async () => {
      if (user) {
        const valid = await checkSession();
        if (!valid) {
          localStorage.removeItem("jira_lite_user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    verify();
  }, []);

  const login = (newUser: User) => {
    localStorage.setItem("jira_lite_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      localStorage.removeItem("jira_lite_user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
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

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
