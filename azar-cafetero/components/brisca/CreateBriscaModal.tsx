"use client";

import React, { useState } from "react";
import { SuitIcon } from "./SuitIcon";

interface CreateBriscaModalProps {
  open: boolean;
  palette: any;
  onClose: () => void;
  onCreate: (data: { name: string; bet: number; maxSeats: number }) => void;
  creating?: boolean;
}

export default function CreateBriscaModal({ open, palette, onClose, onCreate, creating }: CreateBriscaModalProps) {
  const [name, setName] = useState("");
  const [bet, setBet] = useState(100);
  const [maxSeats] = useState(4); // Always 4 seats (FFA)

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(5,9,6,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "modal-bg-in 0.3s ease-out",
    }}>
      <div style={{
        background: palette.deepSoft,
        width: "100%", maxWidth: 440, borderRadius: 24,
        border: `1px solid ${palette.creamSoft}22`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
        overflow: "hidden", position: "relative",
        animation: "modal-in 0.4s cubic-bezier(0.2, 0.7, 0.3, 1)",
      }}>
        <div style={{ padding: "32px 32px 24px" }}>
          <h2 style={{
            margin: 0, fontFamily: "DM Serif Display, serif",
            fontSize: 32, color: palette.cream, lineHeight: 1,
          }}>Repartir Mesa</h2>
          <p style={{ margin: "8px 0 0", color: palette.creamSoft, opacity: 0.7, fontSize: 14 }}>
            Personaliza tu salón de Brisca.
          </p>
        </div>

        <div style={{ padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: palette.amarillo, letterSpacing: ".1em", marginBottom: 8 }}>
              Nombre de la mesa
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cantina de los panas"
              style={{
                all: "unset", boxSizing: "border-box", width: "100%",
                background: "rgba(255,255,255,0.05)", border: `1.5px solid ${palette.creamSoft}1a`,
                borderRadius: 12, padding: "14px 16px", color: palette.cream, fontSize: 15,
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = palette.amarillo}
              onBlur={(e) => e.currentTarget.style.borderColor = `${palette.creamSoft}1a`}
            />
          </div>

          {/* Bet */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: palette.amarillo, letterSpacing: ".1em", marginBottom: 12 }}>
              Apuesta mínima
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[100, 250, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => setBet(val)}
                  style={{
                    all: "unset", cursor: "pointer",
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                    background: bet === val ? palette.cream : "rgba(255,255,255,0.05)",
                    color: bet === val ? palette.deep : palette.creamSoft,
                    border: `1px solid ${bet === val ? palette.cream : palette.creamSoft + "22"}`,
                    transition: "all 0.15s",
                  }}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{
                all: "unset", cursor: "pointer", flex: 1, padding: "14px", borderRadius: 14,
                textAlign: "center", fontWeight: 700, color: palette.creamSoft,
                background: "rgba(255,255,255,0.05)",
              }}
            >Cancelar</button>
            <button
              disabled={!name.trim() || creating}
              onClick={() => onCreate({ name, bet, maxSeats })}
              style={{
                all: "unset", cursor: "pointer", flex: 2, padding: "14px", borderRadius: 14,
                textAlign: "center", fontWeight: 800, color: palette.deep,
                background: palette.amarillo, opacity: (!name.trim() || creating) ? 0.5 : 1,
                boxShadow: `0 8px 20px ${palette.amarillo}44`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              {creating ? "Creando..." : "Mesa lista"}
              {!creating && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
