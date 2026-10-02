"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMe, login as apiLogin, ApiError } from "./api";
import type { LoginRequest, Role, User } from "./types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDocente: boolean;
};

const AuthContext = createContext<AuthContextValue>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Redirige a /login cuando no hay sesión activa.
 * Usar en páginas que retornan null antes de montar <Layout>.
 */
export function useAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = readStorage<string | null>("bh-token", null);
    const storedUser = readStorage<User | null>("bh-user", null);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await apiLogin(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("bh-token", JSON.stringify(response.token));
      localStorage.setItem("bh-user", JSON.stringify(response.user));
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error("Error de conexión. Verificá tu conexión e intentá nuevamente.");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("bh-token");
    localStorage.removeItem("bh-user");
  };

  const isAdmin = user?.role === "bibliotecaria" || user?.role === "admin";
  const isDocente = user?.role === "docente";

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isDocente }}>
      {children}
    </AuthContext.Provider>
  );
}
