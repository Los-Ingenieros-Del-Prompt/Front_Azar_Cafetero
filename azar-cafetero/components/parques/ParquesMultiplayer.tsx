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
import ParquesPieces from "./ParquesPieces";

// ─── Estilos por color ─────────────────────────────────────────────────────────
export const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  ROJO:     { bg: "bg-red-500/20",     border: "border-red-400",     text: "text-red-300",     hex: "#f87171" }, // TL
  AMARILLO: { bg: "bg-yellow-500/20",  border: "border-yellow-400",  text: "text-yellow-300",  hex: "#facc15" }, // TR
  VERDE:    { bg: "bg-emerald-500/20", border: "border-emerald-400", text: "text-emerald-300", hex: "#34d399" }, // BL
  AZUL:     { bg: "bg-blue-500/20",    border: "border-blue-400",    text: "text-blue-300",    hex: "#60a5fa" }, // BR
};
export const COLOR_EMOJI: Record<string, string> = {
  ROJO: "🔴", AMARILLO: "🟡", VERDE: "🟢", AZUL: "🔵",
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

  const { isConnected, connectionStatus, error, gameState, connect, subscribeToGame, createGame, joinGame, rollDice, movePiece } =
    useParquesWebSocket({ onError: (err) => console.error("[Parqués] WS error:", err) });

  // 1. Conectar al montar
  useEffect(() => { connect(); }, [connect]);

  // 2. Cuando conecta: suscribirse al topic y crear partida
  useEffect(() => {
    if (!isConnected || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    subscribeToGame(gameId);
    const init = async () => {
      try {
        await createGame(gameId, [{ id: playerId, name: playerName }]);
      } catch (e) {
        console.log("[Parqués] createGame error (puede que ya exista):", e);
      }
      joinGame(gameId, playerId, playerName);
    };
    init();
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

        {/* Centro — tablero */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative w-full max-w-2xl aspect-square px-8">
            {/* Las fichas se renderizan sobre el tablero */}
            {gameState && (
              <ParquesPieces
                gameState={gameState}
                isMyTurn={isMyTurn}
                movablePieceIds={movablePieces.map(p => p.id)}
                onPieceClick={handleMovePiece}
              />
            )}
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

          {/* Panel flotante de selección de fichas */}
          {gameState.diceRolled && isMyTurn && movablePieces.length > 0 && (
            <div className="absolute bottom-60 right-8 z-40 flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter text-emerald-400 border border-emerald-500/30 shadow-xl">
                ¿Qué ficha quieres mover?
              </p>
              <div className="flex flex-col gap-2">
                {movablePieces.map((piece) => {
                  const s = COLOR_STYLES[myPlayer?.color ?? "VERDE"];
                  return (
                    <button
                      key={piece.id}
                      onClick={() => handleMovePiece(piece.id)}
                      className={`group flex items-center gap-4 px-6 py-4 ${s.bg} hover:brightness-125 border-2 ${s.border} rounded-2xl shadow-2xl transition-all duration-200 transform hover:-translate-x-2 active:scale-95 min-w-[200px] backdrop-blur-md`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-xl">{COLOR_EMOJI[myPlayer?.color ?? "VERDE"]}</span>
                      </div>
                      <div className="text-left">
                        <span className={`block font-black text-sm ${s.text} uppercase`}>
                          Ficha {Number(piece.id.split("-piece-")[1] ?? 0) + 1}
                        </span>
                        <span className="text-[10px] text-white/50 font-medium">
                          {piece.inJail ? "Liberar de la cárcel" : `Mover desde pos. ${piece.relativePosition}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
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

          {/* Botón dado flotante para mayor comodidad */}
          {canRoll && (
            <div className="absolute bottom-24 right-8 z-40 animate-bounce-slow">
              <button
                onClick={handleRollDice}
                className="group relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600 text-white rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-white/20"
              >
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-5xl mb-1 filter drop-shadow-lg">🎲</span>
                <span className="text-xs font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">Lanzar</span>
                
                {/* Efecto de pulso externo */}
                <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/30 -z-10" />
              </button>
            </div>
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
