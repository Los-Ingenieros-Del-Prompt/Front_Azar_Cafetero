"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import ParquesBoard from "@/components/parques/ParquesBoard";
import { GameControls } from "@/components/parques/GameControls";
import {
  useParquesWebSocket,
  GameStateDTO,
  PlayerDTO,
  PieceDTO,
} from "@/hooks/useParquesWebSocket";

// ─── Posiciones del tablero (viewBox 0-100) ─────────────────────────────────
export const CELL_POSITIONS: [number, number][] = [
  [20.21, 62.06], // 0
  [25.05, 61.65], // 1
  [29.38, 62.27], // 2
  [34.02, 61.03], // 3
  [37.94, 64.85], // 4
  [37.42, 69.69], // 5
  [37.63, 74.54], // 6
  [37.11, 79.18], // 7
  [37.42, 83.71], // 8
  [37.53, 88.25], // 9
  [37.32, 92.58], // 10
  [37.11, 97.01], // 11
  [48.14, 97.01], // 12
  [60.93, 97.11], // 13
  [61.24, 92.47], // 14
  [61.24, 87.42], // 15
  [62.27, 83.61], // 16
  [61.34, 78.97], // 17
  [61.44, 74.54], // 18
  [61.34, 69.90], // 19
  [61.24, 65.57], // 20
  [65.15, 61.03], // 21
  [70.41, 61.34], // 22
  [75.05, 61.34], // 23
  [78.35, 61.44], // 24
  [83.30, 60.93], // 25
  [87.73, 61.96], // 26
  [92.78, 61.96], // 27
  [96.70, 61.55], // 28
  [97.01, 49.69], // 29
  [97.53, 37.94], // 30
  [92.16, 37.01], // 31
  [87.63, 37.63], // 32
  [83.61, 36.49], // 33
  [79.38, 37.73], // 34
  [73.71, 37.94], // 35
  [69.69, 38.45], // 36
  [65.67, 38.87], // 37
  [60.72, 34.23], // 38
  [61.03, 29.69], // 39
  [61.44, 24.85], // 40
  [61.44, 20.52], // 41
  [61.44, 16.08], // 42
  [60.93, 11.55], // 43
  [61.44,  6.60], // 44
  [61.03,  3.09], // 45
  [49.79,  2.78], // 46
  [37.63,  2.78], // 47
  [37.42,  7.01], // 48
  [37.32, 11.24], // 49
  [37.53, 15.67], // 50
  [38.45, 19.90], // 51
  [38.56, 25.98], // 52
  [38.35, 29.48], // 53
  [39.38, 33.92], // 54
  [33.92, 38.14], // 55
  [29.90, 38.04], // 56
  [25.15, 38.14], // 57
  [20.62, 37.94], // 58
  [15.88, 38.45], // 59
  [11.75, 38.04], // 60
  [ 6.49, 37.84], // 61
  [ 2.16, 36.91], // 62
  [ 2.58, 49.07], // 63
  [ 2.58, 62.27], // 64
  [ 6.29, 61.75], // 65
  [11.44, 61.96], // 66
  [15.77, 61.96], // 67
];

export const JAIL_POSITIONS: Record<string, [number, number][]> = {
  ROJO:     [[7.84, 9.07],   [24.12, 8.45],  [8.25, 24.12],  [23.61, 24.54]],
  AMARILLO: [[76.08, 8.04],  [91.24, 8.14],  [75.36, 23.92], [91.03, 23.81]],
  VERDE:    [[8.14, 75.46],  [23.71, 75.26], [7.94, 91.34],  [24.33, 91.55]],
  AZUL:     [[75.57, 75.36], [91.86, 74.95], [75.77, 90.31], [91.44, 90.72]],
};

export const PIECE_COLORS: Record<string, string> = {
  AMARILLO: "#facc15",
  AZUL:     "#3b82f6",
  ROJO:     "#ef4444",
  VERDE:    "#22c55e",
};

export const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  AMARILLO: { bg: "bg-yellow-500/20",  border: "border-yellow-400",  text: "text-yellow-300",  hex: "#facc15" },
  AZUL:     { bg: "bg-blue-500/20",    border: "border-blue-400",    text: "text-blue-300",    hex: "#3b82f6" },
  ROJO:     { bg: "bg-red-500/20",     border: "border-red-400",     text: "text-red-300",     hex: "#ef4444" },
  VERDE:    { bg: "bg-emerald-500/20", border: "border-emerald-400", text: "text-emerald-300", hex: "#22c55e" },
};

export const COLOR_EMOJI: Record<string, string> = {
  AMARILLO: "🟡", AZUL: "🔵", ROJO: "🔴", VERDE: "🟢",
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface ParquesMultiplayerProps {
  gameId?: string;
  userName?: string;
  userId?: string;
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function ParquesMultiplayer({
  gameId: propGameId,
  userName,
  userId,
}: ParquesMultiplayerProps) {
  const router = useRouter();
  const { user } = useUserContext();

  const [playerId] = useState(
    () => userId || user?.userId || `player-${Math.random().toString(36).slice(2, 8)}`
  );
  const [playerName] = useState(
    () => userName || user?.name || `Jugador${Math.floor(Math.random() * 1000)}`
  );
  const [gameId] = useState(() => propGameId || "parques-game-1");

  const hasJoinedRef = useRef(false);

  const {
    isConnected, connectionStatus, error, gameState,
    connect, subscribeToGame, createGame, joinGame, rollDice, movePiece,
  } = useParquesWebSocket({ onError: (err) => console.error("[Parqués] WS error:", err) });

  // 1. Conectar al montar
  useEffect(() => { connect(); }, [connect]);

  // 2. Suscribirse y crear partida al conectar
  useEffect(() => {
    if (!isConnected || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    subscribeToGame(gameId);
    const init = async () => {
      try { await createGame(gameId, [{ id: playerId, name: playerName }]); }
      catch (e) { console.log("[Parqués] createGame:", e); }
      joinGame(gameId, playerId, playerName);
    };
    init();
  }, [isConnected]); // eslint-disable-line

  // ─── Datos derivados ────────────────────────────────────────────────────
  const isMyTurn = gameState?.currentPlayerId === playerId;
  const myPlayer = gameState?.players.find((p) => p.id === playerId) ?? null;
  const canRoll  = isMyTurn && !gameState?.diceRolled && (gameState?.players.length ?? 0) >= 2;

  const movablePieces = useMemo<PieceDTO[]>(() => {
    if (!gameState?.diceRolled || !isMyTurn || !myPlayer) return [];
    return myPlayer.pieces.filter((piece) => {
      if (piece.atHome) return false;
      if (piece.inJail) return gameState.jailExitAvailable;
      return piece.relativePosition + gameState.moveValue <= 68;
    });
  }, [gameState, isMyTurn, myPlayer]);

  const handleRollDice  = () => { if (canRoll) rollDice(gameId, playerId); };
  const handleMovePiece = (pieceId: string) => {
    if (gameState?.diceRolled && isMyTurn) movePiece(gameId, playerId, pieceId);
  };

  // ─── SVG de fichas ──────────────────────────────────────────────────────
  const FichasSVG = (
    <svg
      viewBox="0 0 100 100"
      style={{ width: "100%", height: "100%" }}
    >
      {gameState?.players.map((player) =>
        player.pieces.map((piece, pieceIndex) => {
          let cx: number, cy: number;

          if (piece.inJail) {
            const pos = JAIL_POSITIONS[player.color]?.[pieceIndex];
            if (!pos) return null;
            [cx, cy] = pos;
          } else if (piece.atHome) {
            return null;
          } else {
            const pos = CELL_POSITIONS[piece.absolutePosition];
            if (!pos) return null;
            [cx, cy] = pos;
          }

          const isMovable = movablePieces.some((p) => p.id === piece.id);
          const color     = PIECE_COLORS[player.color] ?? "#ffffff";

          return (
            <g
              key={piece.id}
              onClick={() => isMovable && handleMovePiece(piece.id)}
              style={{ cursor: isMovable ? "pointer" : "default" }}
            >
              {/* Sombra */}
              <circle cx={cx + 0.3} cy={cy + 0.4} r={2.2} fill="rgba(0,0,0,0.35)" />
              {/* Ficha */}
              <circle
                cx={cx} cy={cy} r={2.2}
                fill={color}
                stroke={isMovable ? "white" : "rgba(0,0,0,0.5)"}
                strokeWidth={isMovable ? 0.7 : 0.35}
              />
              {/* Brillo */}
              <circle cx={cx - 0.65} cy={cy - 0.65} r={0.75} fill="rgba(255,255,255,0.55)" />
              {/* Anillo cuando es movible */}
              {isMovable && (
                <circle
                  cx={cx} cy={cy} r={2.9}
                  fill="none"
                  stroke="white"
                  strokeWidth={0.45}
                  opacity={0.7}
                />
              )}
            </g>
          );
        })
      )}
    </svg>
  );

  // ═══════════════════════════════════════
  // PANTALLA: Conectando
  // ═══════════════════════════════════════
  if (connectionStatus !== "connected") {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden">
        <ParquesBoard />
        <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center p-10 rounded-2xl border border-emerald-500/40 bg-black/70 max-w-sm">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-emerald-400 mb-2">Conectando...</h2>
            <p className="text-white/40 text-sm">Mesa: {gameId}</p>
            {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // PANTALLA: Sala de espera
  // ═══════════════════════════════════════
  if (!gameState || gameState.players.length < 2) {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden">
        <ParquesBoard />
        <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center p-10 rounded-2xl border-2 border-emerald-500/40 bg-black/80 max-w-md w-full mx-4">
            <div className="text-5xl mb-4">🎲</div>
            <h1 className="text-4xl font-black text-emerald-400 tracking-wider mb-1">PARQUÉS</h1>
            <p className="text-white/40 text-xs mb-6 tracking-widest uppercase">Mesa: {gameId}</p>
            <div className="mb-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                Jugadores ({gameState?.players.length ?? 1}/4)
              </p>
              <div className="flex flex-col gap-2">
                {(gameState?.players ?? []).map((p: PlayerDTO) => {
                  const s = COLOR_STYLES[p.color] ?? COLOR_STYLES.VERDE;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${s.border} ${s.bg}`}
                    >
                      <span className={`font-bold text-sm ${s.text}`}>
                        {COLOR_EMOJI[p.color]} {p.name}{p.id === playerId && " (Tú)"}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  );
                })}
                <div className="px-4 py-3 rounded-xl border border-dashed border-white/20 text-white/30 text-sm">
                  Esperando más jugadores...
                </div>
              </div>
            </div>
            <p className="text-white/30 text-sm">Se necesitan al menos 2 jugadores</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // PANTALLA: Fin de partida
  // ═══════════════════════════════════════
  if (gameState.finished) {
    const winnerPlayer = gameState.players.find((p) => p.id === gameState.winnerId);
    const ws = winnerPlayer ? COLOR_STYLES[winnerPlayer.color] : COLOR_STYLES.VERDE;
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden">
        <ParquesBoard />
        <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center p-10 rounded-2xl border-2 border-emerald-500/50 bg-black/90 max-w-md w-full mx-4">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-4 uppercase tracking-widest">
              ¡Partida Terminada!
            </h2>
            {winnerPlayer && (
              <p className={`text-xl mb-6 ${ws.text}`}>
                {COLOR_EMOJI[winnerPlayer.color]} <strong>{winnerPlayer.name}</strong>
                {winnerPlayer.id === playerId && " (Tú)"} gana
              </p>
            )}
            <div className="flex flex-col gap-2 mb-6">
              {[...gameState.players]
                .sort(
                  (a, b) =>
                    b.pieces.filter((p) => p.atHome).length -
                    a.pieces.filter((p) => p.atHome).length
                )
                .map((p) => {
                  const s = COLOR_STYLES[p.color];
                  return (
                    <div
                      key={p.id}
                      className={`flex justify-between items-center px-4 py-2 rounded-lg border ${s.border} ${s.bg}`}
                    >
                      <span className={`font-bold text-sm ${s.text}`}>
                        {COLOR_EMOJI[p.color]} {p.name}{p.id === playerId && " (Tú)"}
                      </span>
                      <span className="text-white/60 text-sm">
                        {p.pieces.filter((pc) => pc.atHome).length}/4 🏠
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition"
              >
                Revancha
              </button>
              <button
                onClick={() => router.push("/parques")}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // PANTALLA: Juego en curso
  // ═══════════════════════════════════════

  const opponents   = gameState.players.filter((p) => p.id !== playerId);
  const topPlayer   = opponents[0] ?? null;
  const leftPlayer  = opponents[1] ?? null;
  const rightPlayer = opponents[2] ?? null;

  return (
    <div
      className="relative w-full text-white overflow-hidden"
      style={{ height: "100vh", display: "flex", flexDirection: "column", userSelect: "none" }}
    >
      {/* Tablero con fichas como children */}
      <ParquesBoard>{FichasSVG}</ParquesBoard>

      <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />

      {/* UI encima del tablero */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden pointer-events-none">

        {/* Banner de error */}
        {error && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-red-900/80 border border-red-500 text-red-200 text-sm font-bold backdrop-blur-sm"
            style={{ pointerEvents: "auto" }}
          >
            {error}
          </div>
        )}

        {/* ── Jugador de arriba ── */}
        <div
          className="flex justify-center pt-3 pb-1 min-h-[48px] items-center"
          style={{ pointerEvents: "auto" }}
        >
          {topPlayer && (
            <PlayerBadge
              player={topPlayer}
              isLeader={gameState.currentPlayerId === topPlayer.id}
            />
          )}
        </div>

        {/* ── Espacio central (el tablero ocupa el fondo) ── */}
        <div className="flex-1" />

        {/* ── Indicador de turno ── */}
        <div className="text-center py-2" style={{ pointerEvents: "none" }}>
          <span
            className="inline-block px-5 py-2 rounded-full text-sm font-bold"
            style={{
              background: isMyTurn ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.55)",
              border:     `2px solid ${isMyTurn ? "#10b981" : "rgba(255,255,255,0.15)"}`,
              color:      isMyTurn ? "#10b981" : "rgba(255,255,255,0.5)",
            }}
          >
            {isMyTurn
              ? gameState.diceRolled
                ? `Mueve una ficha (valor: ${gameState.moveValue})`
                : "¡Tu turno! Lanza el dado"
              : `Turno de ${gameState.players.find((p) => p.id === gameState.currentPlayerId)?.name ?? "..."}`}
          </span>
        </div>

        {/* ── Barra inferior ── */}
        <div
          className="flex items-center justify-between px-6 py-3 bg-black/60 border-t border-white/10 pl-20 gap-3 flex-wrap"
          style={{ pointerEvents: "auto" }}
        >
          {/* Mi badge */}
          {myPlayer && (
            <PlayerBadge player={myPlayer} isLeader={isMyTurn} isMe />
          )}

          {/* Dados */}
          {gameState.diceRolled && (
            <div className="flex items-center gap-2 text-2xl">
              <span>{getDiceEmoji(gameState.die1)}</span>
              <span>{getDiceEmoji(gameState.die2)}</span>
              {gameState.die1 === gameState.die2 && (
                <span className="text-yellow-400 text-xs font-bold ml-1">PAREJA</span>
              )}
              {gameState.jailExitAvailable && (
                <span className="text-emerald-400 text-xs font-bold ml-1">SALE CÁRCEL</span>
              )}
            </div>
          )}

          {/* Botones de fichas movibles */}
          {gameState.diceRolled && isMyTurn && movablePieces.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {movablePieces.map((piece, i) => {
                const color = PIECE_COLORS[myPlayer?.color ?? "VERDE"];
                return (
                  <button
                    key={piece.id}
                    onClick={() => handleMovePiece(piece.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border border-white/30 bg-white/10 hover:bg-white/20 active:scale-95 transition"
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 10, height: 10,
                        borderRadius: "50%",
                        background: color,
                        border: "1.5px solid white",
                      }}
                    />
                    Ficha {i + 1}
                    <span className="opacity-50 ml-1">
                      {piece.inJail ? "🔒" : `pos.${piece.relativePosition}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {gameState.diceRolled && isMyTurn && movablePieces.length === 0 && (
            <p className="text-white/40 text-xs">Sin fichas movibles este turno</p>
          )}

          {/* Botón dado */}
          {canRoll && (
            <button
              onClick={handleRollDice}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-lg"
            >
              🎲 Lanzar
            </button>
          )}

          {/* Badges rivales (esquinas) */}
          <div className="flex gap-2 ml-auto">
            {leftPlayer && (
              <PlayerBadge
                player={leftPlayer}
                isLeader={gameState.currentPlayerId === leftPlayer.id}
              />
            )}
            {rightPlayer && (
              <PlayerBadge
                player={rightPlayer}
                isLeader={gameState.currentPlayerId === rightPlayer.id}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Badge de jugador ─────────────────────────────────────────────────────────
function PlayerBadge({
  player,
  isLeader,
  isMe = false,
}: {
  player: PlayerDTO;
  isLeader: boolean;
  isMe?: boolean;
}) {
  const s          = COLOR_STYLES[player.color] ?? COLOR_STYLES.VERDE;
  const homePieces = player.pieces.filter((p) => p.atHome).length;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm ${s.border} ${s.bg}`}
    >
      <span className="text-base leading-none">{COLOR_EMOJI[player.color]}</span>
      <div className="flex flex-col min-w-0">
        <span className={`text-xs font-bold leading-tight truncate max-w-[100px] ${s.text}`}>
          {player.name}{isMe && " (Tú)"}
        </span>
        <span className="text-white/40 text-[10px] leading-tight whitespace-nowrap">
          {homePieces}/4 🏠{isLeader ? " ⭐" : ""}
        </span>
      </div>
    </div>
  );
}

// ─── Emoji de dado ────────────────────────────────────────────────────────────
function getDiceEmoji(n: number): string {
  return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n] ?? "🎲";
}
