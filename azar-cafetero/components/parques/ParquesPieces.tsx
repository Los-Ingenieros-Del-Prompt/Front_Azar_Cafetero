"use client";
import React, { useState, useEffect, useRef } from "react";
import { GameStateDTO, PlayerDTO, PieceDTO } from "@/hooks/useParquesWebSocket";
import { COLOR_STYLES } from "./ParquesMultiplayer";

interface ParquesPiecesProps {
  gameState: GameStateDTO;
  onPieceClick?: (pieceId: string) => void;
  isMyTurn: boolean;
  movablePieceIds: string[];
}

const PATH_COORDINATES: Record<number, { x: number; y: number }> = {
  // ─── Recorrido común (0–67) ───
  0:  { x: 600, y: 975 },
  1:  { x: 600, y: 925 },
  2:  { x: 600, y: 875 },
  3:  { x: 600, y: 825 },
  4:  { x: 600, y: 775 }, // Sale AMARILLO
  5:  { x: 600, y: 725 },
  6:  { x: 600, y: 675 },
  7:  { x: 600, y: 625 },
  8:  { x: 625, y: 575 },
  9:  { x: 675, y: 600 },
  10: { x: 725, y: 600 },
  11: { x: 775, y: 600 }, // Segura
  12: { x: 825, y: 600 },
  13: { x: 875, y: 600 },
  14: { x: 925, y: 600 },
  15: { x: 975, y: 600 },
  16: { x: 975, y: 500 }, // Entrada escalera AZUL
  17: { x: 975, y: 400 },
  18: { x: 925, y: 400 },
  19: { x: 875, y: 400 },
  20: { x: 825, y: 400 },
  21: { x: 775, y: 400 }, // Sale AZUL
  22: { x: 725, y: 400 },
  23: { x: 675, y: 400 },
  24: { x: 625, y: 400 },
  25: { x: 575, y: 375 },
  26: { x: 600, y: 325 },
  27: { x: 600, y: 275 },
  28: { x: 600, y: 225 }, // Segura
  29: { x: 600, y: 175 },
  30: { x: 600, y: 125 },
  31: { x: 600, y: 75  },
  32: { x: 600, y: 25  },
  33: { x: 500, y: 25  }, // Entrada escalera ROJO
  34: { x: 400, y: 25  },
  35: { x: 400, y: 75  },
  36: { x: 400, y: 125 },
  37: { x: 400, y: 175 },
  38: { x: 400, y: 225 }, // Sale ROJO
  39: { x: 400, y: 275 },
  40: { x: 400, y: 325 },
  41: { x: 400, y: 375 },
  42: { x: 375, y: 425 },
  43: { x: 325, y: 400 },
  44: { x: 275, y: 400 },
  45: { x: 225, y: 400 }, // Segura
  46: { x: 175, y: 400 },
  47: { x: 125, y: 400 },
  48: { x: 75,  y: 400 },
  49: { x: 25,  y: 400 },
  50: { x: 25,  y: 500 }, // Entrada escalera VERDE
  51: { x: 25,  y: 600 },
  52: { x: 75,  y: 600 },
  53: { x: 125, y: 600 },
  54: { x: 175, y: 600 },
  55: { x: 225, y: 600 }, // Sale VERDE
  56: { x: 275, y: 600 },
  57: { x: 325, y: 600 },
  58: { x: 375, y: 600 },
  59: { x: 425, y: 625 },
  60: { x: 400, y: 675 },
  61: { x: 400, y: 725 },
  62: { x: 400, y: 775 }, // Segura
  63: { x: 400, y: 825 },
  64: { x: 400, y: 875 },
  65: { x: 400, y: 925 },
  66: { x: 400, y: 975 },
  67: { x: 500, y: 975 }, // Entrada escalera AMARILLO

  // ─── Escalera AZUL (entra desde 16) ───
  68: { x: 925, y: 500 },
  69: { x: 875, y: 500 },
  70: { x: 825, y: 500 },
  71: { x: 775, y: 500 },
  72: { x: 725, y: 500 },
  73: { x: 675, y: 500 },
  74: { x: 625, y: 500 },

  // ─── Escalera ROJO (entra desde 33) ───
  75: { x: 500, y: 75  },
  76: { x: 500, y: 125 },
  77: { x: 500, y: 175 },
  78: { x: 500, y: 225 },
  79: { x: 500, y: 275 },
  80: { x: 500, y: 325 },
  81: { x: 500, y: 375 },

  // ─── Escalera VERDE (entra desde 50) ───
  82: { x: 75,  y: 500 },
  83: { x: 125, y: 500 },
  84: { x: 175, y: 500 },
  85: { x: 225, y: 500 },
  86: { x: 275, y: 500 },
  87: { x: 325, y: 500 },
  88: { x: 375, y: 500 },

  // ─── Escalera AMARILLO (entra desde 67) ───
  89: { x: 500, y: 925 },
  90: { x: 500, y: 875 },
  91: { x: 500, y: 825 },
  92: { x: 500, y: 775 },
  93: { x: 500, y: 725 },
  94: { x: 500, y: 675 },
  95: { x: 500, y: 625 },

  // ─── Cárceles (96–111) ───
  96:  { x: 735, y: 910 }, // AMARILLO
  97:  { x: 910, y: 910 },
  98:  { x: 910, y: 735 },
  99:  { x: 735, y: 735 },
  100: { x: 735, y: 265 }, // AZUL
  101: { x: 910, y: 265 },
  102: { x: 910, y: 90  },
  103: { x: 735, y: 90  },
  104: { x: 90,  y: 265 }, // ROJO
  105: { x: 265, y: 265 },
  106: { x: 265, y: 90  },
  107: { x: 90,  y: 90  },
  108: { x: 90,  y: 910 }, // VERDE
  109: { x: 265, y: 910 },
  110: { x: 265, y: 735 },
  111: { x: 90,  y: 735 },

  // ─── Casillas de victoria ───
  112: { x: 500, y: 565 }, // AMARILLO
  113: { x: 565, y: 500 }, // AZUL
  114: { x: 500, y: 435 }, // ROJO
  115: { x: 435, y: 500 }, // VERDE
};

const JAIL_COORDINATES: Record<string, { x: number; y: number }[]> = {
  AMARILLO: [
    PATH_COORDINATES[96], PATH_COORDINATES[97],
    PATH_COORDINATES[98], PATH_COORDINATES[99],
  ],
  AZUL: [
    PATH_COORDINATES[100], PATH_COORDINATES[101],
    PATH_COORDINATES[102], PATH_COORDINATES[103],
  ],
  ROJO: [
    PATH_COORDINATES[104], PATH_COORDINATES[105],
    PATH_COORDINATES[106], PATH_COORDINATES[107],
  ],
  VERDE: [
    PATH_COORDINATES[108], PATH_COORDINATES[109],
    PATH_COORDINATES[110], PATH_COORDINATES[111],
  ],
};

const VICTORY_ABS: Record<string, number> = {
  AMARILLO: 112,
  AZUL:     113,
  ROJO:     114,
  VERDE:    115,
};

const getExitAbsPos = (color: string) => {
  switch (color) {
    case "AMARILLO": return 4;
    case "AZUL":     return 21;
    case "ROJO":     return 38;
    case "VERDE":    return 55;
    default:         return 0;
  }
};

// Ahora todos los colores recorren 63 casillas del anillo antes de entrar a su escalera.
const getThreshold = (_color: string) => 63;

const getAbsFromRel = (relPos: number, color: string) => {
  if (relPos < 0) return -1;
  if (relPos === 70) return VICTORY_ABS[color]; // 112–115

  const exitAbs = getExitAbsPos(color);
  if (relPos < 63) return (exitAbs + relPos) % 68;

  const ladderRel = relPos - 63;
  switch (color) {
    case "AZUL":     return 68 + ladderRel; // 68–74
    case "ROJO":     return 75 + ladderRel; // 75–81
    case "VERDE":    return 82 + ladderRel; // 82–88
    case "AMARILLO": return 89 + ladderRel; // 89–95
    default:         return relPos;
  }
};

const getCoords = (absPos: number, color: string, pieceIndex: number) => {
  // En la cárcel: cada ficha en su propio slot
  if (absPos === -1) {
    const spots = JAIL_COORDINATES[color] ?? JAIL_COORDINATES.AMARILLO;
    return spots[pieceIndex % 4];
  }

  // En la casilla de victoria: pequeño offset para que se vean las 4 fichas
  if (absPos === VICTORY_ABS[color]) {
    const pos = PATH_COORDINATES[absPos];
    return { x: pos.x + (pieceIndex - 1.5) * 12, y: pos.y + (pieceIndex - 1.5) * 12 };
  }

  return PATH_COORDINATES[absPos] ?? { x: 500, y: 500 };
};




function AnimatedPiece({ piece, color, idx, isMovable, onClick }: { 
  piece: PieceDTO, color: string, idx: number, isMovable: boolean, onClick: () => void 
}) {
  const [displayAbsPos, setDisplayAbsPos] = useState(piece.absolutePosition);
  const lastRelPos = useRef(piece.relativePosition);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Si la posición lógica cambió, disparamos la animación
    if (piece.relativePosition !== lastRelPos.current) {
      const start = lastRelPos.current;
      const end = piece.relativePosition;
      
      // Actualizamos el ref inmediatamente para que el siguiente render sepa que ya procesamos esto
      lastRelPos.current = end;

      // Si es un salto "imposible" (como volver a la cárcel o un reset), teletransportar
      // Excepto si es una salida de cárcel (de -1 a 0), que el usuario quiere ver
      if (start === -1 && end === 0) {
          // Dejar que anime o simplemente saltar, pero marcando que no es un error
      } else if (start === -1 || end === -1 || Math.abs(end - start) > 12) {
        setDisplayAbsPos(piece.absolutePosition);
        return;
      }

      // Animación paso a paso
      isAnimating.current = true;
      let current = start;
      const interval = setInterval(() => {
        if (current < end) current++;
        else if (current > end) current--;
        
        setDisplayAbsPos(getAbsFromRel(current, color));
        
        if (current === end) {
          clearInterval(interval);
          isAnimating.current = false;
        }
      }, 120); // Un poco más rápido para mejor sensación

      return () => {
        clearInterval(interval);
        isAnimating.current = false;
      };
    } else if (!isAnimating.current) {
      // SOLO sincronizar si NO estamos en medio de una animación
      // Esto evita que un re-render del padre por otra causa (ej. dados) 
      // teletransporte la ficha al destino antes de tiempo.
      setDisplayAbsPos(piece.absolutePosition);
    }
  }, [piece.relativePosition, piece.absolutePosition, color]);

  const { x, y } = getCoords(displayAbsPos, color, idx);
  const colorStyle = COLOR_STYLES[color];

  return (
    <g
      className={`transition-all duration-300 ease-out ${isMovable ? "pointer-events-auto cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <circle cx={x} cy={y + 5} r="18" fill="black" fillOpacity="0.3" />
      <circle
        cx={x} cy={y} r="18"
        fill={colorStyle.hex}
        stroke="white" strokeWidth="3"
        className={isMovable ? "animate-pulse" : ""}
      />
      <circle cx={x - 5} cy={y - 5} r="6" fill="white" fillOpacity="0.4" />
      {isMovable && (
        <circle
          cx={x} cy={y} r="25"
          fill="none" stroke="white" strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-[spin_4s_linear_infinite]"
        />
      )}
    </g>
  );
}

export default function ParquesPieces({ gameState, onPieceClick, isMyTurn, movablePieceIds }: ParquesPiecesProps) {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Solo permitir debug en localhost y en la sala de debug específica
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isDebugRoom = gameState.gameId === "parques-debug-room";
    
    if (!isLocal && !isDebugRoom) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.gameId]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg viewBox="0 0 1000 1000" className="w-full h-full">
        {gameState.players.map((player) => (
          player.pieces.map((piece, idx) => (
            <AnimatedPiece
              key={piece.id}
              piece={piece}
              color={player.color}
              idx={idx}
              isMovable={isMyTurn && movablePieceIds.includes(piece.id)}
              onClick={() => onPieceClick?.(piece.id)}
            />
          ))
        ))}

        {/* 🛠️ DEBUG MODE: Dibuja un punto en cada una de las coordenadas */}
        {showDebug && Object.entries(PATH_COORDINATES).map(([index, pos]) => (
          <g key={`debug-${index}`}>
            <circle cx={pos.x} cy={pos.y} r="8" fill="rgba(255,0,0,0.6)" />
            <text x={pos.x} y={pos.y + 3} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
              {index}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
