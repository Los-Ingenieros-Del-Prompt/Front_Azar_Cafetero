"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { mockBuildingLayout } from "@/app/lobby/mockBuildingLayout";
import PlayerHUD from "@/components/lobby/PlayerHUD";
import { useUserContext } from "@/context/UserContext";

interface Floor {
  id: string;
  number: number;
  name: string;
  route: string;
  icon: string;
  description: string;
  available: boolean;
  color: string;
}

interface BuildingLayout {
  floors: Floor[];
}

interface FloorDTO {
  name: string;
  icon: string;
  route: string;
}

const FLOOR_COLORS = ["#f472b6", "#facc15", "#34d399", "#60a5fa", "#a78bfa"];

function mapDTOtoFloors(dtos: FloorDTO[]): Floor[] {
  return dtos.map((dto, index) => ({
    id: `floor-${index + 1}`,
    number: index + 1,
    name: dto.name,
    icon: dto.icon,
    route: dto.route,
    description: "",
    available: true,
    color: FLOOR_COLORS[index % FLOOR_COLORS.length],
  }));
}

const LOBBY_API = process.env.NEXT_PUBLIC_LOBBY_URL ?? "http://localhost:8081";

async function fetchBuildingLayout(): Promise<BuildingLayout> {
  if (!process.env.NEXT_PUBLIC_LOBBY_URL) return mockBuildingLayout;
  try {
    const res = await fetch(`${LOBBY_API}building/layout`);
    if (!res.ok) throw new Error(`Error al cargar el edificio: ${res.status}`);
    const data: FloorDTO[] = await res.json();
    return { floors: mapDTOtoFloors(data) };
  } catch {
    return mockBuildingLayout;
  }
}

export default function LobbyView() {
  const router = useRouter();
  const { logout } = useUserContext();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [navigating, setNavigating] = useState<string | null>(null);
  const [active, setActive] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetchBuildingLayout()
      .then((data) => setFloors(data.floors))
      .finally(() => setLoading(false));
  }, []);

  const handleFloorClick = (floor: Floor): void => {
    if (!floor.available || navigating) return;
    setNavigating(floor.id);
    router.push(floor.route);
  };

  const goTo = (index: number) => {
    setActive(Math.max(0, Math.min(index, floors.length - 1)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) goTo(active + (delta > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const handleClaimDaily = () => router.push("/daily-reward");
  const handleLogout = () => { logout(); router.replace("/"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .lobby-root {
          min-height: 100vh;
          background-image:
            linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.5)),
            url('/images/backgroundLogin.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        .lobby-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 0 1.5rem;
          animation: fadeDown 0.6s ease both;
        }

        .lobby-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0.75rem;
          font-weight: 400;
        }

        .lobby-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 0.6rem;
        }

        .lobby-sub {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.5);
          font-weight: 300;
        }

        .slider-viewport {
          width: 100%;
          max-width: 900px;
          padding: 1rem 0 2rem;
          position: relative;
        }

        .slider-track {
          display: flex;
          gap: 1.25rem;
          padding: 0 calc(50% - 200px);
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .game-card {
          flex-shrink: 0;
          width: 400px;
          min-height: 480px;
          background: #fff;
          border-radius: 24px;
          padding: 2.75rem 2.5rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          outline: none;
          transition:
            transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.45s ease,
            box-shadow 0.45s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          user-select: none;
        }

        .game-card.is-inactive {
          transform: scale(0.88);
          opacity: 0.45;
          cursor: default;
          pointer-events: none;
        }

        .game-card.is-active {
          transform: scale(1);
          opacity: 1;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        .game-card.is-active:hover { transform: scale(1.02); }

        .game-card.navigating {
          opacity: 0.5;
          pointer-events: none;
        }

        .card-bg {
          position: absolute;
          inset: 0;
          background: var(--accent, #111);
          opacity: 0.07;
          transition: opacity 0.3s;
        }

        .game-card.is-active:hover .card-bg { opacity: 0.12; }

        .card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--accent, #111);
          border-radius: 24px 24px 0 0;
        }

        .card-icon-wrap {
          position: absolute;
          top: 2.5rem;
          right: 2rem;
          font-size: 6rem;
          line-height: 1;
          opacity: 0.15;
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
        }

        .game-card.is-active:hover .card-icon-wrap {
          opacity: 0.22;
          transform: scale(1.06) rotate(-4deg);
        }

        .card-content { position: relative; z-index: 1; }

        .card-floor-label {
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent, #888);
          font-weight: 500;
          margin-bottom: 0.6rem;
        }

        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: #111;
          line-height: 1.05;
          margin-bottom: 0.75rem;
        }

        .card-desc {
          font-size: 0.88rem;
          color: #777;
          font-weight: 300;
          line-height: 1.6;
          max-width: 280px;
          margin-bottom: 2rem;
        }

        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #111;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.75rem 1.4rem;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, gap 0.2s;
        }

        .game-card.is-active:hover .card-cta {
          background: var(--accent, #111);
          gap: 0.9rem;
        }

        .cta-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .slider-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
          animation: fadeUp 0.7s ease 0.3s both;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s, width 0.25s;
        }

        .dot.active {
          background: #fff;
          width: 22px;
          border-radius: 3px;
        }

        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
          z-index: 10;
        }

        .slider-arrow:hover  { background: rgba(255,255,255,0.22); }
        .slider-arrow:disabled { opacity: 0.2; cursor: default; }
        .slider-arrow.prev { left: 1rem; }
        .slider-arrow.next { right: 1rem; }

        .skeleton-card {
          flex-shrink: 0;
          width: 400px;
          min-height: 480px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
          position: relative;
        }

        .skeleton-block {
          border-radius: 6px;
          background: linear-gradient(90deg,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.06) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        .skeleton-inner {
          position: absolute;
          bottom: 2.75rem;
          left: 2.5rem;
          right: 2.5rem;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .game-card, .skeleton-card { width: 300px; min-height: 400px; }
          .card-name { font-size: 1.9rem; }
          .slider-track { padding: 0 calc(50% - 150px); }
          .slider-arrow { display: none; }
        }
      `}</style>

      {/* HUD fijo — se monta inmediatamente, independiente del slider */}
      <PlayerHUD onClaimDaily={handleClaimDaily} onLogout={handleLogout} />

      <div className="lobby-root">
        <header className="lobby-header">
          <p className="lobby-eyebrow">Casino Nacional</p>
          <h1 className="lobby-title">¿A qué jugamos hoy?</h1>
          <p className="lobby-sub">Desliza y elige tu juego</p>
        </header>

        <div
          className="slider-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {!loading && (
            <>
              <button
                className="slider-arrow prev"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label="Anterior"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="slider-arrow next"
                onClick={() => goTo(active + 1)}
                disabled={active === floors.length - 1}
                aria-label="Siguiente"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <div
            className="slider-track"
            style={{ transform: `translateX(calc(-${active} * (400px + 1.25rem)))` }}
            role="region"
            aria-label="Juegos disponibles"
          >
            {loading ? (
              [0, 1].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-inner">
                    <div className="skeleton-block" style={{ width: "40%", height: 10, marginBottom: "0.8rem" }} />
                    <div className="skeleton-block" style={{ width: "70%", height: 28, marginBottom: "0.6rem" }} />
                    <div className="skeleton-block" style={{ width: "90%", height: 10, marginBottom: "0.4rem" }} />
                    <div className="skeleton-block" style={{ width: "60%", height: 10, marginBottom: "2rem" }} />
                    <div className="skeleton-block" style={{ width: 120, height: 38, borderRadius: 100 }} />
                  </div>
                </div>
              ))
            ) : (
              floors.map((floor, i) => (
                <div
                  key={floor.id}
                  className={[
                    "game-card",
                    i === active ? "is-active" : "is-inactive",
                    navigating === floor.id ? "navigating" : "",
                  ].join(" ")}
                  style={{ "--accent": floor.color } as React.CSSProperties}
                  onClick={() => i === active && handleFloorClick(floor)}
                  onKeyDown={(e) => e.key === "Enter" && i === active && handleFloorClick(floor)}
                  role="button"
                  tabIndex={i === active ? 0 : -1}
                  aria-label={`Jugar ${floor.name}`}
                  aria-disabled={!floor.available || i !== active}
                >
                  <div className="card-bg" />
                  <div className="card-accent" />
                  <div className="card-icon-wrap" aria-hidden="true">{floor.icon}</div>

                  <div className="card-content">
                    <p className="card-floor-label">Piso {floor.number}</p>
                    <h2 className="card-name">{floor.name}</h2>
                    <p className="card-desc">{floor.description}</p>

                    <button
                      className="card-cta"
                      onClick={(e) => { e.stopPropagation(); handleFloorClick(floor); }}
                      tabIndex={i === active ? 0 : -1}
                      aria-label={`Entrar a ${floor.name}`}
                    >
                      {navigating === floor.id ? (
                        <span className="cta-spinner" />
                      ) : (
                        <>
                          Jugar ahora
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
                              stroke="currentColor" strokeWidth="1.5"
                              strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {!loading && (
          <div className="slider-dots" role="tablist" aria-label="Navegación del slider">
            {floors.map((floor, i) => (
              <button
                key={floor.id}
                className={`dot${i === active ? " active" : ""}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={`Ir a ${floor.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
