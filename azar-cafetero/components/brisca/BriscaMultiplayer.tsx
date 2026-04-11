"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { RotateCcw, Home, LogOut, User, DollarSign, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MuteButton from "@/components/common/MuteButton";
import {
  useBriscaWebSocket,
  CardDTO,
  Suit as BackendSuit,
  Rank as BackendRank,
} from "@/hooks/useBriscaWebSocket";

// ============ TYPE DEFINITIONS ============
type Suit = "Oros" | "Copas" | "Espadas" | "Bastos";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;
type Pos = "bottom" | "top" | "left" | "right";
type RoundPhase = "waiting" | "playing" | "finished";

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

interface InGameAlert {
  id: string;
  text: string;
  tone: "info" | "success";
}

interface HandResult {
  handNumber: number;
  winnerId: string;
  winnerName: string;
  points: number;
}

interface FlyingCardAnimation {
  card: Card;
  from: { x: number; y: number; w: number; h: number };
  delta: { x: number; y: number };
  active: boolean;
}

interface OverlayCardAnimation extends FlyingCardAnimation {
  id: string;
  rotateTo: number;
  scaleTo: number;
  fadeTo: number;
  durationMs: number;
}

interface TrickPointsPop {
  text: string;
  x: number;
  y: number;
  active: boolean;
}

// ============ CONSTANTS ============
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
const PLAYER_COLORS = ["#22d3ee", "#f87171", "#a78bfa", "#34d399"];
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

// Dark fantasy card back
const CardBack: React.FC<{ w?: number; h?: number }> = ({ w = 80, h = 120 }) => (
  <svg viewBox="0 0 80 120" style={{ width: w, height: h, display: "block", borderRadius: 6, flexShrink: 0 }}>
    <defs>
      <radialGradient id="cbkgrad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#1a1035" />
        <stop offset="100%" stopColor="#0a0820" />
      </radialGradient>
      <pattern id="cbkpat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="none" />
        <path d="M0,4 L4,0 L8,4 L4,8Z" fill="none" stroke="rgba(100,80,200,0.25)" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="80" height="120" fill="url(#cbkgrad)" rx="6" />
    <rect width="80" height="120" fill="url(#cbkpat)" rx="6" />
    {/* Cyan glow border like the reference */}
    <rect x="2" y="2" width="76" height="116" rx="5" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity="0.6" />
    <rect x="5" y="5" width="70" height="110" rx="4" fill="none" stroke="#22d3ee" strokeWidth="0.4" opacity="0.3" />
    {/* Inner decorative diamond */}
    <path d="M40,20 L55,40 L40,60 L25,40Z" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
    <path d="M40,30 L50,40 L40,50 L30,40Z" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
    {/* Skull-like ornament at top and bottom */}
    <circle cx="40" cy="40" r="7" fill="rgba(139,92,246,0.18)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.6" />
    <text x="40" y="44" textAnchor="middle" fontSize="7" fill="rgba(180,160,255,0.7)" fontFamily="Georgia,serif">✦</text>
    <text x="40" y="100" textAnchor="middle" fontSize="6" fill="rgba(34,211,238,0.45)" fontFamily="Georgia,serif" letterSpacing="1.5">BRISCA</text>
  </svg>
);

interface CardFaceProps { card: Card; w?: number; h?: number; highlight?: boolean; }
const CardFace: React.FC<CardFaceProps> = ({ card, w = 80, h = 120, highlight = false }) => {
  const { suit, rank } = card;
  const isFace = rank >= 10;
  const lbl = rank === 10 ? "S" : rank === 11 ? "C" : rank === 12 ? "R" : String(rank);
  const ps = rank === 1 ? 1.6 : rank >= 6 ? 0.82 : 0.9;
  const dc = SDARK[suit];
  const glowColor = highlight ? "#22d3ee" : "rgba(100,80,200,0.7)";
  return (
    <div style={{
      width: w, height: h, borderRadius: 6, overflow: "hidden", flexShrink: 0,
      border: `2px solid ${highlight ? "#22d3ee" : "rgba(100,80,200,0.55)"}`,
      boxShadow: highlight
        ? `0 0 0 1px rgba(34,211,238,0.4), 0 0 18px rgba(34,211,238,0.5), 0 6px 16px rgba(0,0,0,0.7)`
        : `0 0 0 1px rgba(100,80,200,0.3), 0 4px 14px rgba(0,0,0,0.6)`,
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
    : <div style={{
        width: w, height: h, borderRadius: 6,
        border: "1.5px dashed rgba(34,211,238,0.18)",
        background: "rgba(0,0,0,0.2)",
        boxShadow: "inset 0 0 12px rgba(0,0,0,0.4)"
      }} />
);

// Dark fantasy badge matching reference image style
interface BadgeProps { player: Player; isLeader: boolean; }
const Badge: React.FC<BadgeProps> = ({ player, isLeader }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 6px",
    borderRadius: 8,
    background: isLeader
      ? `linear-gradient(135deg, rgba(34,211,238,0.18), rgba(139,92,246,0.12))`
      : `rgba(0,0,0,0.55)`,
    border: `1.5px solid ${isLeader ? "rgba(34,211,238,0.7)" : "rgba(100,80,200,0.35)"}`,
    boxShadow: isLeader
      ? `0 0 14px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.05)`
      : `0 2px 8px rgba(0,0,0,0.5)`,
    transition: "all 0.35s ease",
    backdropFilter: "blur(8px)",
  }}>
    <span style={{ fontSize: 14 }}>{player.emoji}</span>
    <span style={{
      fontSize: 12, fontWeight: "bold", color: isLeader ? "#22d3ee" : player.clr,
      fontFamily: "Georgia,serif", letterSpacing: 0.5,
      textShadow: isLeader ? "0 0 8px rgba(34,211,238,0.6)" : "none",
    }}>
      {player.name}{player.isMe && " (Tú)"}
    </span>
    {/* Score badge like reference — colored circle with number */}
    <div style={{
      width: 26, height: 26, borderRadius: "50%",
      background: isLeader
        ? "linear-gradient(135deg, #22d3ee, #0891b2)"
        : `linear-gradient(135deg, ${player.clr}cc, ${player.clr}88)`,
      border: `1.5px solid ${isLeader ? "#22d3ee" : player.clr}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#000", fontSize: 11, fontWeight: 900,
      boxShadow: `0 0 8px ${isLeader ? "rgba(34,211,238,0.5)" : "rgba(0,0,0,0.4)"}`,
    }}>
      {player.score}
    </div>
    {isLeader && (
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "#22d3ee",
        boxShadow: "0 0 6px #22d3ee",
        animation: "pulse 1.2s ease-in-out infinite",
      }} />
    )}
  </div>
);

// ============ MAIN COMPONENT ============
interface BriscaMultiplayerProps {
  gameId?: string;
  userName?: string;
  userId?: string;
}

export default function BriscaMultiplayer({ gameId: propGameId, userName, userId }: BriscaMultiplayerProps) {
  const router = useRouter();
  const [playerId] = useState(() => userId || `player-${Math.random().toString(36).slice(2, 8)}`);
  const [playerName] = useState(() => userName || `Jugador${Math.floor(Math.random() * 1000)}`);
  const [gameId] = useState(() => propGameId || "test-game-1");
  const hasJoinedRef = useRef(false);
  const [alerts, setAlerts] = useState<InGameAlert[]>([]);
  const [lastHandResult, setLastHandResult] = useState<HandResult | null>(null);
  const [handHistory, setHandHistory] = useState<HandResult[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAnimatingPlay, setIsAnimatingPlay] = useState(false);
  const [flyingCard, setFlyingCard] = useState<FlyingCardAnimation | null>(null);
  const [opponentFlyingCards, setOpponentFlyingCards] = useState<OverlayCardAnimation[]>([]);
  const [trickCollectCards, setTrickCollectCards] = useState<OverlayCardAnimation[]>([]);
  const [trickPointsPop, setTrickPointsPop] = useState<TrickPointsPop | null>(null);
  const flyTimeoutRef = useRef<number | null>(null);
  const animationTimeoutsRef = useRef<number[]>([]);
  const trickCenterRef = useRef<HTMLDivElement | null>(null);
  const bottomTrickTargetRef = useRef<HTMLDivElement | null>(null);
  const handSourceRefs = useRef<Partial<Record<Pos, HTMLDivElement | null>>>({});
  const trickSlotRefs = useRef<Partial<Record<Pos, HTMLDivElement | null>>>({});
  const badgeRefs = useRef<Partial<Record<Pos, HTMLDivElement | null>>>({});
  const previousTrickRef = useRef<Record<string, Card>>({});
  const previousRoundRef = useRef<{
    phase: RoundPhase;
    currentPlayerId: string | null;
    trickCardCount: number;
    scoresById: Record<string, number>;
    trickCardsByPlayer: Record<string, Card>;
  } | null>(null);

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

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isConnected || hasJoinedRef.current) return;
    const initGame = async () => {
      try {
        await createGame(gameId, 2, 4);
      } catch (e) {
        console.log("[Brisca] Error creating game:", e);
      }
      joinGame(gameId, playerId, playerName);
      hasJoinedRef.current = true;
      setTimeout(() => { requestGameState(gameId); }, 300);
    };
    initGame();
  }, [isConnected]);

  const { players, trumpCard, trumpSuit, remainingCards, currentPlayerId, currentTrick, phase, winner } = useMemo(() => {
    if (!gameState) {
      return { players: [], trumpCard: null, trumpSuit: null, remainingCards: 0, currentPlayerId: null, currentTrick: {}, phase: "waiting" as const, winner: null };
    }
    const myIndex = gameState.players.findIndex(p => p.id === playerId);
    const playerCount = gameState.players.length;
    const players: Player[] = gameState.players.map((p, i) => {
      const relativeIndex = (i - myIndex + playerCount) % playerCount;
      const pos = PLAYER_POSITIONS[relativeIndex] || "bottom";
      return {
        id: p.id, name: p.name, hand: p.hand.map(convertCard), score: p.score,
        pos, emoji: PLAYER_EMOJIS[i % 4], clr: PLAYER_COLORS[i % 4], isMe: p.id === playerId,
      };
    });
    const trumpCard = gameState.trumpCard ? convertCard(gameState.trumpCard) : null;
    const trumpSuit = gameState.trumpSuit ? SUIT_MAP[gameState.trumpSuit] : null;
    const currentTrick: Record<string, Card> = {};
    if (gameState.currentTrick?.playedCards) {
      for (const [pid, cardDto] of Object.entries(gameState.currentTrick.playedCards)) {
        currentTrick[pid] = convertCard(cardDto);
      }
    }
    const phase: RoundPhase = gameState.state === "WAITING_FOR_PLAYERS" ? "waiting"
      : gameState.state === "IN_PROGRESS" ? "playing" : "finished";
    const winner = gameState.winner ? { id: gameState.winner.id, name: gameState.winner.name } : null;
    return { players, trumpCard, trumpSuit, remainingCards: gameState.remainingCards, currentPlayerId: gameState.currentPlayerId, currentTrick, phase, winner };
  }, [gameState, playerId]);

  const isMyTurn = currentPlayerId === playerId;
  const canStart = phase === "waiting" && players.length >= 2;
  const trickCardCount = Object.keys(currentTrick).length;
  const currentHandNumber = handHistory.length + (trickCardCount > 0 ? 1 : 0);
  const posByPlayerId = useMemo(() => Object.fromEntries(players.map(p => [p.id, p.pos])) as Record<string, Pos>, [players]);

  const pushAlert = useCallback((text: string, tone: "info" | "success" = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setAlerts(prev => [...prev, { id, text, tone }]);
    window.setTimeout(() => { setAlerts(prev => prev.filter(a => a.id !== id)); }, 4200);
  }, []);

  const handlePlayCard = useCallback((card: Card) => {
    if (!isMyTurn || phase !== "playing") return;
    playCard(gameId, playerId, REVERSE_SUIT_MAP[card.suit], REVERSE_RANK_MAP[card.rank]);
  }, [isMyTurn, phase, gameId, playerId, playCard]);

  const handleAnimatedPlayCard = useCallback((card: Card, sourceEl: HTMLElement) => {
    if (!isMyTurn || phase !== "playing" || isAnimatingPlay) return;
    const targetEl = bottomTrickTargetRef.current ?? trickCenterRef.current;
    if (!targetEl) { handlePlayCard(card); return; }
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const deltaX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
    const deltaY = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2);
    setSelectedCardId(card.id);
    setIsAnimatingPlay(true);
    setFlyingCard({ card, from: { x: sourceRect.left, y: sourceRect.top, w: sourceRect.width, h: sourceRect.height }, delta: { x: deltaX, y: deltaY }, active: false });
    requestAnimationFrame(() => { setFlyingCard(prev => (prev ? { ...prev, active: true } : prev)); });
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current);
    flyTimeoutRef.current = window.setTimeout(() => {
      handlePlayCard(card);
      setFlyingCard(null);
      setSelectedCardId(null);
      setIsAnimatingPlay(false);
      flyTimeoutRef.current = null;
    }, 430);
  }, [isMyTurn, phase, isAnimatingPlay, handlePlayCard]);

  const handleStartGame = useCallback(() => { startGame(gameId); }, [gameId, startGame]);

  const byPos = (pos: Pos): Player | undefined => players.find(p => p.pos === pos);
  const playedBy = (pid: string): Card | undefined => currentTrick[pid];

  useEffect(() => {
    if (phase !== "playing") { previousTrickRef.current = { ...currentTrick }; return; }
    const prevTrick = previousTrickRef.current;
    const newCards = Object.entries(currentTrick).filter(([pid]) => !prevTrick[pid] && pid !== playerId);
    if (newCards.length > 0) {
      const animations: OverlayCardAnimation[] = [];
      for (const [pid, card] of newCards) {
        const pos = posByPlayerId[pid];
        const sourceEl = pos ? handSourceRefs.current[pos] : null;
        const targetEl = pos ? trickSlotRefs.current[pos] : null;
        if (!sourceEl || !targetEl) continue;
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const startW = Math.min(62, sourceRect.width * 0.45);
        const startH = startW * 1.5;
        const startX = sourceRect.left + sourceRect.width / 2 - startW / 2;
        const startY = sourceRect.top + sourceRect.height / 2 - startH / 2;
        const deltaX = (targetRect.left + targetRect.width / 2) - (startX + startW / 2);
        const deltaY = (targetRect.top + targetRect.height / 2) - (startY + startH / 2);
        animations.push({
          id: `opp-${pid}-${card.id}-${Date.now()}`, card,
          from: { x: startX, y: startY, w: startW, h: startH },
          delta: { x: deltaX, y: deltaY }, active: false,
          rotateTo: pos === "left" ? 7 : pos === "right" ? -7 : 0,
          scaleTo: 0.93, fadeTo: 0.96, durationMs: 420,
        });
      }
      if (animations.length > 0) {
        setOpponentFlyingCards(prev => [...prev, ...animations]);
        requestAnimationFrame(() => {
          setOpponentFlyingCards(prev => prev.map(anim => animations.some(a => a.id === anim.id) ? { ...anim, active: true } : anim));
        });
        const timeout = window.setTimeout(() => {
          setOpponentFlyingCards(prev => prev.filter(anim => !animations.some(a => a.id === anim.id)));
        }, 450);
        animationTimeoutsRef.current.push(timeout);
      }
    }
    previousTrickRef.current = { ...currentTrick };
  }, [phase, currentTrick, playerId, posByPlayerId]);

  useEffect(() => {
    const scoresById = Object.fromEntries(players.map(p => [p.id, p.score]));
    const prev = previousRoundRef.current;
    if (prev && phase === "playing") {
      if (currentPlayerId === playerId && prev.currentPlayerId !== playerId) {
        pushAlert("Es tu turno. Juega una carta.", "info");
      }
      const trickResolved = prev.trickCardCount > 0 && trickCardCount === 0;
      if (trickResolved && currentPlayerId) {
        const winnerPlayer = players.find(p => p.id === currentPlayerId);
        if (winnerPlayer) {
          const points = Math.max(0, winnerPlayer.score - (prev.scoresById[winnerPlayer.id] ?? 0));
          const winnerBadge = badgeRefs.current[winnerPlayer.pos];
          if (winnerBadge) {
            const winnerRect = winnerBadge.getBoundingClientRect();
            const collectAnimations: OverlayCardAnimation[] = [];
            for (const [pid, card] of Object.entries(prev.trickCardsByPlayer)) {
              const pos = posByPlayerId[pid];
              const sourceEl = pos ? trickSlotRefs.current[pos] : null;
              if (!sourceEl) continue;
              const sourceRect = sourceEl.getBoundingClientRect();
              const deltaX = (winnerRect.left + winnerRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
              const deltaY = (winnerRect.top + winnerRect.height / 2) - (sourceRect.top + sourceRect.height / 2);
              collectAnimations.push({
                id: `collect-${pid}-${card.id}-${Date.now()}`, card,
                from: { x: sourceRect.left, y: sourceRect.top, w: sourceRect.width, h: sourceRect.height },
                delta: { x: deltaX, y: deltaY }, active: false,
                rotateTo: (Math.random() - 0.5) * 18, scaleTo: 0.54, fadeTo: 0.25, durationMs: 560,
              });
            }
            if (collectAnimations.length > 0) {
              setTrickCollectCards(collectAnimations);
              requestAnimationFrame(() => { setTrickCollectCards(prevCards => prevCards.map(anim => ({ ...anim, active: true }))); });
              const clearCollect = window.setTimeout(() => { setTrickCollectCards([]); }, 620);
              animationTimeoutsRef.current.push(clearCollect);
            }
            setTrickPointsPop({ text: points > 0 ? `+${points}` : "+0", x: winnerRect.left + winnerRect.width / 2, y: winnerRect.top - 10, active: false });
            requestAnimationFrame(() => { setTrickPointsPop(prevPop => (prevPop ? { ...prevPop, active: true } : prevPop)); });
            const clearPop = window.setTimeout(() => { setTrickPointsPop(null); }, 900);
            animationTimeoutsRef.current.push(clearPop);
          }
          const result: HandResult = { handNumber: handHistory.length + 1, winnerId: winnerPlayer.id, winnerName: winnerPlayer.name, points };
          setLastHandResult(result);
          setHandHistory(old => [result, ...old].slice(0, 5));
          pushAlert(`Mano ${result.handNumber}: gana ${winnerPlayer.name}${points > 0 ? ` (+${points} pts)` : ""}.`, "success");
        }
      }
    }
    previousRoundRef.current = { phase, currentPlayerId, trickCardCount, scoresById, trickCardsByPlayer: { ...currentTrick } };
  }, [phase, currentPlayerId, playerId, players, trickCardCount, handHistory.length, pushAlert, currentTrick, posByPlayerId]);

  useEffect(() => () => {
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current);
    animationTimeoutsRef.current.forEach(timeout => window.clearTimeout(timeout));
    animationTimeoutsRef.current = [];
  }, []);

  // Dark fantasy sidebar
  const Sidebar = () => (
    <nav style={{
      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
      zIndex: 20, display: "flex", flexDirection: "column", gap: 6,
      padding: "12px 8px",
      background: "linear-gradient(180deg, rgba(10,8,25,0.92), rgba(20,10,40,0.88))",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(100,80,200,0.35)",
      borderRadius: 12,
      boxShadow: "0 0 20px rgba(100,80,200,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      {[
        { icon: <User size={18} />, onClick: undefined },
        { icon: <DollarSign size={18} />, onClick: undefined },
        { icon: <Home size={18} />, onClick: () => router.push("/lobby") },
      ].map((btn, i) => (
        <button key={i} onClick={btn.onClick} style={{
          padding: "9px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 8, color: "rgba(200,180,255,0.8)", cursor: "pointer",
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.28)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.7)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)"; }}>
          {btn.icon}
        </button>
      ))}
      <div style={{ height: 1, background: "rgba(139,92,246,0.2)", margin: "2px 0" }} />
      <MuteButton variant="sidebar" />
      <div style={{ height: 1, background: "rgba(139,92,246,0.2)", margin: "2px 0" }} />
      <button onClick={() => router.push("/")} style={{
        padding: "9px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 8, color: "rgba(252,165,165,0.8)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
        title="Salir"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.28)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}>
        <LogOut size={18} />
      </button>
    </nav>
  );

  // Dark fantasy background
  const BG = () => (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {/* Stone/dark base */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #0d1117 0%, #111827 30%, #0f1923 60%, #0d1117 100%)",
      }} />
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url('/images/backgroundbrisca.jpg')`,
        backgroundSize: "cover", backgroundPosition: "center 30%",
        opacity: 0.28,
      }} />
      {/* Stone texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 50%, rgba(20,10,50,0.55) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 30% 20%, rgba(34,211,238,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)
        `,
      }} />
      {/* Vertical dark vignette on sides */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.7) 100%)",
      }} />
      {/* Top dark fade */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.8) 100%)",
      }} />
    </div>
  );

  if (connectionStatus !== "connected") {
    return (
      <div style={{ position: "relative", minHeight: "100vh", width: "100%", color: "white", overflow: "hidden", background: "#0d1117" }}>
        <BG />
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            textAlign: "center", padding: "48px 52px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(10,8,25,0.97), rgba(20,10,40,0.95))",
            border: "1.5px solid rgba(34,211,238,0.4)",
            boxShadow: "0 0 60px rgba(34,211,238,0.08), 0 0 0 1px rgba(100,80,200,0.2)",
          }}>
            <Loader2 style={{ width: 48, height: 48, animation: "spin 1s linear infinite", margin: "0 auto 16px", color: "#22d3ee" }} />
            <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8, fontFamily: "Georgia,serif", color: "#e2e8f0" }}>Conectando...</h2>
            <p style={{ color: "rgba(148,163,184,0.7)" }}>Estableciendo conexión</p>
            {error && <p style={{ color: "#f87171", marginTop: 16 }}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div style={{ position: "relative", minHeight: "100vh", width: "100%", color: "white", overflow: "hidden", background: "#0d1117" }}>
        <BG />
        <Sidebar />
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
          <div style={{
            textAlign: "center", padding: "44px 52px", borderRadius: 20,
            background: "linear-gradient(135deg, rgba(10,8,25,0.97), rgba(20,10,45,0.95))",
            border: "2px solid rgba(34,211,238,0.35)",
            boxShadow: "0 0 80px rgba(34,211,238,0.08), 0 0 0 1px rgba(100,80,200,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
            maxWidth: 440,
          }}>
            {/* Gothic arch top ornament */}
            <div style={{ marginBottom: 16 }}>
              <svg width="120" height="28" viewBox="0 0 120 28">
                <path d="M10,28 Q10,8 60,4 Q110,8 110,28" fill="none" stroke="rgba(34,211,238,0.45)" strokeWidth="1.5" />
                <circle cx="60" cy="4" r="3" fill="rgba(34,211,238,0.6)" />
                <circle cx="10" cy="28" r="2" fill="rgba(139,92,246,0.6)" />
                <circle cx="110" cy="28" r="2" fill="rgba(139,92,246,0.6)" />
              </svg>
            </div>
            <h1 style={{
              fontSize: 56, fontWeight: 900, fontStyle: "italic", color: "#22d3ee",
              letterSpacing: 10, marginBottom: 4,
              textShadow: "0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.2)",
              fontFamily: "Georgia,serif",
            }}>BRISCA</h1>
            <p style={{ color: "rgba(139,92,246,0.8)", fontSize: 11, marginBottom: 24, letterSpacing: 4 }}>MESA: {gameId}</p>

            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "rgba(148,163,184,0.65)", fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>
                JUGADORES ({players.length}/4)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {players.map((p, i) => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", borderRadius: 10,
                    background: `linear-gradient(135deg, ${PLAYER_COLORS[i]}12, transparent)`,
                    border: `1px solid ${PLAYER_COLORS[i]}44`,
                    boxShadow: `0 0 8px ${PLAYER_COLORS[i]}15`,
                  }}>
                    <span style={{ color: PLAYER_COLORS[i], fontWeight: "bold" }}>{PLAYER_EMOJIS[i]} {p.name}{p.isMe && " (Tú)"}</span>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#22d3ee", boxShadow: "0 0 6px #22d3ee",
                    }} />
                  </div>
                ))}
                {players.length < 4 && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 10,
                    border: "1.5px dashed rgba(100,80,200,0.25)",
                    color: "rgba(148,163,184,0.35)", fontSize: 13,
                  }}>
                    Esperando jugadores...
                  </div>
                )}
              </div>
            </div>

            {canStart && (
              <button onClick={handleStartGame} style={{
                width: "100%",
                background: "linear-gradient(135deg, rgba(34,211,238,0.9), rgba(6,182,212,0.8))",
                color: "#0a0820", fontWeight: "bold", fontSize: 16,
                padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "Georgia,serif", letterSpacing: 2,
                boxShadow: "0 0 20px rgba(34,211,238,0.4), 0 4px 14px rgba(0,0,0,0.4)",
                textTransform: "uppercase",
              }}>¡Iniciar Partida!</button>
            )}
            {!canStart && players.length < 2 && (
              <p style={{ color: "rgba(34,211,238,0.6)", fontSize: 13 }}>Se necesitan al menos 2 jugadores</p>
            )}

            <div style={{
              marginTop: 24, padding: "14px 18px", borderRadius: 10,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(100,80,200,0.2)",
              color: "rgba(148,163,184,0.5)", fontSize: 11, lineHeight: 2, textAlign: "left",
            }}>
              <strong style={{ color: "rgba(200,180,255,0.7)", display: "block", marginBottom: 6, letterSpacing: 1 }}>REGLAS</strong>
              As·11pts · Tres·10pts · Rey·4pts · Caballo·3pts · Sota·2pts<br />
              · Triunfo gana cualquier carta de otro palo<br />
              · No hay obligación de seguir palo
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    const winnerPlayer = players.find(p => p.id === winner?.id);
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const totalPoints = sortedPlayers.reduce((sum, p) => sum + p.score, 0);
    return (
      <div style={{ position: "relative", minHeight: "100vh", width: "100%", color: "white", overflow: "hidden", background: "#0d1117" }}>
        <BG />
        <Sidebar />
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
          <div style={{
            textAlign: "center", padding: "44px 52px", borderRadius: 20,
            background: "linear-gradient(135deg, rgba(10,8,25,0.98), rgba(20,10,45,0.96))",
            border: "2px solid rgba(34,211,238,0.4)",
            boxShadow: "0 0 80px rgba(34,211,238,0.1), 0 0 0 1px rgba(100,80,200,0.2)",
            maxWidth: 480,
          }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#e2e8f0", marginBottom: 16, letterSpacing: 2 }}>¡PARTIDA TERMINADA!</h2>
            <div style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(139,92,246,0.08))",
              border: "1.5px solid rgba(34,211,238,0.35)",
              borderRadius: 12, padding: "16px 20px", marginBottom: 20,
              boxShadow: "0 0 20px rgba(34,211,238,0.08)",
            }}>
              <p style={{ fontSize: 17, color: "#94a3b8", marginBottom: 6 }}>
                {winnerPlayer?.emoji} <strong style={{ color: "#22d3ee" }}>{winnerPlayer?.name || winner?.name}</strong>
                {winnerPlayer?.isMe && " (Tú)"}
              </p>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#22d3ee", marginBottom: 4, textShadow: "0 0 20px rgba(34,211,238,0.4)" }}>
                ¡GANA CON {winnerPlayer?.score || 0} PUNTOS!
              </p>
              <p style={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>de {totalPoints} puntos totales en juego</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 10, letterSpacing: 2 }}>TABLA DE POSICIONES</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sortedPlayers.map((p, i) => (
                  <div key={p.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 16px", borderRadius: 10,
                    background: i === 0 ? `linear-gradient(135deg, ${p.clr}18, transparent)` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${i === 0 ? p.clr + "66" : "rgba(100,80,200,0.2)"}`,
                    boxShadow: i === 0 ? `0 0 12px ${p.clr}15` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: i === 0 ? "linear-gradient(135deg,#22d3ee,#0891b2)" : i === 1 ? "rgba(148,163,184,0.3)" : "rgba(100,80,200,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: "bold",
                        color: i === 0 ? "#000" : "#fff",
                        border: i === 0 ? "1px solid #22d3ee" : "1px solid rgba(255,255,255,0.15)",
                      }}>{i + 1}</span>
                      <span style={{ color: p.clr, fontWeight: "bold", fontSize: 14 }}>{p.emoji} {p.name}{p.isMe && " (Tú)"}</span>
                    </div>
                    <span style={{ color: "white", fontSize: 20, fontWeight: 900 }}>{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => window.location.reload()} style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.9), rgba(6,182,212,0.8))",
              color: "#0a0820", fontWeight: "bold", fontSize: 15,
              padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "Georgia,serif", letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 0 20px rgba(34,211,238,0.3)",
            }}>Nueva Partida</button>
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
  const CW = 64, CH = 96, TABLE_GAP = 26;

  const msg = isMyTurn ? "¡Tu turno! Elige una carta" : `Turno de ${players.find(p => p.id === currentPlayerId)?.name || "..."}`;

  return (
    <div style={{
      position: "relative", width: "100%", color: "white", overflow: "hidden",
      height: "100vh", display: "flex", flexDirection: "column",
      userSelect: "none", fontFamily: "sans-serif",
      background: "#0d1117",
    }}>
      <BG />
      <Sidebar />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* TOP PLAYER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 6px", gap: 6, minHeight: topP ? 84 : 12 }}>
          {topP && (
            <>
              <div ref={(el) => { badgeRefs.current.top = el; }}>
                <Badge player={topP} isLeader={currentPlayerId === topP.id} />
              </div>
              <div ref={(el) => { handSourceRefs.current.top = el; }} style={{ display: "flex", gap: 3 }}>
                {topP.hand.map((_, i) => <CardBack key={i} w={34} h={52} />)}
              </div>
            </>
          )}
        </div>

        {/* MIDDLE ROW */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 0 }}>

          {alerts.length > 0 && (
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", flexDirection: "column", gap: 8, width: "min(520px, calc(100vw - 180px))" }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  background: alert.tone === "success"
                    ? "linear-gradient(135deg, rgba(6,182,212,0.22), rgba(8,145,178,0.15))"
                    : "linear-gradient(135deg, rgba(20,14,40,0.9), rgba(10,8,25,0.85))",
                  border: `1px solid ${alert.tone === "success" ? "rgba(34,211,238,0.5)" : "rgba(139,92,246,0.4)"}`,
                  borderRadius: 10,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: `0 8px 22px rgba(0,0,0,0.5), 0 0 12px ${alert.tone === "success" ? "rgba(34,211,238,0.12)" : "rgba(139,92,246,0.08)"}`,
                  textAlign: "center",
                  color: alert.tone === "success" ? "#67e8f9" : "#c4b5fd",
                  backdropFilter: "blur(8px)",
                }}>
                  {alert.text}
                </div>
              ))}
            </div>
          )}

          {/* Round state panel */}
          <div style={{
            position: "absolute", top: 10, right: 14, zIndex: 20, width: 220,
            background: "linear-gradient(135deg, rgba(10,8,25,0.88), rgba(20,10,40,0.82))",
            border: "1px solid rgba(100,80,200,0.3)",
            borderRadius: 12, padding: "10px 14px",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(100,80,200,0.1)",
          }}>
            <div style={{ fontSize: 10, color: "rgba(139,92,246,0.85)", letterSpacing: 2, marginBottom: 8, fontFamily: "Georgia,serif" }}>ESTADO DE LA RONDA</div>
            <div style={{ fontSize: 12, marginBottom: 5, color: "rgba(203,213,225,0.8)" }}>Mano: <strong style={{ color: "#e2e8f0" }}>{currentHandNumber || 1}</strong></div>
            <div style={{ fontSize: 12, marginBottom: 5, color: "rgba(203,213,225,0.8)" }}>En mesa: <strong style={{ color: "#e2e8f0" }}>{trickCardCount}/{Math.max(players.length, 1)}</strong></div>
            <div style={{ fontSize: 12, color: "rgba(203,213,225,0.8)" }}>
              Última:{" "}
              {lastHandResult
                ? <strong style={{ color: "#67e8f9" }}>{lastHandResult.winnerName} {lastHandResult.points > 0 ? `(+${lastHandResult.points})` : "(+0)"}</strong>
                : <span style={{ color: "rgba(148,163,184,0.5)" }}>Sin ganador</span>}
            </div>
          </div>

          {/* LEFT PLAYER */}
          {leftP && (
            <div style={{ position: "absolute", left: 68, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div ref={(el) => { badgeRefs.current.left = el; }}>
                <Badge player={leftP} isLeader={currentPlayerId === leftP.id} />
              </div>
              <div ref={(el) => { handSourceRefs.current.left = el; }} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {leftP.hand.map((_, i) => <CardBack key={i} w={30} h={46} />)}
              </div>
            </div>
          )}

          {/* RIGHT PLAYER */}
          {rightP && (
            <div style={{ position: "absolute", right: 68, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div ref={(el) => { badgeRefs.current.right = el; }}>
                <Badge player={rightP} isLeader={currentPlayerId === rightP.id} />
              </div>
              <div ref={(el) => { handSourceRefs.current.right = el; }} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {rightP.hand.map((_, i) => <CardBack key={i} w={30} h={46} />)}
              </div>
            </div>
          )}

          {/* CENTER: Deck + Trick cross */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Deck + Trump */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 76, height: 110 }}>
                {trumpCard && (
                  <div style={{ position: "absolute", top: 22, left: -22, transform: "rotate(90deg)", transformOrigin: "center", zIndex: 0 }}>
                    <CardFace card={trumpCard} w={52} h={78} />
                  </div>
                )}
                {remainingCards > 0 && (
                  <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        position: "absolute", top: 2, left: 2, width: 64, height: 96, borderRadius: 6,
                        background: "#0a0820", border: "1px solid rgba(100,80,200,0.3)",
                      }} />
                      <CardBack w={64} h={96} />
                      <div style={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                        color: "#22d3ee", fontWeight: "bold", fontSize: 14, pointerEvents: "none",
                        textShadow: "0 0 8px rgba(34,211,238,0.6)",
                      }}>
                        {remainingCards}
                      </div>
                    </div>
                  </div>
                )}
                {remainingCards === 0 && !trumpCard && (
                  <div style={{
                    width: 64, height: 96, borderRadius: 6,
                    border: "2px dashed rgba(100,80,200,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(148,163,184,0.3)", fontSize: 10,
                  }}>vacío</div>
                )}
              </div>
              {trumpSuit && (
                <div style={{
                  background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: 8,
                  border: "1px solid rgba(100,80,200,0.3)",
                  color: "#c4b5fd", fontSize: 11, textAlign: "center",
                  backdropFilter: "blur(4px)",
                }}>
                  {trumpSuit === "Oros" ? "🟡" : trumpSuit === "Copas" ? "🔴" : trumpSuit === "Espadas" ? "🔵" : "🟢"} {trumpSuit}
                </div>
              )}
            </div>

            {/* Cross of played cards */}
            <div ref={trickCenterRef} style={{ position: "relative", width: CW * 3 + TABLE_GAP, height: CH * 3 + TABLE_GAP }}>
              {/* Center play area with gothic styling */}
              <div style={{
                position: "absolute", left: CW, top: CH, width: CW + TABLE_GAP, height: CH + TABLE_GAP,
                borderRadius: 12,
                background: "radial-gradient(ellipse at center, rgba(34,211,238,0.05), rgba(0,0,0,0.3))",
                border: "1px solid rgba(34,211,238,0.12)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
              }} />

              {/* TOP trick slot */}
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)" }}>
                {topP && (
                  <div ref={(el) => { trickSlotRefs.current.top = el; }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <CardSlot card={playedBy(topP.id)} w={CW} h={CH} />
                    {playedBy(topP.id) && <span style={{ fontSize: 10, color: "rgba(148,163,184,0.7)" }}>{topP.name}</span>}
                  </div>
                )}
              </div>

              {/* LEFT trick slot */}
              <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}>
                {leftP && (
                  <div ref={(el) => { trickSlotRefs.current.left = el; }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <CardSlot card={playedBy(leftP.id)} w={CW} h={CH} />
                    {playedBy(leftP.id) && <span style={{ fontSize: 10, color: "rgba(148,163,184,0.7)" }}>{leftP.name}</span>}
                  </div>
                )}
              </div>

              {/* RIGHT trick slot */}
              <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
                {rightP && (
                  <div ref={(el) => { trickSlotRefs.current.right = el; }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <CardSlot card={playedBy(rightP.id)} w={CW} h={CH} />
                    {playedBy(rightP.id) && <span style={{ fontSize: 10, color: "rgba(148,163,184,0.7)" }}>{rightP.name}</span>}
                  </div>
                )}
              </div>

              {/* BOTTOM trick slot + END TURN-style center indicator */}
              <div ref={bottomTrickTargetRef} style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}>
                {botP && (
                  <div ref={(el) => { trickSlotRefs.current.bottom = el; }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <CardSlot card={playedBy(botP.id)} w={CW} h={CH} />
                    {playedBy(botP.id) && <span style={{ fontSize: 10, color: "rgba(148,163,184,0.7)" }}>{botP.name}</span>}
                  </div>
                )}
              </div>

              {/* Central state indicator — like "END TURN" button in reference */}
              {trickCardCount === 0 && (
                <div style={{
                  position: "absolute",
                  left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 72, height: 72, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(34,211,238,0.15), rgba(10,8,25,0.7))",
                  border: "1.5px solid rgba(34,211,238,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column",
                  boxShadow: "0 0 20px rgba(34,211,238,0.1), inset 0 0 16px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: "bold", color: "rgba(34,211,238,0.7)",
                    letterSpacing: 1, textAlign: "center", lineHeight: 1.4,
                    fontFamily: "Georgia,serif", textTransform: "uppercase",
                  }}>{isMyTurn ? "JUEGA" : "ESPERA"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TURN MESSAGE */}
        <div style={{ textAlign: "center", padding: "4px 8px", minHeight: 26 }}>
          <span style={{
            display: "inline-block",
            background: isMyTurn
              ? "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(6,182,212,0.1))"
              : "rgba(10,8,25,0.6)",
            backdropFilter: "blur(6px)",
            padding: "4px 20px", borderRadius: 20,
            color: isMyTurn ? "#22d3ee" : "#94a3b8",
            fontSize: 12, fontStyle: "italic",
            border: `1px solid ${isMyTurn ? "rgba(34,211,238,0.4)" : "rgba(100,80,200,0.25)"}`,
            boxShadow: isMyTurn ? "0 0 12px rgba(34,211,238,0.15)" : "none",
            textShadow: isMyTurn ? "0 0 8px rgba(34,211,238,0.4)" : "none",
          }}>
            {msg}
          </span>
        </div>

        {/* HUMAN HAND */}
        <div
          ref={(el) => { handSourceRefs.current.bottom = el; }}
          style={{ display: "flex", justifyContent: "center", gap: 10, padding: "4px 0 8px", alignItems: "flex-end" }}
        >
          {botP?.hand.map(card => (
            <button
              key={card.id}
              onClick={(e) => handleAnimatedPlayCard(card, e.currentTarget)}
              disabled={!isMyTurn || isAnimatingPlay}
              className={`hand-card-btn${selectedCardId === card.id ? " hand-card-btn--selected" : ""}`}
              style={{
                background: "none", border: "none", padding: 0,
                cursor: isMyTurn && !isAnimatingPlay ? "pointer" : "default",
                filter: isMyTurn && !isAnimatingPlay ? "none" : "brightness(0.5) saturate(0.4)",
                opacity: selectedCardId === card.id ? 0 : 1,
              }}>
              <CardFace card={card} w={78} h={117} highlight={isMyTurn} />
            </button>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 14px 6px 74px",
          background: "linear-gradient(90deg, rgba(0,0,0,0.7), rgba(10,8,25,0.6))",
          borderTop: "1px solid rgba(100,80,200,0.2)",
        }}>
          {botP && <div ref={(el) => { badgeRefs.current.bottom = el; }}><Badge player={botP} isLeader={currentPlayerId === botP.id} /></div>}
          <div style={{ color: "rgba(148,163,184,0.4)", fontSize: 10, textAlign: "right", fontFamily: "Georgia,serif" }}>
            {lastHandResult
              ? `Última: ${lastHandResult.winnerName} (+${lastHandResult.points})`
              : "As·11 · 3·10 · R·4 · C·3 · S·2"}
          </div>
        </div>
      </div>

      {/* Restart button — gothic style */}
      <button
        onClick={() => window.location.reload()}
        title="Nueva partida"
        style={{
          position: "fixed", top: 12, right: 12, zIndex: 100,
          background: "rgba(10,8,25,0.7)",
          border: "1px solid rgba(100,80,200,0.4)",
          color: "rgba(200,180,255,0.7)", padding: 9, borderRadius: 8, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.4s",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "rotate(180deg)";
          el.style.borderColor = "rgba(34,211,238,0.6)";
          el.style.color = "#22d3ee";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "rotate(0deg)";
          el.style.borderColor = "rgba(100,80,200,0.4)";
          el.style.color = "rgba(200,180,255,0.7)";
        }}>
        <RotateCcw size={16} />
      </button>

      {/* Flying card (player) */}
      {flyingCard && (
        <div style={{
          position: "fixed", left: flyingCard.from.x, top: flyingCard.from.y,
          width: flyingCard.from.w, height: flyingCard.from.h,
          pointerEvents: "none", zIndex: 90,
          transform: `translate(${flyingCard.active ? flyingCard.delta.x : 0}px, ${flyingCard.active ? flyingCard.delta.y : 0}px) scale(${flyingCard.active ? 0.9 : 1}) rotate(${flyingCard.active ? -4 : 0}deg)`,
          transformOrigin: "center",
          transition: "transform 430ms cubic-bezier(0.22, 1, 0.36, 1), opacity 430ms ease",
          opacity: flyingCard.active ? 0.98 : 1,
          filter: "drop-shadow(0 12px 22px rgba(34,211,238,0.3))",
        }}>
          <CardFace card={flyingCard.card} w={flyingCard.from.w} h={flyingCard.from.h} highlight />
        </div>
      )}

      {opponentFlyingCards.map((anim) => (
        <div key={anim.id} style={{
          position: "fixed", left: anim.from.x, top: anim.from.y,
          width: anim.from.w, height: anim.from.h,
          pointerEvents: "none", zIndex: 88,
          transform: `translate(${anim.active ? anim.delta.x : 0}px, ${anim.active ? anim.delta.y : 0}px) scale(${anim.active ? anim.scaleTo : 1}) rotate(${anim.active ? anim.rotateTo : 0}deg)`,
          transformOrigin: "center",
          transition: `transform ${anim.durationMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${anim.durationMs}ms ease`,
          opacity: anim.active ? anim.fadeTo : 1,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.7))",
        }}>
          <CardFace card={anim.card} w={anim.from.w} h={anim.from.h} />
        </div>
      ))}

      {trickCollectCards.map((anim) => (
        <div key={anim.id} style={{
          position: "fixed", left: anim.from.x, top: anim.from.y,
          width: anim.from.w, height: anim.from.h,
          pointerEvents: "none", zIndex: 87,
          transform: `translate(${anim.active ? anim.delta.x : 0}px, ${anim.active ? anim.delta.y : 0}px) scale(${anim.active ? anim.scaleTo : 1}) rotate(${anim.active ? anim.rotateTo : 0}deg)`,
          transformOrigin: "center",
          transition: `transform ${anim.durationMs}ms cubic-bezier(0.2, 0.95, 0.2, 1), opacity ${anim.durationMs}ms ease`,
          opacity: anim.active ? anim.fadeTo : 1,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
        }}>
          <CardFace card={anim.card} w={anim.from.w} h={anim.from.h} />
        </div>
      ))}

      {trickPointsPop && (
        <div style={{
          position: "fixed", left: trickPointsPop.x, top: trickPointsPop.y,
          zIndex: 95, pointerEvents: "none",
          transform: `translate(-50%, ${trickPointsPop.active ? "-28px" : "0px"}) scale(${trickPointsPop.active ? 1.1 : 0.85})`,
          opacity: trickPointsPop.active ? 1 : 0,
          transition: "transform 460ms cubic-bezier(0.16, 1, 0.3, 1), opacity 460ms ease",
          color: "#22d3ee", fontWeight: 900, fontSize: 30,
          textShadow: "0 4px 16px rgba(0,0,0,0.7), 0 0 20px rgba(34,211,238,0.5)",
        }}>
          {trickPointsPop.text}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hand-card-btn {
          transform: translateY(0) scale(1);
          transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), filter 220ms ease, opacity 140ms ease;
          will-change: transform;
        }

        .hand-card-btn:not(:disabled):hover {
          transform: translateY(-16px) scale(1.04);
          filter: drop-shadow(0 0 14px rgba(34,211,238,0.45));
        }

        .hand-card-btn:not(:disabled):active,
        .hand-card-btn--selected {
          transform: translateY(-22px) scale(1.06);
          filter: drop-shadow(0 0 18px rgba(34,211,238,0.6));
        }
      `}</style>
    </div>
  );
}