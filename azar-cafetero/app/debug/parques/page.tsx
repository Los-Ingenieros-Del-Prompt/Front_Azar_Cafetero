"use client";
import React, { useState, useEffect } from "react";
import ParquesBoard from "@/components/parques/ParquesBoard";
import ParquesPieces from "@/components/parques/ParquesPieces";

// Mock game state to allow ParquesPieces to render without a backend connection
const MOCK_GAME_STATE = {
  gameId: "parques-debug-room",
  players: [
    {
      id: "debug-user-123",
      name: "Debug Admin",
      color: "VERDE",
      pieces: [] // No pieces needed just to see coordinates
    }
  ],
  currentPlayerId: "debug-user-123",
  diceRolled: false,
  die1: 0,
  die2: 0,
  moveValue: 0,
  finished: false,
  winnerId: null,
  die1Used: false,
  die2Used: false,
  jailExitAvailable: false
};

export default function ParquesDebugRoom() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden" style={{ background: "#0a1f0a" }}>
      {/* The Board */}
      <ParquesBoard />

      {/* The Labels/Pieces Layer */}
      <ParquesPieces 
        gameState={MOCK_GAME_STATE as any} 
        isMyTurn={true}
        movablePieceIds={[]}
      />
      
      {/* UI Overlay */}
      <div className="relative z-30 pointer-events-none p-8">
        <h1 className="text-3xl font-black text-emerald-400 uppercase tracking-widest drop-shadow-md">
          Editor de Coordenadas
        </h1>
        <p className="text-white/60 text-sm mt-2 max-w-md pointer-events-auto">
          Presiona <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30 font-mono">Shift + D</span> para mostrar todos los índices de posición.
          <br /><br />
          Esta sala <strong>no requiere conexión al backend</strong>. Úsala para ajustar los valores en <code className="text-yellow-400">ParquesPieces.tsx</code> y ver los cambios en tiempo real.
        </p>
      </div>

      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <div className="bg-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-2xl animate-pulse uppercase tracking-[0.2em]">
          Offline Debug Mode
        </div>
      </div>
    </div>
  );
}
