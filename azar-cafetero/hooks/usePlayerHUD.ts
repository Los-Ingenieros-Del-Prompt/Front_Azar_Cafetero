"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken } from "@/lib/auth";

export interface PlayerIdentity {
  name: string;
  avatar: string;        // URL or emoji string
  balance: number;       // BigDecimal comes as number in JSON
}

const API = process.env.NEXT_PUBLIC_LOBBY_URL ?? "http://localhost:8081";

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchIdentity(): Promise<PlayerIdentity> {
  const res = await fetch(`${API}player/identity`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`identity: ${res.status}`);
  return res.json();
}

async function fetchBalance(): Promise<number> {
  const res = await fetch(`${API}player/identity`, {
    headers: { ...authHeaders() },
    cache: "no-store",     // siempre fresco al volver de una partida
  });
  if (!res.ok) throw new Error(`balance: ${res.status}`);
  const data: PlayerIdentity = await res.json();
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

  // Carga inicial de identidad completa (nombre + avatar + saldo)
  useEffect(() => {
    fetchIdentity()
      .then(setIdentity)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Actualiza solo el saldo cuando la pestaña vuelve a ser visible
  // (cubre el caso: jugador regresa de una partida sin recargar)
  const refreshBalance = useCallback(async () => {
    try {
      const balance = await fetchBalance();
      setIdentity((prev) => (prev ? { ...prev, balance } : prev));
    } catch (e) {
      // silent — el saldo anterior sigue visible
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
