"use client";

import React, { useState } from "react";
import "./WaitingRoom.css";

interface PlayerInfo {
  id: string;
  name: string;
  isMe: boolean;
  isBot: boolean;
  ready: boolean;
  initials: string;
  color?: string;
  emoji?: string;
}

interface WaitingAreaProps {
  gameTitle: string;
  gameId: string;
  players: PlayerInfo[];
  maxSeats: number;
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
  onAddBot: (difficulty: string) => void;
  onKick: (id: string) => void;
  onReady: () => void;
  // Brisca specific
  briscaRules?: boolean;
  trumpSuit?: { label: string; glyph: string; color: string };
}

const DIFFICULTIES = [
  { value: "EASY", label: "Suave — pa' calentar" },
  { value: "MEDIUM", label: "Medio — estrategia" },
  { value: "HARD", label: "Duro — pa' los pros" },
];

const ParchCorner = ({ where }: { where: string }) => (
  <svg className={`parch-corner ${where}`} viewBox="0 0 32 32" fill="none">
    <path
      d="M2 30 C 2 14, 14 2, 30 2"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M2 30 C 6 18, 18 6, 30 2"
      stroke="currentColor"
      strokeWidth="0.6"
      fill="none"
      opacity="0.7"
    />
    <circle cx="3" cy="29" r="1.2" fill="currentColor" />
    <circle cx="29" cy="3" r="1.2" fill="currentColor" />
    <path d="M10 22 q 4 -8 12 -12" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5"/>
  </svg>
);

const ParchCorners = () => (
  <>
    <ParchCorner where="tl" />
    <ParchCorner where="tr" />
    <ParchCorner where="bl" />
    <ParchCorner where="br" />
  </>
);

const BrambleBg = () => (
  <svg className="bg-brambles" viewBox="0 0 1440 500" preserveAspectRatio="xMidYEnd slice" fill="none">
    {/* horizon hills */}
    <path d="M0 380 L 200 320 L 380 360 L 560 300 L 760 350 L 980 290 L 1180 340 L 1440 320 L 1440 500 L 0 500 Z"
          fill="#0a1612" opacity="0.6"/>
    <path d="M0 420 L 240 380 L 460 410 L 700 370 L 920 400 L 1180 380 L 1440 410 L 1440 500 L 0 500 Z"
          fill="#08130e" opacity="0.8"/>
    {Array.from({length: 12}).map((_, i) => {
      const x = 60 + i * 120 + (i % 2 === 0 ? 20 : -30);
      const h = 260 + (i * 37) % 140;
      const y = 380 - h + (i % 3) * 20;
      return (
        <g key={i} stroke="#0a1f15" strokeWidth="1.2" opacity="0.85" transform={`translate(${x} ${380})`}>
          <line x1="0" y1="0" x2="0" y2={-h}/>
          {Array.from({length: 9}).map((_, j) => {
            const yy = -j * (h/9) - 12;
            const len = 28 + ((i*j) % 14);
            return <g key={j}>
              <line x1="0" y1={yy} x2={-len} y2={yy - 16}/>
              <line x1="0" y1={yy-4} x2={len} y2={yy - 14}/>
            </g>;
          })}
        </g>
      );
    })}
    {/* fireflies */}
    {[[140,260],[320,310],[600,200],[880,260],[1100,300],[1280,240],[480,360],[760,330]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="2.2" fill="#f5d547" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${2.5 + (i%4)*0.5}s`} repeatCount="indefinite"/>
      </circle>
    ))}
  </svg>
);

export default function WaitingArea({
  gameTitle,
  gameId,
  players,
  maxSeats,
  isHost,
  onStart,
  onLeave,
  onAddBot,
  onKick,
  onReady,
  briscaRules,
  trumpSuit,
}: WaitingAreaProps) {
  const [copied, setCopied] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState("MEDIUM");

  const filledSeats = players.length;
  const minPlayers = 2;
  const canStart = filledSeats >= minPlayers && players.every(p => p.ready || p.isBot);
  const youReady = players.find(p => p.isMe)?.ready;
  const waitingCount = players.filter(p => !p.ready && !p.isBot).length;
  const emptySlots = maxSeats - filledSeats;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    try { navigator.clipboard?.writeText(gameId); } catch {}
  };

  const seatList = Array.from({ length: maxSeats }).map((_, i) => players[i] ?? null);

  return (
    <div className="waiting-room-container">
      {/* Atmosphere */}
      <div className="bg-stage"></div>
      <div className="bg-stars"></div>
      <BrambleBg />

      {/* faded lobby title peeking behind */}
      <div className="lobby-fade">
        <div className="eyebrow-glyph">✦ CANTINA DE {gameTitle} ✦</div>
        <h1>Busca <em>compañero</em></h1>
      </div>

      {/* scrim */}
      <div className="scrim"></div>

      {/* modal */}
      <div className="modal-wrap">
        <div className="modal">
          {trumpSuit && (
            <div className="trump-card" title={`Pinta de triunfo: ${trumpSuit.label}`}>
              <span className="suit" style={{ color: trumpSuit.color }}>{trumpSuit.glyph}</span>
              <span className="pinta-label">Pinta · {trumpSuit.label}</span>
            </div>
          )}

          <ParchCorners />

          <div className="modal-inner">
            {/* header */}
            <div className="m-head">
              <div className="m-eyebrow">Sala de {gameTitle.toLowerCase()}</div>
              <button className="close-btn" onClick={onLeave} aria-label="Salir">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3 L 11 11 M 11 3 L 3 11"/>
                </svg>
              </button>
            </div>

            <h2 className="m-title">{gameTitle === "BRISCA" ? "Cantina de Brisca" : "Mesa de Parqués"}</h2>
            <p className="m-sub">
              Mesa abierta · cualquiera se sienta
            </p>

            {/* code strip */}
            <div className="code-strip">
              <div>
                <div className="label">Código de mesa</div>
                <div className="code">{gameId}</div>
              </div>
              <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>

            {/* players */}
            <div className="players-head">
              <div className="lbl">Jugadores</div>
              <div className="count"><em>{filledSeats}</em> / {maxSeats} en la mesa</div>
            </div>
            <div className="players-row" style={{ gridTemplateColumns: `repeat(${maxSeats}, 1fr)` }}>
              {seatList.map((p, i) => (
                <Seat
                  key={p?.id ?? `empty-${i}`}
                  player={p}
                  isYou={p?.isMe}
                  onAddBot={() => onAddBot(botDifficulty)}
                  onKick={() => p && onKick(p.id)}
                  isHost={isHost}
                />
              ))}
            </div>

            {/* banner */}
            <div className={`banner ${canStart ? "ready" : ""}`}>
              <span className="pulse"></span>
              {canStart ? (
                <span><strong>Todos en su puesto.</strong> Repartí cuando quieras, parcero.</span>
              ) : filledSeats < minPlayers ? (
                <span><strong>Faltan {minPlayers - filledSeats} pa' arrancar.</strong> Invitá o sentá un bot.</span>
              ) : (
                <span><strong>{waitingCount} sin marcar listo.</strong> Aguantamos a que confirmen.</span>
              )}
            </div>

            {/* bot picker */}
            {isHost && emptySlots > 0 && (
              <>
                <div className="section-title">Agregar bot</div>
                <div className="bot-row">
                  <div className="diff-select-wrap">
                    <select className="diff-select" value={botDifficulty} onChange={(e) => setBotDifficulty(e.target.value)}>
                      {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <button className="add-bot-btn" onClick={() => onAddBot(botDifficulty)}>+ Sentar bot</button>
                </div>
                <div className="bot-foot">Las ganancias se reducen al <strong style={{color:"var(--parch-ink)"}}>50%</strong> en partidas con bots.</div>
              </>
            )}

            {/* rules */}
            {briscaRules && (
              <div className="rules-block">
                <div className="section-title">Reglas</div>
                <div className="rules-pills">
                  <span className="pill">As <span className="v">11</span></span>
                  <span className="pill">Tres <span className="v">10</span></span>
                  <span className="pill">Rey <span className="v">4</span></span>
                  <span className="pill">Caballo <span className="v">3</span></span>
                  <span className="pill">Sota <span className="v">2</span></span>
                </div>
                <div className="rules-foot">
                  Pinta de triunfo: <strong>{trumpSuit?.label || "Oros"}</strong>. Gana cualquier carta de otro palo. No hay obligación de seguir palo.
                </div>
              </div>
            )}

            {/* actions */}
            <div className="actions">
              <button className="btn-ghost" onClick={onLeave}>Salir</button>
              {isHost ? (
                <button
                  className={`btn-primary ${canStart ? "go" : ""}`}
                  disabled={!canStart}
                  onClick={onStart}
                >
                  {canStart
                    ? <><span>⚂</span> Repartir mesa</>
                    : <>Faltan jugadores</>}
                </button>
              ) : (
                <button
                  className={`btn-primary ${youReady ? "go" : ""}`}
                  onClick={onReady}
                >
                  {youReady
                    ? <>✓ Listo · esperando</>
                    : <>Estoy listo</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Seat = ({ player, isYou, onAddBot, onKick, isHost }: { player: PlayerInfo | null; isYou: boolean; onAddBot: () => void; onKick: () => void; isHost: boolean }) => {
  if (!player) {
    return (
      <button className="seat empty" onClick={isHost ? onAddBot : undefined} aria-label="Asiento libre">
        <div className="seat-avatar empty">
          <span className="plus">+</span>
        </div>
        <div className="seat-name empty">Libre</div>
        <div className="seat-meta">{isHost ? "sentar bot" : "esperando..."}</div>
      </button>
    );
  }
  const stateClass = player.isBot ? "bot" : (isYou ? "you" : "");
  return (
    <div className={`seat ${isYou ? "you" : ""}`}>
      {player.isBot && isHost && (
        <button className="seat-kick" onClick={onKick} title="Quitar bot">✕</button>
      )}
      <div className={`seat-avatar ${stateClass}`}>
        {player.isBot
          ? <span className="bot-glyph">🤖</span>
          : <span className="initials">{player.initials}</span>}
        <span className={`status-dot ${player.ready || player.isBot ? "" : "waiting"}`}></span>
      </div>
      <div className="seat-name">{player.name.split(" ")[0]}</div>
      <div className={`seat-meta ${player.ready || player.isBot ? "ready" : ""}`}>
        {isYou
          ? <span className="you-tag">VOS</span>
          : player.isBot
            ? <span>BOT</span>
            : (player.ready ? <span>LISTO</span> : <span>ESPERA</span>)}
      </div>
    </div>
  );
};
