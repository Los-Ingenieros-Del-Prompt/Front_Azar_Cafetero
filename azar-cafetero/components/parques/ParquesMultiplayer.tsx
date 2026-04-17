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

// ─── Estilos por color ─────────────────────────────────────────────────────────
export const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  AMARILLO: { bg: "bg-yellow-500/20",  border: "border-yellow-400",  text: "text-yellow-300",  hex: "#facc15" },
  AZUL:     { bg: "bg-blue-500/20",    border: "border-blue-400",    text: "text-blue-300",    hex: "#60a5fa" },
  ROJO:     { bg: "bg-red-500/20",     border: "border-red-400",     text: "text-red-300",     hex: "#f87171" },
  VERDE:    { bg: "bg-emerald-500/20", border: "border-emerald-400", text: "text-emerald-300", hex: "#34d399" },
};
export const COLOR_EMOJI: Record<string, string> = {
  AMARILLO: "🟡", AZUL: "🔵", ROJO: "🔴", VERDE: "🟢",
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ParquesMultiplayerProps {
  gameId?: string;
  userName?: string;
  userId?: string;
}

// ─── Componente ────────────────────────────────────────────────────────────────
export default function ParquesMultiplayer({ gameId: propGameId, userName, userId }: ParquesMultiplayerProps) {
  const router = useRouter();
  const { user } = useUserContext();

  const [playerId] = useState(() => userId || user?.userId || `player-${Math.random().toString(36).slice(2, 8)}`);
  const [playerName] = useState(() => userName || user?.name || `Jugador${Math.floor(Math.random() * 1000)}`);
  const [gameId] = useState(() => propGameId || "parques-game-1");

  const hasJoinedRef = useRef(false);

  const { isConnected, connectionStatus, error, gameState, connect, subscribeToGame, createGame, rollDice, movePiece } =
    useParquesWebSocket({ onError: (err) => console.error("[Parqués] WS error:", err) });

  // 1. Conectar al montar
  useEffect(() => { connect(); }, [connect]);

  // 2. Cuando conecta: suscribirse al topic y crear partida
  useEffect(() => {
    if (!isConnected || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    subscribeToGame(gameId);
    createGame([{ id: playerId, name: playerName }]).catch(console.error);
  }, [isConnected]); // eslint-disable-line

  // ─── Datos derivados ──────────────────────────────────────────────────────
  const isMyTurn = gameState?.currentPlayerId === playerId;
  const myPlayer = gameState?.players.find((p) => p.id === playerId) ?? null;
  const canRoll = isMyTurn && !gameState?.diceRolled && (gameState?.players.length ?? 0) >= 2;

  // Fichas que se pueden mover después de tirar el dado
  const movablePieces = useMemo<PieceDTO[]>(() => {
    if (!gameState?.diceRolled || !isMyTurn || !myPlayer) return [];
    return myPlayer.pieces.filter((piece) => {
      if (piece.atHome) return false;
      if (piece.inJail) return gameState.jailExitAvailable;
      return piece.relativePosition + gameState.moveValue <= 68;
    });
  }, [gameState, isMyTurn, myPlayer]);

  const handleRollDice = () => { if (canRoll) rollDice(gameId, playerId); };
  const handleMovePiece = (pieceId: string) => { if (gameState?.diceRolled && isMyTurn) movePiece(gameId, playerId, pieceId); };

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Conectando
  // ═══════════════════════════════════════════════════════════════════════════
  if (connectionStatus !== "connected") {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <ParquesBoard />
        <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />
        {/* ▼ DISEÑO LIBRE ▼ */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center p-10 rounded-2xl border border-emerald-500/40 bg-black/70 max-w-sm">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-emerald-400 mb-2">Conectando...</h2>
            <p className="text-white/40 text-sm">Mesa: {gameId}</p>
            {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
          </div>
        </div>
        {/* ▲ DISEÑO LIBRE ▲ */}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Sala de espera
  // ═══════════════════════════════════════════════════════════════════════════
  if (!gameState || gameState.players.length < 2) {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <ParquesBoard />
        <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />
        {/* ▼ DISEÑO LIBRE ▼ */}
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
                    <div key={p.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${s.border} ${s.bg}`}>
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
            <p className="text-white/30 text-sm">Se necesitan al menos 2 jugadores para iniciar</p>
          </div>
        </div>
        {/* ▲ DISEÑO LIBRE ▲ */}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Fin de partida
  // ═══════════════════════════════════════════════════════════════════════════
  if (gameState.finished) {
    const winnerPlayer = gameState.players.find((p) => p.id === gameState.winnerId);
    const ws = winnerPlayer ? COLOR_STYLES[winnerPlayer.color] : COLOR_STYLES.VERDE;
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <ParquesBoard />
        <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />
        {/* ▼ DISEÑO LIBRE ▼ */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center p-10 rounded-2xl border-2 border-emerald-500/50 bg-black/90 max-w-md w-full mx-4">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-4 uppercase tracking-widest">¡Partida Terminada!</h2>
            {winnerPlayer && (
              <p className={`text-xl mb-6 ${ws.text}`}>
                {COLOR_EMOJI[winnerPlayer.color]} <strong>{winnerPlayer.name}</strong>
                {winnerPlayer.id === playerId && " (Tú)"} gana
              </p>
            )}
            <div className="flex flex-col gap-2 mb-6">
              {[...gameState.players]
                .sort((a, b) => b.pieces.filter((p) => p.atHome).length - a.pieces.filter((p) => p.atHome).length)
                .map((p) => {
                  const s = COLOR_STYLES[p.color];
                  return (
                    <div key={p.id} className={`flex justify-between items-center px-4 py-2 rounded-lg border ${s.border} ${s.bg}`}>
                      <span className={`font-bold text-sm ${s.text}`}>
                        {COLOR_EMOJI[p.color]} {p.name}{p.id === playerId && " (Tú)"}
                      </span>
                      <span className="text-white/60 text-sm">{p.pieces.filter((pc) => pc.atHome).length}/4 🏠</span>
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition">Revancha</button>
              <button onClick={() => router.push("/parques")} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition">Salir</button>
            </div>
          </div>
        </div>
        {/* ▲ DISEÑO LIBRE ▲ */}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Juego en curso
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full text-white overflow-hidden" style={{ height: "100vh", display: "flex", flexDirection: "column", userSelect: "none", background: "#0a1f0a" }}>
      <ParquesBoard />
      <GameControls onMenu={() => router.push("/lobby")} onExit={() => router.push("/")} />

      <div className="relative z-10 flex flex-col h-full overflow-hidden">

        {/* Banner de error de dominio */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-red-900/80 border border-red-500 text-red-200 text-sm font-bold backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* ▼▼▼  ZONA DE DISEÑO LIBRE  ▼▼▼ */}

        {/* Rivales arriba */}
        <div className="flex justify-center pt-4 pb-2 gap-3">
          {gameState.players.filter((p) => p.id !== playerId).map((p) => (
            <OpponentBadge key={p.id} player={p} isLeader={gameState.currentPlayerId === p.id} />
          ))}
        </div>

        {/* Centro — tablero
          DATOS DISPONIBLES para renderizar las fichas:
            gameState.players[i].pieces[j].absolutePosition  → casilla 0-67, -1=cárcel, 68=meta
            gameState.players[i].pieces[j].relativePosition  → relativo al color
            gameState.players[i].color                        → "AMARILLO"|"AZUL"|"ROJO"|"VERDE"
            COLOR_STYLES[color].hex                           → color hex para SVG
        */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-72 h-72 border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/30 text-sm text-center px-4 gap-2">
            <span>Tablero Parqués</span>
            <span className="text-xs">(reemplaza con SVG del tablero)</span>
            <span className="text-xs text-white/20">
              Fichas disponibles via gameState.players[i].pieces[j].absolutePosition
            </span>
          </div>
        </div>

        {/* Indicador de turno */}
        <div className="text-center py-2">
          <span
            className="inline-block px-6 py-2 rounded-full text-sm font-bold"
            style={{
              background: isMyTurn ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.4)",
              border: `2px solid ${isMyTurn ? "#10b981" : "rgba(255,255,255,0.15)"}`,
              color: isMyTurn ? "#10b981" : "rgba(255,255,255,0.5)",
            }}
          >
            {isMyTurn
              ? gameState.diceRolled
                ? `Mueve una ficha (valor: ${gameState.moveValue})`
                : "¡Tu turno! Lanza el dado"
              : `Turno de ${gameState.players.find((p) => p.id === gameState.currentPlayerId)?.name ?? "..."}`}
          </span>
        </div>

        {/* Barra inferior */}
        <div className="flex items-center justify-between px-6 py-3 bg-black/50 border-t border-white/10 pl-20 gap-4">
          {myPlayer && (
            <MyPlayerBadge
              player={myPlayer}
              isLeader={isMyTurn}
              die1={gameState.die1}
              die2={gameState.die2}
              diceRolled={gameState.diceRolled}
            />
          )}

          {/* Fichas movibles */}
          {gameState.diceRolled && isMyTurn && movablePieces.length > 0 && (
            <div className="flex gap-2">
              {movablePieces.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => handleMovePiece(piece.id)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition"
                >
                  Ficha {Number(piece.id.split("-piece-")[1] ?? 0) + 1}
                  <span className="block text-[10px] opacity-70">
                    {piece.inJail ? "Cárcel" : `Rel. ${piece.relativePosition}`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {gameState.diceRolled && isMyTurn && movablePieces.length === 0 && (
            <p className="text-white/40 text-xs">Ninguna ficha puede moverse</p>
          )}

          {/* Resultado del dado */}
          {gameState.diceRolled && (
            <div className="flex items-center gap-2 text-2xl">
              <span>{getDiceEmoji(gameState.die1)}</span>
              <span>{getDiceEmoji(gameState.die2)}</span>
              {gameState.die1 === gameState.die2 && (
                <span className="text-yellow-400 text-xs font-bold">PAREJA</span>
              )}
              {gameState.jailExitAvailable && (
                <span className="text-emerald-400 text-xs font-bold">SALE CÁRCEL</span>
              )}
            </div>
          )}

          {/* Botón dado */}
          {canRoll && (
            <button
              onClick={handleRollDice}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg text-xl"
            >
              🎲 Lanzar
            </button>
          )}
        </div>

        {/* ▲▲▲  FIN ZONA DE DISEÑO LIBRE  ▲▲▲ */}
      </div>
    </div>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function OpponentBadge({ player, isLeader }: { player: PlayerDTO; isLeader: boolean }) {
  const s = COLOR_STYLES[player.color] ?? COLOR_STYLES.VERDE;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${s.border} ${s.bg} backdrop-blur-sm`}>
      <span>{COLOR_EMOJI[player.color]}</span>
      <span className={`text-sm font-bold ${s.text}`}>{player.name}</span>
      <span className="text-white/40 text-xs">{player.pieces.filter((p) => p.atHome).length}/4 🏠</span>
      {isLeader && <span className="text-xs">⭐</span>}
    </div>
  );
}

function MyPlayerBadge({ player, isLeader, die1, die2, diceRolled }: {
  player: PlayerDTO; isLeader: boolean; die1: number; die2: number; diceRolled: boolean;
}) {
  const s = COLOR_STYLES[player.color] ?? COLOR_STYLES.VERDE;
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${s.border} ${s.bg} backdrop-blur-sm`}>
      <span>{COLOR_EMOJI[player.color]}</span>
      <div>
        <p className={`text-sm font-bold ${s.text}`}>{player.name} (Tú)</p>
        <p className="text-white/40 text-xs">
          {player.pieces.filter((p) => p.atHome).length}/4 en meta
          {player.jailAttemptsRemaining > 0 && ` · ${player.jailAttemptsRemaining} int. cárcel`}
          {player.consecutivePairs > 0 && ` · ${player.consecutivePairs} parejas`}
        </p>
      </div>
      {isLeader && <span className="text-xs">⭐</span>}
    </div>
  );
}

function getDiceEmoji(n: number): string {
  return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n] ?? "🎲";
}
