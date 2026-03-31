"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Types matching backend DTOs
export type Suit = "OROS" | "COPAS" | "ESPADAS" | "BASTOS";
export type Rank = "ACE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "SIX" | "SEVEN" | "JACK" | "HORSE" | "KING";
export type GameState = "WAITING_FOR_PLAYERS" | "IN_PROGRESS" | "FINISHED";

export interface CardDTO {
  suit: Suit;
  rank: Rank;
  points: number;
}

export interface PlayerDTO {
  id: string;
  name: string;
  score: number;
  hand: CardDTO[];
  handSize: number;
}

export interface TrickDTO {
  playedCards: Record<string, CardDTO>;
  leadPlayerId: string | null;
  totalPoints: number;
}

export interface GameStateDTO {
  gameId: string;
  state: GameState;
  players: PlayerDTO[];
  currentPlayerId: string | null;
  currentTrick: TrickDTO | null;
  trumpCard: CardDTO | null;
  trumpSuit: Suit | null;
  remainingCards: number;
  winner: PlayerDTO | null;
}

interface UseBriscaWebSocketOptions {
  url?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

const BRISCA_WS_URL = process.env.NEXT_PUBLIC_BRISCA_WS_URL ?? "https://azar-cafetero.duckdns.org/api/brisca/ws";

export function useBriscaWebSocket(options: UseBriscaWebSocketOptions = {}) {
  const { url = BRISCA_WS_URL, onConnected, onDisconnected, onError } = options;

  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const subscribedGameIdRef = useRef<string | null>(null);
  const gameSubscriptionsRef = useRef<Map<string, any>>(new Map());
  const isConnectingRef = useRef(false); // Prevent multiple connection attempts

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (clientRef.current?.connected || isConnectingRef.current) {
      console.log("[Brisca WS] Already connected or connecting, skipping...");
      return;
    }

    isConnectingRef.current = true;
    console.log("[Brisca WS] Attempting to connect to:", url);
    setConnectionStatus("connecting");
    setError(null);

    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log("[STOMP Debug]", str);
      },
      onConnect: () => {
        console.log("[Brisca WS] Connected");
        isConnectingRef.current = false; // Reset flag
        setIsConnected(true);
        setConnectionStatus("connected");
        onConnected?.();
      },
      onDisconnect: () => {
        console.log("[Brisca WS] Disconnected");
        isConnectingRef.current = false; // Reset flag
        setIsConnected(false);
        setConnectionStatus("disconnected");
        subscribedGameIdRef.current = null;
        onDisconnected?.();
      },
      onStompError: (frame) => {
        const errorMsg = frame.headers["message"] || "WebSocket error";
        console.error("[Brisca WS] STOMP Error:", errorMsg);
        isConnectingRef.current = false; // Reset flag
        setError(errorMsg);
        onError?.(errorMsg);
      },
      onWebSocketError: (event) => {
        console.error("[Brisca WS] WebSocket Error:", event);
        isConnectingRef.current = false; // Reset flag
        setError("WebSocket connection error");
        onError?.("WebSocket connection error");
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
      setConnectionStatus("disconnected");
      subscribedGameIdRef.current = null;
      isConnectingRef.current = false; // Reset flag
    }
  }, []);

  // Subscribe to a game's updates
  const subscribeToGame = useCallback((gameId: string) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Brisca WS] Cannot subscribe - not connected");
      return;
    }

    if (subscribedGameIdRef.current === gameId) return;

    console.log("[Brisca WS] Subscribing to game:", gameId);
    subscribedGameIdRef.current = gameId;

    client.subscribe(`/topic/game/${gameId}`, (message: IMessage) => {
      try {
        const state = JSON.parse(message.body) as GameStateDTO;
        console.log("[Brisca WS] Game state update:", state);
        setGameState(state);
      } catch (e) {
        console.error("[Brisca WS] Failed to parse game state:", e);
      }
    });
  }, []);

  // Create a new game
  const createGame = useCallback((gameId: string, minPlayers = 2, maxPlayers = 4): Promise<void> => {
    return new Promise((resolve, reject) => {
      const client = clientRef.current;
      if (!client?.connected) {
        reject(new Error("Not connected"));
        return;
      }

      // Subscribe to the game topic first
      subscribeToGame(gameId);

      console.log("[Brisca WS] Creating game:", gameId);
      client.publish({
        destination: "/app/game/create",
        body: JSON.stringify({ gameId, minPlayers, maxPlayers }),
      });

      // Give some time for the message to arrive
      setTimeout(resolve, 500);
    });
  }, [subscribeToGame]);

  // Join an existing game
  const joinGame = useCallback((gameId: string, playerId: string, playerName: string) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Brisca WS] Cannot join - not connected");
      return;
    }

    console.log("[Brisca WS] Joining game:", { gameId, playerId, playerName });
    
    // Subscribe to game topic first
    const subscription = client.subscribe(`/topic/game/${gameId}`, (message: IMessage) => {
      try {
        const state = JSON.parse(message.body) as GameStateDTO;
        console.log("[Brisca WS] Game state update:", state);
        setGameState(state);
      } catch (e) {
        console.error("[Brisca WS] Failed to parse game state:", e);
      }
    });

    // Store subscription for cleanup
    if (!gameSubscriptionsRef.current.has(gameId)) {
      gameSubscriptionsRef.current.set(gameId, subscription);
    }

    // Send join message after subscription is established
    client.publish({
      destination: `/app/game/${gameId}/join`,
      body: JSON.stringify({ gameId, playerId, playerName }),
    });
  }, []);

  // Start the game
  const startGame = useCallback((gameId: string) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Brisca WS] Cannot start - not connected");
      return;
    }

    console.log("[Brisca WS] Starting game:", gameId);
    client.publish({
      destination: `/app/game/${gameId}/start`,
      body: JSON.stringify({ gameId }),
    });
  }, []);

  // Play a card
  const playCard = useCallback((gameId: string, playerId: string, suit: Suit, rank: Rank) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Brisca WS] Cannot play card - not connected");
      return;
    }

    console.log("[Brisca WS] Playing card:", { gameId, playerId, suit, rank });
    client.publish({
      destination: `/app/game/${gameId}/play`,
      body: JSON.stringify({ gameId, playerId, suit, rank }),
    });
  }, []);

  // Request current game state
  const requestGameState = useCallback((gameId: string) => {
    const client = clientRef.current;
    if (!client?.connected) {
      console.warn("[Brisca WS] Cannot request state - not connected");
      return;
    }

    console.log("[Brisca WS] Requesting game state:", gameId);
    client.publish({
      destination: `/app/game/${gameId}/state`,
      body: "{}",
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
    connectionStatus,
    error,
    gameState,
    connect,
    disconnect,
    subscribeToGame,
    createGame,
    joinGame,
    startGame,
    playCard,
    requestGameState,
  };
}
