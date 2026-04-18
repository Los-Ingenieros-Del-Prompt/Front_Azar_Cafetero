"use client";
import { useEffect, useState } from "react";

export interface PlayerIdentity {
  name: string;
  avatar: string;
}

// Apunta al gateway, no al lobby directamente
const API = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://azar-cafetero.duckdns.org";

async function fetchIdentity(): Promise<PlayerIdentity> {
  const res = await fetch(`${API}/api/player/identity`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`identity: ${res.status}`);
  return res.json();
}

interface UsePlayerHUDReturn {
  identity: PlayerIdentity | null;
  loading: boolean;
  error: string | null;
}

/**
 * Provee solo la identidad del jugador (nombre y avatar).
 * El saldo ya es responsabilidad exclusiva de useBalance, que
 * se mantiene sincronizado vía SSE y tiene su propia carga inicial.
 * No duplicamos la llamada al wallet aquí.
 */
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

  return { identity, loading, error };
}