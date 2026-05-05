"use client";
import React from "react";
import ParquesBoard from "@/components/parques/ParquesBoard";
import ParquesPieces from "@/components/parques/ParquesPieces";

// Datos dummy para que el componente no explote
const dummyGameState = {
  id: "test",
  players: [
    { id: "p1", name: "Player 1", color: "AMARILLO", pieces: [], balance: 0, ready: true, consecutivePairs: 0, jailAttempts: 0, hasFinished: false },
  ],
  currentPlayerId: "p1",
  die1: 0,
  die2: 0,
  moveValue: 0,
  jailExitAvailable: false,
  diceRolled: false,
  finished: false,
};

export default function ParquesTestPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="relative w-full max-w-2xl aspect-square bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* El tablero de fondo */}
        <ParquesBoard />
        
        {/* Las piezas y los puntos de debug */}
        <div className="absolute inset-0 px-8">
           <ParquesPieces 
            gameState={dummyGameState as any} 
            isMyTurn={false} 
            movablePieceIds={[]} 
          />
        </div>
      </div>
      
      <div className="fixed top-4 left-4 bg-slate-800 p-4 rounded-xl border border-white/10 text-white max-w-xs shadow-xl">
        <h1 className="text-xl font-bold mb-2">Modo Visualizador</h1>
        <p className="text-sm text-white/60">
          Usa esta página para ajustar las coordenadas en <code>ParquesPieces.tsx</code>. 
          Los cambios se verán reflejados aquí al instante.
        </p>
      </div>
    </div>
  );
}
