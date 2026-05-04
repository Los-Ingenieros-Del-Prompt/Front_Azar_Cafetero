"use client";
import React from "react";
import { GameStateDTO, PlayerDTO, PieceDTO } from "@/hooks/useParquesWebSocket";
import { COLOR_STYLES } from "./ParquesMultiplayer";

interface ParquesPiecesProps {
  gameState: GameStateDTO;
  onPieceClick?: (pieceId: string) => void;
  isMyTurn: boolean;
  movablePieceIds: string[];
}

/**
 * Mapeo de coordenadas para un tablero de Parqués estándar (1000x1000)
 * Casillas 0-67 (recorrido), -1 (cárcel), 68 (meta)
 */

/**
 * TABLA DE COORDENADAS (EDITAR AQUÍ)
 * El tablero es de 1000x1000.
 * Ajusta x e y para cada casilla.
 */

// Casillas del recorrido (0 a 67)
const PATH_COORDINATES: Record<number, { x: number; y: number }> = {
  0: { x: 550, y: 950 }, 1: { x: 0, y: 0 }, 2: { x: 0, y: 0 }, 3: { x: 0, y: 0 }, 4: { x: 0, y: 0 },
  5: { x: 0, y: 0 }, 6: { x: 0, y: 0 }, 7: { x: 0, y: 0 }, 8: { x: 0, y: 0 }, 9: { x: 0, y: 0 },
  10: { x: 0, y: 0 }, 11: { x: 0, y: 0 }, 12: { x: 0, y: 0 }, 13: { x: 0, y: 0 }, 14: { x: 0, y: 0 },
  15: { x: 0, y: 0 }, 16: { x: 0, y: 0 }, 17: { x: 50, y: 550 }, 18: { x: 0, y: 0 }, 19: { x: 0, y: 0 },
  20: { x: 0, y: 0 }, 21: { x: 0, y: 0 }, 22: { x: 0, y: 0 }, 23: { x: 0, y: 0 }, 24: { x: 0, y: 0 },
  25: { x: 0, y: 0 }, 26: { x: 0, y: 0 }, 27: { x: 0, y: 0 }, 28: { x: 0, y: 0 }, 29: { x: 0, y: 0 },
  30: { x: 0, y: 0 }, 31: { x: 0, y: 0 }, 32: { x: 0, y: 0 }, 33: { x: 0, y: 0 }, 34: { x: 450, y: 50 },
  35: { x: 0, y: 0 }, 36: { x: 0, y: 0 }, 37: { x: 0, y: 0 }, 38: { x: 0, y: 0 }, 39: { x: 0, y: 0 },
  40: { x: 0, y: 0 }, 41: { x: 0, y: 0 }, 42: { x: 0, y: 0 }, 43: { x: 0, y: 0 }, 44: { x: 0, y: 0 },
  45: { x: 0, y: 0 }, 46: { x: 0, y: 0 }, 47: { x: 0, y: 0 }, 48: { x: 0, y: 0 }, 49: { x: 0, y: 0 },
  50: { x: 0, y: 0 }, 51: { x: 950, y: 450 }, 52: { x: 0, y: 0 }, 53: { x: 0, y: 0 }, 54: { x: 0, y: 0 },
  55: { x: 0, y: 0 }, 56: { x: 0, y: 0 }, 57: { x: 0, y: 0 }, 58: { x: 0, y: 0 }, 59: { x: 0, y: 0 },
  60: { x: 0, y: 0 }, 61: { x: 0, y: 0 }, 62: { x: 0, y: 0 }, 63: { x: 0, y: 0 }, 64: { x: 0, y: 0 },
  65: { x: 0, y: 0 }, 66: { x: 0, y: 0 }, 67: { x: 0, y: 0 },
};

// Coordenadas de las cárceles (-1) por color
const JAIL_COORDINATES: Record<string, { x: number; y: number }> = {
  "ROJO":     { x: 180, y: 180 }, // Top Left
  "AMARILLO": { x: 820, y: 180 }, // Top Right
  "VERDE":    { x: 180, y: 820 }, // Bottom Left
  "AZUL":     { x: 820, y: 820 }, // Bottom Right
};

// Coordenadas de las metas (68) por color
const GOAL_COORDINATES: Record<string, { x: number; y: number }> = {
  "ROJO":     { x: 400, y: 500 },
  "AMARILLO": { x: 500, y: 400 },
  "VERDE":    { x: 500, y: 600 },
  "AZUL":     { x: 600, y: 500 },
};

/**
 * Función que obtiene la posición final.
 * No necesitas editar esta lógica, solo la tabla de arriba.
 */
const getPiecePosition = (absolutePosition: number, color: string, pieceIndex: number): { x: number; y: number } => {
  // 1. CÁRCEL
  if (absolutePosition === -1) {
    const base = JAIL_COORDINATES[color] || { x: 500, y: 500 };
    // Offset para que las 4 fichas no se solapen en la cárcel
    const offsets = [
      { dx: -40, dy: -40 }, { dx: 40, dy: -40 },
      { dx: -40, dy: 40 },  { dx: 40, dy: 40 }
    ];
    const off = offsets[pieceIndex % 4];
    return { x: base.x + off.dx, y: base.y + off.dy };
  }

  // 2. META
  if (absolutePosition >= 68) {
    const base = GOAL_COORDINATES[color] || { x: 500, y: 500 };
    // Offset ligero para la meta
    return { x: base.x + (pieceIndex - 1.5) * 10, y: base.y };
  }

  // 3. RECORRIDO (0-67)
  const pos = PATH_COORDINATES[absolutePosition];
  if (pos) return pos;

  // Si no hay coordenadas definidas para esa casilla, fallback al centro
  return { x: 500, y: 500 };
};

export default function ParquesPieces({ gameState, onPieceClick, isMyTurn, movablePieceIds }: ParquesPiecesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg viewBox="0 0 1000 1000" className="w-full h-full">
        {gameState.players.map((player) => (
          player.pieces.map((piece, idx) => {
            const { x, y } = getPiecePosition(piece.absolutePosition, player.color, idx);
            const isMovable = isMyTurn && movablePieceIds.includes(piece.id);
            const colorStyle = COLOR_STYLES[player.color];

            return (
              <g
                key={piece.id}
                className={`transition-all duration-500 ease-out ${isMovable ? "pointer-events-auto cursor-pointer" : ""}`}
                onClick={() => isMovable && onPieceClick?.(piece.id)}
              >
                {/* Sombra de la ficha */}
                <circle cx={x} cy={y + 5} r="18" fill="black" fillOpacity="0.3" />
                
                {/* Cuerpo de la ficha */}
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={colorStyle.hex}
                  stroke="white"
                  strokeWidth="3"
                  className={isMovable ? "animate-pulse" : ""}
                />
                
                {/* Brillo/Detalle superior */}
                <circle cx={x - 5} cy={y - 5} r="6" fill="white" fillOpacity="0.4" />
                
                {/* Indicador de "clicable" */}
                {isMovable && (
                  <circle
                    cx={x}
                    cy={y}
                    r="25"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-[spin_4s_linear_infinite]"
                  />
                )}
              </g>
            );
          })
        ))}
      </svg>
    </div>
  );
}
