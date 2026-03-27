"use client";
import React, { useEffect, useCallback, useReducer } from "react";
import { RotateCcw, Home, LogOut, User, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import MuteButton from "@/components/common/MuteButton";

type Suit = "Oros" | "Copas" | "Espadas" | "Bastos";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;
type Pos = "bottom" | "top" | "left" | "right";
type Phase = "menu" | "playing" | "resolving" | "game_over";

interface Card { suit: Suit; rank: Rank; id: string; }
interface PlayerCfg { name: string; isHuman: boolean; team: number; pos: Pos; emoji: string; clr: string; }
interface Player extends PlayerCfg { id: number; hand: Card[]; }
interface TrickPlay { playerIdx: number; card: Card; }
interface GameState {
  phase: Phase; mode: number | null; players: Player[]; deck: Card[];
  lifeCard: Card | null; trumpSuit: Suit | null; turnOrder: number[];
  trickPlays: TrickPlay[]; scores: number[]; msg: string;
}
type GameAction =
  | { type: "MENU" }
  | { type: "START"; mode: number }
  | { type: "PLAY"; pidx: number; card: Card }
  | { type: "RESOLVE" };

const SUITS: Suit[] = ["Oros", "Copas", "Espadas", "Bastos"];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
const CV: Record<number, number> = { 1: 11, 3: 10, 12: 4, 11: 3, 10: 2, 7: 0, 6: 0, 5: 0, 4: 0, 2: 0 };
const RS: Record<number, number> = { 1: 10, 3: 9, 12: 8, 11: 7, 10: 6, 7: 5, 6: 4, 5: 3, 4: 2, 2: 1 };
const SDARK: Record<Suit, string> = { Oros: "#78350f", Copas: "#7f1d1d", Espadas: "#1e3a8a", Bastos: "#14532d" };
const SBRIGHT: Record<Suit, string> = { Oros: "#f59e0b", Copas: "#dc2626", Espadas: "#3b82f6", Bastos: "#15803d" };

const CFGS: Record<number, PlayerCfg[]> = {
  2: [
    { name: "Yolanda", isHuman: true,  team: 0, pos: "bottom", emoji: "🃏", clr: "#60a5fa" },
    { name: "Zeus",    isHuman: false, team: 1, pos: "top",    emoji: "⚡", clr: "#f87171" },
  ],
  3: [
    { name: "Yolanda", isHuman: true,  team: 0, pos: "bottom", emoji: "🃏", clr: "#60a5fa" },
    { name: "Zeus",    isHuman: false, team: 1, pos: "top",    emoji: "⚡", clr: "#f87171" },
    { name: "Ares",    isHuman: false, team: 2, pos: "right",  emoji: "🔥", clr: "#c084fc" },
  ],
  4: [
    { name: "Yolanda", isHuman: true,  team: 0, pos: "bottom", emoji: "🃏", clr: "#60a5fa" },
    { name: "Zeus",    isHuman: false, team: 1, pos: "right",  emoji: "⚡", clr: "#f87171" },
    { name: "Athena",  isHuman: false, team: 0, pos: "top",    emoji: "🦉", clr: "#34d399" },
    { name: "Ares",    isHuman: false, team: 1, pos: "left",   emoji: "🔥", clr: "#c084fc" },
  ],
};

const PIP_LAYOUTS: Record<number, [number, number, boolean][]> = {
  1: [[30, 45, false]],
  2: [[30, 22, false], [30, 68, true]],
  3: [[30, 16, false], [30, 45, false], [30, 74, true]],
  4: [[19, 22, false], [41, 22, false], [19, 68, true], [41, 68, true]],
  5: [[19, 19, false], [41, 19, false], [30, 45, false], [19, 71, true], [41, 71, true]],
  6: [[19, 18, false], [41, 18, false], [19, 45, false], [41, 45, false], [19, 72, true], [41, 72, true]],
  7: [[30, 13, false], [19, 27, false], [41, 27, false], [19, 53, false], [41, 53, false], [19, 74, true], [41, 74, true]],
};

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

function mkDeck(n: number): Card[] {
  const d: Card[] = [];
  SUITS.forEach(s => RANKS.forEach(r => {
    if (n === 3 && r === 2 && s === "Oros") return;
    d.push({ suit: s, rank: r, id: `${r}-${s}-${Math.random()}` });
  }));
  return d.sort(() => Math.random() - 0.5);
}

function beats(c: Card, a: Card, lead: Suit, trump: Suit): boolean {
  const ct = c.suit === trump, at = a.suit === trump;
  if (ct && !at) return true;
  if (!ct && at) return false;
  if (ct && at) return RS[c.rank] > RS[a.rank];
  const cl = c.suit === lead, al = a.suit === lead;
  if (cl && !al) return true;
  if (!cl && al) return false;
  if (cl && al) return RS[c.rank] > RS[a.rank];
  return false;
}

function trickWinner(plays: TrickPlay[], trump: Suit): TrickPlay {
  const lead = plays[0].card.suit;
  let w = plays[0];
  for (let i = 1; i < plays.length; i++)
    if (beats(plays[i].card, w.card, lead, trump)) w = plays[i];
  return w;
}

function aiPick(hand: Card[], plays: TrickPlay[], trump: Suit): Card {
  const val = (c: Card) => CV[c.rank] * 4 + RS[c.rank] * 0.1;
  if (!plays.length) {
    const pool = hand.filter(c => c.suit !== trump);
    return (pool.length ? pool : hand).reduce((b, c) => val(c) < val(b) ? c : b);
  }
  const lead = plays[0].card.suit;
  const pts = plays.reduce((s, p) => s + CV[p.card.rank], 0);
  let wc = plays[0].card;
  for (let i = 1; i < plays.length; i++)
    if (beats(plays[i].card, wc, lead, trump)) wc = plays[i].card;
  if (pts >= 4) {
    const canWin = hand.filter(c => beats(c, wc, lead, trump));
    if (canWin.length)
      return canWin.reduce((b, c) => RS[c.rank] < RS[b.rank] ? c : b);
  }
  return hand.reduce((b, c) => val(c) < val(b) ? c : b);
}

const INIT: GameState = {
  phase: "menu", mode: null, players: [], deck: [], lifeCard: null,
  trumpSuit: null, turnOrder: [], trickPlays: [], scores: [], msg: "",
};

function reducer(st: GameState, ac: GameAction): GameState {
  switch (ac.type) {
    case "MENU": return { ...INIT };
    case "START": {
      const m = ac.mode;
      const deck = mkDeck(m);
      const players: Player[] = CFGS[m].map((cfg, id) => ({ ...cfg, id, hand: deck.splice(0, 3) }));
      const lifeCard = deck.pop()!;
      return {
        ...INIT, phase: "playing", mode: m, players, deck, lifeCard,
        trumpSuit: lifeCard.suit,
        turnOrder: players.map((_, i) => i),
        scores: players.map(() => 0),
        msg: "¡Tu turno! Elige una carta",
      };
    }
    case "PLAY": {
      const { pidx, card } = ac;
      const plays = [...st.trickPlays, { playerIdx: pidx, card }];
      const players = st.players.map((p, i) =>
        i === pidx ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p
      );
      const done = plays.length === st.players.length;
      let msg: string;
      if (done) {
        msg = "Resolviendo baza...";
      } else {
        const ni = st.turnOrder[plays.length];
        msg = players[ni].isHuman ? "¡Tu turno! Elige una carta" : `${players[ni].name} pensando...`;
      }
      return { ...st, trickPlays: plays, players, phase: done ? "resolving" : "playing", msg };
    }
    case "RESOLVE": {
      const w = trickWinner(st.trickPlays, st.trumpSuit!);
      const pts = st.trickPlays.reduce((s, p) => s + CV[p.card.rank], 0);
      const scores = st.scores.map((s, i) => i === w.playerIdx ? s + pts : s);
      const deck = [...st.deck];
      let life = st.lifeCard;
      const players = st.players.map(p => ({ ...p, hand: [...p.hand] }));
      const wp = st.turnOrder.indexOf(w.playerIdx);
      for (let i = 0; i < st.players.length; i++) {
        const pi = st.turnOrder[(wp + i) % st.players.length];
        if (deck.length > 0) players[pi].hand.push(deck.pop()!);
        else if (life) { players[pi].hand.push(life); life = null; }
      }
      const to = Array.from({ length: st.players.length }, (_, i) =>
        (w.playerIdx + i) % st.players.length
      );
      const empty = players.every(p => p.hand.length === 0);
      const wn = st.players[w.playerIdx].name;
      const nextHuman = !empty && players[to[0]].isHuman;
      const msg = empty
        ? "¡Fin de la partida!"
        : `${wn} gana${pts ? ` (+${pts} pts)` : ""}${nextHuman ? " — ¡Tu turno!" : ""}`;
      return {
        ...st, phase: empty ? "game_over" : "playing",
        players, deck, lifeCard: life, scores, turnOrder: to, trickPlays: [], msg,
      };
    }
    default: return st;
  }
}

interface BadgeProps { player: Player; score: number; isLeader: boolean; }
const Badge: React.FC<BadgeProps> = ({ player, score, isLeader }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 5, padding: "3px 10px",
    borderRadius: 20, background: `${player.clr}22`, border: `1.5px solid ${player.clr}55`,
    boxShadow: isLeader ? `0 0 10px ${player.clr}55` : "none", transition: "box-shadow 0.4s",
  }}>
    <span style={{ fontSize: 13 }}>{player.emoji}</span>
    <span style={{ fontSize: 12, fontWeight: "bold", color: player.clr, fontFamily: "Georgia,serif" }}>{player.name}</span>
    <span style={{ background: "rgba(255,255,255,0.9)", color: "#111", fontSize: 11, fontWeight: 900, padding: "1px 7px", borderRadius: 10, minWidth: 22, textAlign: "center" }}>{score}</span>
    {isLeader && <span style={{ fontSize: 10, color: "#fde68a", marginLeft: 1 }}>★</span>}
  </div>
);

interface CardSlotProps { card?: Card; w?: number; h?: number; }
const CardSlot: React.FC<CardSlotProps> = ({ card, w = 52, h = 78 }) => (
  card
    ? <CardFace card={card} w={w} h={h} />
    : <div style={{ width: w, height: h, borderRadius: 7, border: "2px dashed rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.08)" }} />
);

interface BriscaGameProps { roomId?: string; }

export default function BriscaGame({ roomId }: BriscaGameProps) {
  const router = useRouter();
  const [st, dispatch] = useReducer(reducer, INIT);
  const { phase, mode, players, deck, lifeCard, trumpSuit, turnOrder, trickPlays, scores, msg } = st;

  const hi = players.findIndex(p => p.isHuman);
  const myTurn = phase === "playing" && turnOrder[trickPlays.length] === hi;
  const leaderIdx = (phase === "playing" || phase === "resolving") ? turnOrder[0] : null;

  useEffect(() => {
    if (phase !== "playing") return;
    const ci = turnOrder[trickPlays.length];
    if (ci === undefined) return;
    const cp = players[ci];
    if (!cp || cp.isHuman) return;
    const t = setTimeout(() => {
      dispatch({ type: "PLAY", pidx: ci, card: aiPick(cp.hand, trickPlays, trumpSuit!) });
    }, 850 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [phase, trickPlays.length, players, turnOrder, trumpSuit]);

  useEffect(() => {
    if (phase !== "resolving") return;
    const t = setTimeout(() => dispatch({ type: "RESOLVE" }), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const play = useCallback((card: Card) => {
    if (!myTurn) return;
    dispatch({ type: "PLAY", pidx: hi, card });
  }, [myTurn, hi]);

  const byPos = (pos: Pos): Player | undefined => players.find(p => p.pos === pos);
  const playedBy = (pid: number): Card | undefined => trickPlays.find(p => p.playerIdx === pid)?.card;
  const teamScore = (t: number) => scores.reduce((s, sc, i) => players[i]?.team === t ? s + sc : s, 0);

  const Sidebar = () => (
    <nav className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
      <button className="p-2 hover:bg-white/20 rounded-full"><User size={24} /></button>
      <button className="p-2 hover:bg-white/20 rounded-full"><DollarSign size={24} /></button>
      <button onClick={() => router.push("/lobby")} className="p-2 hover:bg-white/20 rounded-full"><Home size={24} /></button>
      <div className="h-px bg-white/20 w-8 self-center my-2" />
      <MuteButton variant="sidebar" />
      <div className="h-px bg-white/20 w-8 self-center my-2" />
      <button onClick={() => router.push("/games/brisca")} className="p-2 hover:bg-white/20 rounded-full text-red-400" title="Salir"><LogOut size={24} /></button>
    </nav>
  );

  if (phase === "menu") return (
    <div className="relative min-h-screen w-full text-white overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.55)), url('/images/backgroundbrisca.jpg')`, backgroundPosition: "center 30%" }} />
      <Sidebar />
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
        <div style={{ textAlign: "center", padding: "40px 48px", borderRadius: 32, border: "2px solid rgba(234,179,8,0.45)", background: "rgba(10,60,28,0.97)", boxShadow: "0 0 80px rgba(234,179,8,0.12)", maxWidth: 440 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            {([{ suit: "Oros", rank: 1 }, { suit: "Copas", rank: 12 }, { suit: "Espadas", rank: 3 }, { suit: "Bastos", rank: 11 }] as Card[])
              .map((c, i) => (
                <div key={i} style={{ transform: `rotate(${(i - 1.5) * 7}deg) translateY(${i % 2 ? -4 : 0}px)` }}>
                  <CardFace card={{ ...c, id: `p${i}` }} w={58} h={87} />
                </div>
              ))}
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, fontStyle: "italic", color: "#fbbf24", letterSpacing: 8, marginBottom: 4, textShadow: "0 0 30px rgba(251,191,36,0.35)" }}>BRISCA</h1>
          {roomId && <p style={{ color: "#6ee7b7", fontSize: 12, marginBottom: 4, letterSpacing: 3 }}>MESA {roomId.toUpperCase()}</p>}
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 20 }}>Elige número de jugadores:</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => dispatch({ type: "START", mode: n })}
                style={{ background: "rgba(251,191,36,0.1)", border: "2px solid rgba(251,191,36,0.45)", color: "#fbbf24", fontSize: 15, fontWeight: "bold", padding: "13px 26px", borderRadius: 14, cursor: "pointer", fontFamily: "Georgia,serif" }}>
                {n} Jugadores
                {n === 4 && <div style={{ fontSize: 10, color: "rgba(251,191,36,0.6)", marginTop: 2, fontWeight: "normal" }}>por equipos</div>}
              </button>
            ))}
          </div>
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.8, textAlign: "left" }}>
            <strong style={{ color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 4 }}>Reglas:</strong>
            As·11pts · Tres·10pts · Rey·4pts · Caballo·3pts · Sota·2pts<br />
            · Triunfo gana cualquier carta de otro palo<br />
            · No hay obligación de seguir palo<br />
            · Gana quien acumule más puntos (máx. 120)
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === "game_over") {
    const isTeam = mode === 4;
    const tA = teamScore(0), tB = teamScore(1);
    const winnerIdx = scores.indexOf(Math.max(...scores));
    const tied = mode !== 4 && scores.filter(s => s === scores[winnerIdx]).length > 1;
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.55)), url('/images/backgroundbrisca.jpg')`, backgroundPosition: "center 30%" }} />
        <Sidebar />
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
          <div style={{ textAlign: "center", padding: "44px 52px", borderRadius: 36, border: "3px solid #fbbf24", background: "#0a4d22", boxShadow: "0 0 70px rgba(251,191,36,0.18)", maxWidth: 440 }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 26, fontWeight: "bold", color: "white", marginBottom: 24 }}>¡Partida Terminada!</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {players.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderRadius: 12, background: !tied && i === winnerIdx ? `${p.clr}22` : "rgba(255,255,255,0.05)", border: `1.5px solid ${!tied && i === winnerIdx ? p.clr : "rgba(255,255,255,0.1)"}` }}>
                  <span style={{ color: p.clr, fontWeight: "bold", fontSize: 15 }}>
                    {p.emoji} {p.name}
                    {isTeam && <span style={{ fontSize: 11, opacity: 0.7 }}> (Eq.{p.team === 0 ? "A" : "B"})</span>}
                  </span>
                  <span style={{ color: "white", fontSize: 22, fontWeight: 900 }}>{scores[i]}</span>
                </div>
              ))}
            </div>
            {isTeam && (
              <div style={{ marginBottom: 16, padding: "10px 18px", borderRadius: 12, background: "rgba(0,0,0,0.35)", color: "#fde68a", fontSize: 14 }}>
                Equipo A: {tA} — Equipo B: {tB}<br />
                <strong>{tA > tB ? "🏆 Yolanda & Athena ganan!" : tA < tB ? "🏆 Zeus & Ares ganan!" : "🤝 ¡Empate!"}</strong>
              </div>
            )}
            <p style={{ fontSize: 20, fontWeight: "bold", marginBottom: 28, color: tied ? "#fde68a" : players[winnerIdx]?.clr }}>
              {tied ? "🤝 ¡Empate!" : isTeam ? "" : `🏆 ¡${players[winnerIdx]?.name} gana!`}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => dispatch({ type: "START", mode: mode! })}
                style={{ background: "#fbbf24", color: "#052a12", fontWeight: "bold", fontSize: 15, padding: "12px 28px", borderRadius: 24, border: "none", cursor: "pointer", fontFamily: "Georgia,serif" }}>
                Revancha
              </button>
              <button onClick={() => dispatch({ type: "MENU" })}
                style={{ background: "rgba(255,255,255,0.1)", color: "white", fontSize: 14, padding: "12px 24px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}>
                Menú
              </button>
              <button onClick={() => router.push("/games/brisca")}
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", fontSize: 14, padding: "12px 24px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topP = byPos("top");
  const leftP = byPos("left");
  const rightP = byPos("right");
  const botP = byPos("bottom");
  const CW = 52, CH = 78;

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
              <Badge player={topP} score={scores[topP.id]} isLeader={leaderIdx === topP.id} />
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
              <Badge player={leftP} score={scores[leftP.id]} isLeader={leaderIdx === leftP.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {leftP.hand.map((_, i) => <CardBack key={i} w={32} h={48} />)}
              </div>
            </div>
          )}
          {rightP && (
            <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Badge player={rightP} score={scores[rightP.id]} isLeader={leaderIdx === rightP.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {rightP.hand.map((_, i) => <CardBack key={i} w={32} h={48} />)}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Deck + Trump */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", width: 76, height: 110 }}>
                {lifeCard && (
                  <div style={{ position: "absolute", top: 22, left: -22, transform: "rotate(90deg)", transformOrigin: "center", zIndex: 0 }}>
                    <CardFace card={lifeCard} w={52} h={78} />
                  </div>
                )}
                {deck.length > 0 && (
                  <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", top: 2, left: 2, width: 64, height: 96, borderRadius: 8, background: "#172554", border: "1px solid rgba(255,255,255,0.12)" }} />
                      <CardBack w={64} h={96} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "rgba(255,255,255,0.75)", fontWeight: "bold", fontSize: 13, pointerEvents: "none" }}>
                        {deck.length}
                      </div>
                    </div>
                  </div>
                )}
                {!deck.length && !lifeCard && (
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
          <span style={{ display: "inline-block", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "3px 16px", borderRadius: 20, color: "#a7f3d0", fontSize: 12, fontStyle: "italic", border: "1px solid rgba(255,255,255,0.08)" }}>
            {msg}
          </span>
        </div>

        {/* HUMAN HAND */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "4px 0 8px", alignItems: "flex-end" }}>
          {botP?.hand.map(card => (
            <button key={card.id} onClick={() => play(card)} disabled={!myTurn}
              style={{ background: "none", border: "none", padding: 0, cursor: myTurn ? "pointer" : "default", transition: "transform 0.2s, filter 0.2s", filter: myTurn ? "none" : "brightness(0.8) saturate(0.8)" }}
              onMouseEnter={e => { if (myTurn) (e.currentTarget as HTMLElement).style.transform = "translateY(-14px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              <CardFace card={card} w={78} h={117} highlight={myTurn} />
            </button>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px 6px 80px", background: "rgba(0,0,0,0.28)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {botP && <Badge player={botP} score={scores[botP.id]} isLeader={leaderIdx === botP.id} />}
          {mode === 4 && (
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
              EqA <strong style={{ color: "#60a5fa" }}>{teamScore(0)}</strong> — EqB <strong style={{ color: "#f87171" }}>{teamScore(1)}</strong>
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, textAlign: "right" }}>
            As·11 · 3·10 · R·4 · C·3 · S·2
          </div>
        </div>
      </div>

      {/* Restart */}
      <button onClick={() => dispatch({ type: "START", mode: mode! })} title="Nueva partida"
        style={{ position: "fixed", top: 10, right: 10, zIndex: 100, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.18)", color: "white", padding: 8, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.5s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "rotate(180deg)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "rotate(0deg)"; }}>
        <RotateCcw size={16} />
      </button>
    </div>
  );
}