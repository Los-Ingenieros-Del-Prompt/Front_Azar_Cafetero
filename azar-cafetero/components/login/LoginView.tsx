"use client";

import React from "react";
import LobbyBackdrop from "@/components/lobby/LobbyBackdrop";
import LobbyFireflies from "@/components/lobby/LobbyFireflies";
import LoginCard from "./LoginCard";

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

interface FeatureProps {
  icon: string;
  label: string;
  sub: string;
}

function Feature({ icon, label, sub }: FeatureProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "rgba(255,255,255,.05)",
          border: `1px solid ${PALETTE.creamSoft}1a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: PALETTE.cream }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: PALETTE.creamSoft, opacity: 0.65 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

export default function LoginView() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: PALETTE.deep,
        color: PALETTE.cream,
        fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(40px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ff-pulse {
          0%, 100% { filter: blur(4px) brightness(1); }
          50%      { filter: blur(2px) brightness(1.4); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Backdrop layers */}
      <LobbyBackdrop density="medium" />
      <LobbyFireflies count={14} />

      {/* Slim top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 56px",
          position: "relative",
          zIndex: 4,
          animation: "hero-in .7s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/images/logo.jpeg"
            alt="Logo"
            style={{ width: 44, height: 38, objectFit: "contain", opacity: 0.9 }}
          />
          <div
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: 18,
              lineHeight: 1,
              color: PALETTE.cream,
            }}
          >
            Azar{" "}
            <em style={{ fontStyle: "italic", color: PALETTE.amarillo }}>
              Cafetero
            </em>
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontSize: 12,
            color: PALETTE.creamSoft,
            opacity: 0.75,
          }}
        >
          <span style={{ display: "inline-flex" }}>
            <span style={{ width: 14, height: 4, background: PALETTE.amarillo }} />
            <span style={{ width: 14, height: 4, background: PALETTE.azul }} />
            <span style={{ width: 14, height: 4, background: PALETTE.rojo }} />
          </span>
          <span style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>
            Versión beta
          </span>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1.05fr",
          gap: 80,
          alignItems: "center",
          padding: "20px 80px 40px",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Left: Login Card */}
        <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <LoginCard onError={setError} onLoadingChange={setIsLoading} isLoading={isLoading} />
          
          {/* Error Message */}
          {error && (
            <div style={{
              maxWidth: 400,
              padding: "12px 18px",
              background: "#ce112615",
              border: `1px solid ${PALETTE.rojo}33`,
              borderRadius: 12,
              color: PALETTE.rojo,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "hero-in .3s ease-out",
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              {error}
            </div>
          )}
        </div>

        {/* Right: Editorial Hero */}
        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: PALETTE.amarillo,
              opacity: 0.95,
              marginBottom: 22,
              animation: "hero-in .7s ease-out",
            }}
          >
            <span
              style={{
                width: 28,
                height: 1,
                background: PALETTE.amarillo,
                opacity: 0.5,
              }}
            />
            ✦ Entra en un mundo ✦
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "DM Serif Display, serif",
              fontSize: 96,
              lineHeight: 0.95,
              color: PALETTE.cream,
              letterSpacing: "-.025em",
              animation: "hero-in .8s .1s ease-out backwards",
            }}
          >
            Donde la{" "}
            <em
              style={{
                fontStyle: "italic",
                color: PALETTE.amarillo,
                textShadow: `0 6px 40px ${PALETTE.amarillo}55`,
                position: "relative",
              }}
            >
              Tradición
            </em>
            <br />
            se Juega
          </h1>
          <p
            style={{
              margin: "24px 0 0",
              maxWidth: 480,
              fontSize: 16,
              lineHeight: 1.6,
              color: PALETTE.creamSoft,
              opacity: 0.82,
              animation: "hero-in .8s .2s ease-out backwards",
            }}
          >
            Parqués, brisca y todos los clásicos colombianos en una sola mesa.
            <strong style={{ color: PALETTE.cream }}>
              {" "}
              Conectate, jugá con los panas, y que la suerte te acompañe.
            </strong>
          </p>

          {/* Feature row */}
          <div
            style={{
              display: "flex",
              gap: 36,
              marginTop: 36,
              animation: "hero-in .8s .3s ease-out backwards",
            }}
          >
            <Feature icon="🃏" label="2 juegos clásicos" sub="Parqués · Brisca" />
            <Feature icon="☕" label="Granos de café" sub="moneda de la casa" />
            <Feature icon="🌴" label="Mesa abierta" sub="24 / 7, donde estés" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "16px 56px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 3,
          color: PALETTE.creamSoft,
          fontSize: 12,
          animation: "hero-in .8s .5s ease-out backwards",
        }}
      >
        <span style={{ opacity: 0.55 }}>
          © 2026 Azar Cafetero · Hecho con tinto en Colombia
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            opacity: 0.65,
          }}
        >
          <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
            Sobre nosotros
          </a>
          <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
            Soporte
          </a>
          <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
            Privacidad
          </a>
        </span>
      </footer>

      {/* Signing-in overlay */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(5,9,6,.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 22,
            color: PALETTE.cream,
            animation: "hero-in .25s ease-out",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              border: `3px solid ${PALETTE.amarillo}33`,
              borderTopColor: PALETTE.amarillo,
              animation: "spin .9s linear infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: 28,
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              Sirviendo el tinto…
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Te llevamos a la mesa en un segundito.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
