"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ParquesMultiplayer from "@/components/parques/ParquesMultiplayer";
import { useUserContext } from "@/context/UserContext";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ParquesRoomPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading } = useUserContext();

  const { connect: connectLobby, isConnected: isLobbyConnected, joinTable: joinLobbyTable } = useGameWebSocket();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Connect to Lobby WebSocket to maintain table session
  useEffect(() => {
    if (user) {
      connectLobby();
    }
  }, [user, connectLobby]);

  // Join the table in the Lobby WebSocket to set session attributes for cleanup
  useEffect(() => {
    if (isLobbyConnected && user && id) {
      joinLobbyTable(id, user.userId, user.name);
    }
  }, [isLobbyConnected, user, id, joinLobbyTable]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) return null;

  return <ParquesMultiplayer gameId={id} userName={user.name} userId={user.userId} />;
}
