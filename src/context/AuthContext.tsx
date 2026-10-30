import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import type { LoginLocation, User } from "@/types";
import { authApi, type PublicSignupPayload } from "@/api";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, location?: LoginLocation) => Promise<void>;
  signup: (payload: PublicSignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem("token");
    const storedToken = sessionStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, location?: LoginLocation) => {
    const response = await authApi.login({ email, password, ...(location ? { location } : {}) });
    sessionStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const signup = async (payload: PublicSignupPayload) => {
    const response = await authApi.register(payload);
    sessionStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    let idleTimer: number;
    let lastServerActivityAt = Date.now();
    const resetIdleTimer = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        void logout().then(() => window.location.assign("/login?sessionExpired=1"));
      }, IDLE_TIMEOUT_MS);
      if (Date.now() - lastServerActivityAt >= 5 * 60 * 1000) {
        lastServerActivityAt = Date.now();
        void authApi
          .me()
          .then(updateUser)
          .catch((error: unknown) => console.error("Could not refresh the active session:", error));
      }
    };
    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "pointermove",
      "keydown",
      "touchstart",
      "scroll",
    ];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, resetIdleTimer, { passive: true }),
    );
    resetIdleTimer();

    const closeSession = () => {
      const currentToken = sessionStorage.getItem("token");
      if (!currentToken) return;
      const apiBase = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api";
      const body = new Blob([currentToken], { type: "text/plain" });
      if (!navigator.sendBeacon(`${apiBase}/auth/logout-on-close`, body)) {
        void fetch(`${apiBase}/auth/logout-on-close`, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: currentToken,
          keepalive: true,
        }).catch((error: unknown) => console.warn("Could not close the login session:", error));
      }
    };
    window.addEventListener("pagehide", closeSession);

    return () => {
      window.clearTimeout(idleTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
      window.removeEventListener("pagehide", closeSession);
    };
  }, [token, user, logout, updateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
