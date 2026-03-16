const GAME_BASE_URL = process.env.NEXT_PUBLIC_GAME_URL ?? "http://localhost:8085";

interface GameTableDTO {
  tableId: string;
  tableName: string;
  playerCount: number;
}

export interface GameRoom {
  id: string;
  name: string;
  players: number;
}

export async function fetchGameRooms(): Promise<GameRoom[]> {
  const res = await fetch(`${GAME_BASE_URL}/api/tables`);
  if (!res.ok) {
    throw new Error(`Failed to load game tables: ${res.status}`);
  }

  const tables: GameTableDTO[] = await res.json();
  return tables.map((table) => ({
    id: table.tableId,
    name: table.tableName,
    players: table.playerCount,
  }));
}
