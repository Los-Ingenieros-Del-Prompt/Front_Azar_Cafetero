"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import TableWaitingRoom from "@/components/lobby/TableWaitingRoom";
import { useUserContext } from "@/context/UserContext";

export default function ParquesRoomPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUserContext();
  const tableId = params.id;

  const players = useMemo(
    () => [
      {
        id: "host",
        name: user?.name ?? "Capitán Costeño",
        avatar: "🪇",
        isHost: true,
      },
      { id: "guest-1", name: "La Rola", avatar: "🎀" },
      { id: "guest-2", name: "El Caleño", avatar: "🕺" },
      { id: "guest-3", name: "La Santandereana", avatar: "🌶️" },
    ],
    [user?.name]
  );

  return (
    <TableWaitingRoom
      gameLabel="Parqués"
      tableId={tableId}
      tableName={`Sala Parqués #${tableId}`}
      minPlayers={2}
      maxPlayers={10}
      players={players}
      accentClass="border-emerald-300/45 bg-emerald-500/15 text-emerald-100"
      bgImage="/images/backgroundparques.jpg"
      roomRoutePrefix="parques"
    />
  );
}
