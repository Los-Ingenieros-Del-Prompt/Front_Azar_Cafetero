"use client";

import React from "react";

interface SuitIconProps {
  suit: string;
  palette: any;
  x?: number;
  y?: number;
  scale?: number;
}

export function SuitIcon({ suit, palette, x = 0, y = 0, scale = 1 }: SuitIconProps) {
  const sk = palette.cafe;
  const s = scale;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {suit === 'oros' && (
        <g>
          <circle r="5" fill={palette.amarillo} stroke={sk} strokeWidth={0.5} />
          <circle r="2.4" fill={sk} />
        </g>
      )}
      {suit === 'copas' && (
        <g>
          <path d="M -4 -3 Q -4 3 0 4 Q 4 3 4 -3 Z" fill={palette.rojo} stroke={sk} strokeWidth={0.5} />
          <rect x="-0.7" y="4" width="1.4" height="2" fill={sk} />
          <rect x="-2.5" y="6" width="5" height="0.8" fill={sk} />
        </g>
      )}
      {suit === 'espadas' && (
        <g>
          <path d="M 0 -5 L 1.4 3 L 0 4 L -1.4 3 Z" fill={palette.azul} stroke={sk} strokeWidth={0.5} />
          <rect x="-2" y="3" width="4" height="0.8" fill={sk} />
        </g>
      )}
      {suit === 'bastos' && (
        <g>
          <rect x="-1" y="-5" width="2" height="10" fill={palette.verdeLeaf} stroke={sk} strokeWidth={0.5} rx="1" />
          <path d="M -3 -4 L 3 4 M -3 4 L 3 -4" stroke={palette.verdeLeaf} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}
