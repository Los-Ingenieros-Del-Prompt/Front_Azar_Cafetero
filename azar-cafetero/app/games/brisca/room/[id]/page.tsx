"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import BriscaMultiplayer from "@/components/brisca/BriscaMultiplayer";
import { useUserContext } from "@/context/UserContext";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BriscaRoomPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading } = useUserContext();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);
  const BRISCA_FLOOR_ID = "00000000-0000-0000-0000-000000000002";

  const { isConnected, connect, joinTable, leaveTable } = useGameWebSocket();

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    connect();
  }, [user, connect]);

  useEffect(() => {
    if (!user) return;
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://azar-cafetero.duckdns.org";

    fetch(`${gatewayUrl}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to get player id: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (typeof data.userId === "string" && data.userId.trim()) {
          setPlayerId(data.userId);
        } else {
          throw new Error("Missing userId in /auth/me response");
        }
      })
      .catch((err) => {
        console.error("[Brisca Room] Unable to resolve player id", err);
      });
  }, [user]);

  useEffect(() => {
    if (!user || !playerId || !isConnected || hasJoinedRef.current) {
      return;
    }

    joinTable(id, playerId, user.name, undefined, BRISCA_FLOOR_ID);
    hasJoinedRef.current = true;

    return () => {
      if (hasJoinedRef.current) {
        leaveTable(id, playerId, user.name, BRISCA_FLOOR_ID);
        hasJoinedRef.current = false;
      }
    };
  }, [id, user, playerId, isConnected, joinTable, leaveTable]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <BriscaMultiplayer gameId={id} userName={user.name} />;
}
