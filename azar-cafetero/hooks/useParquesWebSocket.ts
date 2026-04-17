"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ============ TIPOS QUE DEVUELVE EL BACKEND ============

export interface PieceDTO {
  id: string;
  absolutePosition: number;  // -1 = cárcel, 68 = casa, 0-67 = tablero
  relativePosition: number;  // -1 = cárcel, 68 = casa, 0-67 = relativo al jugador
  inJail: boolean;
  atHome: boolean;
}

export interface PlayerDTO {
  id: string;
  name: string;
  color: "AMARILLO" | "AZUL" | "ROJO" | "VERDE";
  jailAttemptsRemaining: number;
  consecutivePairs: number;
  pieces: PieceDTO[];
}

export interface GameStateDTO {
  gameId: string;
  currentPlayerId: string;
  die1: number;
  die2: number;
  moveValue: number;
  diceRolled: boolean;
  jailExitAvailable: boolean;
  finished: boolean;
  winnerId: string | null;
  players: PlayerDTO[];
}

export interface PlayerInput {
  id: string;
  name: string;
}

// ============ HOOK ============

interface UseParquesWebSocketOptions {
  url?: string;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

const PARQUES_WS_URL =
  process.env.NEXT_PUBLIC_PARQUES_WS_URL ?? "https://azar-cafetero.duckdns.org/parques/ws";

export function useParquesWebSocket(options: UseParquesWebSocketOptions = {}) {
  const { url = PARQUES_WS_URL, onError, onConnected, onDisconnected } = options;

  const clientRef = useRef<Client | null>(null);
  const isConnectingRef = useRef(false);
  const gameSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const errorSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Conectar ──────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (clientRef.current?.connected || isConnectingRef.current) return;

    isConnectingRef.current = true;
    setConnectionStatus("connecting");
    setError(null);

    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        isConnectingRef.current = false;
        setIsConnected(true);
        setConnectionStatus("connected");
        onConnected?.();
      },
      onDisconnect: () => {
        isConnectingRef.current = false;
        setIsConnected(false);
        setConnectionStatus("disconnected");
        onDisconnected?.();
      },
      onStompError: (frame) => {
        const msg = frame.headers["message"] || "WebSocket error";
        isConnectingRef.current = false;
        setError(msg);
        onError?.(msg);
      },
      onWebSocketError: () => {
        isConnectingRef.current = false;
        setError("WebSocket connection error");
        onError?.("WebSocket connection error");
      },
    });

    clientRef.current = client;
    client.activate();
  }, [url, onConnected, onDisconnected, onError]);

  // ── Desconectar ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    gameSubscriptionRef.current?.unsubscribe();
    errorSubscriptionRef.current?.unsubscribe();
    clientRef.current?.deactivate();
    clientRef.current = null;
    isConnectingRef.current = false;
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  // ── Suscribirse a un juego ────────────────────────────────────────────────
  const subscribeToGame = useCallback((gameId: string) => {
    const client = clientRef.current;
    if (!client?.connected) return;

    // Limpiar suscripción anterior si existe
    gameSubscriptionRef.current?.unsubscribe();
    errorSubscriptionRef.current?.unsubscribe();

    // /topic/game/{gameId} — estado del juego en tiempo real
    gameSubscriptionRef.current = client.subscribe(
      `/topic/game/${gameId}`,
      (message: IMessage) => {
        try {
          const state: GameStateDTO = JSON.parse(message.body);
          setGameState(state);
        } catch (e) {
          console.error("[Parqués WS] Error parseando estado:", e);
        }
      }
    );

    // /topic/errors — errores de dominio (turno incorrecto, movimiento inválido, etc.)
    errorSubscriptionRef.current = client.subscribe(
      `/topic/errors`,
      (message: IMessage) => {
        try {
          const { error: errMsg } = JSON.parse(message.body);
          setError(errMsg || "Error desconocido");
          // Limpiar el error después de 4 segundos
          setTimeout(() => setError(null), 4000);
        } catch (e) {
          console.error("[Parqués WS] Error parseando error:", e);
        }
      }
    );
  }, []);

  // ── Crear juego ───────────────────────────────────────────────────────────
  // Destino: /app/game/create
  // Payload: { players: [{id, name}, ...] }
  // Broadcast: /topic/game/{gameId}
  const createGame = useCallback(
    (players: PlayerInput[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        const client = clientRef.current;
        if (!client?.connected) {
          reject(new Error("No conectado"));
          return;
        }

        client.publish({
          destination: "/app/game/create",
          body: JSON.stringify({ players }),
        });

        // El backend responde en /topic/game/{gameId}, que ya estará suscrito
        setTimeout(resolve, 300);
      });
    },
    []
  );

  // ── Lanzar dado ───────────────────────────────────────────────────────────
  // Destino: /app/game/{gameId}/roll
  // Payload: { playerId }
  // Broadcast: /topic/game/{gameId}
  const rollDice = useCallback((gameId: string, playerId: string) => {
    const client = clientRef.current;
    if (!client?.connected) return;

    client.publish({
      destination: `/app/game/${gameId}/roll`,
      body: JSON.stringify({ playerId }),
    });
  }, []);

  // ── Mover ficha ───────────────────────────────────────────────────────────
  // Destino: /app/game/{gameId}/move
  // Payload: { playerId, pieceId }
  // Broadcast: /topic/game/{gameId}
  const movePiece = useCallback((gameId: string, playerId: string, pieceId: string) => {
    const client = clientRef.current;
    if (!client?.connected) return;

    client.publish({
      destination: `/app/game/${gameId}/move`,
      body: JSON.stringify({ playerId, pieceId }),
    });
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    gameState,
    connect,
    disconnect,
    subscribeToGame,
    createGame,
    rollDice,
    movePiece,
  };
}
