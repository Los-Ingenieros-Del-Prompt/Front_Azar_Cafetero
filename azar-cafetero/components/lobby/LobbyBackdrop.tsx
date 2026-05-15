"use client";

import React from "react";

const PALETTE = {
  deep: "#0E1610",
  deepSoft: "#1A241C",
  cream: "#F7EFD9",
  creamSoft: "#E5D8B5",
  amarillo: "#FCD116",
  azul: "#003893",
  rojo: "#CE1126",
  verde: "#27A86A",
  verdeLeaf: "#1B7A4C",
  cafe: "#6B4423",
};

type Density = "low" | "medium" | "high";

interface BackdropProps {
  density?: Density;
}

function PalmTree({ height, stroke }: { height: number; stroke: string }) {
  const fronds = 9;
  return (
    <g fill="none" stroke={stroke} strokeLinecap="round">
      <path
        d={`M 0 0 Q ${height * 0.04} ${-height * 0.5} ${-height * 0.02} ${-height}`}
        strokeWidth={Math.max(2, height / 80)}
      />
      {Array.from({ length: fronds }).map((_, i) => {
        const a = (i / (fronds - 1)) * Math.PI * 1.35 - Math.PI * 0.75;
        const len = height * 0.32 + (i % 2) * 8;
        const cx = -height * 0.02;
        const cy = -height;
        const x2 = cx + Math.cos(a) * len;
        const y2 = cy + Math.sin(a) * len * 0.85;
        const mx = (cx + x2) / 2;
        const my = (cy + y2) / 2 + 12;
        return (
          <g key={i}>
            <path
              d={`M ${cx} ${cy} Q ${mx} ${my} ${x2} ${y2}`}
              strokeWidth={Math.max(1.4, height / 140)}
            />
            {Array.from({ length: 6 }).map((_, j) => {
              const t = (j + 1) / 7;
              const bx =
                (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * mx + t * t * x2;
              const by =
                (1 - t) * (1 - t) * cy + 2 * (1 - t) * t * my + t * t * y2;
              const dx = x2 - cx,
                dy = y2 - cy;
              const llen = Math.hypot(dx, dy);
              const px = -dy / llen,
                py = dx / llen;
              const lLen = 10 * (1 - Math.abs(t - 0.5));
              return (
                <line
                  key={j}
                  x1={bx + px * lLen}
                  y1={by + py * lLen}
                  x2={bx - px * lLen}
                  y2={by - py * lLen}
                  strokeWidth="1.2"
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

function PalmLayer({
  count,
  band,
}: {
  count: number;
  band: "far" | "mid" | "near";
}) {
  const cfg = {
    far: { scale: 0.55, opacity: 0.32, baseY: 92, jitterY: 4 },
    mid: { scale: 0.85, opacity: 0.55, baseY: 100, jitterY: 6 },
    near: { scale: 1.2, opacity: 0.85, baseY: 110, jitterY: 8 },
  }[band];

  const palms = Array.from({ length: count }).map((_, i) => {
    const seed = i * 137 + (band === "far" ? 7 : band === "mid" ? 41 : 91);
    const x = (seed * 31) % 1600;
    const y = cfg.baseY - ((seed * 13) % cfg.jitterY);
    const h = 280 + ((seed * 7) % 220);
    const flip = seed % 2 === 0;
    return { x, y, h, flip, k: i + band };
  });

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMax slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: cfg.opacity,
      }}
    >
      {palms.map((p) => (
        <g
          key={p.k}
          transform={`translate(${p.x}, ${p.y * 10}) scale(${cfg.scale * (p.flip ? -1 : 1)}, ${cfg.scale})`}
        >
          <PalmTree
            height={p.h}
            stroke={band === "near" ? "#050a06" : PALETTE.deep}
          />
        </g>
      ))}
    </svg>
  );
}

export default function LobbyBackdrop({ density = "medium" }: BackdropProps) {
  const palmConfig = {
    low: { far: 4, mid: 3, near: 2 },
    medium: { far: 6, mid: 4, near: 3 },
    high: { far: 8, mid: 6, near: 4 },
  }[density];

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* aurora glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% 8%, ${PALETTE.verde}22, transparent 60%),
            radial-gradient(ellipse 60% 40% at 18% 90%, ${PALETTE.amarillo}1a, transparent 55%),
            radial-gradient(ellipse 60% 40% at 88% 88%, ${PALETTE.rojo}18, transparent 55%)
          `,
        }}
      />

      {/* stars */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.55,
        }}
      >
        {Array.from({ length: 80 }).map((_, i) => {
          const x = (i * 173 + 41) % 1600;
          const y = (i * 89 + 13) % 480;
          const r = 0.6 + ((i * 7) % 10) / 12;
          const o = 0.25 + ((i * 11) % 7) / 12;
          return (
            <circle key={i} cx={x} cy={y} r={r} fill={PALETTE.cream} opacity={o} />
          );
        })}
      </svg>

      {/* far mountains */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <path
          d="M 0 540 L 180 440 L 340 510 L 520 420 L 740 500 L 940 430 L 1180 510 L 1400 450 L 1600 480 L 1600 900 L 0 900 Z"
          fill={PALETTE.deepSoft}
          opacity="0.55"
        />
        <path
          d="M 0 640 L 220 560 L 460 630 L 660 540 L 880 620 L 1100 550 L 1400 610 L 1600 580 L 1600 900 L 0 900 Z"
          fill={PALETTE.deepSoft}
          opacity="0.85"
        />
      </svg>

      <PalmLayer count={palmConfig.far} band="far" />
      <PalmLayer count={palmConfig.mid} band="mid" />
      <PalmLayer count={palmConfig.near} band="near" />

      {/* ground fade */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "38%",
          background: `linear-gradient(to top, ${PALETTE.deep} 10%, transparent 100%)`,
        }}
      />
    </div>
  );
}
