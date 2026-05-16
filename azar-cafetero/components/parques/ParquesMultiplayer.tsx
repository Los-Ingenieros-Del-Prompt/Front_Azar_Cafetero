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
import WaitingArea from "@/components/games/WaitingArea";

export const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  ROJO:     { bg: "bg-red-500/20",     border: "border-red-400",     text: "text-red-300",     hex: "#f87171" },
  AMARILLO: { bg: "bg-yellow-500/20",  border: "border-yellow-400",  text: "text-yellow-300",  hex: "#facc15" },
  VERDE:    { bg: "bg-emerald-500/20", border: "border-emerald-400", text: "text-emerald-300", hex: "#34d399" },
  AZUL:     { bg: "bg-blue-500/20",    border: "border-blue-400",    text: "text-blue-300",    hex: "#60a5fa" },
};
export const COLOR_EMOJI: Record<string, string> = {
  ROJO: "🔴", AMARILLO: "🟡", VERDE: "🟢", AZUL: "🔵",
};

const VICTORY_RELATIVE = 70;

interface ParquesMultiplayerProps {
  gameId?: string;
  userName?: string;
  userId?: string;
  onLeaveTable?: (tableId: string, playerId: string, playerName: string) => void;
}

export default function ParquesMultiplayer({ gameId: propGameId, userName, userId, onLeaveTable }: ParquesMultiplayerProps) {
  const router = useRouter();
  const { user } = useUserContext();

  const [playerId] = useState(() => userId || user?.userId || `player-${Math.random().toString(36).slice(2, 8)}`);
  const [playerName] = useState(() => userName || user?.name || `Jugador${Math.floor(Math.random() * 1000)}`);
  const [gameId] = useState(() => propGameId || "parques-game-1");
  const [selectedDiceSelection, setSelectedDiceSelection] = useState<number | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const hasJoinedRef = useRef(false);

  const {
    isConnected, connectionStatus, error, gameState,
    connect, subscribeToGame, createGame, joinGame, startGame,
    rollDice, movePiece, passTurn, exitJail, leaveGame, addBot,
  } = useParquesWebSocket({ onError: (err) => console.error("[Parqués] WS error:", err) });

  const leaveTable = onLeaveTable ?? (() => {});

  const [isAnimatingDice, setIsAnimatingDice] = useState(false);
  const [mixedStateChoice, setMixedStateChoice] = useState<'pending' | 'move' | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const prevMyPiecesRef = useRef<PieceDTO[] | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!gameState) return;
    const myPlayer = gameState.players.find((p) => p.id === playerId);
    if (!myPlayer) return;
    const prevPieces = prevMyPiecesRef.current;
    if (prevPieces) {
      const scored = prevPieces.some((prev) => {
        if (prev.atHome) return false;
        const current = myPlayer.pieces.find((p) => p.id === prev.id);
        return current?.atHome === true;
      });
      if (scored) showToast("🏠 ¡Metiste una ficha!");
      const wasCaptured = prevPieces.some((prev) => {
        if (prev.inJail) return false;
        const current = myPlayer.pieces.find((p) => p.id === prev.id);
        return current?.inJail === true;
      });
      if (wasCaptured) showToast("💀 ¡Te comieron una ficha!");
    }
    prevMyPiecesRef.current = myPlayer.pieces;
  }, [gameState, playerId]);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

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

  const isGameFinished = useMemo(() => {
    if (!gameState) return false;
    return (
      gameState.finished === true ||
      gameState.state === "FINISHED" ||
      (gameState.winnerId != null && gameState.winnerId !== "")
    );
  }, [gameState]);

  const isWaiting = !gameState ||
    gameState.state === "WAITING_FOR_PLAYERS" ||
    (gameState.state === undefined && gameState.players.length < 2);

  useEffect(() => {
    if (gameState?.diceRolled && !isAnimatingDice && isMyTurn && myPlayer) {
      if (gameState.jailExitAvailable && !gameState.die1Used && !gameState.die2Used) {
        const inJailCount = myPlayer.pieces.filter(p => p.inJail).length;
        if (inJailCount === 4) {
          exitJail(gameId, playerId);
        } else if (inJailCount > 0 && inJailCount < 4 && !mixedStateChoice) {
          setMixedStateChoice('pending');
        }
      }
    }
  }, [gameState?.diceRolled, isAnimatingDice, isMyTurn, myPlayer, gameState?.die1Used, gameState?.die2Used, gameState?.jailExitAvailable, mixedStateChoice, gameId, playerId, exitJail]);

  const pieceCanMoveWithSteps = (piece: PieceDTO, steps: number): boolean => {
    if (piece.atHome || piece.inJail) return false;
    return piece.relativePosition + steps <= VICTORY_RELATIVE;
  };

  const hasAnyValidMove = useMemo(() => {
    if (!gameState?.diceRolled || !isMyTurn || !myPlayer) return false;
    if (isGameFinished) return false;
    if (gameState.jailExitAvailable && mixedStateChoice !== 'move' && myPlayer.pieces.some(p => p.inJail)) return true;
    const d1Available = !gameState.die1Used;
    const d2Available = !gameState.die2Used;
    return myPlayer.pieces.some((piece) => {
      if (piece.atHome || piece.inJail) return false;
      return (d1Available && pieceCanMoveWithSteps(piece, gameState.die1)) ||
             (d2Available && pieceCanMoveWithSteps(piece, gameState.die2)) ||
             (d1Available && d2Available && pieceCanMoveWithSteps(piece, gameState.die1 + gameState.die2));
    });
  }, [gameState, isMyTurn, myPlayer, mixedStateChoice, isGameFinished]);

  const movablePieces = useMemo<PieceDTO[]>(() => {
    if (!gameState?.diceRolled || !isMyTurn || !myPlayer || isAnimatingDice || mixedStateChoice === 'pending') return [];
    if (isGameFinished) return [];
    const d1Available = !gameState.die1Used;
    const d2Available = !gameState.die2Used;
    return myPlayer.pieces.filter((piece) => {
      if (piece.atHome || piece.inJail) return false;
      const canMoveD1 = d1Available && pieceCanMoveWithSteps(piece, gameState.die1);
      const canMoveD2 = d2Available && pieceCanMoveWithSteps(piece, gameState.die2);
      const canMoveSum = d1Available && d2Available && pieceCanMoveWithSteps(piece, gameState.die1 + gameState.die2);
      if (selectedDiceSelection === 1) return canMoveD1;
      if (selectedDiceSelection === 2) return canMoveD2;
      if (selectedDiceSelection === 3) return canMoveSum;
      return canMoveD1 || canMoveD2 || canMoveSum;
    });
  }, [gameState, isMyTurn, myPlayer, selectedDiceSelection, isAnimatingDice, mixedStateChoice, isGameFinished]);

  const handleRollDice = () => { if (canRoll) rollDice(gameId, playerId); };

  const handlePieceClick = (pieceId: string) => {
    if (!gameState?.diceRolled || !isMyTurn || isAnimatingDice || mixedStateChoice === 'pending') return;
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
    if (isAnimatingDice || mixedStateChoice === 'pending') return;
    setSelectedDiceSelection(prev => prev === selection ? null : selection);
  };

  const handleStartGame = () => { if (isHost) startGame(gameId); };

  const handleExit = () => {
    leaveGame(gameId, playerId);
    leaveTable(gameId, playerId, playerName);
    router.push("/lobby");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Conectando
  // ═══════════════════════════════════════════════════════════════════════════
  if (connectionStatus !== "connected") {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <ParquesBoard />
        <GameControls onMenu={handleExit} onExit={handleExit} />
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
  // PANTALLA: Fin de partida
  // ═══════════════════════════════════════════════════════════════════════════
  if (isGameFinished && gameState) {
    const winnerId = gameState.winnerId;
    const winnerPlayer = gameState.players.find((p) => p.id === winnerId);
    const ws = winnerPlayer ? COLOR_STYLES[winnerPlayer.color] : COLOR_STYLES.VERDE;
    const isWinner = winnerId === playerId;

    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
        <ParquesBoard />
        {isWinner && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="absolute w-3 h-3 rounded-full opacity-70"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`, background: ["#facc15","#f87171","#34d399","#60a5fa"][i % 4], animation: `fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite` }} />
            ))}
          </div>
        )}
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="text-center p-8 md:p-12 rounded-[2.5rem] border-2 bg-black/90 backdrop-blur-xl max-w-xl w-full shadow-2xl"
            style={{ borderColor: winnerPlayer ? COLOR_STYLES[winnerPlayer.color].hex : "#10b981", boxShadow: `0 0 60px ${winnerPlayer ? COLOR_STYLES[winnerPlayer.color].hex : "#10b981"}44` }}>
            <div className="text-8xl mb-4 inline-block" style={{ filter: "drop-shadow(0 0 20px rgba(250,204,21,0.6))" }}>🏆</div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500/60 font-semibold mb-2">¡Partida terminada!</p>
            {isWinner
              ? <h2 className="text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">¡GANASTE!</h2>
              : <h2 className="text-4xl font-black tracking-tight mb-2 text-white/80">Fin del juego</h2>}
            {winnerPlayer && (
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 mt-4 mb-6 ${ws.bg} ${ws.border}`}>
                <span className="text-2xl">{COLOR_EMOJI[winnerPlayer.color]}</span>
                <div className="text-left">
                  <p className={`font-black text-lg ${ws.text}`}>{winnerPlayer.name}{winnerPlayer.id === playerId && " (Tú)"}</p>
                  <p className="text-white/40 text-xs">{winnerPlayer.pieces.filter((p) => p.atHome).length}/4 fichas en meta</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 mb-8 mt-4">
              {[...gameState.players]
                .sort((a, b) => b.pieces.filter((p) => p.atHome).length - a.pieces.filter((p) => p.atHome).length)
                .map((p, rank) => {
                  const s = COLOR_STYLES[p.color] ?? COLOR_STYLES.VERDE;
                  const isThisWinner = p.id === winnerId;
                  const piecesHome = p.pieces.filter((pc) => pc.atHome).length;
                  return (
                    <div key={p.id} className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all ${isThisWinner ? `${s.border} ${s.bg} border-2` : "border-white/10 bg-white/5"}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${rank === 0 ? "bg-yellow-400 text-black" : "bg-white/10 text-white/50"}`}>{rank + 1}</span>
                        <span className={`font-bold text-sm ${isThisWinner ? s.text : "text-white/70"}`}>{COLOR_EMOJI[p.color]} {p.name}{p.id === playerId && " (Tú)"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full border ${i < piecesHome ? `${s.bg.replace("/20","")} border-current` : "border-white/20 bg-transparent"}`}
                              style={i < piecesHome ? { backgroundColor: s.hex, borderColor: s.hex } : {}} />
                          ))}
                        </div>
                        <span className="text-white/40 text-xs ml-1">{piecesHome}/4</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push("/parques")} className="flex-1 py-4 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/15 text-emerald-400 font-bold text-sm uppercase tracking-widest transition hover:bg-emerald-500/25 hover:border-emerald-400 active:scale-95">🎲 Nueva partida</button>
              <button onClick={() => router.push("/lobby")} className="flex-1 py-4 rounded-2xl border border-white/15 bg-white/5 text-white/60 font-bold text-sm uppercase tracking-widest transition hover:bg-white/10 active:scale-95">🏠 Lobby</button>
            </div>
          </div>
        </div>
        <style>{`@keyframes fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Sala de espera
  // ═══════════════════════════════════════════════════════════════════════════
  if (isWaiting) {
    const playersCount = gameState?.players.length ?? 1;
    const canStart = playersCount >= 2;

    const mappedPlayers = (gameState?.players ?? [{ id: playerId, name: playerName, color: "VERDE" as const }]).map((p: any) => ({
      id: p.id,
      name: p.name,
      isMe: p.id === playerId,
      isBot: p.id.startsWith("BOT_"),
      ready: true, // Parqués starts when host says so
      initials: p.name.substring(0, 2).toUpperCase(),
      color: p.color,
      emoji: COLOR_EMOJI[p.color] || "👤",
    }));

    return (
      <WaitingArea
        gameTitle="PARQUÉS"
        gameId={gameId}
        players={mappedPlayers}
        maxSeats={4}
        isHost={isHost}
        onStart={handleStartGame}
        onLeave={handleExit}
        onAddBot={(diff) => addBot(gameId, diff as any)}
        onKick={(id) => leaveGame(gameId, id)}
        onReady={() => {}} // Parqués doesn't have ready state yet
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLA: Juego en curso
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full text-white overflow-hidden" style={{ height: "100vh", display: "flex", flexDirection: "column", userSelect: "none", background: "#0a1f0a" }}>
      <GameControls onMenu={handleExit} onExit={handleExit} />
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {toast && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl bg-black/85 border border-emerald-400 text-emerald-300 text-base font-bold backdrop-blur-sm text-center shadow-2xl pointer-events-none">
            {toast}
          </div>
        )}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-red-900/80 border border-red-500 text-red-200 text-sm font-bold backdrop-blur-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center pt-4 pb-2 gap-3">
          {gameState.players.filter((p) => p.id !== playerId).map((p) => (
            <OpponentBadge key={p.id} player={p} isLeader={gameState.currentPlayerId === p.id} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: 0 }}>
          <div style={{ position: "relative", width: "min(calc(100vh - 200px), calc(100vw - 120px))", aspectRatio: "1 / 1" }}>
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
        <div className="text-center py-2">
          <span className="inline-block px-6 py-2 rounded-full text-sm font-bold"
            style={{ background: isMyTurn ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.4)", border: `2px solid ${isMyTurn ? "#10b981" : "rgba(255,255,255,0.15)"}`, color: isMyTurn ? "#10b981" : "rgba(255,255,255,0.5)" }}>
            {isMyTurn
              ? gameState.diceRolled ? `Mueve una ficha (valor: ${gameState.moveValue})` : "¡Tu turno! Lanza el dado"
              : `Turno de ${gameState.players.find((p) => p.id === gameState.currentPlayerId)?.name ?? "..."}`}
          </span>
        </div>
        <DiceReveal
          die1={gameState.die1} die2={gameState.die2}
          die1Used={gameState.die1Used} die2Used={gameState.die2Used}
          active={gameState.diceRolled}
          selectedDice={selectedDiceSelection}
          onSelectDice={isMyTurn ? handleSelectDice : () => {}}
        />
        <div className="flex items-center justify-between px-6 py-3 bg-black/50 border-t border-white/10 pl-20 gap-4">
          {myPlayer && (
            <MyPlayerBadge player={myPlayer} isLeader={isMyTurn} die1={gameState.die1} die2={gameState.die2} diceRolled={gameState.diceRolled} />
          )}
          {gameState.diceRolled && isMyTurn && movablePieces.length > 0 && mixedStateChoice !== 'pending' && (
            <div className="absolute bottom-60 right-8 z-40 flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter text-emerald-400 border border-emerald-500/30 shadow-xl">
                {selectedDiceSelection ? "¿Qué ficha quieres mover?" : "Selecciona un dado"}
              </p>
              <div className="flex flex-col gap-2">
                {movablePieces.map((piece) => {
                  const s = COLOR_STYLES[myPlayer?.color ?? "VERDE"];
                  const stepsToVictory = VICTORY_RELATIVE - piece.relativePosition;
                  return (
                    <button key={piece.id} onClick={() => handlePieceClick(piece.id)}
                      className={`group flex items-center gap-4 px-6 py-4 ${s.bg} hover:brightness-125 border-2 ${s.border} rounded-2xl shadow-2xl transition-all duration-200 transform hover:-translate-x-2 active:scale-95 min-w-[200px] backdrop-blur-md`}>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-xl">{COLOR_EMOJI[myPlayer?.color ?? "VERDE"]}</span>
                      </div>
                      <div className="text-left">
                        <span className={`block font-black text-sm ${s.text} uppercase`}>Ficha {Number(piece.id.split("-piece-")[1] ?? 0) + 1}</span>
                        <span className="text-[10px] text-white/50 font-medium">
                          {piece.inJail ? "Liberar de la cárcel" : stepsToVictory <= 7 ? `¡Faltan ${stepsToVictory} para la meta!` : `Pos. ${piece.relativePosition}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {gameState.diceRolled && isMyTurn && mixedStateChoice === 'pending' && !isAnimatingDice && (
            <div className="absolute bottom-60 right-8 z-40 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter text-emerald-400 border border-emerald-500/30 shadow-xl text-center">
                Has sacado par, ¿qué deseas hacer?
              </p>
              <button onClick={() => { exitJail(gameId, playerId); setMixedStateChoice(null); }}
                className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border border-emerald-400">
                Salir de cárcel
              </button>
              <button onClick={() => setMixedStateChoice('move')}
                className="bg-blue-600/90 hover:bg-blue-500 text-white font-black px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border border-blue-400">
                Mover fichas activas
              </button>
            </div>
          )}
          {gameState.diceRolled && isMyTurn && !hasAnyValidMove && !isAnimatingDice && mixedStateChoice !== 'pending' && !isGameFinished && (
            <div className="absolute bottom-60 right-8 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={() => passTurn(gameId, playerId)}
                className="bg-red-600/90 hover:bg-red-500 text-white font-black px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest border border-red-400">
                Sin movimientos válidos — Continuar
              </button>
            </div>
          )}
          {gameState.diceRolled && (
            <div className="flex items-center gap-2 text-2xl">
              <span>{getDiceEmoji(gameState.die1)}</span>
              <span>{getDiceEmoji(gameState.die2)}</span>
              {gameState.die1 === gameState.die2 && <span className="text-yellow-400 text-xs font-bold">PAREJA</span>}
              {gameState.jailExitAvailable && <span className="text-emerald-400 text-xs font-bold">SALE CÁRCEL</span>}
            </div>
          )}
          {canRoll && (
            <div className="absolute bottom-24 right-8 z-40 animate-bounce-slow">
              <button onClick={handleRollDice}
                className="group relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600 text-white rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-white/20">
                <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-5xl mb-1 filter drop-shadow-lg">🎲</span>
                <span className="text-xs font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">Lanzar</span>
                <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/30 -z-10" />
              </button>
            </div>
          )}
        </div>
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

function DiceReveal({ die1, die2, die1Used, die2Used, active, selectedDice, onSelectDice }: {
  die1: number; die2: number; die1Used: boolean; die2Used: boolean; active: boolean;
  selectedDice: number | null; onSelectDice: (d: number) => void;
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
        <div className={`pointer-events-auto cursor-pointer transition-transform ${selectedDice === 1 ? "scale-110 ring-4 ring-emerald-500 rounded-3xl" : "hover:scale-105"} ${die1Used ? "opacity-30 pointer-events-none" : ""}`}
          onClick={() => !rolling && !die1Used && onSelectDice(1)}>
          <DiceBox value={die1} rolling={rolling} used={die1Used} delay="0s" />
        </div>
        {!rolling && !die1Used && !die2Used && (
          <button className={`pointer-events-auto bg-emerald-500/80 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-lg text-xs transition-all ${selectedDice === 3 ? "scale-110 ring-2 ring-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "hover:scale-105"}`}
            onClick={() => onSelectDice(3)}>
            SUMA ({die1 + die2})
          </button>
        )}
        <div className={`pointer-events-auto cursor-pointer transition-transform ${selectedDice === 2 ? "scale-110 ring-4 ring-emerald-500 rounded-3xl" : "hover:scale-105"} ${die2Used ? "opacity-30 pointer-events-none" : ""}`}
          onClick={() => !rolling && !die2Used && onSelectDice(2)}>
          <DiceBox value={die2} rolling={rolling} used={die2Used} delay="0.1s" />
        </div>
        {!rolling && die1 === die2 && die1 > 0 && (
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black px-4 py-1.5 rounded-full shadow-[0_0_25px_rgba(234,179,8,0.5)] animate-bounce text-sm tracking-widest pointer-events-none whitespace-nowrap">
            ¡PAREJA!
          </div>
        )}
      </div>
    </div>
  );
}

function DiceBox({ value, rolling, used, delay }: { value: number; rolling: boolean; used: boolean; delay: string }) {
  return (
    <div className={`relative w-20 h-20 flex items-center justify-center bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border-b-4 border-slate-300 transition-all duration-500 ${rolling ? "animate-spin-dice" : ""} ${used ? "opacity-30 grayscale scale-90" : ""}`}
      style={{ animationDelay: delay }}>
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

function getDiceEmoji(n: number): string {
  return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n] ?? "🎲";
}