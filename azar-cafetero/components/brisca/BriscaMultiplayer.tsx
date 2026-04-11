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
  id: string; name: string; hand: Card[]; score: number;
  pos: Pos; emoji: string; clr: string; isMe: boolean;
}
interface InGameAlert { id: string; text: string; tone: "info" | "success"; }
interface HandResult { handNumber: number; winnerId: string; winnerName: string; points: number; }
interface FlyingCardAnimation {
  card: Card;
  from: { x: number; y: number; w: number; h: number };
  delta: { x: number; y: number };
  active: boolean;
}
interface OverlayCardAnimation extends FlyingCardAnimation {
  id: string; rotateTo: number; scaleTo: number; fadeTo: number; durationMs: number;
}
interface TrickPointsPop { text: string; x: number; y: number; active: boolean; }

// ============ COLOMBIAN COLOR PALETTE ============
const COL = {
  amarillo: "#FFD100",
  azul:     "#003087",
  rojo:     "#CE1126",
  orquidea: "#E8006A",
  selva:    "#1A7A3C",
  caribe:   "#00AFEC",
  cafe:     "#6B3A2A",
  oro:      "#F5A623",
  crema:    "#FFF8E7",
};

const SDARK: Record<Suit, string> = { Oros:"#78350f", Copas:"#7f1d1d", Espadas:"#1e3a8a", Bastos:"#14532d" };
const SBRIGHT: Record<Suit, string> = { Oros:"#f59e0b", Copas:"#dc2626", Espadas:"#3b82f6", Bastos:"#15803d" };

const PIP_LAYOUTS: Record<number, [number, number, boolean][]> = {
  1: [[30,45,false]],
  2: [[30,22,false],[30,68,true]],
  3: [[30,16,false],[30,45,false],[30,74,true]],
  4: [[19,22,false],[41,22,false],[19,68,true],[41,68,true]],
  5: [[19,19,false],[41,19,false],[30,45,false],[19,71,true],[41,71,true]],
  6: [[19,18,false],[41,18,false],[19,45,false],[41,45,false],[19,72,true],[41,72,true]],
  7: [[30,13,false],[19,27,false],[41,27,false],[19,53,false],[41,53,false],[19,74,true],[41,74,true]],
};

const PLAYER_POSITIONS: Pos[] = ["bottom","top","right","left"];
const PLAYER_COLORS = [COL.amarillo, COL.rojo, COL.caribe, COL.orquidea];
const PLAYER_EMOJIS = ["🌺","🦅","☕","🌿"];

const SUIT_MAP: Record<BackendSuit, Suit> = { OROS:"Oros", COPAS:"Copas", ESPADAS:"Espadas", BASTOS:"Bastos" };
const RANK_MAP: Record<BackendRank, Rank> = { ACE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,SIX:6,SEVEN:7,JACK:10,HORSE:11,KING:12 };
const REVERSE_SUIT_MAP: Record<Suit, BackendSuit> = { Oros:"OROS",Copas:"COPAS",Espadas:"ESPADAS",Bastos:"BASTOS" };
const REVERSE_RANK_MAP: Record<Rank, BackendRank> = { 1:"ACE",2:"TWO",3:"THREE",4:"FOUR",5:"FIVE",6:"SIX",7:"SEVEN",10:"JACK",11:"HORSE",12:"KING" };

function convertCard(dto: CardDTO): Card {
  return { suit:SUIT_MAP[dto.suit], rank:RANK_MAP[dto.rank], id:`${dto.suit}-${dto.rank}-${Math.random()}` };
}

// ============ CARD COMPONENTS ============
interface SuitPipProps { suit: Suit; size?: number; flip?: boolean; }
const SuitPip: React.FC<SuitPipProps> = ({ suit, size=1, flip=false }) => {
  const t = `${flip?"rotate(180)":""} scale(${size})`;
  switch (suit) {
    case "Oros": return (
      <g transform={t}>
        <circle r="9" fill="#f59e0b" stroke="#78350f" strokeWidth="1"/>
        <circle r="6" fill="none" stroke="#78350f" strokeWidth="0.6"/>
        {[0,60,120,180,240,300].map(a=>(
          <line key={a} x1={Math.cos(a*Math.PI/180)*3.2} y1={Math.sin(a*Math.PI/180)*3.2}
            x2={Math.cos(a*Math.PI/180)*5.8} y2={Math.sin(a*Math.PI/180)*5.8} stroke="#78350f" strokeWidth="0.6"/>
        ))}
        <circle r="2.5" fill="#b45309" opacity="0.5"/>
      </g>
    );
    case "Copas": return (
      <g transform={t}>
        <path d="M-7,-7 C-9,-2 -8,3 0,6 C8,3 9,-2 7,-7Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.7"/>
        <line x1="-7.5" y1="-7" x2="7.5" y2="-7" stroke="#7f1d1d" strokeWidth="1.2"/>
        <rect x="-1.5" y="6" width="3" height="3.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4"/>
        <ellipse cx="0" cy="9.5" rx="5" ry="1.8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6"/>
        <path d="M-4,0 C-5,2 0,5 4,0" fill="#ef4444" opacity="0.3"/>
      </g>
    );
    case "Espadas": return (
      <g transform={t}>
        <path d="M0,-11 L2.5,4 L0,5.5 L-2.5,4Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.6"/>
        <path d="M-7.5,3.5 C-5,1 5,1 7.5,3.5 C5,6 -5,6 -7.5,3.5Z" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="0.6"/>
        <rect x="-1.8" y="5.5" width="3.6" height="5" rx="1" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5"/>
        <circle cy="11" r="2.2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5"/>
      </g>
    );
    case "Bastos": return (
      <g transform={t}>
        <path d="M-2,-11 C3,-10 5,-5 5,0 C5,5 3,10 -2,11 C-5.5,10 -5.5,5 -5.5,0 C-5.5,-5 -5.5,-10 -2,-11Z"
          fill="#15803d" stroke="#14532d" strokeWidth="0.7"/>
        <ellipse cx="1" cy="-5.5" rx="3.2" ry="2.2" fill="#86efac" opacity="0.7"/>
        <ellipse cx="1" cy="0" rx="3.2" ry="2.2" fill="#fde68a" opacity="0.6"/>
        <ellipse cx="1" cy="5.5" rx="3.2" ry="2.2" fill="#86efac" opacity="0.7"/>
      </g>
    );
  }
};

interface FigureSVGProps { suit: Suit; rank: number; }
const FigureSVG: React.FC<FigureSVGProps> = ({ suit, rank }) => {
  const c=SDARK[suit]; const bg=SBRIGHT[suit];
  return (
    <>
      <rect x="6" y="18" width="48" height="58" rx="3" fill={`${bg}18`}/>
      <ellipse cx="30" cy="31" rx="8.5" ry="9" fill="#fde68a" stroke={c} strokeWidth="0.7"/>
      <circle cx="26.5" cy="29" r="1.2" fill={c}/><circle cx="33.5" cy="29" r="1.2" fill={c}/>
      <path d="M25.5,34.5 Q30,37.5 34.5,34.5" fill="none" stroke={c} strokeWidth="0.9"/>
      {rank===12&&<path d="M20,23 L20,19 L23.5,21.5 L27,17 L30,21 L33,17 L36.5,21.5 L40,19 L40,23Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6"/>}
      {rank===11&&<><path d="M22,23 L38,23 L35,17 L25,17Z" fill={c}/><circle cx="30" cy="16" r="3" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5"/></>}
      {rank===10&&<><path d="M20,23 L40,23 L37.5,17.5 L22.5,17.5Z" fill={c}/><rect x="18" y="22.5" width="24" height="2.5" rx="1" fill={c}/></>}
      <rect x="22" y="39" width="16" height="19" rx="2" fill={c}/>
      <line x1="22" y1="43" x2="38" y2="43" stroke={`${bg}88`} strokeWidth="1"/>
      <path d="M22,41 L14,47 L16,50 L23,45Z" fill={c}/><path d="M38,41 L46,47 L44,50 L37,45Z" fill={c}/>
      <rect x="24" y="57" width="5" height="11" rx="2" fill={c}/><rect x="31" y="57" width="5" height="11" rx="2" fill={c}/>
      {rank===12&&<><rect x="43" y="37" width="2.5" height="20" rx="1" fill="#fbbf24"/><circle cx="44.2" cy="35.5" r="3.5" fill="#fbbf24" stroke={c} strokeWidth="0.5"/><circle cx="44.2" cy="35.5" r="1.8" fill="#dc2626"/></>}
      {rank===10&&<rect x="41" y="41" width="2.5" height="17" rx="1" fill="#fbbf24"/>}
      {rank===11&&<><rect x="41" y="35" width="2.5" height="24" rx="1" fill="#92400e" transform="rotate(-10 42 47)"/><path d="M44,30 L50,38" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></>}
    </>
  );
};

// Colombian card back: flag stripes + orchid
const CardBack: React.FC<{ w?: number; h?: number }> = ({ w=80, h=120 }) => (
  <svg viewBox="0 0 80 120" style={{ width:w, height:h, display:"block", borderRadius:7, flexShrink:0 }}>
    <defs>
      <linearGradient id="cbk_flag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#FFD100"/>
        <stop offset="42%"  stopColor="#FFD100"/>
        <stop offset="42%"  stopColor="#003087"/>
        <stop offset="71%"  stopColor="#003087"/>
        <stop offset="71%"  stopColor="#CE1126"/>
        <stop offset="100%" stopColor="#CE1126"/>
      </linearGradient>
      <linearGradient id="cbk_shine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect width="80" height="120" fill="url(#cbk_flag)" rx="7"/>
    <rect width="80" height="120" fill="url(#cbk_shine)" rx="7"/>
    <rect x="3" y="3" width="74" height="114" rx="5" fill="none" stroke="#FFD100" strokeWidth="2.5" opacity="0.9"/>
    <rect x="6" y="6" width="68" height="108" rx="4" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6"/>
    {/* Orchid */}
    <g transform="translate(40,60)">
      {[0,72,144,216,288].map(a=>(
        <ellipse key={a}
          cx={Math.cos(a*Math.PI/180)*9} cy={Math.sin(a*Math.PI/180)*9}
          rx="5.5" ry="3.2" fill="#E8006A" opacity="0.95"
          transform={`rotate(${a}, ${Math.cos(a*Math.PI/180)*9}, ${Math.sin(a*Math.PI/180)*9})`}/>
      ))}
      <circle r="5.5" fill="#FFD100" stroke="#CE1126" strokeWidth="1.2"/>
      <circle r="2.8" fill="#CE1126"/>
      <circle r="1" fill="#FFD100"/>
    </g>
    <text x="40" y="108" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.75)"
      fontFamily="Georgia,serif" letterSpacing="2.5" fontStyle="italic">BRISCA</text>
  </svg>
);

interface CardFaceProps { card: Card; w?: number; h?: number; highlight?: boolean; }
const CardFace: React.FC<CardFaceProps> = ({ card, w=80, h=120, highlight=false }) => {
  const {suit,rank}=card;
  const isFace=rank>=10;
  const lbl=rank===10?"S":rank===11?"C":rank===12?"R":String(rank);
  const ps=rank===1?1.6:rank>=6?0.82:0.9;
  const dc=SDARK[suit];
  return (
    <div style={{
      width:w, height:h, borderRadius:7, overflow:"hidden", flexShrink:0,
      border:highlight?`3px solid ${COL.amarillo}`:`2px solid rgba(255,209,0,0.5)`,
      boxShadow:highlight
        ?`0 0 0 2px rgba(206,17,38,0.4), 0 0 24px rgba(255,209,0,0.7), 0 6px 18px rgba(0,0,0,0.55)`
        :`0 0 0 1px rgba(255,209,0,0.22), 0 4px 14px rgba(0,0,0,0.45)`,
      background:"white",
    }}>
      <svg viewBox="0 0 60 90" style={{ width:"100%", height:"100%" }}>
        <rect width="60" height="90" fill="white"/>
        <rect x="1.5" y="1.5" width="57" height="87" rx="3" fill="none" stroke={dc} strokeWidth="0.3" opacity="0.2"/>
        <text x="4.5" y="10" fontSize="7.5" fontWeight="bold" fontFamily="Georgia,serif" fill={dc}>{lbl}</text>
        <g transform="translate(7,18) scale(0.38)"><SuitPip suit={suit}/></g>
        <g transform="rotate(180,30,45)">
          <text x="4.5" y="10" fontSize="7.5" fontWeight="bold" fontFamily="Georgia,serif" fill={dc}>{lbl}</text>
          <g transform="translate(7,18) scale(0.38)"><SuitPip suit={suit}/></g>
        </g>
        {isFace
          ?<FigureSVG suit={suit} rank={rank}/>
          :(PIP_LAYOUTS[rank]||[]).map(([x,y,fl],i)=>(
            <g key={i} transform={`translate(${x},${y})`}><SuitPip suit={suit} size={ps} flip={fl}/></g>
          ))
        }
      </svg>
    </div>
  );
};

interface CardSlotProps { card?: Card; w?: number; h?: number; }
const CardSlot: React.FC<CardSlotProps> = ({ card, w=52, h=78 }) => (
  card
    ?<CardFace card={card} w={w} h={h}/>
    :<div style={{ width:w, height:h, borderRadius:7, border:`2px dashed rgba(255,209,0,0.22)`, background:"rgba(0,0,0,0.18)" }}/>
);

// Colombian badge
interface BadgeProps { player: Player; isLeader: boolean; }
const Badge: React.FC<BadgeProps> = ({ player, isLeader }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:6, padding:"3px 10px 3px 5px",
    borderRadius:10,
    background:isLeader
      ?`linear-gradient(135deg, rgba(255,209,0,0.3), rgba(206,17,38,0.18))`
      :`rgba(0,0,0,0.65)`,
    border:isLeader?`2px solid ${COL.amarillo}`:`1.5px solid rgba(255,209,0,0.3)`,
    boxShadow:isLeader?`0 0 20px rgba(255,209,0,0.55), 0 0 8px rgba(206,17,38,0.3)`:`0 2px 8px rgba(0,0,0,0.5)`,
    transition:"all 0.35s ease",
    backdropFilter:"blur(10px)",
  }}>
    <span style={{ fontSize:15 }}>{player.emoji}</span>
    <span style={{
      fontSize:12, fontWeight:"bold",
      color:isLeader?COL.amarillo:"rgba(255,248,231,0.92)",
      fontFamily:"Georgia,serif", letterSpacing:0.5,
      textShadow:isLeader?`0 0 10px rgba(255,209,0,0.7)`:"none",
    }}>
      {player.name}{player.isMe&&" (Tú)"}
    </span>
    <div style={{
      minWidth:28, height:28, borderRadius:14, padding:"0 6px",
      background:isLeader
        ?`linear-gradient(135deg, ${COL.amarillo}, ${COL.oro})`
        :`linear-gradient(135deg, ${COL.azul}, #005bd4)`,
      border:`2px solid ${isLeader?COL.rojo:"rgba(255,209,0,0.4)"}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:isLeader?"#1a0000":COL.amarillo,
      fontSize:12, fontWeight:900,
      boxShadow:isLeader?`0 0 14px rgba(255,209,0,0.6)`:`0 0 8px rgba(0,48,135,0.5)`,
    }}>
      {player.score}
    </div>
    {isLeader&&(
      <span style={{ fontSize:14, lineHeight:1, display:"inline-block", animation:"cumbia 0.5s ease-in-out infinite alternate" }}>⭐</span>
    )}
  </div>
);

// ============ MAIN COMPONENT ============
interface BriscaMultiplayerProps { gameId?: string; userName?: string; userId?: string; }

export default function BriscaMultiplayer({ gameId: propGameId, userName, userId }: BriscaMultiplayerProps) {
  const router = useRouter();
  const [playerId] = useState(()=>userId||`player-${Math.random().toString(36).slice(2,8)}`);
  const [playerName] = useState(()=>userName||`Jugador${Math.floor(Math.random()*1000)}`);
  const [gameId] = useState(()=>propGameId||"test-game-1");
  const hasJoinedRef = useRef(false);
  const [alerts, setAlerts] = useState<InGameAlert[]>([]);
  const [lastHandResult, setLastHandResult] = useState<HandResult|null>(null);
  const [handHistory, setHandHistory] = useState<HandResult[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string|null>(null);
  const [isAnimatingPlay, setIsAnimatingPlay] = useState(false);
  const [flyingCard, setFlyingCard] = useState<FlyingCardAnimation|null>(null);
  const [opponentFlyingCards, setOpponentFlyingCards] = useState<OverlayCardAnimation[]>([]);
  const [trickCollectCards, setTrickCollectCards] = useState<OverlayCardAnimation[]>([]);
  const [trickPointsPop, setTrickPointsPop] = useState<TrickPointsPop|null>(null);
  const flyTimeoutRef = useRef<number|null>(null);
  const animationTimeoutsRef = useRef<number[]>([]);
  const trickCenterRef = useRef<HTMLDivElement|null>(null);
  const bottomTrickTargetRef = useRef<HTMLDivElement|null>(null);
  const handSourceRefs = useRef<Partial<Record<Pos,HTMLDivElement|null>>>({});
  const trickSlotRefs = useRef<Partial<Record<Pos,HTMLDivElement|null>>>({});
  const badgeRefs = useRef<Partial<Record<Pos,HTMLDivElement|null>>>({});
  const previousTrickRef = useRef<Record<string,Card>>({});
  const previousRoundRef = useRef<{
    phase:RoundPhase; currentPlayerId:string|null; trickCardCount:number;
    scoresById:Record<string,number>; trickCardsByPlayer:Record<string,Card>;
  }|null>(null);

  const { isConnected, connectionStatus, error, gameState, connect, createGame, joinGame, startGame, playCard, requestGameState } =
    useBriscaWebSocket({ onError:(err)=>console.error("[Brisca] Error:",err) });

  useEffect(()=>{ connect(); },[]); // eslint-disable-line

  useEffect(()=>{
    if (!isConnected||hasJoinedRef.current) return;
    const initGame=async()=>{
      try { await createGame(gameId,2,4); } catch(e) { console.log("[Brisca] Error creating game:",e); }
      joinGame(gameId,playerId,playerName);
      hasJoinedRef.current=true;
      setTimeout(()=>{ requestGameState(gameId); },300);
    };
    initGame();
  },[isConnected]); // eslint-disable-line

  const { players, trumpCard, trumpSuit, remainingCards, currentPlayerId, currentTrick, phase, winner } = useMemo(()=>{
    if (!gameState) return { players:[],trumpCard:null,trumpSuit:null,remainingCards:0,currentPlayerId:null,currentTrick:{},phase:"waiting" as const,winner:null };
    const myIndex=gameState.players.findIndex(p=>p.id===playerId);
    const playerCount=gameState.players.length;
    const players: Player[]=gameState.players.map((p,i)=>{
      const relativeIndex=(i-myIndex+playerCount)%playerCount;
      const pos=PLAYER_POSITIONS[relativeIndex]||"bottom";
      return { id:p.id,name:p.name,hand:p.hand.map(convertCard),score:p.score,pos,emoji:PLAYER_EMOJIS[i%4],clr:PLAYER_COLORS[i%4],isMe:p.id===playerId };
    });
    const trumpCard=gameState.trumpCard?convertCard(gameState.trumpCard):null;
    const trumpSuit=gameState.trumpSuit?SUIT_MAP[gameState.trumpSuit]:null;
    const currentTrick: Record<string,Card>={};
    if (gameState.currentTrick?.playedCards) {
      for (const [pid,cardDto] of Object.entries(gameState.currentTrick.playedCards)) currentTrick[pid]=convertCard(cardDto);
    }
    const phase: RoundPhase=gameState.state==="WAITING_FOR_PLAYERS"?"waiting":gameState.state==="IN_PROGRESS"?"playing":"finished";
    const winner=gameState.winner?{ id:gameState.winner.id,name:gameState.winner.name }:null;
    return { players,trumpCard,trumpSuit,remainingCards:gameState.remainingCards,currentPlayerId:gameState.currentPlayerId,currentTrick,phase,winner };
  },[gameState,playerId]);

  const isMyTurn=currentPlayerId===playerId;
  const canStart=phase==="waiting"&&players.length>=2;
  const trickCardCount=Object.keys(currentTrick).length;
  const currentHandNumber=handHistory.length+(trickCardCount>0?1:0);
  const posByPlayerId=useMemo(()=>Object.fromEntries(players.map(p=>[p.id,p.pos])) as Record<string,Pos>,[players]);

  const pushAlert=useCallback((text:string,tone:"info"|"success"="info")=>{
    const id=`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    setAlerts(prev=>[...prev,{id,text,tone}]);
    window.setTimeout(()=>{ setAlerts(prev=>prev.filter(a=>a.id!==id)); },4200);
  },[]);

  const handlePlayCard=useCallback((card:Card)=>{
    if (!isMyTurn||phase!=="playing") return;
    playCard(gameId,playerId,REVERSE_SUIT_MAP[card.suit],REVERSE_RANK_MAP[card.rank]);
  },[isMyTurn,phase,gameId,playerId,playCard]);

  const handleAnimatedPlayCard=useCallback((card:Card,sourceEl:HTMLElement)=>{
    if (!isMyTurn||phase!=="playing"||isAnimatingPlay) return;
    const targetEl=bottomTrickTargetRef.current??trickCenterRef.current;
    if (!targetEl) { handlePlayCard(card); return; }
    const sourceRect=sourceEl.getBoundingClientRect();
    const targetRect=targetEl.getBoundingClientRect();
    const deltaX=(targetRect.left+targetRect.width/2)-(sourceRect.left+sourceRect.width/2);
    const deltaY=(targetRect.top+targetRect.height/2)-(sourceRect.top+sourceRect.height/2);
    setSelectedCardId(card.id); setIsAnimatingPlay(true);
    setFlyingCard({ card,from:{x:sourceRect.left,y:sourceRect.top,w:sourceRect.width,h:sourceRect.height},delta:{x:deltaX,y:deltaY},active:false });
    requestAnimationFrame(()=>{ setFlyingCard(prev=>(prev?{...prev,active:true}:prev)); });
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current);
    flyTimeoutRef.current=window.setTimeout(()=>{
      handlePlayCard(card); setFlyingCard(null); setSelectedCardId(null); setIsAnimatingPlay(false); flyTimeoutRef.current=null;
    },430);
  },[isMyTurn,phase,isAnimatingPlay,handlePlayCard]);

  const handleStartGame=useCallback(()=>{ startGame(gameId); },[gameId,startGame]);

  const byPos=(pos:Pos):Player|undefined=>players.find(p=>p.pos===pos);
  const playedBy=(pid:string):Card|undefined=>currentTrick[pid];

  useEffect(()=>{
    if (phase!=="playing") { previousTrickRef.current={...currentTrick}; return; }
    const prevTrick=previousTrickRef.current;
    const newCards=Object.entries(currentTrick).filter(([pid])=>!prevTrick[pid]&&pid!==playerId);
    if (newCards.length>0) {
      const animations: OverlayCardAnimation[]=[];
      for (const [pid,card] of newCards) {
        const pos=posByPlayerId[pid]; const sourceEl=pos?handSourceRefs.current[pos]:null; const targetEl=pos?trickSlotRefs.current[pos]:null;
        if (!sourceEl||!targetEl) continue;
        const sourceRect=sourceEl.getBoundingClientRect(); const targetRect=targetEl.getBoundingClientRect();
        const startW=Math.min(62,sourceRect.width*0.45); const startH=startW*1.5;
        const startX=sourceRect.left+sourceRect.width/2-startW/2; const startY=sourceRect.top+sourceRect.height/2-startH/2;
        animations.push({ id:`opp-${pid}-${card.id}-${Date.now()}`,card,from:{x:startX,y:startY,w:startW,h:startH},delta:{x:(targetRect.left+targetRect.width/2)-(startX+startW/2),y:(targetRect.top+targetRect.height/2)-(startY+startH/2)},active:false,rotateTo:pos==="left"?7:pos==="right"?-7:0,scaleTo:0.93,fadeTo:0.96,durationMs:420 });
      }
      if (animations.length>0) {
        setOpponentFlyingCards(prev=>[...prev,...animations]);
        requestAnimationFrame(()=>{ setOpponentFlyingCards(prev=>prev.map(anim=>animations.some(a=>a.id===anim.id)?{...anim,active:true}:anim)); });
        const timeout=window.setTimeout(()=>{ setOpponentFlyingCards(prev=>prev.filter(anim=>!animations.some(a=>a.id===anim.id))); },450);
        animationTimeoutsRef.current.push(timeout);
      }
    }
    previousTrickRef.current={...currentTrick};
  },[phase,currentTrick,playerId,posByPlayerId]);

  useEffect(()=>{
    const scoresById=Object.fromEntries(players.map(p=>[p.id,p.score]));
    const prev=previousRoundRef.current;
    if (prev&&phase==="playing") {
      if (currentPlayerId===playerId&&prev.currentPlayerId!==playerId) pushAlert("Es tu turno. Juega una carta.","info");
      const trickResolved=prev.trickCardCount>0&&trickCardCount===0;
      if (trickResolved&&currentPlayerId) {
        const winnerPlayer=players.find(p=>p.id===currentPlayerId);
        if (winnerPlayer) {
          const points=Math.max(0,winnerPlayer.score-(prev.scoresById[winnerPlayer.id]??0));
          const winnerBadge=badgeRefs.current[winnerPlayer.pos];
          if (winnerBadge) {
            const winnerRect=winnerBadge.getBoundingClientRect();
            const collectAnimations: OverlayCardAnimation[]=[];
            for (const [pid,card] of Object.entries(prev.trickCardsByPlayer)) {
              const pos=posByPlayerId[pid]; const sourceEl=pos?trickSlotRefs.current[pos]:null;
              if (!sourceEl) continue;
              const sourceRect=sourceEl.getBoundingClientRect();
              collectAnimations.push({ id:`collect-${pid}-${card.id}-${Date.now()}`,card,from:{x:sourceRect.left,y:sourceRect.top,w:sourceRect.width,h:sourceRect.height},delta:{x:(winnerRect.left+winnerRect.width/2)-(sourceRect.left+sourceRect.width/2),y:(winnerRect.top+winnerRect.height/2)-(sourceRect.top+sourceRect.height/2)},active:false,rotateTo:(Math.random()-0.5)*18,scaleTo:0.54,fadeTo:0.25,durationMs:560 });
            }
            if (collectAnimations.length>0) {
              setTrickCollectCards(collectAnimations);
              requestAnimationFrame(()=>{ setTrickCollectCards(p=>p.map(a=>({...a,active:true}))); });
              animationTimeoutsRef.current.push(window.setTimeout(()=>{ setTrickCollectCards([]); },620));
            }
            setTrickPointsPop({ text:points>0?`+${points}`:"+0",x:winnerRect.left+winnerRect.width/2,y:winnerRect.top-10,active:false });
            requestAnimationFrame(()=>{ setTrickPointsPop(p=>(p?{...p,active:true}:p)); });
            animationTimeoutsRef.current.push(window.setTimeout(()=>{ setTrickPointsPop(null); },900));
          }
          const result: HandResult={ handNumber:handHistory.length+1,winnerId:winnerPlayer.id,winnerName:winnerPlayer.name,points };
          setLastHandResult(result); setHandHistory(old=>[result,...old].slice(0,5));
          pushAlert(`Mano ${result.handNumber}: gana ${winnerPlayer.name}${points>0?` (+${points} pts)`:""}`, "success");
        }
      }
    }
    previousRoundRef.current={ phase,currentPlayerId,trickCardCount,scoresById,trickCardsByPlayer:{...currentTrick} };
  },[phase,currentPlayerId,playerId,players,trickCardCount,handHistory.length,pushAlert,currentTrick,posByPlayerId]);

  useEffect(()=>()=>{
    if (flyTimeoutRef.current) window.clearTimeout(flyTimeoutRef.current);
    animationTimeoutsRef.current.forEach(t=>window.clearTimeout(t));
    animationTimeoutsRef.current=[];
  },[]);

  // ============ BACKGROUND — jungle + flag energy ============
  const BG = () => (
    <div style={{ position:"absolute",inset:0,zIndex:0,overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,background:`linear-gradient(160deg, #001800 0%, #0d3d10 35%, #003d1a 65%, #001800 100%)` }}/>
      <div style={{ position:"absolute",inset:0,backgroundImage:`url('/images/backgroundbrisca.jpg')`,backgroundSize:"cover",backgroundPosition:"center 30%",opacity:0.2,filter:"saturate(3) hue-rotate(85deg) brightness(0.7)" }}/>
      {/* Colombian flag diagonal streaks */}
      <div style={{ position:"absolute",inset:0,background:`linear-gradient(125deg, rgba(255,209,0,0.22) 0%, rgba(255,209,0,0.04) 22%, rgba(0,48,135,0.14) 44%, rgba(206,17,38,0.2) 68%, rgba(206,17,38,0.06) 100%)` }}/>
      <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255,180,0,0.16) 0%, transparent 60%)` }}/>
      <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,8,0,0.88) 100%)` }}/>
      <div style={{ position:"absolute",inset:0,background:`linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 16%, transparent 84%, rgba(0,0,0,0.85) 100%)` }}/>
      {/* Floating orbs */}
      <div style={{ position:"absolute",width:320,height:320,borderRadius:"50%",top:"-10%",left:"-5%",background:`radial-gradient(circle, rgba(255,209,0,0.12), transparent 70%)`,filter:"blur(40px)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",width:280,height:280,borderRadius:"50%",bottom:"-8%",right:"-4%",background:`radial-gradient(circle, rgba(206,17,38,0.15), transparent 70%)`,filter:"blur(36px)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",width:240,height:240,borderRadius:"50%",top:"30%",right:"8%",background:`radial-gradient(circle, rgba(0,48,135,0.18), transparent 70%)`,filter:"blur(32px)",pointerEvents:"none" }}/>
    </div>
  );

  // Colombian sidebar
  const Sidebar = () => (
    <nav style={{
      position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
      zIndex:20,display:"flex",flexDirection:"column",gap:6,padding:"14px 9px",
      background:`linear-gradient(180deg, rgba(0,48,135,0.94), rgba(0,24,60,0.90))`,
      backdropFilter:"blur(14px)",borderRadius:14,
      border:`2.5px solid ${COL.amarillo}`,
      borderLeft:`5px solid ${COL.amarillo}`,
      boxShadow:`0 0 30px rgba(255,209,0,0.2), 0 0 0 1px rgba(206,17,38,0.25), 0 8px 28px rgba(0,0,0,0.7)`,
    }}>
      {[{icon:<User size={18}/>,onClick:undefined},{icon:<DollarSign size={18}/>,onClick:undefined},{icon:<Home size={18}/>,onClick:()=>router.push("/lobby")}].map((btn,i)=>(
        <button key={i} onClick={btn.onClick} style={{ padding:"9px",background:"rgba(255,209,0,0.1)",border:`1px solid rgba(255,209,0,0.4)`,borderRadius:9,color:COL.amarillo,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,209,0,0.3)";(e.currentTarget as HTMLElement).style.boxShadow=`0 0 12px rgba(255,209,0,0.4)`;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,209,0,0.1)";(e.currentTarget as HTMLElement).style.boxShadow="none";}}>
          {btn.icon}
        </button>
      ))}
      <div style={{ height:1,background:`linear-gradient(90deg, ${COL.amarillo}, ${COL.rojo})`,margin:"2px 0",borderRadius:1 }}/>
      <MuteButton variant="sidebar"/>
      <div style={{ height:1,background:`linear-gradient(90deg, ${COL.amarillo}, ${COL.rojo})`,margin:"2px 0",borderRadius:1 }}/>
      <button onClick={()=>router.push("/")} title="Salir" style={{ padding:"9px",background:"rgba(206,17,38,0.15)",border:`1px solid rgba(206,17,38,0.5)`,borderRadius:9,color:COL.rojo,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(206,17,38,0.4)";(e.currentTarget as HTMLElement).style.boxShadow=`0 0 12px rgba(206,17,38,0.5)`;}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(206,17,38,0.15)";(e.currentTarget as HTMLElement).style.boxShadow="none";}}>
        <LogOut size={18}/>
      </button>
    </nav>
  );

  const FlagStripe = ({ h=6 }: { h?: number }) => (
    <div style={{ display:"flex",height:h,borderRadius:h/2,overflow:"hidden" }}>
      <div style={{ flex:2,background:COL.amarillo }}/><div style={{ flex:1,background:COL.azul }}/><div style={{ flex:1,background:COL.rojo }}/>
    </div>
  );

  const modalBox: React.CSSProperties = {
    textAlign:"center",padding:"44px 52px",borderRadius:22,
    background:`linear-gradient(160deg, rgba(0,48,135,0.97), rgba(0,18,50,0.97))`,
    border:`3px solid ${COL.amarillo}`,
    boxShadow:`0 0 80px rgba(255,209,0,0.25), 0 0 0 2px rgba(206,17,38,0.4), inset 0 2px 0 rgba(255,209,0,0.12)`,
    maxWidth:460,
  };

  if (connectionStatus!=="connected") {
    return (
      <div style={{ position:"relative",minHeight:"100vh",width:"100%",color:"white",overflow:"hidden",background:"#001800" }}>
        <BG/>
        <div style={{ position:"relative",zIndex:10,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={modalBox}>
            <FlagStripe h={8}/>
            <div style={{ margin:"20px 0 8px" }}>
              <Loader2 style={{ width:52,height:52,animation:"spin 1s linear infinite",margin:"0 auto",color:COL.amarillo }}/>
            </div>
            <h2 style={{ fontSize:22,fontWeight:"bold",marginBottom:8,fontFamily:"Georgia,serif",color:COL.amarillo,letterSpacing:2 }}>Conectando...</h2>
            <p style={{ color:"rgba(255,248,231,0.6)" }}>Estableciendo conexión</p>
            {error&&<p style={{ color:COL.rojo,marginTop:16 }}>{error}</p>}
            <div style={{ marginTop:20 }}><FlagStripe h={6}/></div>
          </div>
        </div>
      </div>
    );
  }

  if (phase==="waiting") {
    return (
      <div style={{ position:"relative",minHeight:"100vh",width:"100%",color:"white",overflow:"hidden",background:"#001800" }}>
        <BG/><Sidebar/>
        <div style={{ position:"relative",zIndex:10,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif" }}>
          <div style={modalBox}>
            <FlagStripe h={8}/>
            <div style={{ fontSize:44,margin:"16px 0 4px" }}>🌺</div>
            <h1 style={{
              fontSize:58,fontWeight:900,fontStyle:"italic",
              background:`linear-gradient(135deg, ${COL.amarillo} 0%, ${COL.oro} 40%, ${COL.rojo} 100%)`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              letterSpacing:10,marginBottom:2,lineHeight:1,fontFamily:"Georgia,serif",
              filter:`drop-shadow(0 0 18px rgba(255,209,0,0.35))`,
            }}>BRISCA</h1>
            <p style={{ color:COL.caribe,fontSize:11,marginBottom:24,letterSpacing:4,textTransform:"uppercase" }}>Mesa: {gameId}</p>
            <div style={{ marginBottom:24 }}>
              <p style={{ color:"rgba(255,248,231,0.5)",fontSize:12,marginBottom:12,letterSpacing:2,textTransform:"uppercase" }}>Jugadores ({players.length}/4)</p>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {players.map((p,i)=>(
                  <div key={p.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderRadius:12,background:`linear-gradient(135deg, ${PLAYER_COLORS[i]}22, transparent)`,border:`2px solid ${PLAYER_COLORS[i]}88`,boxShadow:`0 0 14px ${PLAYER_COLORS[i]}20` }}>
                    <span style={{ color:PLAYER_COLORS[i],fontWeight:"bold",fontSize:14,textShadow:`0 0 8px ${PLAYER_COLORS[i]}88` }}>{PLAYER_EMOJIS[i]} {p.name}{p.isMe&&" (Tú)"}</span>
                    <div style={{ width:10,height:10,borderRadius:"50%",background:COL.selva,boxShadow:`0 0 10px ${COL.selva}` }}/>
                  </div>
                ))}
                {players.length<4&&<div style={{ padding:"14px 16px",borderRadius:12,border:`2px dashed rgba(255,209,0,0.2)`,color:"rgba(255,248,231,0.3)",fontSize:13 }}>Esperando jugadores...</div>}
              </div>
            </div>
            {canStart&&(
              <button onClick={handleStartGame} style={{ width:"100%",background:`linear-gradient(135deg, ${COL.amarillo}, ${COL.oro})`,color:"#1a0000",fontWeight:"bold",fontSize:16,padding:"15px 28px",borderRadius:12,border:`2px solid ${COL.rojo}`,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:3,textTransform:"uppercase",boxShadow:`0 0 28px rgba(255,209,0,0.55), 0 4px 14px rgba(0,0,0,0.4)`,transition:"transform 0.15s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.02)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
                ¡Iniciar Partida!
              </button>
            )}
            {!canStart&&players.length<2&&<p style={{ color:`${COL.amarillo}99`,fontSize:13,marginTop:8 }}>Se necesitan al menos 2 jugadores</p>}
            <div style={{ marginTop:20,padding:"14px 18px",borderRadius:12,background:"rgba(0,0,0,0.4)",border:`1px solid rgba(255,209,0,0.18)`,color:"rgba(255,248,231,0.4)",fontSize:11,lineHeight:2,textAlign:"left" }}>
              <strong style={{ color:COL.amarillo,display:"block",marginBottom:6,letterSpacing:2,textTransform:"uppercase",fontSize:10 }}>Reglas</strong>
              As·11pts · Tres·10pts · Rey·4pts · Caballo·3pts · Sota·2pts<br/>
              · Triunfo gana cualquier carta de otro palo · No hay obligación de seguir palo
            </div>
            <div style={{ marginTop:16 }}><FlagStripe h={6}/></div>
          </div>
        </div>
      </div>
    );
  }

  if (phase==="finished") {
    const winnerPlayer=players.find(p=>p.id===winner?.id);
    const sortedPlayers=[...players].sort((a,b)=>b.score-a.score);
    const totalPoints=sortedPlayers.reduce((sum,p)=>sum+p.score,0);
    return (
      <div style={{ position:"relative",minHeight:"100vh",width:"100%",color:"white",overflow:"hidden",background:"#001800" }}>
        <BG/><Sidebar/>
        <div style={{ position:"relative",zIndex:10,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif" }}>
          <div style={{ ...modalBox,maxWidth:500 }}>
            <FlagStripe h={8}/>
            <div style={{ fontSize:52,margin:"16px 0 8px" }}>🏆</div>
            <h2 style={{ fontSize:22,fontWeight:"bold",color:COL.amarillo,marginBottom:16,letterSpacing:3,textTransform:"uppercase",textShadow:`0 0 22px rgba(255,209,0,0.55)` }}>¡Partida Terminada!</h2>
            <div style={{ background:`linear-gradient(135deg, rgba(255,209,0,0.2), rgba(206,17,38,0.15))`,border:`2.5px solid ${COL.amarillo}`,borderRadius:14,padding:"16px 20px",marginBottom:20,boxShadow:`0 0 28px rgba(255,209,0,0.22)` }}>
              <p style={{ fontSize:17,color:"rgba(255,248,231,0.8)",marginBottom:6 }}>{winnerPlayer?.emoji} <strong style={{ color:COL.amarillo }}>{winnerPlayer?.name||winner?.name}</strong>{winnerPlayer?.isMe&&" (Tú)"}</p>
              <p style={{ fontSize:32,fontWeight:900,marginBottom:4,background:`linear-gradient(135deg, ${COL.amarillo}, ${COL.rojo})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>¡GANA CON {winnerPlayer?.score||0} PTS!</p>
              <p style={{ fontSize:12,color:"rgba(255,248,231,0.4)" }}>de {totalPoints} puntos en juego</p>
            </div>
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11,color:`${COL.amarillo}88`,marginBottom:10,letterSpacing:3,textTransform:"uppercase" }}>Tabla de posiciones</p>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {sortedPlayers.map((p,i)=>(
                  <div key={p.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderRadius:10,background:i===0?`linear-gradient(135deg, rgba(255,209,0,0.2), rgba(206,17,38,0.1))`:"rgba(255,255,255,0.04)",border:`2px solid ${i===0?COL.amarillo:"rgba(255,209,0,0.15)"}`,boxShadow:i===0?`0 0 18px rgba(255,209,0,0.28)`:"none" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <span style={{ width:28,height:28,borderRadius:"50%",background:i===0?`linear-gradient(135deg,${COL.amarillo},${COL.oro})`:i===1?"rgba(255,255,255,0.16)":"rgba(255,209,0,0.1)",border:`2px solid ${i===0?COL.rojo:"rgba(255,209,0,0.2)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:"bold",color:i===0?"#1a0000":"rgba(255,248,231,0.7)" }}>{i+1}</span>
                      <span style={{ color:p.clr,fontWeight:"bold",fontSize:14,textShadow:`0 0 8px ${p.clr}99` }}>{p.emoji} {p.name}{p.isMe&&" (Tú)"}</span>
                    </div>
                    <span style={{ color:COL.amarillo,fontSize:22,fontWeight:900,textShadow:`0 0 12px rgba(255,209,0,0.5)` }}>{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={()=>window.location.reload()} style={{ background:`linear-gradient(135deg, ${COL.amarillo}, ${COL.oro})`,color:"#1a0000",fontWeight:"bold",fontSize:15,padding:"13px 36px",borderRadius:12,border:`2px solid ${COL.rojo}`,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:3,textTransform:"uppercase",boxShadow:`0 0 28px rgba(255,209,0,0.45)` }}>Nueva Partida</button>
            <div style={{ marginTop:16 }}><FlagStripe h={6}/></div>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN GAME ============
  const topP=byPos("top"); const leftP=byPos("left"); const rightP=byPos("right"); const botP=byPos("bottom");
  const CW=64, CH=96, TABLE_GAP=26;
  const msg=isMyTurn?"¡Tu turno! Elige una carta":`Turno de ${players.find(p=>p.id===currentPlayerId)?.name||"..."}`;

  return (
    <div style={{ position:"relative",width:"100%",color:"white",overflow:"hidden",height:"100vh",display:"flex",flexDirection:"column",userSelect:"none",fontFamily:"sans-serif",background:"#001800" }}>
      <BG/>
      <Sidebar/>
      <div style={{ position:"relative",zIndex:10,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden" }}>

        {/* TOP PLAYER */}
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 0 6px",gap:6,minHeight:topP?84:12 }}>
          {topP&&(
            <>
              <div ref={(el)=>{ badgeRefs.current.top=el; }}><Badge player={topP} isLeader={currentPlayerId===topP.id}/></div>
              <div ref={(el)=>{ handSourceRefs.current.top=el; }} style={{ display:"flex",gap:3 }}>
                {topP.hand.map((_,i)=><CardBack key={i} w={34} h={52}/>)}
              </div>
            </>
          )}
        </div>

        {/* MIDDLE */}
        <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",minHeight:0 }}>

          {alerts.length>0&&(
            <div style={{ position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",zIndex:30,display:"flex",flexDirection:"column",gap:8,width:"min(520px,calc(100vw - 180px))" }}>
              {alerts.map(alert=>(
                <div key={alert.id} style={{
                  background:alert.tone==="success"
                    ?`linear-gradient(135deg, rgba(26,122,60,0.92), rgba(0,48,135,0.82))`
                    :`linear-gradient(135deg, rgba(0,48,135,0.92), rgba(0,18,50,0.88))`,
                  border:`2px solid ${alert.tone==="success"?COL.selva:COL.caribe}`,
                  borderRadius:12,padding:"9px 16px",fontSize:13,fontWeight:700,
                  boxShadow:`0 8px 22px rgba(0,0,0,0.5), 0 0 18px ${alert.tone==="success"?`rgba(26,122,60,0.35)`:`rgba(0,175,236,0.3)`}`,
                  textAlign:"center",color:alert.tone==="success"?COL.selva:COL.caribe,
                  backdropFilter:"blur(10px)",letterSpacing:0.5,
                }}>{alert.text}</div>
              ))}
            </div>
          )}

          {/* Round state panel */}
          <div style={{ position:"absolute",top:10,right:14,zIndex:20,width:224,background:`linear-gradient(135deg, rgba(0,48,135,0.94), rgba(0,18,50,0.90))`,border:`2px solid ${COL.amarillo}`,borderRadius:14,padding:"10px 14px",backdropFilter:"blur(10px)",boxShadow:`0 4px 20px rgba(0,0,0,0.5), 0 0 18px rgba(255,209,0,0.1)` }}>
            <FlagStripe h={4}/>
            <div style={{ fontSize:10,color:COL.amarillo,letterSpacing:2,marginBottom:7,textTransform:"uppercase",marginTop:8 }}>Estado de Ronda</div>
            <div style={{ fontSize:12,marginBottom:5,color:"rgba(255,248,231,0.8)" }}>Mano: <strong style={{ color:COL.amarillo }}>{currentHandNumber||1}</strong></div>
            <div style={{ fontSize:12,marginBottom:5,color:"rgba(255,248,231,0.8)" }}>En mesa: <strong style={{ color:COL.amarillo }}>{trickCardCount}/{Math.max(players.length,1)}</strong></div>
            <div style={{ fontSize:12,color:"rgba(255,248,231,0.8)" }}>Última:{" "}
              {lastHandResult
                ?<strong style={{ color:COL.selva }}>{lastHandResult.winnerName} {lastHandResult.points>0?`(+${lastHandResult.points})`:"+0"}</strong>
                :<span style={{ color:"rgba(255,248,231,0.35)" }}>Sin ganador</span>}
            </div>
          </div>

          {/* LEFT */}
          {leftP&&(
            <div style={{ position:"absolute",left:68,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
              <div ref={(el)=>{ badgeRefs.current.left=el; }}><Badge player={leftP} isLeader={currentPlayerId===leftP.id}/></div>
              <div ref={(el)=>{ handSourceRefs.current.left=el; }} style={{ display:"flex",flexDirection:"column",gap:2 }}>
                {leftP.hand.map((_,i)=><CardBack key={i} w={30} h={46}/>)}
              </div>
            </div>
          )}

          {/* RIGHT */}
          {rightP&&(
            <div style={{ position:"absolute",right:68,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
              <div ref={(el)=>{ badgeRefs.current.right=el; }}><Badge player={rightP} isLeader={currentPlayerId===rightP.id}/></div>
              <div ref={(el)=>{ handSourceRefs.current.right=el; }} style={{ display:"flex",flexDirection:"column",gap:2 }}>
                {rightP.hand.map((_,i)=><CardBack key={i} w={30} h={46}/>)}
              </div>
            </div>
          )}

          {/* CENTER */}
          <div style={{ display:"flex",alignItems:"center",gap:24 }}>
            {/* Deck */}
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
              <div style={{ position:"relative",width:76,height:110 }}>
                {trumpCard&&(
                  <div style={{ position:"absolute",top:22,left:-22,transform:"rotate(90deg)",transformOrigin:"center",zIndex:0 }}>
                    <CardFace card={trumpCard} w={52} h={78}/>
                  </div>
                )}
                {remainingCards>0&&(
                  <div style={{ position:"absolute",top:0,left:0,zIndex:1 }}>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute",top:2,left:2,width:64,height:96,borderRadius:7,background:"#001800",border:`1px solid rgba(255,209,0,0.3)` }}/>
                      <CardBack w={64} h={96}/>
                      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:COL.amarillo,fontWeight:"bold",fontSize:15,pointerEvents:"none",textShadow:`0 0 12px rgba(255,209,0,0.8)` }}>{remainingCards}</div>
                    </div>
                  </div>
                )}
                {remainingCards===0&&!trumpCard&&(
                  <div style={{ width:64,height:96,borderRadius:7,border:`2px dashed rgba(255,209,0,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,248,231,0.25)",fontSize:10 }}>vacío</div>
                )}
              </div>
              {trumpSuit&&(
                <div style={{ background:`rgba(0,48,135,0.8)`,padding:"4px 12px",borderRadius:8,border:`2px solid ${COL.amarillo}`,color:COL.amarillo,fontSize:11,textAlign:"center",backdropFilter:"blur(6px)",boxShadow:`0 0 14px rgba(255,209,0,0.25)`,fontWeight:"bold" }}>
                  {trumpSuit==="Oros"?"🟡":trumpSuit==="Copas"?"🔴":trumpSuit==="Espadas"?"🔵":"🟢"} {trumpSuit}
                </div>
              )}
            </div>

            {/* Trick cross */}
            <div ref={trickCenterRef} style={{ position:"relative",width:CW*3+TABLE_GAP,height:CH*3+TABLE_GAP }}>
              {/* Table felt — Colombian green baize with gold border */}
              <div style={{
                position:"absolute",left:CW,top:CH,width:CW+TABLE_GAP,height:CH+TABLE_GAP,borderRadius:14,
                background:`radial-gradient(ellipse at center, rgba(26,122,60,0.5), rgba(0,48,135,0.25))`,
                border:`2.5px solid ${COL.amarillo}`,
                boxShadow:`inset 0 0 22px rgba(0,0,0,0.35), 0 0 20px rgba(255,209,0,0.12)`,
              }}/>
              {/* TOP */}
              <div style={{ position:"absolute",left:"50%",top:0,transform:"translateX(-50%)" }}>
                {topP&&<div ref={(el)=>{ trickSlotRefs.current.top=el; }} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                  <CardSlot card={playedBy(topP.id)} w={CW} h={CH}/>
                  {playedBy(topP.id)&&<span style={{ fontSize:10,color:"rgba(255,248,231,0.7)" }}>{topP.name}</span>}
                </div>}
              </div>
              {/* LEFT */}
              <div style={{ position:"absolute",left:0,top:"50%",transform:"translateY(-50%)" }}>
                {leftP&&<div ref={(el)=>{ trickSlotRefs.current.left=el; }} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                  <CardSlot card={playedBy(leftP.id)} w={CW} h={CH}/>
                  {playedBy(leftP.id)&&<span style={{ fontSize:10,color:"rgba(255,248,231,0.7)" }}>{leftP.name}</span>}
                </div>}
              </div>
              {/* RIGHT */}
              <div style={{ position:"absolute",right:0,top:"50%",transform:"translateY(-50%)" }}>
                {rightP&&<div ref={(el)=>{ trickSlotRefs.current.right=el; }} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                  <CardSlot card={playedBy(rightP.id)} w={CW} h={CH}/>
                  {playedBy(rightP.id)&&<span style={{ fontSize:10,color:"rgba(255,248,231,0.7)" }}>{rightP.name}</span>}
                </div>}
              </div>
              {/* BOTTOM */}
              <div ref={bottomTrickTargetRef} style={{ position:"absolute",left:"50%",bottom:0,transform:"translateX(-50%)" }}>
                {botP&&<div ref={(el)=>{ trickSlotRefs.current.bottom=el; }} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                  <CardSlot card={playedBy(botP.id)} w={CW} h={CH}/>
                  {playedBy(botP.id)&&<span style={{ fontSize:10,color:"rgba(255,248,231,0.7)" }}>{botP.name}</span>}
                </div>}
              </div>

              {/* Center Colombian sun indicator */}
              {trickCardCount===0&&(
                <div style={{
                  position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
                  width:78,height:78,borderRadius:"50%",
                  background:isMyTurn
                    ?`radial-gradient(circle, rgba(255,209,0,0.35), rgba(206,17,38,0.2))`
                    :`radial-gradient(circle, rgba(0,48,135,0.5), rgba(0,18,50,0.6))`,
                  border:`3px solid ${isMyTurn?COL.amarillo:COL.azul}`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
                  boxShadow:isMyTurn?`0 0 32px rgba(255,209,0,0.65), 0 0 10px rgba(206,17,38,0.35)`:`0 0 16px rgba(0,48,135,0.4)`,
                  pointerEvents:"none",transition:"all 0.4s",
                }}>
                  <span style={{ fontSize:20,lineHeight:1,marginBottom:2 }}>{isMyTurn?"🌺":"☕"}</span>
                  <span style={{ fontSize:8,fontWeight:"bold",color:isMyTurn?COL.amarillo:COL.caribe,letterSpacing:1,textTransform:"uppercase",fontFamily:"Georgia,serif" }}>{isMyTurn?"JUEGA":"ESPERA"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TURN MESSAGE */}
        <div style={{ textAlign:"center",padding:"4px 8px",minHeight:28 }}>
          <span style={{
            display:"inline-block",
            background:isMyTurn
              ?`linear-gradient(135deg, rgba(255,209,0,0.3), rgba(206,17,38,0.2))`
              :`rgba(0,48,135,0.65)`,
            backdropFilter:"blur(8px)",
            padding:"5px 22px",borderRadius:22,
            color:isMyTurn?COL.amarillo:COL.caribe,
            fontSize:12,fontStyle:"italic",fontWeight:"bold",
            border:`2px solid ${isMyTurn?COL.amarillo:COL.caribe}88`,
            boxShadow:isMyTurn?`0 0 22px rgba(255,209,0,0.3)`:undefined,
            textShadow:isMyTurn?`0 0 12px rgba(255,209,0,0.6)`:undefined,
            letterSpacing:0.5,
          }}>{msg}</span>
        </div>

        {/* HAND */}
        <div ref={(el)=>{ handSourceRefs.current.bottom=el; }} style={{ display:"flex",justifyContent:"center",gap:10,padding:"4px 0 8px",alignItems:"flex-end" }}>
          {botP?.hand.map(card=>(
            <button key={card.id} onClick={(e)=>handleAnimatedPlayCard(card,e.currentTarget)} disabled={!isMyTurn||isAnimatingPlay}
              className={`hand-card-btn${selectedCardId===card.id?" hand-card-btn--selected":""}`}
              style={{ background:"none",border:"none",padding:0,cursor:isMyTurn&&!isAnimatingPlay?"pointer":"default",filter:isMyTurn&&!isAnimatingPlay?"none":"brightness(0.4) saturate(0.2)",opacity:selectedCardId===card.id?0:1 }}>
              <CardFace card={card} w={78} h={117} highlight={isMyTurn}/>
            </button>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div style={{ display:"flex",flexDirection:"column",background:"rgba(0,0,0,0.7)",borderTop:`2px solid rgba(255,209,0,0.3)` }}>
          <FlagStripe h={5}/>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 14px 5px 74px" }}>
            {botP&&<div ref={(el)=>{ badgeRefs.current.bottom=el; }}><Badge player={botP} isLeader={currentPlayerId===botP.id}/></div>}
            <div style={{ color:`${COL.amarillo}55`,fontSize:10,textAlign:"right",fontFamily:"Georgia,serif" }}>
              {lastHandResult?`Última: ${lastHandResult.winnerName} (+${lastHandResult.points})`:"As·11 · 3·10 · R·4 · C·3 · S·2"}
            </div>
          </div>
        </div>
      </div>

      {/* Restart */}
      <button onClick={()=>window.location.reload()} title="Nueva partida" style={{ position:"fixed",top:12,right:12,zIndex:100,background:`rgba(0,48,135,0.85)`,border:`2px solid ${COL.amarillo}`,color:COL.amarillo,padding:9,borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.4s",backdropFilter:"blur(8px)",boxShadow:`0 0 14px rgba(255,209,0,0.18)` }}
        onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="rotate(180deg)"; el.style.boxShadow=`0 0 24px rgba(255,209,0,0.5), 0 0 8px rgba(206,17,38,0.3)`; }}
        onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="rotate(0deg)"; el.style.boxShadow=`0 0 14px rgba(255,209,0,0.18)`; }}>
        <RotateCcw size={16}/>
      </button>

      {flyingCard&&(
        <div style={{ position:"fixed",left:flyingCard.from.x,top:flyingCard.from.y,width:flyingCard.from.w,height:flyingCard.from.h,pointerEvents:"none",zIndex:90,transform:`translate(${flyingCard.active?flyingCard.delta.x:0}px,${flyingCard.active?flyingCard.delta.y:0}px) scale(${flyingCard.active?0.9:1}) rotate(${flyingCard.active?-4:0}deg)`,transformOrigin:"center",transition:"transform 430ms cubic-bezier(0.22,1,0.36,1), opacity 430ms ease",opacity:flyingCard.active?0.98:1,filter:`drop-shadow(0 12px 22px rgba(255,209,0,0.5))` }}>
          <CardFace card={flyingCard.card} w={flyingCard.from.w} h={flyingCard.from.h} highlight/>
        </div>
      )}

      {opponentFlyingCards.map(anim=>(
        <div key={anim.id} style={{ position:"fixed",left:anim.from.x,top:anim.from.y,width:anim.from.w,height:anim.from.h,pointerEvents:"none",zIndex:88,transform:`translate(${anim.active?anim.delta.x:0}px,${anim.active?anim.delta.y:0}px) scale(${anim.active?anim.scaleTo:1}) rotate(${anim.active?anim.rotateTo:0}deg)`,transformOrigin:"center",transition:`transform ${anim.durationMs}ms cubic-bezier(0.22,1,0.36,1), opacity ${anim.durationMs}ms ease`,opacity:anim.active?anim.fadeTo:1,filter:"drop-shadow(0 10px 20px rgba(0,0,0,0.7))" }}>
          <CardFace card={anim.card} w={anim.from.w} h={anim.from.h}/>
        </div>
      ))}

      {trickCollectCards.map(anim=>(
        <div key={anim.id} style={{ position:"fixed",left:anim.from.x,top:anim.from.y,width:anim.from.w,height:anim.from.h,pointerEvents:"none",zIndex:87,transform:`translate(${anim.active?anim.delta.x:0}px,${anim.active?anim.delta.y:0}px) scale(${anim.active?anim.scaleTo:1}) rotate(${anim.active?anim.rotateTo:0}deg)`,transformOrigin:"center",transition:`transform ${anim.durationMs}ms cubic-bezier(0.2,0.95,0.2,1), opacity ${anim.durationMs}ms ease`,opacity:anim.active?anim.fadeTo:1,filter:"drop-shadow(0 8px 16px rgba(0,0,0,0.6))" }}>
          <CardFace card={anim.card} w={anim.from.w} h={anim.from.h}/>
        </div>
      ))}

      {trickPointsPop&&(
        <div style={{ position:"fixed",left:trickPointsPop.x,top:trickPointsPop.y,zIndex:95,pointerEvents:"none",transform:`translate(-50%,${trickPointsPop.active?"-32px":"0px"}) scale(${trickPointsPop.active?1.15:0.8})`,opacity:trickPointsPop.active?1:0,transition:"transform 460ms cubic-bezier(0.16,1,0.3,1), opacity 460ms ease",fontWeight:900,fontSize:34,background:`linear-gradient(135deg, ${COL.amarillo}, ${COL.rojo})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:`drop-shadow(0 4px 12px rgba(255,209,0,0.7))` }}>
          {trickPointsPop.text}
        </div>
      )}

      <style jsx>{`
        @keyframes cumbia {
          from { transform: scale(1) rotate(-10deg); }
          to   { transform: scale(1.25) rotate(10deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.8); }
        }
        .hand-card-btn {
          transform: translateY(0) scale(1);
          transition: transform 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms ease, opacity 140ms ease;
          will-change: transform;
        }
        .hand-card-btn:not(:disabled):hover {
          transform: translateY(-18px) scale(1.05);
          filter: drop-shadow(0 0 18px rgba(255,209,0,0.7)) drop-shadow(0 0 8px rgba(206,17,38,0.5));
        }
        .hand-card-btn:not(:disabled):active,
        .hand-card-btn--selected {
          transform: translateY(-24px) scale(1.07);
          filter: drop-shadow(0 0 24px rgba(255,209,0,0.9)) drop-shadow(0 0 14px rgba(206,17,38,0.6));
        }
      `}</style>
    </div>
  );
}