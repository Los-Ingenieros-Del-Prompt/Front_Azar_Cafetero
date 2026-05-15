"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080";

export interface MesaConfig {
  game: string;
  visibility: "publica" | "privada";
  players: number;
  apuesta: number;
  aprendizaje: boolean;
}

interface MesaSetupModalProps {
  open: boolean;
  game: { id: string; title: string } | null;
  onClose: () => void;
}

function CoffeeBean({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <ellipse cx="8" cy="8" rx="4.5" ry="6.5" fill={color} transform="rotate(-20 8 8)" />
      <path d="M 8 1.5 Q 5 8 8 14.5" stroke="rgba(0,0,0,.5)" strokeWidth="1" fill="none" transform="rotate(-20 8 8)" />
    </svg>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: PALETTE.creamSoft,
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: 11, color: PALETTE.creamSoft, opacity: 0.55 }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Segment({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string; sub: string }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        padding: 4,
        borderRadius: 14,
        background: "rgba(255,255,255,.04)",
        border: `1px solid ${PALETTE.creamSoft}1a`,
      }}
    >
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            all: "unset",
            cursor: "pointer",
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            background: value === o.v ? PALETTE.cream : "transparent",
            color: value === o.v ? PALETTE.deep : PALETTE.cream,
            textAlign: "left",
            transition: "all .15s",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{o.label}</div>
          <div style={{ fontSize: 11, opacity: value === o.v ? 0.6 : 0.55 }}>{o.sub}</div>
        </button>
      ))}
    </div>
  );
}

export default function MesaSetupModal({
  open,
  game,
  onClose,
}: MesaSetupModalProps) {
  const router = useRouter();
  const [visibility, setVis] = useState<"publica" | "privada">("publica");
  const [players, setPlayers] = useState(4);
  const [apuesta, setApuesta] = useState(50);
  const [aprendizaje, setAprendizaje] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (game?.id === "brisca") setPlayers(2);
    if (game?.id === "parques") setPlayers(4);
  }, [game?.id]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open || !game) return null;

  const playerOptions = game.id === "brisca" ? [2, 4] : [2, 3, 4];

  const handleConfirm = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const endpoint =
        game.id === "parques"
          ? `${GATEWAY}/parques/create-table`
          : `${GATEWAY}/brisca/create-table`;

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPlayers: players,
          isPrivate: visibility === "privada",
          bet: apuesta,
          learningMode: aprendizaje,
        }),
      });

      if (!res.ok) throw new Error(`Error al crear mesa: ${res.status}`);

      const data = await res.json();
      const tableId = data.tableId ?? data.id ?? data.roomId;

      if (!tableId) throw new Error("No se recibió ID de mesa");

      const route = game.id === "parques" ? `/parques/${tableId}` : `/brisca/${tableId}`;
      router.push(route);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      setError(msg);
      setIsCreating(false);
    }
  };

  const handleJoinPublic = () => {
    // Navigate to game lobby page to browse/join tables
    const route = game.id === "parques" ? "/parques" : "/brisca";
    router.push(route);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "modal-bg-in .25s ease-out",
      }}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(5, 9, 6, .78)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* panel */}
      <div
        style={{
          position: "relative",
          width: "min(560px, 92vw)",
          background: PALETTE.deepSoft,
          color: PALETTE.cream,
          borderRadius: 22,
          border: `1px solid ${PALETTE.creamSoft}22`,
          boxShadow: "0 40px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04)",
          overflow: "hidden",
          animation: "modal-in .35s cubic-bezier(.2,.7,.3,1)",
        }}
      >
        {/* tricolor top bar */}
        <div style={{ display: "flex", height: 4 }}>
          <div style={{ flex: 1, background: PALETTE.amarillo }} />
          <div style={{ flex: 1, background: PALETTE.azul }} />
          <div style={{ flex: 1, background: PALETTE.rojo }} />
        </div>

        <div style={{ padding: "28px 32px 24px" }}>
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: PALETTE.amarillo,
                  marginBottom: 6,
                }}
              >
                Armando mesa
              </div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "DM Serif Display, serif",
                  fontSize: 38,
                  lineHeight: 1,
                  letterSpacing: "-.01em",
                }}
              >
                {game.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                all: "unset",
                cursor: "pointer",
                width: 36,
                height: 36,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,.05)",
                color: PALETTE.cream,
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,.05)")
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Visibility */}
            <Field label="¿Mesa pública o entre panas?">
              <Segment
                value={visibility}
                onChange={(v) => setVis(v as "publica" | "privada")}
                options={[
                  { v: "publica", label: "Pública", sub: "Cualquiera puede entrar" },
                  { v: "privada", label: "Privada", sub: "Solo con código" },
                ]}
              />
            </Field>

            {/* Players */}
            <Field label="¿Cuántos a la mesa?">
              <div style={{ display: "flex", gap: 10 }}>
                {playerOptions.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPlayers(n)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      flex: 1,
                      padding: "14px 0",
                      textAlign: "center",
                      borderRadius: 12,
                      background:
                        players === n ? PALETTE.amarillo : "rgba(255,255,255,.04)",
                      color: players === n ? PALETTE.deep : PALETTE.cream,
                      border: `1px solid ${players === n ? PALETTE.amarillo : PALETTE.creamSoft + "22"}`,
                      transition: "all .15s",
                      fontFamily: "DM Serif Display, serif",
                      fontSize: 28,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>

            {/* Apuesta */}
            <Field
              label="Apuesta en granos de café"
              hint={
                apuesta === 0
                  ? "Mesa amistosa, sin granos."
                  : `Cada jugador apuesta ${apuesta}.`
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={apuesta}
                  onChange={(e) => setApuesta(+e.target.value)}
                  style={{ flex: 1, accentColor: PALETTE.amarillo, height: 4 }}
                />
                <div
                  style={{
                    width: 100,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: `1px solid ${PALETTE.creamSoft}22`,
                  }}
                >
                  <CoffeeBean color={PALETTE.amarillo} />
                  <span
                    style={{
                      fontFamily: "DM Serif Display, serif",
                      fontSize: 20,
                    }}
                  >
                    {apuesta}
                  </span>
                </div>
              </div>
            </Field>

            {/* Modo aprendizaje */}
            <button
              onClick={() => setAprendizaje(!aprendizaje)}
              style={{
                all: "unset",
                cursor: "pointer",
                padding: "14px 16px",
                borderRadius: 12,
                background: aprendizaje
                  ? PALETTE.amarillo + "18"
                  : "rgba(255,255,255,.03)",
                border: `1px solid ${aprendizaje ? PALETTE.amarillo + "88" : PALETTE.creamSoft + "1f"}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "all .15s",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: aprendizaje ? PALETTE.amarillo : "transparent",
                  border: `1.5px solid ${aprendizaje ? PALETTE.amarillo : PALETTE.creamSoft + "66"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {aprendizaje && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PALETTE.deep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                  Modo aprendizaje
                </div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  Te van diciendo las jugadas, bueno pa&apos; los novatos.
                </div>
              </div>
            </button>

            {/* Error message */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: PALETTE.rojo + "22",
                  border: `1px solid ${PALETTE.rojo}55`,
                  fontSize: 13,
                  color: "#ff8080",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button
              onClick={onClose}
              style={{
                all: "unset",
                cursor: "pointer",
                flex: 1,
                padding: "14px 0",
                textAlign: "center",
                borderRadius: 999,
                border: `1px solid ${PALETTE.creamSoft}33`,
                color: PALETTE.cream,
                fontWeight: 700,
                fontSize: 14,
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "")
              }
            >
              Después
            </button>
            <button
              onClick={visibility === "publica" ? handleJoinPublic : handleConfirm}
              disabled={isCreating}
              style={{
                all: "unset",
                cursor: isCreating ? "not-allowed" : "pointer",
                flex: 2,
                padding: "14px 0",
                textAlign: "center",
                borderRadius: 999,
                background: PALETTE.amarillo,
                color: PALETTE.deep,
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: ".02em",
                boxShadow: `0 10px 30px ${PALETTE.amarillo}44`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: isCreating ? 0.7 : 1,
                transition: "opacity .15s",
              }}
            >
              {isCreating ? (
                "Armando mesa…"
              ) : visibility === "publica" ? (
                <>
                  Buscar mesa
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 5 7 7-7 7" /><path d="M5 12h14" />
                  </svg>
                </>
              ) : (
                <>
                  Crear mesa privada
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 5 7 7-7 7" /><path d="M5 12h14" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
