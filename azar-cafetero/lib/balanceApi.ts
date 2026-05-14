import { getToken } from "@/lib/auth";
const LOBBY_API = (process.env.NEXT_PUBLIC_LOBBY_URL ?? "/api-proxy").replace(/\/$/, "");

export interface BalanceData {
  userId: string;
  amount: number;
  canReceiveBonus: boolean;
  nextBonusAt: string | null;
}

export interface BalanceSseEvent {
  userId: string;
  balance: number;
  diff: string;
}

export async function getBalance(): Promise<BalanceData> {
  const token = getToken();
  const res = await fetch(`${LOBBY_API}/player/balance`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`balance: ${res.status}`);
  return res.json();
}

export async function claimDailyBonus(): Promise<{
  message: string;
  amount: number;
  transactionId: string;
}> {
  const token = getToken();
  const res = await fetch(`${LOBBY_API}/player/bonus`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al reclamar bono");
  return data;
}

export function timeUntilNextBonus(nextBonusAt: string | null): string | null {
  if (!nextBonusAt) return null;
  const diff = new Date(nextBonusAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
