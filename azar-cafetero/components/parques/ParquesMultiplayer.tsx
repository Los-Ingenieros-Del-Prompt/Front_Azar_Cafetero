"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import ParquesBoard from "@/components/parques/ParquesBoard";
import { GameControls } from "@/components/parques/GameControls";
import {
  useParquesWebSocket,
  PlayerDTO,
  PieceDTO,
} from "@/hooks/useParquesWebSocket";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import ParquesPieces from "./ParquesPieces";

export const COLOR_STYLES: Record<
  string,
  { bg: string; border: string; text: string; hex: string }
> = {
  ROJO:     { bg: "bg-red-500/20",     border: "border-red-400",     text: "text-red-300",     hex: "#f87171" },
  AMARILLO: { bg: "bg-yellow-500/20",  border: "border-yellow-400",  text: "text-yellow-300",  hex: "#facc15" },
  VERDE:    { bg: "bg-emerald-500/20", border: "border-emerald-400", text: "text-emerald-300", hex: "#34d399" },
  AZUL:     { bg: "bg-blue-500/20",    border: "border-blue-400",    text: "text-blue-300",    hex: "#60a5fa" },
};

export const COLOR_EMOJI: Record<string, string> = {
  ROJO: "🔴", AMARILLO: "🟡", VERDE: "🟢", AZUL: "🔵",
};

interface ParquesMultiplayerProps {
  gameId?: string;
  userName?: string;
  userId?: string;
}

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
  const [selectedDiceSelection, setSelectedDiceSelection] = useState<number | null>(null);
  const hasJoinedRef = useRef(false);

  const {
    isConnected, connectionStatus, error, gameState,
    connect, subscribeToGame, createGame, joinGame,
    startGame, rollDice, movePiece, passTurn, exitJail, leaveGame,
  } = useParquesWebSocket({
    onError: (err) => console.error("[Parqués] WS error:", err),
  });

  const { leaveTable } = useGameWebSocket();
  const [isAnimatingDice, setIsAnimatingDice] = useState(false);
  const [mixedStateChoice, setMixedStateChoice] = useState<"pending" | "move" | null>(null);

  useEffect(() => {
    if (!gameState?.diceRolled) {
      setSelectedDiceSelection(null);
      setMixedStateChoice(null);
      setIsAnimatingDice(false);
    } else {
      setIsAnimatingDice(true);
      const timer = setTimeout(() => setIsAnimatingDice(false), 1100);
      return () => clearTimeout(timer);
    }
  }, [gameState?.diceRolled]);

  useEffect(() => { connect(); }, [connect]);

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

  const isMyTurn = gameState?.currentPlayerId === playerId;
  const myPlayer = gameState?.players.find((p) => p.id === playerId) ?? null;
  const isHost = gameState?.players[0]?.id === playerId;
  const canRoll = isMyTurn && !gameState?.diceRolled && (gameState?.players.length ?? 0) >= 2 && !isAnimatingDice;

  const isWaiting =
    !gameState ||
    gameState.state === "WAITING_FOR_PLAYERS" ||
    (gameState.state === undefined && (gameState?.players?.length ?? 0) < 2);

  useEffect(() => {
    if (gameState?.diceRolled && !isAnimatingDice && isMyTurn && myPlayer) {
      if (gameState.jailExitAvailable && !gameState.die1Used && !gameState.die2Used) {
        const inJailCount = myPlayer.pieces.filter((p) => p.inJail).length;
        if (inJailCount === 4) {
          exitJail(gameId, playerId);
        } else if (inJailCount > 0 && inJailCount < 4 && !mixedStateChoice) {
          setMixedStateChoice("pending");
        }
      }
    }
  }, [
    gameState?.diceRolled, isAnimatingDice, isMyTurn, myPlayer,
    gameState?.die1Used, gameState?.die2Used, gameState?.jailExitAvailable,
    mixedStateChoice, gameId, playerId, exitJail,
  ]);

  const movablePieces = useMemo<PieceDTO[]>(() => {
    if (!gameState?.diceRolled || !isMyTurn || !myPlayer || isAnimatingDice || mixedStateChoice === "pending")
      return [];
    const d1Available = !gameState.die1Used;
    const d2Available = !gameState.die2Used;
    return myPlayer.pieces.filter((piece) => {
      if (piece.atHome || piece.inJail) return false;
      const canMoveD1 = d1Available && piece.relativePosition + gameState.die1 <= 68;
      const canMoveD2 = d2Available && piece.relativePosition + gameState.die2 <= 68;
      const canMoveSum = d1Available && d2Available && piece.relativePosition + (gameState.die1 + gameState.die2) <= 68;
      if (selectedDiceSelection === 1) return canMoveD1;
      if (selectedDiceSelection === 2) return canMoveD2;
      if (selectedDiceSelection === 3) return canMoveSum;
      return canMoveD1 || canMoveD2 || canMoveSum;
    });
  }, [gameState, isMyTurn, myPlayer, selectedDiceSelection, isAnimatingDice, mixedStateChoice]);

  const handlePieceClick = (pieceId: string) => {
    if (!gameState?.diceRolled || !isMyTurn || isAnimatingDice || mixedStateChoice === "pending") return;
    const d1Available = !gameState.die1Used;
    const d2Available = !gameState.die2Used;
    let selection = selectedDiceSelection;
    if (!selection) {
      if (d1Available && !d2Available) selection = 1;
      else if (!d1Available && d2Available) selection = 2;
      else return;
    }
    movePiece(gameId, playerId, pieceId, selection);
    setSelectedDiceSelection(null);
  };

  const handleSelectDice = (selection: number) => {
    if (isAnimatingDice || mixedStateChoice === "pending") return;
    setSelectedDiceSelection(selection === selectedDiceSelection ? null : selection);
  };

  const handleStartGame = () => { if (isHost) startGame(gameId); };

  const leaveActions = {
    onMenu: () => { leaveGame(gameId, playerId); leaveTable(gameId, playerId, playerName); router.push("/lobby"); },
    onExit: () => { leaveGame(gameId, playerId); leaveTable(gameId, playerId, playerName); router.push("/lobby"); },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Conectando
  // ═══════════════════════════════════════════════════════════════════════════
  if (connectionStatus !== "connected") {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <GameControls {...leaveActions} />
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Sala de espera
  // ═══════════════════════════════════════════════════════════════════════════
  if (isWaiting) {
    const playersCount = gameState?.players.length ?? 1;
    const canStart = playersCount >= 2;

    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <ParquesBoard />
        <GameControls {...leaveActions} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center p-8 md:p-12 rounded-[2.5rem] border-2 border-emerald-500/30 bg-black/85 backdrop-blur-xl max-w-xl w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 mb-8 animate-pulse">
              <span className="text-6xl">🎲</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tighter mb-2">
              PARQUÉS
            </h1>
            <p className="text-emerald-500/60 text-xs font-black tracking-[0.4em] uppercase mb-10">
              Mesa: {gameId}
            </p>
            <div className="mb-10 text-left">
              <div className="flex items-center justify-between mb-4 px-2">
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Jugadores en línea</p>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {playersCount}/4
                </span>
              </div>
              <div className="grid gap-3">
                {(gameState?.players ?? [{ id: playerId, name: playerName, color: "VERDE" as const }]).map((p: any) => {
                  const s = COLOR_STYLES[p.color] || COLOR_STYLES.VERDE;
                  return (
                    <div key={p.id} className={`group flex items-center justify-between px-5 py-4 rounded-2xl border ${s.border}/40 ${s.bg} backdrop-blur-md transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                          {COLOR_EMOJI[p.color] || "👤"}
                        </div>
                        <div>
                          <span className={`font-black text-sm ${s.text} tracking-tight`}>{p.name}</span>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                            {p.id === playerId ? "¡Eres tú!" : "Listo para jugar"}
                          </p>
                        </div>
                      </div>
                      {p.id === (gameState?.players[0]?.id ?? playerId) && (
                        <span className="text-[10px] font-black text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20 uppercase tracking-tighter">
                          Host ⭐
                        </span>
                      )}
                    </div>
                  );
                })}
                {playersCount < 4 && (
                  <div className="px-5 py-4 rounded-2xl border border-dashed border-white/10 bg-white/5 flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20">?</div>
                    <span className="text-sm font-medium text-white/30 italic">Esperando a la banda...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className={`w-full group relative overflow-hidden py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl ${
                    canStart
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.03] active:scale-95 shadow-emerald-500/25"
                      : "bg-white/10 text-white/20 cursor-not-allowed"
                  }`}
                >
                  {canStart ? (
                    <>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Iniciar Partida
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </>
                  ) : "Faltan jugadores"}
                </button>
              ) : (
                <div className="w-full py-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400/80 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Esperando a que el host inicie...
                </div>
              )}
              {!canStart && (
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  Se requieren al menos 2 jugadores para empezar la rumba
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Partida en curso
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="relative w-full text-white overflow-hidden"
      style={{ height: "100vh", display: "flex", flexDirection: "column", userSelect: "none", background: "#0a1f0a" }}
    >
      {/* SIN <ParquesBoard /> suelto aquí — solo existe dentro del contenedor centrado */}

      <GameControls {...leaveActions} />

      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-red-900/80 border border-red-500 text-red-200 text-sm font-bold backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Rivales arriba */}
        <div className="flex justify-center pt-4 pb-2 gap-3">
          {gameState?.players
            .filter((p) => p.id !== playerId)
            .map((p) => (
              <OpponentBadge key={p.id} player={p} isLeader={gameState.currentPlayerId === p.id} />
            ))}
        </div>

        {/* Centro — tablero + fichas en el mismo SVG */}
        <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: 0 }}>
          <div
            style={{
              position: "relative",
              width: "min(calc(100vh - 200px), calc(100vw - 120px))",
              aspectRatio: "1 / 1",
            }}
          >
            <ParquesBoard>
              {gameState && (
                <ParquesPieces
                  gameState={gameState}
                  isMyTurn={isMyTurn}
                  movablePieceIds={movablePieces.map((p) => p.id)}
                  onPieceClick={handlePieceClick}
                />
              )}
            </ParquesBoard>
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
              ? gameState?.diceRolled ? "Mueve una ficha" : "¡Tu turno! Lanza el dado"
              : `Turno de ${gameState?.players.find((p) => p.id === gameState.currentPlayerId)?.name ?? "..."}`}
          </span>
        </div>

        <DiceReveal
          die1={gameState?.die1 ?? 0}
          die2={gameState?.die2 ?? 0}
          die1Used={gameState?.die1Used ?? false}
          die2Used={gameState?.die2Used ?? false}
          active={gameState?.diceRolled ?? false}
          selectedDice={selectedDiceSelection}
          onSelectDice={isMyTurn ? handleSelectDice : () => {}}
        />
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

function DiceReveal({
  die1, die2, die1Used, die2Used, active, selectedDice, onSelectDice,
}: {
  die1: number; die2: number; die1Used: boolean; die2Used: boolean;
  active: boolean; selectedDice: number | null; onSelectDice: (d: number) => void;
}) {
  const [show, setShow] = useState(false);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      setRolling(true);
      const timer = setTimeout(() => setRolling(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [active]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex gap-6 items-center animate-in zoom-in fade-in duration-500">
        <div
          className={`pointer-events-auto cursor-pointer transition-transform ${selectedDice === 1 ? "scale-110 ring-4 ring-emerald-500 rounded-3xl" : "hover:scale-105"}`}
          onClick={() => !rolling && !die1Used && onSelectDice(1)}
        >
          <DiceBox value={die1} rolling={rolling} used={die1Used} delay="0s" />
        </div>

        {!rolling && !die1Used && !die2Used && (
          <button
            className={`pointer-events-auto bg-emerald-500/80 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-lg text-xs transition-all ${selectedDice === 3 ? "scale-110 ring-2 ring-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "hover:scale-105"}`}
            onClick={() => onSelectDice(3)}
          >
            SUMA ({die1 + die2})
          </button>
        )}

        <div
          className={`pointer-events-auto cursor-pointer transition-transform ${selectedDice === 2 ? "scale-110 ring-4 ring-emerald-500 rounded-3xl" : "hover:scale-105"}`}
          onClick={() => !rolling && !die2Used && onSelectDice(2)}
        >
          <DiceBox value={die2} rolling={rolling} used={die2Used} delay="0.1s" />
        </div>
      </div>
    </div>
  );
}

function DiceBox({ value, rolling, used, delay }: { value: number; rolling: boolean; used: boolean; delay: string }) {
  return (
    <div
      className={`relative w-20 h-20 flex items-center justify-center bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border-b-4 border-slate-300 transition-all duration-500 ${rolling ? "animate-spin-dice" : ""} ${used ? "opacity-30 grayscale scale-90" : ""}`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-1.5 border border-slate-100 rounded-xl opacity-50" />
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-12 h-12">
        {getDiceDots(rolling ? Math.floor(Math.random() * 6) + 1 : value).map((dot, i) => (
          <div key={i} className={`w-full h-full rounded-full ${dot ? "bg-slate-900 shadow-inner" : "bg-transparent"}`} />
        ))}
      </div>
      {!rolling && <div className="absolute -bottom-8 w-full h-3 bg-black/30 blur-lg rounded-full scale-125" />}
    </div>
  );
}

function getDiceDots(n: number): boolean[] {
  const dots = new Array(9).fill(false);
  if (n === 1) dots[4] = true;
  if (n === 2) { dots[0] = true; dots[8] = true; }
  if (n === 3) { dots[0] = true; dots[4] = true; dots[8] = true; }
  if (n === 4) { dots[0] = true; dots[2] = true; dots[6] = true; dots[8] = true; }
  if (n === 5) { dots[0] = true; dots[2] = true; dots[4] = true; dots[6] = true; dots[8] = true; }
  if (n === 6) { dots[0] = true; dots[2] = true; dots[3] = true; dots[5] = true; dots[6] = true; dots[8] = true; }
  return dots;
}
