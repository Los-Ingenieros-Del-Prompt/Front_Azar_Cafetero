"use client";

import React, { useRef, useState } from "react";

const PALETTE = {
  deep: "#0E1610",
  deepSoft: "#1A241C",
  cream: "#F7EFD9",
  creamSoft: "#E5D8B5",
  amarillo: "#FCD116",
  azul: "#003893",
  rojo: "#CE1126",
  verde: "#27A86A",
  cafe: "#6B4423",
};


const ACCENT = PALETTE.amarillo;

const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export interface GameCardProps {
  id: string;
  idx: string;
  title: string;
  kicker: string;
  copy: string;
  time: { players: string; duration: string };
  art: React.ReactNode;
  onSelect: (id: string) => void;
  delay?: number;
}

export default function GameCard({
  id,
  idx,
  title,
  kicker,
  copy,
  time,
  art,
  onSelect,
  delay = 0,
}: GameCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.transform = `perspective(1500px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-10px) translateZ(0)`;
    if (artRef.current) {
      artRef.current.style.transform = `translate3d(${-x * 14}px, ${-y * 14}px, 40px) scale(1.04)`;
    }
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(252,209,22,.35), transparent 55%)`;
    }
  };

  const onLeave = () => {
    setHover(false);
    if (cardRef.current) cardRef.current.style.transform = "";
    if (artRef.current) artRef.current.style.transform = "";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        animation: `card-enter .85s ${delay}s cubic-bezier(.2,.7,.3,1) backwards`,
      }}
    >
      {/* Card */}
      <button
        ref={cardRef}
        onMouseEnter={() => setHover(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => onSelect(id)}
        aria-label={`Entrar a ${title}`}
        style={{
          all: "unset",
          cursor: "pointer",
          width: 320,
          height: 448,
          position: "relative",
          transition: "transform .4s cubic-bezier(.2,.7,.3,1), filter .3s",
          transformStyle: "preserve-3d",
          filter: hover
            ? "drop-shadow(0 24px 36px rgba(0,0,0,.55)) drop-shadow(0 4px 10px rgba(252,209,22,.18))"
            : "drop-shadow(0 14px 28px rgba(0,0,0,.5))",
          animation: `card-float 7s ${delay + 0.5}s ease-in-out infinite`,
        }}
      >
        {/* card surface */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            overflow: "hidden",
            background: PALETTE.cream,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.04)",
          }}
        >
          <div
            ref={artRef}
            style={{
              width: "100%",
              height: "100%",
              transition: "transform .4s cubic-bezier(.2,.7,.3,1)",
              willChange: "transform",
            }}
          >
            {art}
          </div>
        </div>

        {/* glare overlay */}
        <div
          ref={glareRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            pointerEvents: "none",
            mixBlendMode: "soft-light",
            transition: "background .25s",
          }}
        />

        {/* foil edge */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            pointerEvents: "none",
            boxShadow: `inset 0 0 0 1px ${ACCENT}55, inset 0 0 0 2.5px ${PALETTE.cafe}aa`,
          }}
        />

        {/* number badge */}
        <div
          style={{
            position: "absolute",
            top: -16,
            left: -16,
            width: 56,
            height: 56,
            borderRadius: 999,
            background: ACCENT,
            color: PALETTE.deep,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "DM Serif Display, serif",
            fontSize: 26,
            border: `3px solid ${PALETTE.deep}`,
            boxShadow: "0 10px 24px rgba(0,0,0,.45)",
            transform: "translateZ(60px)",
          }}
        >
          {idx}
        </div>


      </button>

      {/* Caption below card */}
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: ACCENT,
            opacity: 0.9,
            marginBottom: 10,
          }}
        >
          {kicker}
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: "DM Serif Display, serif",
            fontSize: 56,
            lineHeight: 0.95,
            color: PALETTE.cream,
            letterSpacing: "-.01em",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: "14px auto 18px",
            fontSize: 14,
            lineHeight: 1.55,
            color: PALETTE.creamSoft,
            opacity: 0.85,
            maxWidth: 320,
          }}
        >
          {copy}
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            color: PALETTE.creamSoft,
            fontSize: 12,
            fontWeight: 600,
            opacity: 0.75,
            marginBottom: 22,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <UsersIcon /> {time.players}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: PALETTE.cream, opacity: 0.4 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ClockIcon /> {time.duration}
          </span>
        </div>
        <div>
          <button
            onClick={() => onSelect(id)}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "14px 30px",
              borderRadius: 999,
              background: ACCENT,
              color: PALETTE.deep,
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: ".02em",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              boxShadow: `0 10px 30px ${ACCENT}55, inset 0 1px 0 rgba(255,255,255,.4)`,
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 14px 36px ${ACCENT}77, inset 0 1px 0 rgba(255,255,255,.4)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = `0 10px 30px ${ACCENT}55, inset 0 1px 0 rgba(255,255,255,.4)`;
            }}
          >
            ¡Vamos a echar!
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mystery Card ─────────────────────────────────────────────────────────────

export function MysteryCard({ delay = 0 }: { delay?: number }) {
  const games = ["Dominó", "Cucunubá", "Rana", "Tute", "Cacho"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        animation: `card-enter .85s ${delay}s cubic-bezier(.2,.7,.3,1) backwards`,
      }}
    >
      <div
        style={{
          width: 320,
          height: 448,
          position: "relative",
          borderRadius: 18,
          border: `1.5px dashed ${PALETTE.creamSoft}55`,
          background: `linear-gradient(180deg, ${PALETTE.deepSoft}88 0%, ${PALETTE.deep}cc 100%)`,
          backdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 36,
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color .25s, background .25s, transform .25s",
          animation: `card-float 8.5s ${delay + 0.4}s ease-in-out infinite`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = PALETTE.amarillo + "aa";
          e.currentTarget.style.transform = "translateY(-6px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = PALETTE.creamSoft + "55";
          e.currentTarget.style.transform = "";
        }}
      >
        {/* faint flag bars */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", opacity: 0.08 }}>
          <div style={{ height: "33.3%", background: PALETTE.amarillo }} />
          <div style={{ height: "33.3%", background: PALETTE.azul }} />
          <div style={{ height: "33.4%", background: PALETTE.rojo }} />
        </div>

        <div
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: 130,
            lineHeight: 1,
            fontStyle: "italic",
            color: PALETTE.amarillo,
            opacity: 0.85,
            textShadow: `0 4px 24px ${PALETTE.amarillo}44`,
            position: "relative",
          }}
        >
          ?
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: PALETTE.amarillo,
            opacity: 0.9,
            position: "relative",
          }}
        >
          Próximamente
        </div>
        <div
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: 26,
            lineHeight: 1.1,
            color: PALETTE.cream,
            position: "relative",
          }}
        >
          Hay más en camino
        </div>
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: PALETTE.creamSoft,
            opacity: 0.75,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 6,
            position: "relative",
          }}
        >
          {games.map((g) => (
            <span
              key={g}
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                border: `1px solid ${PALETTE.creamSoft}33`,
                fontWeight: 600,
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: PALETTE.creamSoft,
            opacity: 0.6,
            marginBottom: 10,
          }}
        >
          Aún sin nombre
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: "DM Serif Display, serif",
            fontSize: 56,
            lineHeight: 0.95,
            color: PALETTE.cream,
            opacity: 0.55,
          }}
        >
          ¿Cuál pedís?
        </h2>
        <p style={{ margin: "14px auto 0", fontSize: 13, lineHeight: 1.55, color: PALETTE.creamSoft, opacity: 0.65, maxWidth: 280 }}>
          Decinos qué juego querés ver en la mesa la próxima.
        </p>
      </div>
    </div>
  );
}


