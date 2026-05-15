"use client";

import React from "react";

const PALETTE = {
  cream: "#F7EFD9",
  amarillo: "#FCD116",
  azul: "#003893",
  rojo: "#CE1126",
  verde: "#27A86A",
  verdeLeaf: "#1B7A4C",
  cafe: "#6B4423",
};

// ─── Card Frame ──────────────────────────────────────────────────────────────

function CardFrame({
  title,
  romanNum,
  children,
  unique,
}: {
  title: string;
  romanNum: string;
  children: React.ReactNode;
  unique: string;
}) {
  const sk = PALETTE.cafe;
  return (
    <svg
      viewBox="0 0 240 336"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={`bg-${unique}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6E9C3" />
          <stop offset="55%" stopColor="#EFDDAB" />
          <stop offset="100%" stopColor="#E2CC91" />
        </linearGradient>
        <pattern
          id={`grain-${unique}`}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <rect width="3" height="3" fill={`url(#bg-${unique})`} />
          <circle cx="1.5" cy="1.5" r=".4" fill={sk} opacity=".22" />
          <circle cx=".5" cy="2.5" r=".3" fill={sk} opacity=".12" />
        </pattern>
        <radialGradient id={`vig-${unique}`} cx="50%" cy="50%" r="65%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#3a2410" stopOpacity=".4" />
        </radialGradient>
      </defs>

      <rect width="240" height="336" fill={`url(#grain-${unique})`} />
      <rect width="240" height="336" fill={`url(#vig-${unique})`} />

      {/* outer ornate frame */}
      <rect
        x="10" y="10" width="220" height="316" rx="10"
        fill="none" stroke={sk} strokeWidth="2.5"
      />
      <rect
        x="16" y="16" width="208" height="304" rx="5"
        fill="none" stroke={sk} strokeWidth=".8" opacity=".7"
      />
      <rect
        x="20" y="20" width="200" height="296" rx="3"
        fill="none" stroke={sk} strokeWidth=".4" opacity=".5"
      />

      {/* corner flourishes */}
      {([[20, 20, 0], [220, 20, 90], [220, 316, 180], [20, 316, 270]] as const).map(([x, y, r], i) => (
        <g
          key={i}
          transform={`translate(${x},${y}) rotate(${r})`}
          stroke={sk}
          fill="none"
          strokeWidth="1.2"
        >
          <path d="M 0 0 Q 14 0 18 8 Q 22 16 30 18" />
          <path d="M 4 4 Q 14 4 18 12" opacity=".6" />
          <circle cx="30" cy="18" r="1.8" fill={sk} />
          <circle cx="2" cy="2" r="1.4" fill={sk} />
        </g>
      ))}

      {/* top title */}
      <text
        x="120" y="44"
        fontSize="9"
        fontFamily="DM Serif Display, serif"
        fontStyle="italic"
        fill={sk}
        textAnchor="middle"
        letterSpacing="3"
        opacity=".85"
      >
        — {title} —
      </text>

      {/* corner roman numerals */}
      <text x="30" y="40" fontSize="14" fontFamily="DM Serif Display, serif" fontStyle="italic" fill={sk}>
        {romanNum}
      </text>
      <text
        x="210" y="312"
        fontSize="14"
        fontFamily="DM Serif Display, serif"
        fontStyle="italic"
        fill={sk}
        textAnchor="end"
        transform="rotate(180 210 312)"
      >
        {romanNum}
      </text>

      {children}
    </svg>
  );
}

// ─── Parqués Card Art ─────────────────────────────────────────────────────────

export function ParquesCardArt() {
  const sk = PALETTE.cafe;
  const colors = [PALETTE.rojo, PALETTE.azul, PALETTE.amarillo, PALETTE.verdeLeaf];

  return (
    <CardFrame title="EL TABLERO" romanNum="I" unique="parq">
      <g transform="translate(120, 170)">
        <ellipse cx="0" cy="78" rx="86" ry="12" fill={sk} opacity=".18" />

        {[0, 90, 180, 270].map((rot, i) => (
          <g key={i} transform={`rotate(${rot})`}>
            <rect x={-18} y={-82} width={36} height={62} fill="#FFF8E6" stroke={sk} strokeWidth="1.6" />
            {Array.from({ length: 4 }).map((_, j) => (
              <line
                key={j}
                x1={-18} y1={-82 + (j + 1) * 14}
                x2={18}  y2={-82 + (j + 1) * 14}
                stroke={sk} strokeWidth=".7" opacity=".55"
              />
            ))}
            <line x1={0} y1={-82} x2={0} y2={-20} stroke={sk} strokeWidth=".7" opacity=".4" />
            <rect
              x={-6} y={-82} width={12} height={62}
              fill={colors[i]} stroke={sk} strokeWidth="1.4"
            />
            <rect x={-5} y={-81} width={3} height={60} fill="#fff" opacity=".22" />
          </g>
        ))}

        <rect x={-24} y={-24} width={48} height={48} fill={PALETTE.amarillo} stroke={sk} strokeWidth="1.6" />
        <polygon points="0,-24 24,0 0,24 -24,0" fill="#FFF8E6" stroke={sk} strokeWidth="1.4" />
        <circle r={9} fill={PALETTE.rojo} stroke={sk} strokeWidth="1.4" />
        <circle r={4} fill={PALETTE.amarillo} />

        {([ [-60, -60, PALETTE.rojo], [60, -60, PALETTE.azul], [60, 60, PALETTE.amarillo], [-60, 60, PALETTE.verdeLeaf] ] as [number, number, string][]).map(([x, y, c], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <ellipse cx="1" cy="3" rx="11" ry="3" fill={sk} opacity=".25" />
            <circle r={11} fill={c} stroke={sk} strokeWidth="1.6" />
            <circle r={4} fill="#FFF8E6" />
          </g>
        ))}
      </g>

      {/* dice */}
      <g transform="translate(54, 286) rotate(-10)">
        <rect x="1" y="3" width="26" height="26" rx="4" fill={sk} opacity=".25" />
        <rect width="26" height="26" rx="4" fill="#FFF8E6" stroke={sk} strokeWidth="1.4" />
        <circle cx="6" cy="6" r="2" fill={sk} />
        <circle cx="20" cy="20" r="2" fill={sk} />
        <circle cx="13" cy="13" r="2" fill={PALETTE.rojo} />
      </g>
      <g transform="translate(168, 290) rotate(14)">
        <rect x="1" y="3" width="26" height="26" rx="4" fill={sk} opacity=".25" />
        <rect width="26" height="26" rx="4" fill="#FFF8E6" stroke={sk} strokeWidth="1.4" />
        <circle cx="6"  cy="6"  r="2" fill={sk} />
        <circle cx="20" cy="6"  r="2" fill={sk} />
        <circle cx="6"  cy="20" r="2" fill={sk} />
        <circle cx="20" cy="20" r="2" fill={sk} />
        <circle cx="13" cy="13" r="2" fill={sk} />
      </g>

      <text
        x="120" y="298"
        textAnchor="middle" fontSize="8"
        fontFamily="DM Serif Display, serif" fontStyle="italic"
        fill={sk} opacity=".7" letterSpacing="2"
      >
        PARES · CINCO · CAPADO
      </text>
    </CardFrame>
  );
}

// ─── Brisca Card Art ──────────────────────────────────────────────────────────

export function BriscaCardArt() {
  const sk = PALETTE.cafe;

  return (
    <CardFrame title="LAS CARTAS" romanNum="II" unique="bri">
      <g transform="translate(120, 162)">
        <circle r={72} fill="none" stroke={sk} strokeWidth=".8" opacity=".5" strokeDasharray="2 3" />
        <circle r={64} fill={PALETTE.amarillo} stroke={sk} strokeWidth="2" />
        <circle r={58} fill="none" stroke={sk} strokeWidth=".8" />

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 62} y1={Math.sin(a) * 62}
              x2={Math.cos(a) * 72} y2={Math.sin(a) * 72}
              stroke={sk} strokeWidth="1.2" opacity=".55"
            />
          );
        })}

        <g transform="translate(0, 4)">
          <path
            d="M -34 -38 L 34 -38 L 34 8 Q 34 36 0 50 Q -34 36 -34 8 Z"
            fill={PALETTE.cream} stroke={sk} strokeWidth="2"
          />
          {/* tricolor bands */}
          <rect x="-34" y="-38" width="68" height="15" fill={PALETTE.azul} />
          <rect x="-34" y="-23" width="68" height="15" fill={PALETTE.amarillo} />
          <rect x="-34" y="-8"  width="68" height="16" fill={PALETTE.rojo} />
          <path
            d="M -34 -38 L 34 -38 L 34 8 Q 34 36 0 50 Q -34 36 -34 8 Z"
            fill="none" stroke={sk} strokeWidth="2"
          />
          {/* tiny crown */}
          <path
            d="M -12 -38 L -10 -46 L -4 -42 L 0 -50 L 4 -42 L 10 -46 L 12 -38 Z"
            fill={PALETTE.amarillo} stroke={sk} strokeWidth="1.2"
          />
          <circle cx="0" cy="-50" r="1.6" fill={PALETTE.rojo} />
        </g>

        {/* laurel */}
        <g stroke={PALETTE.verdeLeaf} fill={PALETTE.verdeLeaf} strokeWidth="1">
          <path d="M -64 -4 Q -84 -16 -88 -42 Q -78 -34 -68 -22 Q -64 -16 -64 -4 Z" />
          <path d="M -50 14 Q -68 14 -76 -2" fill="none" />
          <path d="M 64 -4 Q 84 -16 88 -42 Q 78 -34 68 -22 Q 64 -16 64 -4 Z" />
          <path d="M 50 14 Q 68 14 76 -2" fill="none" />
        </g>
      </g>

      {/* pinta oros */}
      <g transform="translate(36, 64)">
        <circle r={10} fill={PALETTE.amarillo} stroke={sk} strokeWidth="1.4" />
        <circle r={5} fill={sk} />
        <circle r={2} fill={PALETTE.amarillo} />
      </g>
      <g transform="translate(204, 268)">
        <circle r={10} fill={PALETTE.amarillo} stroke={sk} strokeWidth="1.4" />
        <circle r={5} fill={sk} />
        <circle r={2} fill={PALETTE.amarillo} />
      </g>

      {/* baraja stack */}
      <g transform="translate(120, 288)">
        <rect x="-30" y="-2"  width="60" height="20" rx="3" fill={PALETTE.rojo} stroke={PALETTE.cafe} strokeWidth="1.4" />
        <rect x="-32" y="-6"  width="60" height="20" rx="3" fill={PALETTE.rojo} stroke={PALETTE.cafe} strokeWidth="1.4" />
        <rect x="-34" y="-10" width="60" height="20" rx="3" fill={PALETTE.rojo} stroke={PALETTE.cafe} strokeWidth="1.4" />
        <rect x="-31" y="-7"  width="54" height="14" fill="none" stroke={PALETTE.amarillo} strokeWidth=".8" />
        <text
          x="0" y="3"
          textAnchor="middle" fontSize="8"
          fontFamily="DM Serif Display, serif" fontStyle="italic"
          fill={PALETTE.amarillo} letterSpacing="2"
        >
          BARAJA · 40
        </text>
      </g>
    </CardFrame>
  );
}
