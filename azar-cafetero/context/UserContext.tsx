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
  id?: string;
  name: string;
  avatarUrl: string;
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

  // Al montar, intenta recuperar los datos del usuario desde sessionStorage
  // (solo nombre y avatar — el JWT vive en la cookie HttpOnly)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // sessionStorage no disponible (SSR)
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: StoredUser) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    // Borra la cookie HttpOnly en el gateway
    try {
      await fetch(`${GATEWAY}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // continuar aunque falle
    }
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
