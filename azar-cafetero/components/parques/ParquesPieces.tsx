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

// Casillas del recorrido y meta (0 a 99).
// 0-67: Recorrido común
// 68-75: Camino AMARILLO (Meta en 75)
// 76-83: Camino AZUL (Meta en 83)
// 84-91: Camino VERDE (Meta en 91)
// 92-99: Camino ROJO (Meta en 99)
const PATH_COORDINATES: Record<number, { x: number; y: number }> = {
  0: { x: 785, y: 380 }, 1: { x: 740, y: 380 }, 2: { x: 695, y: 380 }, 3: { x: 650, y: 380 },
  4: { x: 605, y: 345 }, 5: { x: 605, y: 295 }, 6: { x: 605, y: 250 }, 7: { x: 605, y: 205 },
  8: { x: 605, y: 160 }, 9: { x: 605, y: 115 }, 10: { x: 605, y: 70 }, 11: { x: 605, y: 26 },
  12: { x: 500, y: 26 }, 13: { x: 380, y: 26 }, 14: { x: 380, y: 70 }, 15: { x: 380, y: 115 },
  16: { x: 380, y: 160 }, 17: { x: 380, y: 205 }, 18: { x: 380, y: 250 }, 19: { x: 380, y: 295 },
  20: { x: 380, y: 345 }, 21: { x: 340, y: 380 }, 22: { x: 295, y: 380 }, 23: { x: 250, y: 380 },
  24: { x: 205, y: 380 }, 25: { x: 160, y: 380 }, 26: { x: 115, y: 380 }, 27: { x: 70, y: 380 },
  28: { x: 70, y: 500 }, 29: { x: 70, y: 610 }, 30: { x: 115, y: 610 }, 31: { x: 160, y: 610 },
  32: { x: 205, y: 610 }, 33: { x: 250, y: 610 }, 34: { x: 295, y: 610 }, 35: { x: 340, y: 610 },
  36: { x: 380, y: 650 }, 37: { x: 380, y: 700 }, 38: { x: 380, y: 740 }, 39: { x: 380, y: 790 },
  40: { x: 380, y: 835 }, 41: { x: 380, y: 880 }, 42: { x: 380, y: 925 }, 43: { x: 380, y: 970 },
  44: { x: 500, y: 970 }, 45: { x: 610, y: 970 }, 46: { x: 610, y: 925 }, 47: { x: 610, y: 880 },
  48: { x: 610, y: 835 }, 49: { x: 610, y: 790 }, 50: { x: 610, y: 740 }, 51: { x: 610, y: 695 },
  52: { x: 610, y: 650 }, 53: { x: 650, y: 605 }, 54: { x: 695, y: 605 }, 55: { x: 740, y: 605 },
  56: { x: 785, y: 605 }, 57: { x: 835, y: 605 }, 58: { x: 880, y: 605 }, 59: { x: 925, y: 605 },
  60: { x: 925, y: 500 }, 61: { x: 925, y: 380 }, 62: { x: 880, y: 380 }, 63: { x: 835, y: 380 },
  64: { x: 880, y: 500 }, 65: { x: 835, y: 500 }, 66: { x: 790, y: 500 }, 67: { x: 745, y: 500 },
  68: { x: 700, y: 500 }, 69: { x: 655, y: 500 }, 70: { x: 600, y: 500 }, 71: { x: 500, y: 925 },
  72: { x: 500, y: 880 }, 73: { x: 500, y: 835 }, 74: { x: 500, y: 790 }, 75: { x: 500, y: 745 },
  76: { x: 500, y: 700 }, 77: { x: 500, y: 655 }, 78: { x: 500, y: 600 }, 79: { x: 115, y: 500 },
  80: { x: 160, y: 500 }, 81: { x: 205, y: 500 }, 82: { x: 250, y: 500 }, 83: { x: 295, y: 500 }, // Corregido: la meta azul cae en 500,500
  84: { x: 500, y: 160 }, 85: { x: 500, y: 205 }, 86: { x: 500, y: 250 }, 87: { x: 500, y: 295 },
  88: { x: 340, y: 500 }, 89: { x: 400, y: 500 }, 90: { x: 500, y: 70 }, 91: { x: 500, y: 115 },
  92: { x: 500, y: 160 }, 93: { x: 500, y: 205 }, 94: { x: 500, y: 250 }, 95: { x: 500, y: 295 },
  96: { x: 500, y: 340 }, 97: { x: 500, y: 400 }
};

// Coordenadas de las cárceles (-1) por color
const JAIL_COORDINATES: Record<string, { x: number; y: number }> = {
  "ROJO": { x: 200, y: 200 }, // Top Left
  "AMARILLO": { x: 830, y: 200 }, // Top Right
  "VERDE": { x: 200, y: 830 }, // Bottom Left
  "AZUL": { x: 830, y: 830 }, // Bottom Right
};

/**
 * Función que obtiene la posición final.
 */
const getPiecePosition = (absolutePosition: number, color: string, pieceIndex: number): { x: number; y: number } => {
  // 1. CÁRCEL
  if (absolutePosition === -1) {
    const base = JAIL_COORDINATES[color] || { x: 500, y: 500 };
    // Offset para que las 4 fichas no se solapen en la cárcel
    const offsets = [
      { dx: -40, dy: -40 }, { dx: 40, dy: -40 },
      { dx: -40, dy: 40 }, { dx: 40, dy: 40 }
    ];
    const off = offsets[pieceIndex % 4];
    return { x: base.x + off.dx, y: base.y + off.dy };
  }

  // 2. RECORRIDO COMÚN Y METAS (0-97)
  // El backend ahora envía el índice absoluto final directamente para todas las casillas
  const posIndex = absolutePosition;
  const pos = PATH_COORDINATES[posIndex];

  if (pos) {
    // Si estamos exactamente en una meta (70, 78, 89 o 97), aplicamos un pequeño offset para que las fichas no se sobrepongan
    const isVictory = [70, 78, 89, 97].includes(absolutePosition);
    if (isVictory) {
      return { x: pos.x + (pieceIndex - 1.5) * 12, y: pos.y + (pieceIndex - 1.5) * 12 };
    }
    return pos;
  }

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
