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
  0: { x: 830, y: 400 }, 1: { x: 868, y: 447 }, 2: { x: 921, y: 447 }, 3: { x: 974, y: 447 },
  4: { x: 974, y: 500 }, 5: { x: 974, y: 553 }, 6: { x: 921, y: 553 }, 7: { x: 868, y: 553 },
  8: { x: 816, y: 553 }, 9: { x: 763, y: 553 }, 10: { x: 711, y: 553 }, 11: { x: 658, y: 553 },
  12: { x: 605, y: 553 }, 13: { x: 553, y: 605 }, 14: { x: 553, y: 658 }, 15: { x: 553, y: 711 },
  16: { x: 553, y: 763 }, 17: { x: 553, y: 816 }, 18: { x: 553, y: 868 }, 19: { x: 553, y: 921 },
  20: { x: 553, y: 974 }, 21: { x: 500, y: 974 }, 22: { x: 447, y: 974 }, 23: { x: 447, y: 921 },
  24: { x: 447, y: 868 }, 25: { x: 447, y: 816 }, 26: { x: 447, y: 763 }, 27: { x: 447, y: 711 },
  28: { x: 447, y: 658 }, 29: { x: 447, y: 605 }, 30: { x: 395, y: 553 }, 31: { x: 342, y: 553 },
  32: { x: 289, y: 553 }, 33: { x: 237, y: 553 }, 34: { x: 184, y: 553 }, 35: { x: 132, y: 553 },
  36: { x: 79, y: 553 }, 37: { x: 26, y: 553 }, 38: { x: 26, y: 500 }, 39: { x: 26, y: 447 },
  40: { x: 79, y: 447 }, 41: { x: 132, y: 447 }, 42: { x: 184, y: 447 }, 43: { x: 237, y: 447 },
  44: { x: 289, y: 447 }, 45: { x: 342, y: 447 }, 46: { x: 395, y: 447 }, 47: { x: 447, y: 395 },
  48: { x: 447, y: 342 }, 49: { x: 447, y: 289 }, 50: { x: 447, y: 237 }, 51: { x: 447, y: 184 },
  52: { x: 447, y: 132 }, 53: { x: 447, y: 79 }, 54: { x: 447, y: 26 }, 55: { x: 500, y: 26 },
  56: { x: 553, y: 26 }, 57: { x: 553, y: 79 }, 58: { x: 553, y: 132 }, 59: { x: 553, y: 184 },
  60: { x: 553, y: 237 }, 61: { x: 553, y: 289 }, 62: { x: 553, y: 342 }, 63: { x: 553, y: 395 },
  64: { x: 605, y: 447 }, 65: { x: 658, y: 447 }, 66: { x: 711, y: 447 }, 67: { x: 763, y: 447 },
  68: { x: 921, y: 500 }, 69: { x: 868, y: 500 }, 70: { x: 816, y: 500 }, 71: { x: 763, y: 500 },
  72: { x: 711, y: 500 }, 73: { x: 658, y: 500 }, 74: { x: 605, y: 500 }, 75: { x: 553, y: 500 },
  76: { x: 500, y: 921 }, 77: { x: 500, y: 868 }, 78: { x: 500, y: 816 }, 79: { x: 500, y: 763 },
  80: { x: 500, y: 711 }, 81: { x: 500, y: 658 }, 82: { x: 500, y: 605 }, 83: { x: 553, y: 500 }, // Corregido: la meta azul cae en 500,500
  84: { x: 79, y: 500 }, 85: { x: 132, y: 500 }, 86: { x: 184, y: 500 }, 87: { x: 237, y: 500 },
  88: { x: 289, y: 500 }, 89: { x: 342, y: 500 }, 90: { x: 395, y: 500 }, 91: { x: 447, y: 500 },
  92: { x: 500, y: 79 }, 93: { x: 500, y: 132 }, 94: { x: 500, y: 184 }, 95: { x: 500, y: 237 },
  96: { x: 500, y: 289 }, 97: { x: 500, y: 342 }, 98: { x: 500, y: 395 }, 99: { x: 500, y: 447 },
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

  // 2. RECORRIDO COMÚN Y METAS (0-99)
  let posIndex = absolutePosition;
  if (absolutePosition >= 68) {
    if (color === "AMARILLO") posIndex = absolutePosition;
    if (color === "AZUL") posIndex = absolutePosition + 8;
    if (color === "VERDE") posIndex = absolutePosition + 16;
    if (color === "ROJO") posIndex = absolutePosition + 24;
  }

  const pos = PATH_COORDINATES[posIndex];
  if (pos) {
    // Si estamos exactamente en la meta (75), aplicamos un pequeño offset para que las fichas no se sobrepongan totalmente en el centro
    if (absolutePosition === 75) {
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
