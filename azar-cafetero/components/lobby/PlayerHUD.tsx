"use client";

import { usePlayerHUD } from "@/hooks/usePlayerHUD";

interface PlayerHUDProps {
  /** Callback cuando el jugador reclama fichas diarias */
  onClaimDaily?: () => void;
  /** Callback para cerrar sesión */
  onLogout?: () => void;
}

export default function PlayerHUD({ onClaimDaily, onLogout }: PlayerHUDProps) {
  const { identity, loading, isZeroBalance } = usePlayerHUD();

  return (
    <>
      <style>{`
        /* ── HUD wrapper ── */
        .hud {
          position: fixed;
          top: 1.25rem;
          right: 1.25rem;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.6rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Pill principal ── */
        .hud-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 100px;
          padding: 0.4rem 1rem 0.4rem 0.4rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
          animation: hudIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes hudIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Avatar */
        .hud-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.2);
          flex-shrink: 0;
          background: rgba(255,255,255,0.1);
        }

        .hud-avatar-fallback {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* Info */
        .hud-info {
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
          min-width: 80px;
        }

        .hud-name {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          white-space: nowrap;
          line-height: 1.2;
        }

        .hud-balance {
          font-size: 0.72rem;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          line-height: 1.2;
        }

        .hud-balance-amount {
          color: #4ade80;
          font-weight: 500;
        }

        .hud-balance-amount.is-zero {
          color: #f87171;
        }

        /* ── Skeleton ── */
        .hud-skeleton {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          padding: 0.4rem 1rem 0.4rem 0.4rem;
        }

        .sk {
          border-radius: 100px;
          background: linear-gradient(90deg,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.14) 50%,
            rgba(255,255,255,0.06) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.3s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Zero-balance banner ── */
        .hud-alert {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(251, 191, 36, 0.35);
          border-radius: 12px;
          padding: 0.6rem 0.85rem;
          animation: alertIn 0.4s ease 0.1s both;
          max-width: 260px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }

        @keyframes alertIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hud-alert-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .hud-alert-text {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.75);
          font-weight: 300;
          line-height: 1.4;
          flex: 1;
        }

        .hud-alert-cta {
          font-size: 0.72rem;
          font-weight: 500;
          color: #fbbf24;
          background: none;
          border: 1px solid rgba(251,191,36,0.4);
          border-radius: 100px;
          padding: 0.3rem 0.75rem;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }

        .hud-alert-cta:hover {
          background: #fbbf24;
          color: #111;
        }

        /* Responsive: en móvil baja un poco */
        @media (max-width: 480px) {
          .hud { top: 1rem; right: 1rem; }
          .hud-alert { max-width: 200px; }
          .hud-alert-text { display: none; }
        }

        /* ── Logout button ── */
        .hud-logout {
          background: none;
          border: none;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          font-size: 0.7rem;
          padding: 0 0.25rem;
          line-height: 1;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .hud-logout:hover { color: rgba(255,255,255,0.75); }
      `}</style>

      <div className="hud" role="complementary" aria-label="HUD del jugador">

        {/* Pill: skeleton o datos reales — el botón de logout está siempre presente */}
        {loading || !identity ? (
          <div className="hud-skeleton" aria-busy="true" aria-label="Cargando perfil">
            <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div className="sk" style={{ width: 80, height: 10 }} />
              <div className="sk" style={{ width: 55, height: 9 }} />
            </div>
            {onLogout && (
              <button
                className="hud-logout"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="hud-pill">
            {/* Avatar: imagen si es URL, emoji/inicial si no */}
            {identity.avatar?.startsWith("http") ? (
              <img
                src={identity.avatar}
                alt={identity.name}
                className="hud-avatar"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="hud-avatar-fallback" aria-hidden="true">
                {identity.avatar || identity.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="hud-info">
              <span className="hud-name">{identity.name}</span>
              <span className="hud-balance">
                🪙&nbsp;
                <span className={`hud-balance-amount${isZeroBalance ? " is-zero" : ""}`}>
                  {identity.balance.toLocaleString("es-CO")}
                </span>
                &nbsp;fichas
              </span>
            </div>

            {onLogout && (
              <button
                className="hud-logout"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Aviso de saldo cero */}
        {isZeroBalance && !loading && (
          <div className="hud-alert" role="alert">
            <span className="hud-alert-icon">⚠️</span>
            <p className="hud-alert-text">Sin fichas disponibles</p>
            <button
              className="hud-alert-cta"
              onClick={onClaimDaily}
              aria-label="Reclamar fichas diarias"
            >
              Reclamar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
