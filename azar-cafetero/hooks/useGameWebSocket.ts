"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// DTOs matching Game-WebSocket service
export interface TableDTO {
  tableId: string;
  tableName: string;
  playerCount: number;
  createdAt: number;
  requiredBet: number;
  maxPlayers?: number;
}

export interface JoinTableDTO {
  playerId: string;
  playerName: string;
  tableId: string;
  balance?: number;
}

export interface TableMessageDTO {
  playerId: string;
  tableId: string;
  content: string;
  timestamp: string;
}

export interface TableCreatedEvent {
  tableId: string;
  tableName: string;
  maxPlayers: number;
  requiredBet?: number;
}

export interface PlayerJoinedEvent {
  tableId: string;
  playerName: string;
  currentPlayers: number;
  availableSeats: number;
}

export interface TableClosedEvent {
  tableId: string;
}

export type FloorEvent = 
  | { type: "TABLE_CREATED"; data: TableCreatedEvent }
  | { type: "PLAYER_JOINED"; data: PlayerJoinedEvent }
  | { type: "TABLE_CLOSED"; data: TableClosedEvent };

interface UseGameWebSocketOptions {
  url?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

const GAME_WS_URL = process.env.NEXT_PUBLIC_GAME_WS_URL ?? "http://localhost:8080/game/ws";
const GAME_API_URL = process.env.NEXT_PUBLIC_GAME_API_URL ?? "http://localhost:8080/game";

export function useGameWebSocket(options: UseGameWebSocketOptions = {}) {
  const { url = GAME_WS_URL, onConnected, onDisconnected, onError } = options;

  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [floorEvents, setFloorEvents] = useState<FloorEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const subscribedFloorRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    setError(null);

    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log("[Game WS Debug]", str);
      },
      onConnect: () => {
        console.log("[Game WS] Connected");
        setIsConnected(true);
        onConnected?.();
      },
      onDisconnect: () => {
        console.log("[Game WS] Disconnected");
        setIsConnected(false);
        subscribedFloorRef.current = null;
        onDisconnected?.();
      },
      onStompError: (frame) => {
        const errorMsg = frame.headers["message"] || "WebSocket error";
        console.error("[Game WS] STOMP Error:", errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [url, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      subscribedFloorRef.current = null;
    }
  }, []);

  // Subscribe to floor events
  const subscribeToFloor = useCallback((floorId: string, playerId: string) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Game WS] Cannot subscribe - not connected");
      return;
    }

    if (subscribedFloorRef.current === floorId) return;

    console.log("[Game WS] Subscribing to floor:", floorId);
    subscribedFloorRef.current = floorId;

    // Subscribe to floor topic
    client.subscribe(`/topic/floor/${floorId}`, (message: IMessage) => {
      try {
        const event = JSON.parse(message.body);
        console.log("[Game WS] Floor event:", event);
        
        // Limit event history to last 100 events to prevent memory leaks
        setFloorEvents(prev => {
          const updated = [...prev, event];
          return updated.slice(-100);
        });
        
        // Update tables based on events
        if (event.type === "TABLE_CREATED") {
          setTables(prev => [...prev, {
            tableId: event.data.tableId,
            tableName: event.data.tableName,
            playerCount: 0,
            createdAt: Date.now(),
            requiredBet: event.data.requiredBet || 0,
            maxPlayers: event.data.maxPlayers,
          }]);
        } else if (event.type === "PLAYER_JOINED") {
          setTables(prev => prev.map(t => 
            t.tableId === event.data.tableId 
              ? { ...t, playerCount: event.data.currentPlayers }
              : t
          ));
        } else if (event.type === "TABLE_CLOSED") {
          setTables(prev => prev.filter(t => t.tableId !== event.data.tableId));
        }
      } catch (e) {
        console.error("[Game WS] Failed to parse floor event:", e);
      }
    });

    // Send subscribe message
    client.publish({
      destination: `/app/floor/${floorId}/subscribe`,
      body: JSON.stringify({ floorId, playerId }),
    });
  }, []);

  // Create a new table (REST API)
  const createTable = useCallback(async (
    tableName: string, 
    requiredBet: number, 
    maxPlayers: number = 4
  ): Promise<TableDTO> => {
    const response = await fetch(`${GAME_API_URL}/api/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName, requiredBet, maxPlayers }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to create table");
    }
    
    const table = await response.json();
    return table;
  }, []);

  // Fetch all tables (REST API)
  const fetchTables = useCallback(async (): Promise<TableDTO[]> => {
    const response = await fetch(`${GAME_API_URL}/api/tables`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch tables");
    }
    
    const tables = await response.json();
    setTables(tables);
    return tables;
  }, []);

  // Notify table created (WebSocket)
  const notifyTableCreated = useCallback((floorId: string, table: TableCreatedEvent) => {
    const client = clientRef.current;
    if (!client?.connected) return;

    client.publish({
      destination: `/app/floor/${floorId}/table-created`,
      body: JSON.stringify(table),
    });
  }, []);

  // Join table (WebSocket message)
  const joinTable = useCallback((tableId: string, playerId: string, playerName: string, balance?: number) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Game WS] Cannot join - not connected");
      return;
    }

    console.log("[Game WS] Joining table:", { tableId, playerId, playerName });
    
    // Debounce rapid join attempts - prevent duplicate requests
    const joinKey = `${tableId}-${playerId}`;
    const now = Date.now();
    const lastJoinAttempt = (client as any).lastJoinAttempt || {};
    
    if (lastJoinAttempt[joinKey] && now - lastJoinAttempt[joinKey] < 1000) {
      console.warn("[Game WS] Ignoring duplicate join request (debounced)");
      return;
    }
    
    (client as any).lastJoinAttempt = { ...lastJoinAttempt, [joinKey]: now };
    
    client.publish({
      destination: `/app/table/${tableId}/join`,
      body: JSON.stringify({ playerId, playerName, tableId, balance }),
    });
  }, []);

  // Leave table (WebSocket message)
  const leaveTable = useCallback((tableId: string, playerId: string, playerName: string) => {
    const client = clientRef.current;
    if (!client?.connected) return;

    client.publish({
      destination: `/app/table/${tableId}/leave`,
      body: JSON.stringify({ playerId, playerName, tableId }),
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    error,
    tables,
    floorEvents,
    connect,
    disconnect,
    subscribeToFloor,
    createTable,
    fetchTables,
    notifyTableCreated,
    joinTable,
    leaveTable,
  };
}
