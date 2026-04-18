"use client";

import { useState } from "react";
import { usePlayerHUD } from "@/hooks/usePlayerHUD";
import { useBalance }   from "@/hooks/useBalance";
import { useUserContext } from "@/context/UserContext";
import ProfilePanel from "@/components/profile/ProfilePanel";

interface PlayerHUDProps {
  onLogout?: () => void;
  onClaimDaily?: () => void;
}

export default function PlayerHUD({ onLogout }: PlayerHUDProps) {
  const { identity, loading: identityLoading } = usePlayerHUD();
  const { logout } = useUserContext();

  const {
    amount,
    canReceiveBonus,
    nextBonusCountdown,
    diff,
    loading: balanceLoading,
    claimBonus,
    claimingBonus,
  } = useBalance();

  const [panelOpen, setPanelOpen] = useState(false);

  const loading = identityLoading || balanceLoading;
  const handleLogout = onLogout ?? logout;

  return (
    <>
      <style>{`
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

        .hud-avatar-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: 50%;
          flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hud-avatar-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
          border-radius: 50%;
        }
        .hud-avatar-btn:active { transform: scale(0.96); }

        .hud-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.2);
          display: block;
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
        }

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
          position: relative;
        }

        .hud-balance-amount { color: #4ade80; font-weight: 500; }
        .hud-balance-amount.is-zero { color: #f87171; }

        .hud-diff {
          position: absolute;
          left: 0;
          top: -1.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          pointer-events: none;
          animation: diffFloat 2.5s ease-out forwards;
          white-space: nowrap;
        }
        .hud-diff.positive { color: #4ade80; }
        .hud-diff.negative { color: #f87171; }

        @keyframes diffFloat {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateY(-14px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-22px) scale(0.9); }
        }

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

        .hud-bonus-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border: none;
          border-radius: 100px;
          padding: 0.35rem 0.9rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(249, 115, 22, 0.4);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          animation: bonusPulse 2s ease-in-out infinite;
        }
        .hud-bonus-btn:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 4px 18px rgba(249, 115, 22, 0.55);
        }
        .hud-bonus-btn:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }

        @keyframes bonusPulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(249, 115, 22, 0.4); }
          50%       { box-shadow: 0 2px 20px rgba(249, 115, 22, 0.7); }
        }

        .hud-bonus-countdown {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.4);
          text-align: right;
          padding-right: 0.25rem;
        }

        @media (max-width: 480px) {
          .hud { top: 1rem; right: 1rem; }
        }
      `}</style>

      <ProfilePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onLogout={() => { setPanelOpen(false); handleLogout(); }}
        balance={amount}
      />

      <div className="hud" role="complementary" aria-label="HUD del jugador">

        {loading || !identity ? (
          <div className="hud-skeleton" aria-busy="true">
            <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div className="sk" style={{ width: 80, height: 10 }} />
              <div className="sk" style={{ width: 55, height: 9 }} />
            </div>
          </div>
        ) : (
          <div className="hud-pill">
            <button
              className="hud-avatar-btn"
              onClick={() => setPanelOpen(true)}
              aria-label="Abrir perfil"
              title="Ver perfil"
            >
              {identity.avatar?.startsWith("http") ? (
                <img
                  src={identity.avatar}
                  alt={identity.name}
                  className="hud-avatar"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="hud-avatar-fallback" aria-hidden="true">
                  {identity.avatar || identity.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <div className="hud-info">
              <span className="hud-name">{identity.name}</span>
              <span className="hud-balance">
                {diff && (
                  <span className={`hud-diff ${diff.startsWith("+") ? "positive" : "negative"}`}>
                    {diff}
                  </span>
                )}
                🪙&nbsp;
                <span className={`hud-balance-amount${amount === 0 ? " is-zero" : ""}`}>
                  {(amount ?? 0).toLocaleString("es-CO")}
                </span>
                &nbsp;fichas
              </span>
            </div>
          </div>
        )}

        {!loading && identity && canReceiveBonus && (
          <button
            className="hud-bonus-btn"
            onClick={claimBonus}
            disabled={claimingBonus}
            aria-label="Reclamar bono diario"
          >
            {claimingBonus ? "..." : "🎁 +100 fichas"}
          </button>
        )}

        {!loading && identity && !canReceiveBonus && nextBonusCountdown && (
          <p className="hud-bonus-countdown">
            Próximo bono en {nextBonusCountdown}
          </p>
        )}

      </div>
    </>
  );
}