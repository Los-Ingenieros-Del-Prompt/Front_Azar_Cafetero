"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import { useBalance } from "@/hooks/useBalance";
import { useGameWebSocket, TableDTO } from "@/hooks/useGameWebSocket";
import ProfilePanel from "@/components/profile/ProfilePanel";
import PlayerHUD from "@/components/lobby/PlayerHUD";
import LobbyBackdrop from "@/components/lobby/LobbyBackdrop";
import LobbyFireflies from "@/components/lobby/LobbyFireflies";
import Sidebar from "./Sidebar";
import TableCard from "./TableCard";
import CreateTableModal from "./CreateTableModal";

const PALETTE = {
  deep: '#0E1610',
  deepSoft: '#1A241C',
  cream: '#F7EFD9',
  creamSoft: '#E5D8B5',
  amarillo: '#FCD116',
  azul: '#003893',
  rojo: '#CE1126',
  verde: '#27A86A',
  verdeLeaf: '#1B7A4C',
  cafe: '#6B4423',
};

const PARQUES_FLOOR_ID = "00000000-0000-0000-0000-000000000001";
const MAX_PLAYERS = 4;

export default function ParquesLobbyView() {
  const router = useRouter();
  const { user, logout } = useUserContext();
  const { amount } = useBalance();
  const {
    isConnected,
    tables,
    connect,
    fetchTables,
    createTable,
    notifyTableCreated,
    subscribeToFloor,
  } = useGameWebSocket();

  const [filter, setFilter] = useState('todas');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [enteringTableId, setEnteringTableId] = useState<string | null>(null);

  useEffect(() => {
    if (user) connect();
  }, [user, connect]);

  useEffect(() => {
    if (isConnected && user) {
      subscribeToFloor(PARQUES_FLOOR_ID, user.name);
      fetchTables(PARQUES_FLOOR_ID).catch(console.error);
    }
  }, [isConnected, user, subscribeToFloor, fetchTables]);

  const enterRoom = (tableId: string) => {
    setEnteringTableId(tableId);
    setTimeout(() => {
      router.push(`/games/parques/room/${tableId}`);
    }, 800);
  };

  const handleCreate = async ({ name, bet }: { name: string; bet: number }) => {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const table = await createTable(name, bet, PARQUES_FLOOR_ID, MAX_PLAYERS);
      notifyTableCreated(PARQUES_FLOOR_ID, {
        tableId: table.tableId,
        tableName: table.tableName,
        maxPlayers: MAX_PLAYERS,
        requiredBet: table.requiredBet,
      });
      setCreateOpen(false);
      enterRoom(table.tableId);
    } catch (error) {
      console.error("Failed to create table:", error);
      setToast("Error al crear la sala");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setCreating(false);
    }
  };

  const visible = tables.filter(t => {
    if (filter === 'amistosas' && t.requiredBet !== 0) return false;
    if (filter === 'disponibles' && t.playerCount >= (t.maxPlayers || MAX_PLAYERS)) return false;
    if (filter === 'duras' && t.requiredBet < 200) return false;
    if (search && !t.tableName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAction = (action: string) => {
    if (action === 'exit') {
      logout();
      router.replace("/");
    } else if (action === 'home') {
      router.push("/lobby");
    } else if (action === 'profile') {
      setPanelOpen(true);
    }
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: PALETTE.deep,
      color: PALETTE.cream,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      display: 'flex',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(40px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <LobbyBackdrop density="medium" />
      <LobbyFireflies count={12} />

      <Sidebar 
        palette={PALETTE} 
        active="home"
        muted={muted} 
        onMute={() => setMuted(!muted)}
        onAction={handleAction} 
      />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, position: 'relative', zIndex: 3,
      }}>
        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 40px',
          animation: 'hero-in .6s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button 
              onClick={() => router.push("/lobby")}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: PALETTE.creamSoft, fontSize: 13, fontWeight: 600, opacity: .8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </button>
            <span style={{ width: 1, height: 16, background: PALETTE.creamSoft, opacity: .15 }} />
            <div style={{ fontSize: 12, color: PALETTE.creamSoft, opacity: .65, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              Modos · Parqués
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ConnectionChip palette={PALETTE} isConnected={isConnected} />
          </div>
        </header>

        {/* Hero */}
        <section style={{
          padding: '4px 40px 18px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24,
          animation: 'hero-in .7s .1s ease-out backwards',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontSize: 11, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase',
              color: PALETTE.amarillo, opacity: .95, marginBottom: 10,
            }}>
              <span>✦</span> Salón de Parqués <span>✦</span>
            </div>
            <h1 style={{
              margin: 0, fontFamily: 'DM Serif Display, serif',
              fontSize: 56, lineHeight: 0.95, letterSpacing: '-.02em',
              color: PALETTE.cream,
            }}>
              Sentate donde te <em style={{ color: PALETTE.amarillo, fontStyle: 'italic' }}>llamen las fichas</em>
            </h1>
            <p style={{
              margin: '12px 0 0', fontSize: 14, color: PALETTE.creamSoft, opacity: .75,
              maxWidth: 560, lineHeight: 1.5,
            }}>
              Estas son las mesas abiertas ahorita. Si no te gusta ninguna,
              <strong style={{ color: PALETTE.cream }}> armá la tuya en 10 segundos.</strong>
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} style={{
            all: 'unset', cursor: 'pointer', flexShrink: 0,
            padding: '14px 22px', borderRadius: 999,
            background: PALETTE.amarillo, color: PALETTE.deep,
            fontWeight: 800, fontSize: 14, letterSpacing: '.02em',
            boxShadow: `0 12px 30px ${PALETTE.amarillo}55, inset 0 1px 0 rgba(255,255,255,.4)`,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            transition: 'transform .2s, box-shadow .2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Armar mesa
          </button>
        </section>

        {/* Filter strip */}
        <section style={{
          padding: '8px 40px 16px',
          display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between',
          animation: 'hero-in .7s .2s ease-out backwards',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { v: 'todas', label: 'Todas', count: tables.length },
              { v: 'disponibles', label: 'Con cupo', count: tables.filter(t => t.playerCount < (t.maxPlayers || MAX_PLAYERS)).length },
              { v: 'amistosas', label: 'Amistosas', count: tables.filter(t => t.requiredBet === 0).length },
              { v: 'duras', label: 'Apuesta alta', count: tables.filter(t => t.requiredBet >= 200).length },
            ].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 16px', borderRadius: 999,
                fontSize: 13, fontWeight: 700,
                color: filter === f.v ? PALETTE.deep : PALETTE.creamSoft,
                background: filter === f.v ? PALETTE.cream : 'transparent',
                border: `1px solid ${filter === f.v ? PALETTE.cream : PALETTE.creamSoft + '22'}`,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all .15s',
              }}>
                {f.label}
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 999,
                  background: filter === f.v ? PALETTE.deep + '15' : 'rgba(255,255,255,.06)',
                  color: filter === f.v ? PALETTE.deep : PALETTE.creamSoft,
                  opacity: .8, fontWeight: 800,
                }}>{f.count}</span>
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,.04)',
            border: `1px solid ${PALETTE.creamSoft}1a`,
            minWidth: 240,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PALETTE.creamSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".6">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre…"
              style={{
                all: 'unset', flex: 1,
                color: PALETTE.cream, fontSize: 13,
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                all: 'unset', cursor: 'pointer', color: PALETTE.creamSoft, opacity: .7,
                fontSize: 14, lineHeight: 1,
              }}>×</button>
            )}
          </div>
        </section>

        {/* Tables grid */}
        <main style={{
          padding: '8px 40px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 22,
          alignContent: 'start',
          flex: 1,
          overflowY: 'auto'
        }}>

          {visible.map((t, idx) => (
            <div key={t.tableId} style={{
              animation: `card-enter .55s ${0.04 * idx}s cubic-bezier(.2,.7,.3,1) backwards`,
            }}>
              <TableCard 
                table={t} 
                palette={PALETTE} 
                onEnter={enterRoom}
                isNew={Date.now() - t.createdAt < 10000} 
              />
            </div>
          ))}

          {visible.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '60px 24px', textAlign: 'center',
              color: PALETTE.creamSoft, opacity: .6,
            }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginBottom: 6 }}>
                No hay mesas que coincidan
              </div>
              <div style={{ fontSize: 13 }}>Probá quitando filtros o armá la primera vos mismo.</div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          padding: '12px 40px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, color: PALETTE.creamSoft, opacity: .7,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: PALETTE.verde, boxShadow: `0 0 8px ${PALETTE.verde}` }} />
            <strong style={{ color: PALETTE.cream }}>Activo</strong> 
            &nbsp;·&nbsp;
            <strong style={{ color: PALETTE.cream }}>{tables.length}</strong> mesas de Parqués
          </span>
        </footer>
      </div>

      <PlayerHUD />

      <ProfilePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onLogout={() => { setPanelOpen(false); handleAction('exit'); }}
        balance={amount}
      />

      <CreateTableModal
        open={createOpen}
        palette={PALETTE}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        creating={creating}
      />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: PALETTE.cream, color: PALETTE.deep,
          padding: '14px 22px', borderRadius: 999,
          fontWeight: 700, fontSize: 14, zIndex: 1100,
          boxShadow: '0 20px 40px rgba(0,0,0,.4)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          {toast}
        </div>
      )}

      {enteringTableId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(5,9,6,.86)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 18,
          animation: 'modal-bg-in .25s ease-out',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 999,
            border: `3px solid ${PALETTE.amarillo}33`,
            borderTopColor: PALETTE.amarillo,
            animation: 'spin .9s linear infinite',
          }} />
          <div style={{ textAlign: 'center', color: PALETTE.cream }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, lineHeight: 1, marginBottom: 6 }}>
              Sentándote en la mesa…
            </div>
            <div style={{ fontSize: 13, opacity: .7 }}>Saludando a los demás cafeteros.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionChip({ palette, isConnected }: { palette: any; isConnected: boolean }) {
  const cfg = isConnected 
    ? { color: palette.verde, label: 'En vivo', pulse: false }
    : { color: palette.amarillo, label: 'Conectando…', pulse: true };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 14px', borderRadius: 999,
      background: 'rgba(255,255,255,.04)',
      border: `1px solid ${cfg.color}33`,
      color: palette.cream, fontWeight: 700, fontSize: 12,
      letterSpacing: '.04em',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: 999,
        background: cfg.color,
        boxShadow: `0 0 8px ${cfg.color}`,
        animation: cfg.pulse ? 'pulse-soft 1.2s ease-in-out infinite' : 'none',
      }} />
      {cfg.label}
    </span>
  );
}
