"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  getBalance,
  claimDailyBonus,
  timeUntilNextBonus,
  BalanceData,
  BalanceSseEvent,
} from "@/lib/balanceApi";

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080";

// Monto del bono diario — debe coincidir con Balance.DAILY_BONUS en el backend
const DAILY_BONUS_AMOUNT = 100;

export interface UseBalanceReturn {
  amount: number | null;
  canReceiveBonus: boolean;
  nextBonusCountdown: string | null;
  diff: string | null;
  loading: boolean;
  error: string | null;
  claimBonus: () => Promise<void>;
  claimingBonus: boolean;
  /** Fuerza recarga del saldo desde el servidor (útil al terminar una partida) */
  refreshBalance: () => Promise<void>;
}

export function useBalance(): UseBalanceReturn {
  const [data, setData]                   = useState<BalanceData | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [diff, setDiff]                   = useState<string | null>(null);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [countdown, setCountdown]         = useState<string | null>(null);
  const diffTimerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      const d = await getBalance();
      setData(d);
      setCountdown(timeUntilNextBonus(d.nextBonusAt));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cargar saldo";
      setError(msg);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    loadBalance().finally(() => setLoading(false));
  }, [loadBalance]);

  // Countdown del bono
  useEffect(() => {
    if (!data?.nextBonusAt) return;
    const interval = setInterval(() => {
      setCountdown(timeUntilNextBonus(data.nextBonusAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [data?.nextBonusAt]);

  // SSE: actualizaciones en tiempo real desde el backend
  useEffect(() => {
    if (loading) return;

    const es = new EventSource(`${GATEWAY}/player/balance/live`, {
      withCredentials: true,
    });

    es.addEventListener("balance-update", (e: MessageEvent) => {
      try {
        const event: BalanceSseEvent = JSON.parse(e.data);
        setData((prev) =>
          prev ? { ...prev, amount: event.balance } : prev
        );
        setDiff(event.diff);
        if (diffTimerRef.current) clearTimeout(diffTimerRef.current);
        diffTimerRef.current = setTimeout(() => setDiff(null), 2500);
      } catch {
        // ignore parse errors
      }
    });

    es.onerror = () => {};

    return () => {
      es.close();
      if (diffTimerRef.current) clearTimeout(diffTimerRef.current);
    };
  }, [loading]);

  /**
   * Reclama el bono diario.
   * Actualiza el saldo de forma optimista (+100) sin esperar al SSE,
   * para que la UI responda de inmediato aunque la conexión SSE tarde.
   */
  const claimBonus = useCallback(async () => {
    setClaimingBonus(true);
    try {
      await claimDailyBonus();
      // Actualización optimista: suma el bono al saldo local
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          amount: prev.amount + DAILY_BONUS_AMOUNT,
          canReceiveBonus: false,
        };
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al reclamar bono";
      setError(msg);
    } finally {
      setClaimingBonus(false);
    }
  }, []);

  return {
    amount:             data?.amount ?? null,
    canReceiveBonus:    data?.canReceiveBonus ?? false,
    nextBonusCountdown: countdown,
    diff,
    loading,
    error,
    claimBonus,
    claimingBonus,
    refreshBalance:     loadBalance,
  };
}