"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { RotateCcw, Home, LogOut, User, DollarSign, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MuteButton from "@/components/common/MuteButton";
import {
  useBriscaWebSocket,
  GameStateDTO,
  CardDTO,
  PlayerDTO,
  Suit as BackendSuit,
  Rank as BackendRank,
} from "@/hooks/useBriscaWebSocket";

// ============ TYPE DEFINITIONS ============
type Suit = "Oros" | "Copas" | "Espadas" | "Bastos";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;
type Pos = "bottom" | "top" | "left" | "right";

interface Card { suit: Suit; rank: Rank; id: string; }
interface Player { 
  id: string; 
  name: string; 
  hand: Card[]; 
  score: number;
  pos: Pos;
  emoji: string;
  clr: string;
  isMe: boolean;
}

// ============ CONSTANTS ============
const CV: Record<number, number> = { 1: 11, 3: 10, 12: 4, 11: 3, 10: 2, 7: 0, 6: 0, 5: 0, 4: 0, 2: 0 };
const SDARK: Record<Suit, string> = { Oros: "#78350f", Copas: "#7f1d1d", Espadas: "#1e3a8a", Bastos: "#14532d" };
const SBRIGHT: Record<Suit, string> = { Oros: "#f59e0b", Copas: "#dc2626", Espadas: "#3b82f6", Bastos: "#15803d" };

const PIP_LAYOUTS: Record<number, [number, number, boolean][]> = {
  1: [[30, 45, false]],
  2: [[30, 22, false], [30, 68, true]],
  3: [[30, 16, false], [30, 45, false], [30, 74, true]],
  4: [[19, 22, false], [41, 22, false], [19, 68, true], [41, 68, true]],
  5: [[19, 19, false], [41, 19, false], [30, 45, false], [19, 71, true], [41, 71, true]],
  6: [[19, 18, false], [41, 18, false], [19, 45, false], [41, 45, false], [19, 72, true], [41, 72, true]],
  7: [[30, 13, false], [19, 27, false], [41, 27, false], [19, 53, false], [41, 53, false], [19, 74, true], [41, 74, true]],
};

const PLAYER_POSITIONS: Pos[] = ["bottom", "top", "right", "left"];
const PLAYER_COLORS = ["#60a5fa", "#f87171", "#34d399", "#c084fc"];
const PLAYER_EMOJIS = ["🃏", "⚡", "🦉", "🔥"];

// ============ SUIT/RANK CONVERSION ============
const SUIT_MAP: Record<BackendSuit, Suit> = {
  OROS: "Oros",
  COPAS: "Copas",
  ESPADAS: "Espadas",
  BASTOS: "Bastos",
};

const RANK_MAP: Record<BackendRank, Rank> = {
  ACE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7,
  JACK: 10, HORSE: 11, KING: 12,
};

const REVERSE_SUIT_MAP: Record<Suit, BackendSuit> = {
  Oros: "OROS",
  Copas: "COPAS",
  Espadas: "ESPADAS",
  Bastos: "BASTOS",
};

const REVERSE_RANK_MAP: Record<Rank, BackendRank> = {
  1: "ACE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX", 7: "SEVEN",
  10: "JACK", 11: "HORSE", 12: "KING",
};

function convertCard(dto: CardDTO): Card {
  return {
    suit: SUIT_MAP[dto.suit],
    rank: RANK_MAP[dto.rank],
    id: `${dto.suit}-${dto.rank}-${Math.random()}`,
  };
}

// ============ CARD COMPONENTS ============
interface SuitPipProps { suit: Suit; size?: number; flip?: boolean; }
const SuitPip: React.FC<SuitPipProps> = ({ suit, size = 1, flip = false }) => {
  const t = `${flip ? "rotate(180)" : ""} scale(${size})`;
  switch (suit) {
    case "Oros": return (
      <g transform={t}>
        <circle r="9" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        <circle r="6" fill="none" stroke="#78350f" strokeWidth="0.6" />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <line key={a}
            x1={Math.cos(a * Math.PI / 180) * 3.2} y1={Math.sin(a * Math.PI / 180) * 3.2}
            x2={Math.cos(a * Math.PI / 180) * 5.8} y2={Math.sin(a * Math.PI / 180) * 5.8}
            stroke="#78350f" strokeWidth="0.6" />
        ))}
        <circle r="2.5" fill="#b45309" opacity="0.5" />
      </g>
    );
    case "Copas": return (
      <g transform={t}>
        <path d="M-7,-7 C-9,-2 -8,3 0,6 C8,3 9,-2 7,-7Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.7" />
        <line x1="-7.5" y1="-7" x2="7.5" y2="-7" stroke="#7f1d1d" strokeWidth="1.2" />
        <rect x="-1.5" y="6" width="3" height="3.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
        <ellipse cx="0" cy="9.5" rx="5" ry="1.8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
        <path d="M-4,0 C-5,2 0,5 4,0" fill="#ef4444" opacity="0.3" />
      </g>
    );
    case "Espadas": return (
      <g transform={t}>
        <path d="M0,-11 L2.5,4 L0,5.5 L-2.5,4Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.6" />
        <path d="M-7.5,3.5 C-5,1 5,1 7.5,3.5 C5,6 -5,6 -7.5,3.5Z" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="0.6" />
        <rect x="-1.8" y="5.5" width="3.6" height="5" rx="1" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
        <circle cy="11" r="2.2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
      </g>
    );
    case "Bastos": return (
      <g transform={t}>
        <path d="M-2,-11 C3,-10 5,-5 5,0 C5,5 3,10 -2,11 C-5.5,10 -5.5,5 -5.5,0 C-5.5,-5 -5.5,-10 -2,-11Z"
          fill="#15803d" stroke="#14532d" strokeWidth="0.7" />
        <ellipse cx="1" cy="-5.5" rx="3.2" ry="2.2" fill="#86efac" opacity="0.7" />
        <ellipse cx="1" cy="0" rx="3.2" ry="2.2" fill="#fde68a" opacity="0.6" />
        <ellipse cx="1" cy="5.5" rx="3.2" ry="2.2" fill="#86efac" opacity="0.7" />
      </g>
    );
  }
};

interface FigureSVGProps { suit: Suit; rank: number; }
const FigureSVG: React.FC<FigureSVGProps> = ({ suit, rank }) => {
  const c = SDARK[suit];
  const bg = SBRIGHT[suit];
  return (
    <>
      <rect x="6" y="18" width="48" height="58" rx="3" fill={`${bg}18`} />
      <ellipse cx="30" cy="31" rx="8.5" ry="9" fill="#fde68a" stroke={c} strokeWidth="0.7" />
      <circle cx="26.5" cy="29" r="1.2" fill={c} />
      <circle cx="33.5" cy="29" r="1.2" fill={c} />
      <path d="M25.5,34.5 Q30,37.5 34.5,34.5" fill="none" stroke={c} strokeWidth="0.9" />
      {rank === 12 && <path d="M20,23 L20,19 L23.5,21.5 L27,17 L30,21 L33,17 L36.5,21.5 L40,19 L40,23Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />}
      {rank === 11 && <><path d="M22,23 L38,23 L35,17 L25,17Z" fill={c} /><circle cx="30" cy="16" r="3" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" /></>}
      {rank === 10 && <><path d="M20,23 L40,23 L37.5,17.5 L22.5,17.5Z" fill={c} /><rect x="18" y="22.5" width="24" height="2.5" rx="1" fill={c} /></>}
      <rect x="22" y="39" width="16" height="19" rx="2" fill={c} />
      <line x1="22" y1="43" x2="38" y2="43" stroke={`${bg}88`} strokeWidth="1" />
      <path d="M22,41 L14,47 L16,50 L23,45Z" fill={c} />
      <path d="M38,41 L46,47 L44,50 L37,45Z" fill={c} />
      <rect x="24" y="57" width="5" height="11" rx="2" fill={c} />
      <rect x="31" y="57" width="5" height="11" rx="2" fill={c} />
      {rank === 12 && <><rect x="43" y="37" width="2.5" height="20" rx="1" fill="#fbbf24" /><circle cx="44.2" cy="35.5" r="3.5" fill="#fbbf24" stroke={c} strokeWidth="0.5" /><circle cx="44.2" cy="35.5" r="1.8" fill="#dc2626" /></>}
      {rank === 10 && <rect x="41" y="41" width="2.5" height="17" rx="1" fill="#fbbf24" />}
      {rank === 11 && <><rect x="41" y="35" width="2.5" height="24" rx="1" fill="#92400e" transform="rotate(-10 42 47)" /><path d="M44,30 L50,38" stroke={c} strokeWidth="1.5" strokeLinecap="round" /></>}
    </>
  );
};

const CardBack: React.FC<{ w?: number; h?: number }> = ({ w = 80, h = 120 }) => (
  <svg viewBox="0 0 80 120" style={{ width: w, height: h, display: "block", borderRadius: 9, flexShrink: 0 }}>
    <defs>
      <pattern id="cbk" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#1e3a8a" />
        <path d="M0,0L5,5L10,0M0,10L5,5L10,10" stroke="#2563eb" strokeWidth="0.8" fill="none" />
      </pattern>
    </defs>
    <rect width="80" height="120" fill="url(#cbk)" rx="9" />
    <rect x="4" y="4" width="72" height="112" rx="6" fill="none" stroke="#60a5fa" strokeWidth="0.7" opacity="0.3" />
    <text x="40" y="64" textAnchor="middle" fontSize="8" fill="#93c5fd" opacity="0.55" fontFamily="Georgia,serif" letterSpacing="2">BRISCA</text>
  </svg>
);

interface CardFaceProps { card: Card; w?: number; h?: number; highlight?: boolean; }
const CardFace: React.FC<CardFaceProps> = ({ card, w = 80, h = 120, highlight = false }) => {
  const { suit, rank } = card;
  const isFace = rank >= 10;
  const lbl = rank === 10 ? "S" : rank === 11 ? "C" : rank === 12 ? "R" : String(rank);
  const ps = rank === 1 ? 1.6 : rank >= 6 ? 0.82 : 0.9;
  const dc = SDARK[suit];
  return (
    <div style={{
      width: w, height: h, borderRadius: 9, overflow: "hidden", flexShrink: 0,
      border: `2px solid ${highlight ? "#facc15" : "#d1d5db"}`,
      boxShadow: highlight ? "0 0 0 3px rgba(250,204,21,0.35), 0 6px 16px rgba(0,0,0,0.5)" : "0 4px 14px rgba(0,0,0,0.45)",
      background: "white",
    }}>
      <svg viewBox="0 0 60 90" style={{ width: "100%", height: "100%" }}>
        <rect width="60" height="90" fill="white" />
        <rect x="1.5" y="1.5" width="57" height="87" rx="3" fill="none" stroke={dc} strokeWidth="0.3" opacity="0.2" />
        <text x="4.5" y="10" fontSize="7.5" fontWeight="bold" fontFamily="Georgia,serif" fill={dc}>{lbl}</text>
        <g transform="translate(7,18) scale(0.38)"><SuitPip suit={suit} /></g>
        <g transform="rotate(180,30,45)">
          <text x="4.5" y="10" fontSize="7.5" fontWeight="bold" fontFamily="Georgia,serif" fill={dc}>{lbl}</text>
          <g transform="translate(7,18) scale(0.38)"><SuitPip suit={suit} /></g>
        </g>
        {isFace
          ? <FigureSVG suit={suit} rank={rank} />
          : (PIP_LAYOUTS[rank] || []).map(([x, y, fl], i) => (
            <g key={i} transform={`translate(${x},${y})`}><SuitPip suit={suit} size={ps} flip={fl} /></g>
          ))
        }
      </svg>
    </div>
  );
};

interface CardSlotProps { card?: Card; w?: number; h?: number; }
const CardSlot: React.FC<CardSlotProps> = ({ card, w = 52, h = 78 }) => (
  card
    ? <CardFace card={card} w={w} h={h} />
    : <div style={{ width: w, height: h, borderRadius: 7, border: "2px dashed rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.08)" }} />
);

interface BadgeProps { player: Player; isLeader: boolean; }
const Badge: React.FC<BadgeProps> = ({ player, isLeader }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
    borderRadius: 20, background: `${player.clr}22`, border: `1.5px solid ${player.clr}55`,
    boxShadow: isLeader ? `0 0 10px ${player.clr}55` : "none", transition: "box-shadow 0.4s",
  }}>
    <span style={{ fontSize: 13 }}>{player.emoji}</span>
    <span style={{ fontSize: 12, fontWeight: "bold", color: player.clr, fontFamily: "Georgia,serif" }}>
      {player.name}{player.isMe && " (Tú)"}
    </span>
    <span style={{ background: "rgba(255,255,255,0.9)", color: "#111", fontSize: 11, fontWeight: 900, padding: "1px 7px", borderRadius: 10, minWidth: 22, textAlign: "center" }}>{player.score}</span>
    {isLeader && <span style={{ fontSize: 10, color: "#fde68a", marginLeft: 1 }}>★</span>}
  </div>
);

// ============ MAIN COMPONENT ============
interface BriscaMultiplayerProps { 
  gameId?: string; 
  userName?: string;
}

export default function BriscaMultiplayer({ gameId: propGameId, userName }: BriscaMultiplayerProps) {
  const router = useRouter();
  const [playerId] = useState(() => `player-${Math.random().toString(36).slice(2, 8)}`);
  const [playerName] = useState(() => userName || `Jugador${Math.floor(Math.random() * 1000)}`);
  const [gameId] = useState(() => propGameId || "test-game-1");

  const {
    isConnected,
    connectionStatus,
    error,
    gameState,
    connect,
    createGame,
    joinGame,
    startGame,
    playCard,
    requestGameState,
  } = useBriscaWebSocket({
    onError: (err) => console.error("[Brisca] Error:", err),
  });

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Auto-create or join game when connected
  useEffect(() => {
    if (!isConnected) return;

    const initGame = async () => {
      try {
        await createGame(gameId, 2, 4);
        console.log("[Brisca] Game created/found, joining...");
      } catch (e) {
        console.log("[Brisca] Error creating game:", e);
      }
      joinGame(gameId, playerId, playerName);
      
      // Request game state after a brief delay to ensure we have latest
      setTimeout(() => {
        requestGameState(gameId);
      }, 300);
    };

    initGame();
  }, [isConnected, gameId, playerId, playerName, createGame, joinGame, requestGameState]);

  // Convert backend state to local format
  const { players, trumpCard, trumpSuit, remainingCards, currentPlayerId, currentTrick, phase, winner } = useMemo(() => {
    if (!gameState) {
      return { players: [], trumpCard: null, trumpSuit: null, remainingCards: 0, currentPlayerId: null, currentTrick: {}, phase: "waiting" as const, winner: null };
    }

    // Find my index and arrange players relative to me
    const myIndex = gameState.players.findIndex(p => p.id === playerId);
    const playerCount = gameState.players.length;
    
    const players: Player[] = gameState.players.map((p, i) => {
      // Calculate position relative to me
      let relativeIndex = (i - myIndex + playerCount) % playerCount;
      const pos = PLAYER_POSITIONS[relativeIndex] || "bottom";
      
      return {
        id: p.id,
        name: p.name,
        hand: p.hand.map(convertCard),
        score: p.score,
        pos,
        emoji: PLAYER_EMOJIS[i % 4],
        clr: PLAYER_COLORS[i % 4],
        isMe: p.id === playerId,
      };
    });

    const trumpCard = gameState.trumpCard ? convertCard(gameState.trumpCard) : null;
    const trumpSuit = gameState.trumpSuit ? SUIT_MAP[gameState.trumpSuit] : null;
    
    // Convert trick
    const currentTrick: Record<string, Card> = {};
    if (gameState.currentTrick?.playedCards) {
      for (const [pid, cardDto] of Object.entries(gameState.currentTrick.playedCards)) {
        currentTrick[pid] = convertCard(cardDto);
      }
    }

    const phase = gameState.state === "WAITING_FOR_PLAYERS" ? "waiting" 
                : gameState.state === "IN_PROGRESS" ? "playing"
                : "finished";

    const winner = gameState.winner ? {
      id: gameState.winner.id,
      name: gameState.winner.name,
    } : null;

    return { players, trumpCard, trumpSuit, remainingCards: gameState.remainingCards, currentPlayerId: gameState.currentPlayerId, currentTrick, phase, winner };
  }, [gameState, playerId]);

  const myPlayer = players.find(p => p.isMe);
  const isMyTurn = currentPlayerId === playerId;
  const canStart = phase === "waiting" && players.length >= 2;

  const handlePlayCard = useCallback((card: Card) => {
    if (!isMyTurn || phase !== "playing") return;
    playCard(gameId, playerId, REVERSE_SUIT_MAP[card.suit], REVERSE_RANK_MAP[card.rank]);
  }, [isMyTurn, phase, gameId, playerId, playCard]);

  const handleStartGame = useCallback(() => {
    startGame(gameId);
  }, [gameId, startGame]);

  const byPos = (pos: Pos): Player | undefined => players.find(p => p.pos === pos);
  const playedBy = (pid: string): Card | undefined => currentTrick[pid];

  // Sidebar
  const Sidebar = () => (
    <nav className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
      <button className="p-2 hover:bg-white/20 rounded-full"><User size={24} /></button>
      <button className="p-2 hover:bg-white/20 rounded-full"><DollarSign size={24} /></button>
      <button onClick={() => router.push("/lobby")} className="p-2 hover:bg-white/20 rounded-full"><Home size={24} /></button>
      <div className="h-px bg-white/20 w-8 self-center my-2" />
      <MuteButton variant="sidebar" />
      <div className="h-px bg-white/20 w-8 self-center my-2" />
      <button onClick={() => router.push("/")} className="p-2 hover:bg-white/20 rounded-full text-red-400" title="Salir"><LogOut size={24} /></button>
    </nav>
  );

  // Loading/Connecting
  if (connectionStatus !== "connected") {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.55)), url('/images/backgroundbrisca.jpg')`, backgroundPosition: "center 30%" }} />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center p-10 rounded-3xl border-2 border-yellow-500/40 bg-green-900/95">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">Conectando...</h2>
            <p className="text-white/60">Estableciendo conexión</p>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Waiting for players
  if (phase === "waiting") {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.55)), url('/images/backgroundbrisca.jpg')`, backgroundPosition: "center 30%" }} />
        <Sidebar />
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
          <div style={{ textAlign: "center", padding: "40px 48px", borderRadius: 32, border: "2px solid rgba(234,179,8,0.45)", background: "rgba(10,60,28,0.97)", boxShadow: "0 0 80px rgba(234,179,8,0.12)", maxWidth: 440 }}>
            <h1 style={{ fontSize: 52, fontWeight: 900, fontStyle: "italic", color: "#fbbf24", letterSpacing: 8, marginBottom: 4, textShadow: "0 0 30px rgba(251,191,36,0.35)" }}>BRISCA</h1>
            <p style={{ color: "#6ee7b7", fontSize: 12, marginBottom: 16, letterSpacing: 3 }}>MESA: {gameId}</p>
            
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 12 }}>Jugadores ({players.length}/4):</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {players.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderRadius: 12, background: `${PLAYER_COLORS[i]}22`, border: `1px solid ${PLAYER_COLORS[i]}55` }}>
                    <span style={{ color: PLAYER_COLORS[i] }}>{PLAYER_EMOJIS[i]} {p.name}{p.isMe && " (Tú)"}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Listo</span>
                  </div>
                ))}
                {players.length < 4 && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, border: "2px dashed rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" }}>
                    Esperando jugadores...
                  </div>
                )}
              </div>
            </div>

            {canStart && (
              <button onClick={handleStartGame}
                style={{ width: "100%", background: "#fbbf24", color: "#052a12", fontWeight: "bold", fontSize: 16, padding: "14px 28px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Georgia,serif" }}>
                ¡Iniciar Partida!
              </button>
            )}
            {!canStart && players.length < 2 && (
              <p style={{ color: "rgba(251,191,36,0.7)", fontSize: 13 }}>Se necesitan al menos 2 jugadores</p>
            )}

            <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 12, background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.8, textAlign: "left" }}>
              <strong style={{ color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 4 }}>Reglas:</strong>
              As·11pts · Tres·10pts · Rey·4pts · Caballo·3pts · Sota·2pts<br />
              · Triunfo gana cualquier carta de otro palo<br />
              · No hay obligación de seguir palo
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game finished
  if (phase === "finished") {
    const winnerPlayer = players.find(p => p.id === winner?.id);
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const totalPoints = sortedPlayers.reduce((sum, p) => sum + p.score, 0);
    
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.55)), url('/images/backgroundbrisca.jpg')`, backgroundPosition: "center 30%" }} />
        <Sidebar />
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
          <div style={{ textAlign: "center", padding: "44px 52px", borderRadius: 36, border: "3px solid #fbbf24", background: "#0a4d22", boxShadow: "0 0 70px rgba(251,191,36,0.18)", maxWidth: 480 }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 26, fontWeight: "bold", color: "white", marginBottom: 8 }}>¡Partida Terminada!</h2>
            
            {/* Winner announcement with points */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))", 
              border: "2px solid rgba(251,191,36,0.4)", 
              borderRadius: 16, 
              padding: "16px 20px", 
              marginBottom: 20 
            }}>
              <p style={{ fontSize: 18, color: "#fde68a", marginBottom: 4 }}>
                {winnerPlayer?.emoji} <strong>{winnerPlayer?.name || winner?.name}</strong>
                {winnerPlayer?.isMe && " (Tú)"}
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24", marginBottom: 4 }}>
                ¡GANA CON {winnerPlayer?.score || 0} PUNTOS!
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                de {totalPoints} puntos totales en juego
              </p>
            </div>

            {/* Scoreboard */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 2 }}>TABLA DE POSICIONES</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sortedPlayers.map((p, i) => (
                  <div key={p.id} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "10px 16px", 
                    borderRadius: 12, 
                    background: i === 0 ? `${p.clr}22` : "rgba(255,255,255,0.05)", 
                    border: `1.5px solid ${i === 0 ? p.clr : "rgba(255,255,255,0.1)"}` 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: "50%", 
                        background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "rgba(255,255,255,0.1)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: 12, 
                        fontWeight: "bold",
                        color: i < 3 ? "#000" : "#fff"
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ color: p.clr, fontWeight: "bold", fontSize: 14 }}>
                        {p.emoji} {p.name}{p.isMe && " (Tú)"}
                      </span>
                    </div>
                    <span style={{ color: "white", fontSize: 20, fontWeight: 900 }}>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => window.location.reload()}
              style={{ background: "#fbbf24", color: "#052a12", fontWeight: "bold", fontSize: 15, padding: "12px 28px", borderRadius: 24, border: "none", cursor: "pointer", fontFamily: "Georgia,serif" }}>
              Nueva Partida
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN GAME (playing phase) ============
  const topP = byPos("top");
  const leftP = byPos("left");
  const rightP = byPos("right");
  const botP = byPos("bottom");
  const CW = 52, CH = 78;

  const msg = isMyTurn ? "¡Tu turno! Elige una carta" : `Turno de ${players.find(p => p.id === currentPlayerId)?.name || "..."}`;

  return (
    <div className="relative w-full text-white overflow-hidden bg-slate-900"
      style={{ height: "100vh", display: "flex", flexDirection: "column", userSelect: "none", fontFamily: "sans-serif" }}>
      <div className="absolute inset-0 z-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(5,42,18,0.93), rgba(5,42,18,0.88)), url('/images/backgroundbrisca.jpg')`, backgroundPosition: "center 30%" }} />
      <Sidebar />
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* TOP PLAYER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 6px", gap: 6, minHeight: topP ? 86 : 12 }}>
          {topP && (
            <>
              <Badge player={topP} isLeader={currentPlayerId === topP.id} />
              <div style={{ display: "flex", gap: 3 }}>
                {topP.hand.map((_, i) => <CardBack key={i} w={36} h={54} />)}
              </div>
            </>
          )}
        </div>

        {/* MIDDLE ROW */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 0 }}>
          {leftP && (
            <div style={{ position: "absolute", left: 80, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Badge player={leftP} isLeader={currentPlayerId === leftP.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {leftP.hand.map((_, i) => <CardBack key={i} w={32} h={48} />)}
              </div>
            </div>
          )}
          {rightP && (
            <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Badge player={rightP} isLeader={currentPlayerId === rightP.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {rightP.hand.map((_, i) => <CardBack key={i} w={32} h={48} />)}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Deck + Trump */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", width: 76, height: 110 }}>
                {trumpCard && (
                  <div style={{ position: "absolute", top: 22, left: -22, transform: "rotate(90deg)", transformOrigin: "center", zIndex: 0 }}>
                    <CardFace card={trumpCard} w={52} h={78} />
                  </div>
                )}
                {remainingCards > 0 && (
                  <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", top: 2, left: 2, width: 64, height: 96, borderRadius: 8, background: "#172554", border: "1px solid rgba(255,255,255,0.12)" }} />
                      <CardBack w={64} h={96} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "rgba(255,255,255,0.75)", fontWeight: "bold", fontSize: 13, pointerEvents: "none" }}>
                        {remainingCards}
                      </div>
                    </div>
                  </div>
                )}
                {remainingCards === 0 && !trumpCard && (
                  <div style={{ width: 64, height: 96, borderRadius: 8, border: "2px dashed rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 10 }}>vacío</div>
                )}
              </div>
              {trumpSuit && (
                <div style={{ background: "rgba(0,0,0,0.45)", padding: "3px 10px", borderRadius: 8, color: "#fde68a", fontSize: 11, textAlign: "center" }}>
                  {trumpSuit === "Oros" ? "🟡" : trumpSuit === "Copas" ? "🔴" : trumpSuit === "Espadas" ? "🔵" : "🟢"} {trumpSuit}
                </div>
              )}
            </div>
            {/* Cross of played cards */}
            <div style={{ position: "relative", width: CW * 3 + 18, height: CH * 3 + 18 }}>
              <div style={{ position: "absolute", left: CW, top: CH, width: CW + 18, height: CH + 18, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)" }}>
                {topP && <CardSlot card={playedBy(topP.id)} w={CW} h={CH} />}
              </div>
              <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}>
                {leftP && <CardSlot card={playedBy(leftP.id)} w={CW} h={CH} />}
              </div>
              <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
                {rightP && <CardSlot card={playedBy(rightP.id)} w={CW} h={CH} />}
              </div>
              <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}>
                {botP && <CardSlot card={playedBy(botP.id)} w={CW} h={CH} />}
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        <div style={{ textAlign: "center", padding: "4px 8px", minHeight: 24 }}>
          <span style={{ display: "inline-block", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "3px 16px", borderRadius: 20, color: isMyTurn ? "#fde68a" : "#a7f3d0", fontSize: 12, fontStyle: "italic", border: "1px solid rgba(255,255,255,0.08)" }}>
            {msg}
          </span>
        </div>

        {/* HUMAN HAND */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "4px 0 8px", alignItems: "flex-end" }}>
          {botP?.hand.map(card => (
            <button key={card.id} onClick={() => handlePlayCard(card)} disabled={!isMyTurn}
              style={{ background: "none", border: "none", padding: 0, cursor: isMyTurn ? "pointer" : "default", transition: "transform 0.2s, filter 0.2s", filter: isMyTurn ? "none" : "brightness(0.8) saturate(0.8)" }}
              onMouseEnter={e => { if (isMyTurn) (e.currentTarget as HTMLElement).style.transform = "translateY(-14px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              <CardFace card={card} w={78} h={117} highlight={isMyTurn} />
            </button>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px 6px 80px", background: "rgba(0,0,0,0.28)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {botP && <Badge player={botP} isLeader={currentPlayerId === botP.id} />}
          <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, textAlign: "right" }}>
            As·11 · 3·10 · R·4 · C·3 · S·2
          </div>
        </div>
      </div>

      {/* Restart */}
      <button onClick={() => window.location.reload()} title="Nueva partida"
        style={{ position: "fixed", top: 10, right: 10, zIndex: 100, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.18)", color: "white", padding: 8, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.5s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "rotate(180deg)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "rotate(0deg)"; }}>
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
