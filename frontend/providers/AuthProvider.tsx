
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe, login as loginRequest } from "@/services/auth.service";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const finishLoading = () => {
      if (active) {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");

    if (!token) {
      queueMicrotask(finishLoading);

      return () => {
        active = false;
      };
    }

    getMe()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      })
      .finally(finishLoading);

    return () => {
      active = false;
    };
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<User> => {
    const data = await loginRequest(credentials);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
