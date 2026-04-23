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
const getPiecePosition = (absolutePosition: number, color: string, pieceIndex: number): { x: number; y: number } => {
  // 1. CÁRCEL
  if (absolutePosition === -1) {
    const offsets = [
      { dx: -30, dy: -30 }, { dx: 30, dy: -30 },
      { dx: -30, dy: 30 },  { dx: 30, dy: 30 }
    ];
    const off = offsets[pieceIndex % 4];
    if (color === "AMARILLO") return { x: 180 + off.dx, y: 820 + off.dy };
    if (color === "AZUL")     return { x: 180 + off.dx, y: 180 + off.dy };
    if (color === "ROJO")     return { x: 820 + off.dx, y: 180 + off.dy };
    if (color === "VERDE")    return { x: 820 + off.dx, y: 820 + off.dy };
  }

  // 2. META
  if (absolutePosition === 68) {
    const center = { x: 500, y: 500 };
    const radius = 40;
    const angle = (pieceIndex * 90 + (color === "AMARILLO" ? 0 : color === "AZUL" ? 90 : color === "ROJO" ? 180 : 270)) * (Math.PI / 180);
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    };
  }

  // 3. RECORRIDO (0-67)
  // Generamos un recorrido circular simplificado
  // En un tablero real esto requiere un mapa exacto, aquí usamos una elipse/rectángulo redondeado
  const radiusX = 380;
  const radiusY = 380;
  const totalCasillas = 68;
  
  // Ajuste de ángulo inicial para que el 0 coincida con la salida amarilla (abajo-izquierda aprox)
  const startAngle = Math.PI * 0.75; 
  const angle = startAngle - (absolutePosition * (2 * Math.PI / totalCasillas));
  
  return {
    x: 500 + radiusX * Math.cos(angle),
    y: 500 + radiusY * Math.sin(angle)
  };
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
