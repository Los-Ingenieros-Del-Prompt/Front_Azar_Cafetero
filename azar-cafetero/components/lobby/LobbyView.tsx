"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import PlayerHUD from "@/components/lobby/PlayerHUD";
import LobbyBackdrop from "@/components/lobby/LobbyBackdrop";
import LobbyFireflies from "@/components/lobby/LobbyFireflies";
import LobbyGameCard, { MysteryCard } from "@/components/lobby/LobbyGameCard";
import { ParquesCardArt, BriscaCardArt } from "@/components/lobby/LobbyCardArt";

// ─── Palette & Copy ───────────────────────────────────────────────────────────

const PALETTE = {
  deep: "#0E1610",
  deepSoft: "#1A241C",
  cream: "#F7EFD9",
  creamSoft: "#E5D8B5",
  amarillo: "#FCD116",
  azul: "#003893",
  rojo: "#CE1126",
  verde: "#27A86A",
};

const COPY = {
  eyebrow: "Escogé tu mesa, parcero",
  title: "La noche está",
  titleAccent: "pa\u2019 jugar",
  sub: (
    <>
      Dos clásicos colombianos. Una baraja, un tablero, los panas conectados y un tinto
      caliente. <strong>Vos pedís la mesa.</strong>
    </>
  ),
  parques: {
    kicker: "Tablero · Tradición",
    copy:
      "Saque par y arranque. Aquí se reza, se sopla y se grita cuando le caen el cinco. El clásico de las tardes en familia.",
  },
  brisca: {
    kicker: "Cartas · Baraja Española",
    copy:
      "40 cartas, una pinta de triunfo, dos parejas. Se gana con la mirada tanto como con la mano. Bueno pa\u2019 aprender rapidito.",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────



function TopBar({ userName, userAvatar, balance, onOpenProfile }: {
  userName: string;
  userAvatar?: string;
  balance?: number | null;
  onOpenProfile?: () => void;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 56px",
        position: "relative",
        zIndex: 4,
        animation: "hero-in .8s ease-out",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src="/images/logo.jpeg"
            alt="Azar Cafetero"
            style={{ width: 52, height: 44, objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, lineHeight: 1, color: PALETTE.cream }}>
            Azar Cafetero
          </div>
          <div style={{ fontSize: 10, color: PALETTE.amarillo, opacity: 0.85, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 3 }}>
            Mesa abierta
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 13, fontWeight: 600 }}>
        <a style={{ color: PALETTE.cream, opacity: 1, textDecoration: "none", position: "relative" }}>
          Mesas
          <span style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 2, background: PALETTE.amarillo, borderRadius: 1 }} />
        </a>
        <a style={{ color: PALETTE.creamSoft, opacity: 0.7, textDecoration: "none" }}>Amigos</a>
        <a style={{ color: PALETTE.creamSoft, opacity: 0.7, textDecoration: "none" }}>Ranking</a>
      </nav>

      {/* User info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
        {/* balance */}
        {balance != null && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,.05)",
              border: `1px solid ${PALETTE.creamSoft}1a`,
              color: PALETTE.cream,
              fontWeight: 700,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16">
              <ellipse cx="8" cy="8" rx="4.5" ry="6.5" fill={PALETTE.amarillo} transform="rotate(-20 8 8)" />
              <path d="M 8 1.5 Q 5 8 8 14.5" stroke="rgba(0,0,0,.45)" strokeWidth="1" fill="none" transform="rotate(-20 8 8)" />
            </svg>
            {balance.toLocaleString("es-CO")}
            <span style={{ opacity: 0.55, fontWeight: 500, fontSize: 11 }}>granos</span>
          </span>
        )}

        {/* avatar */}
        <button
          onClick={onOpenProfile}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: PALETTE.creamSoft,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${PALETTE.amarillo}, ${PALETTE.rojo})`,
              border: `2px solid ${PALETTE.deep}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 12,
              color: "#fff",
              overflow: "hidden",
            }}
          >
            {userAvatar?.startsWith("http") ? (
              <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </span>
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "12px 48px 28px",
        position: "relative",
        zIndex: 3,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: PALETTE.amarillo,
          opacity: 0.95,
          marginBottom: 16,
          animation: "hero-in .7s ease-out",
        }}
      >
        <span style={{ width: 24, height: 1, background: PALETTE.amarillo, opacity: 0.5 }} />
        <span>✦ {COPY.eyebrow} ✦</span>
        <span style={{ width: 24, height: 1, background: PALETTE.amarillo, opacity: 0.5 }} />
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "DM Serif Display, serif",
          fontSize: 76,
          lineHeight: 0.95,
          color: PALETTE.cream,
          letterSpacing: "-.02em",
          animation: "hero-in .8s .1s ease-out backwards",
        }}
      >
        {COPY.title}{" "}
        <em
          style={{
            fontStyle: "italic",
            color: PALETTE.amarillo,
            textShadow: `0 4px 30px ${PALETTE.amarillo}55`,
          }}
        >
          {COPY.titleAccent}
        </em>
      </h1>
      <p
        style={{
          margin: "16px auto 0",
          maxWidth: 560,
          fontSize: 15,
          lineHeight: 1.6,
          color: PALETTE.creamSoft,
          opacity: 0.82,
          animation: "hero-in .8s .2s ease-out backwards",
        }}
      >
        {COPY.sub}
      </p>
    </section>
  );
}



// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LobbyView() {
  const router = useRouter();
  const { logout } = useUserContext();

  const [toast, setToast] = useState<string | null>(null);

  const openMesa = (id: string) => {
    router.push(`/${id}`);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes card-enter {
          from { opacity: 0; transform: translateY(40px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-bg-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(.94) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes ff-pulse {
          0%, 100% { filter: blur(4px) brightness(1); }
          50%      { filter: blur(2px) brightness(1.4); }
        }
      `}</style>

      {/* PlayerHUD — fixed top-right */}
      <PlayerHUD onLogout={handleLogout} />

      {/* Full-page wrapper */}
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: PALETTE.deep,
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
          color: PALETTE.cream,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Animated background */}
        <LobbyBackdrop density="medium" />
        <LobbyFireflies count={14} />

        {/* Top bar — hidden on mobile since PlayerHUD covers it */}
        <div style={{ display: "none" }}>
          <TopBar
            userName=""
            onOpenProfile={() => {}}
          />
        </div>

        {/* Hero heading */}
        <Hero />

        {/* Three game cards */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 56,
            padding: "8px 56px 40px",
            position: "relative",
            zIndex: 3,
            flexWrap: "wrap",
          }}
        >
          <LobbyGameCard
            id="parques"
            idx="I"
            title="Parqués"
            kicker={COPY.parques.kicker}
            copy={COPY.parques.copy}
            players="312"
            time={{ players: "2–4 jugadores", duration: "20–40 min" }}
            art={<ParquesCardArt />}
            onSelect={openMesa}
            delay={0.15}
          />

          <LobbyGameCard
            id="brisca"
            idx="II"
            title="Brisca"
            kicker={COPY.brisca.kicker}
            copy={COPY.brisca.copy}
            players="184"
            time={{ players: "2 ó 4", duration: "10–20 min" }}
            art={<BriscaCardArt />}
            onSelect={openMesa}
            delay={0.3}
          />

          <MysteryCard delay={0.45} />
        </main>



        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              background: PALETTE.cream,
              color: PALETTE.deep,
              padding: "14px 22px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              zIndex: 1100,
              boxShadow: "0 20px 40px rgba(0,0,0,.4)",
              animation: "toast-in .3s ease-out",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: PALETTE.verde,
                animation: "ff-pulse 1.2s ease-in-out infinite",
              }}
            />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
