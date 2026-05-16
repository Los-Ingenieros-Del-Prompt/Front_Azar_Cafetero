"use client";

import React from "react";
import { SuitIcon } from "./SuitIcon";

interface Seat {
  occupant?: string;
  host?: boolean;
  joinedAt?: number;
}

interface MiniBriscaTableProps {
  seats: Seat[];
  triunfo?: string;
  palette: any;
  size?: number;
}

export default function MiniBriscaTable({ seats, triunfo = 'oros', palette, size = 150 }: MiniBriscaTableProps) {
  const cream = '#F6E9C3';
  const sk = palette.cafe;
  const felt = '#1B5E3F';
  const feltShade = '#143F2A';
  const is2p = seats.length === 2;

  // seat positions on a circle (in viewBox units, center 80,80)
  const seatPos = is2p
    ? [[80, 28], [80, 132]]                     // 1v1, top & bottom
    : [[80, 26], [134, 80], [80, 134], [26, 80]]; // 2v2 NESW

  return (
    <svg viewBox="0 0 160 160" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="brisca-felt" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={felt} />
          <stop offset="100%" stopColor={feltShade} />
        </radialGradient>
        <radialGradient id="brisca-shine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`brisca-back-${triunfo}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={palette.rojo} />
          <path d="M 0 3 L 3 0 L 6 3 L 3 6 Z" fill={palette.amarillo} opacity={0.4} />
        </pattern>
      </defs>

      {/* shadow under table */}
      <ellipse cx="80" cy="142" rx="58" ry="6" fill="#000" opacity={0.35} />

      {/* table top: green felt */}
      <ellipse cx="80" cy="82" rx="60" ry="46" fill="url(#brisca-felt)" stroke={sk} strokeWidth={1.4} />
      {/* inner ring */}
      <ellipse cx="80" cy="82" rx="52" ry="38" fill="none" stroke={cream} strokeWidth={0.6} opacity={0.25} strokeDasharray="2 3" />

      {/* deck stack (face-down) */}
      <g transform="translate(64, 70) rotate(-12)">
        <rect width="22" height="32" rx="3" fill={`url(#brisca-back-${triunfo})`} stroke={sk} strokeWidth={0.8} />
        <rect x="-2" y="-2" width="22" height="32" rx="3" fill={`url(#brisca-back-${triunfo})`} stroke={sk} strokeWidth={0.8} />
        <rect x="-4" y="-4" width="22" height="32" rx="3" fill={`url(#brisca-back-${triunfo})`} stroke={sk} strokeWidth={0.8} />
      </g>

      {/* triunfo card (face-up, peeking under deck) */}
      <g transform="translate(82, 76) rotate(76)">
        <rect width="22" height="32" rx="3" fill={cream} stroke={sk} strokeWidth={1} />
        <SuitIcon suit={triunfo} palette={palette} x={11} y={16} scale={0.9} />
        <text x="3" y="8" fontSize="5" fontFamily="DM Serif Display, serif" fontWeight="700" fill={sk}>A</text>
      </g>

      {/* seats around the rim */}
      {seats.map((s, i) => {
        const [x, y] = seatPos[i];
        const occupied = !!s.occupant;
        const teamColor = is2p
          ? (i === 0 ? palette.rojo : palette.azul)
          : (i % 2 === 0 ? palette.rojo : palette.azul); // 4p: opposite players on same team
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <circle r="11" fill={cream} stroke={sk} strokeWidth={1.2} />
            {occupied && (
              <g>
                <ellipse cy="2" rx="9" ry="2" fill="#000" opacity={0.4} />
                <circle r="9" fill={teamColor} stroke={sk} strokeWidth={1.2} />
                <circle r="9" fill="url(#brisca-shine)" opacity={0.7} />
                {/* tiny initial */}
                <text textAnchor="middle" y="2.5" fontSize="7" fontWeight={800} fill="#fff" fontFamily="Plus Jakarta Sans">
                  {s.occupant && s.occupant[0]}
                </text>
              </g>
            )}
            {!occupied && (
              <circle r="7" fill="none" stroke={sk} strokeWidth={0.8} strokeDasharray="2 2" opacity={0.55} />
            )}
            {s.host && occupied && (
              <g transform="translate(0,-13)">
                <circle r="4" fill={palette.amarillo} stroke={sk} strokeWidth={0.6} />
                <text textAnchor="middle" y="1.5" fontSize="5" fontFamily="DM Serif Display, serif" fill={sk}>★</text>
              </g>
            )}
          </g>
        );
      })}

      {/* pair-line connector for 2v2: subtle dashed line linking teammates */}
      {!is2p && (
        <>
          <line x1={seatPos[0][0]} y1={seatPos[0][1]} x2={seatPos[2][0]} y2={seatPos[2][1]}
            stroke={palette.rojo} strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
          <line x1={seatPos[1][0]} y1={seatPos[1][1]} x2={seatPos[3][0]} y2={seatPos[3][1]}
            stroke={palette.azul} strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
        </>
      )}
    </svg>
  );
}
