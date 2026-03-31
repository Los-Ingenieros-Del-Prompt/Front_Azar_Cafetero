"use client";
import { useEffect, useState, useCallback } from "react";

export interface PlayerIdentity {
  name: string;
  avatar: string;
  balance: number;
}

// Apunta al gateway, no al lobby directamente
const API = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://azar-cafetero.duckdns.org";

async function fetchIdentity(): Promise<PlayerIdentity> {
  const res = await fetch(`${API}/api/player/identity`, {
    credentials: "include", // ← envía la cookie HttpOnly automáticamente
  });
  if (!res.ok) throw new Error(`identity: ${res.status}`);
  return res.json();
}

async function fetchBalance(): Promise<number> {
  const res = await fetch(`${API}/api/player/balance`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`balance: ${res.status}`);
  const data: { balance: number } = await res.json();
  return data.balance;
}

interface UsePlayerHUDReturn {
  identity: PlayerIdentity | null;
  loading: boolean;
  error: string | null;
  isZeroBalance: boolean;
  refreshBalance: () => Promise<void>;
}

export function usePlayerHUD(): UsePlayerHUDReturn {
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetchIdentity()
      .then(setIdentity)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const balance = await fetchBalance();
      setIdentity((prev) => (prev ? { ...prev, balance } : prev));
    } catch (e) {
      console.warn("No se pudo actualizar el saldo:", e);
    }
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshBalance();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refreshBalance]);

  return {
    identity,
    loading,
    error,
    isZeroBalance: identity !== null && identity.balance === 0,
    refreshBalance,
  };
}