"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080";

export interface StoredUser {
  name: string;
  avatarUrl: string;
  userId: string; // ← NUEVO: email que usa el wallet como ID
}

interface UserContextValue {
  user: StoredUser | null;
  isLoading: boolean;
  login: (userData: StoredUser) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: StoredUser) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${GATEWAY}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.replace("/");
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
}

export default UserContext;
