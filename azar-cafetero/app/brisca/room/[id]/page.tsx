"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import TableWaitingRoom from "@/components/lobby/TableWaitingRoom";
import { useUserContext } from "@/context/UserContext";

export default function BriscaRoomPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUserContext();
  const tableId = params.id;

  const players = useMemo(
    () => [
      {
        id: "host",
        name: user?.name ?? "Jugador Paisa",
        avatar: "🧉",
        isHost: true,
      },
      { id: "guest-1", name: "La Mona", avatar: "🧢" },
      { id: "guest-2", name: "Don Ñero", avatar: "🎩" },
    ],
    [user?.name]
  );

  return (
    <TableWaitingRoom
      gameLabel="Brisca"
      tableId={tableId}
      tableName={`Mesa Brisca #${tableId}`}
      minPlayers={2}
      maxPlayers={4}
      players={players}
      accentClass="border-yellow-300/45 bg-yellow-500/15 text-yellow-100"
      bgImage="/images/backgroundbrisca.jpg"
      roomRoutePrefix="brisca"
    />
  );
}
