"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getToken, getSavedUser, saveToken, saveUser, removeToken, StoredUser } from "../lib/auth";
import { AuthResponse } from "../lib/api";

interface UserContextValue {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session al montar
  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getSavedUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((authResponse: AuthResponse) => {
    const userData: StoredUser = {
      name: authResponse.name,
      avatarUrl: authResponse.avatarUrl,
    };
    saveToken(authResponse.token);
    saveUser(userData);
    setToken(authResponse.token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, token, isLoading, login, logout }}>
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
