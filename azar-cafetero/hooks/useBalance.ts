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

export interface UseBalanceReturn {
  amount: number | null;
  canReceiveBonus: boolean;
  nextBonusCountdown: string | null;
  diff: string | null;
  loading: boolean;
  error: string | null;
  claimBonus: () => Promise<void>;
  claimingBonus: boolean;
}

export function useBalance(): UseBalanceReturn {
  const [data, setData]               = useState<BalanceData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [diff, setDiff]               = useState<string | null>(null);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [countdown, setCountdown]     = useState<string | null>(null);
  const diffTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getBalance()
      .then((d) => {
        setData(d);
        setCountdown(timeUntilNextBonus(d.nextBonusAt));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data?.nextBonusAt) return;
    const interval = setInterval(() => {
      setCountdown(timeUntilNextBonus(data.nextBonusAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [data?.nextBonusAt]);

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

  const claimBonus = useCallback(async () => {
    setClaimingBonus(true);
    try {
      await claimDailyBonus();
      setData((prev) =>
        prev ? { ...prev, canReceiveBonus: false } : prev
      );
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
  };
}