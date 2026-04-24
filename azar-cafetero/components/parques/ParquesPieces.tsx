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

// Generamos el camino de 68 casillas en forma de cruz
const generatePath = () => {
  const path: { x: number; y: number }[] = [];
  const gridSize = 19;
  const step = 1000 / gridSize;
  const offset = step / 2;

  const add = (x: number, y: number) => {
    path.push({ x: x * step + offset, y: y * step + offset });
  };

  /**
   * Recorrido de 68 casillas (17 por cuadrante)
   * Rotado para que Yellow (0) empiece en el brazo SUPERIOR (Top Right area)
   * siguiendo el orden pedido por el usuario.
   */
  
  // CUADRANTE 1 (Arriba -> Derecha) - Salida de Amarillo (0-16)
  for (let i = 0; i < 8; i++) add(10, i + 1);  // Bajar brazo superior
  for (let i = 0; i < 8; i++) add(11 + i, 8);  // Ir a la derecha brazo derecho
  add(18, 9);                                  // Esquina derecha

  // CUADRANTE 2 (Derecha -> Abajo) - Salida de Azul (17-33)
  for (let i = 0; i < 8; i++) add(17 - i, 10); // Ir a la izquierda brazo derecho
  for (let i = 0; i < 8; i++) add(10, 11 + i); // Bajar brazo inferior
  add(9, 18);                                  // Esquina inferior

  // CUADRANTE 3 (Abajo -> Izquierda) - Salida de Verde (34-50)
  for (let i = 0; i < 8; i++) add(8, 18 - i);  // Subir brazo inferior
  for (let i = 0; i < 8; i++) add(7 - i, 10); // Ir a la izquierda brazo izquierdo
  add(0, 9);                                   // Esquina izquierda

  // CUADRANTE 4 (Izquierda -> Arriba) - Salida de Rojo (51-67)
  for (let i = 0; i < 8; i++) add(i + 1, 8);  // Ir a la derecha brazo izquierdo
  for (let i = 0; i < 8; i++) add(8, 7 - i);   // Subir brazo superior
  add(9, 0);                                   // Esquina superior

  return path;
};

const BOARD_PATH = generatePath();

const getPiecePosition = (absolutePosition: number, color: string, pieceIndex: number): { x: number; y: number } => {
  // 1. CÁRCEL
  if (absolutePosition === -1) {
    const offsets = [
      { dx: -40, dy: -40 }, { dx: 40, dy: -40 },
      { dx: -40, dy: 40 },  { dx: 40, dy: 40 }
    ];
    const off = offsets[pieceIndex % 4];
    // Layout pedido: TL: Red, TR: Yellow, BL: Green, BR: Blue
    if (color === "AMARILLO") return { x: 820 + off.dx, y: 180 + off.dy }; // Top Right
    if (color === "ROJO")     return { x: 180 + off.dx, y: 180 + off.dy }; // Top Left
    if (color === "VERDE")    return { x: 180 + off.dx, y: 820 + off.dy }; // Bottom Left
    if (color === "AZUL")     return { x: 820 + off.dx, y: 820 + off.dy }; // Bottom Right
  }

  // 2. META
  if (absolutePosition >= 68) {
    const center = { x: 500, y: 500 };
    const radius = 60;
    // Ajuste de ángulos para la meta
    const angleMap: Record<string, number> = { 
      "AMARILLO": 270, // Apunta hacia arriba (meta amarilla en TR/Top)
      "AZUL": 0,       // Apunta a la derecha
      "VERDE": 90,     // Apunta abajo
      "ROJO": 180      // Apunta a la izquierda
    };
    const baseAngle = angleMap[color] || 0;
    const angle = (baseAngle + (pieceIndex - 1.5) * 20) * (Math.PI / 180);
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    };
  }

  // 3. RECORRIDO (0-67)
  if (absolutePosition >= 0 && absolutePosition < BOARD_PATH.length) {
    return BOARD_PATH[absolutePosition];
  }

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
