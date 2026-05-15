// ParquesLobby.jsx — the lobby page.
// Reuses Backdrop + Fireflies (mesa/components) for the atmosphere.
// Wires Sidebar + top bar + filter strip + table grid + CreateTableModal
// through the useStompLobby hook (swap for real STOMP client in prod).

const LOBBY_PALETTE = {
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

function ParquesLobby() {
  const palette = LOBBY_PALETTE;
  const { status, tables, onlineCount, latency, publish } =
    useStompLobby({ initialTables: seedTables() });

  const [filter, setFilter] = React.useState('todas');
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [enteringTable, setEnteringTable] = React.useState(null);

  const visible = tables.filter(t => {
    if (filter === 'amistosas' && t.bet !== 0) return false;
    if (filter === 'disponibles' && t.seats.filter(s => !s.occupant).length === 0) return false;
    if (filter === 'duras' && t.bet < 200) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = ({ name, bet }) => {
    publish('/app/parques/create', { name, bet, host: 'Juan C.', maxSeats: 4 });
    setCreateOpen(false);
    setToast(`Mesa "${name}" armada · esperando jugadores`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEnter = (table) => {
    setEnteringTable(table);
    setTimeout(() => setEnteringTable(null), 1800);
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: palette.deep,
      color: palette.cream,
      fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      display: 'flex',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(40px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes card-pop {
          0%   { opacity: 0; transform: scale(.8); }
          60%  { opacity: 1; transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes ficha-drop {
          0%   { transform: translateY(-12px) scale(.7); opacity: 0; }
          60%  { transform: translateY(2px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ff-pulse {
          0%, 100% { filter: blur(4px) brightness(1); }
          50%      { filter: blur(2px) brightness(1.4); }
        }
        @keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(.94) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50%      { opacity: .55; }
        }
      `}</style>

      {/* Backdrop reused from Noche Valle */}
      <Backdrop palette={palette} density="medium" />
      <Fireflies palette={palette} count={12} />

      {/* Left rail */}
      <Sidebar palette={palette} active="home"
        muted={muted} onMute={() => setMuted(m => !m)}
        onAction={() => {}} />

      {/* Main column */}
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
            <button style={{
              all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: palette.creamSoft, fontSize: 13, fontWeight: 600, opacity: .8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </button>
            <span style={{ width: 1, height: 16, background: palette.creamSoft, opacity: .15 }} />
            <div style={{ fontSize: 12, color: palette.creamSoft, opacity: .65, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              Modos · Parqués
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ConnectionChip palette={palette} status={status} latency={latency} />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,.04)',
              border: `1px solid ${palette.creamSoft}1a`,
              color: palette.cream, fontWeight: 700, fontSize: 13,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16">
                <ellipse cx="8" cy="8" rx="4.5" ry="6.5" fill={palette.amarillo} transform="rotate(-20 8 8)" />
                <path d="M 8 1.5 Q 5 8 8 14.5" stroke="rgba(0,0,0,.45)" strokeWidth="1" fill="none" transform="rotate(-20 8 8)" />
              </svg>
              1.240
              <span style={{ opacity: .55, fontWeight: 500, fontSize: 11 }}>granos</span>
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13, color: palette.creamSoft,
            }}>
              <span>Juan C.</span>
              <span style={{
                width: 32, height: 32, borderRadius: 999,
                background: `linear-gradient(135deg, ${palette.amarillo}, ${palette.rojo})`,
                border: `2px solid ${palette.deep}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 12, color: '#fff',
              }}>JC</span>
            </span>
          </div>
        </header>

        {/* Hero / page heading */}
        <section style={{
          padding: '4px 40px 18px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24,
          animation: 'hero-in .7s .1s ease-out backwards',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontSize: 11, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase',
              color: palette.amarillo, opacity: .95, marginBottom: 10,
            }}>
              <span>✦</span> Salón de Parqués <span>✦</span>
            </div>
            <h1 style={{
              margin: 0, fontFamily: 'DM Serif Display, serif',
              fontSize: 56, lineHeight: 0.95, letterSpacing: '-.02em',
              color: palette.cream,
            }}>
              Sentate donde te <em style={{ color: palette.amarillo, fontStyle: 'italic' }}>llamen las fichas</em>
            </h1>
            <p style={{
              margin: '12px 0 0', fontSize: 14, color: palette.creamSoft, opacity: .75,
              maxWidth: 560, lineHeight: 1.5,
            }}>
              Estas son las mesas abiertas ahorita. Si no te gusta ninguna,
              <strong style={{ color: palette.cream }}> armá la tuya en 10 segundos.</strong>
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} style={{
            all: 'unset', cursor: 'pointer', flexShrink: 0,
            padding: '14px 22px', borderRadius: 999,
            background: palette.amarillo, color: palette.deep,
            fontWeight: 800, fontSize: 14, letterSpacing: '.02em',
            boxShadow: `0 12px 30px ${palette.amarillo}55, inset 0 1px 0 rgba(255,255,255,.4)`,
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
              { v: 'disponibles', label: 'Con cupo', count: tables.filter(t => t.seats.some(s => !s.occupant) && t.status !== 'jugando').length },
              { v: 'amistosas', label: 'Amistosas', count: tables.filter(t => t.bet === 0).length },
              { v: 'duras', label: 'Apuesta alta', count: tables.filter(t => t.bet >= 200).length },
            ].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 16px', borderRadius: 999,
                fontSize: 13, fontWeight: 700,
                color: filter === f.v ? palette.deep : palette.creamSoft,
                background: filter === f.v ? palette.cream : 'transparent',
                border: `1px solid ${filter === f.v ? palette.cream : palette.creamSoft + '22'}`,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all .15s',
              }}>
                {f.label}
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 999,
                  background: filter === f.v ? palette.deep + '15' : 'rgba(255,255,255,.06)',
                  color: filter === f.v ? palette.deep : palette.creamSoft,
                  opacity: .8, fontWeight: 800,
                }}>{f.count}</span>
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,.04)',
            border: `1px solid ${palette.creamSoft}1a`,
            minWidth: 240,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={palette.creamSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".6">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre…"
              style={{
                all: 'unset', flex: 1,
                color: palette.cream, fontSize: 13,
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                all: 'unset', cursor: 'pointer', color: palette.creamSoft, opacity: .7,
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
        }}>
          <CreateTableTile palette={palette} onClick={() => setCreateOpen(true)} />
          {visible.map((t, idx) => (
            <div key={t.id} style={{
              animation: `card-enter .55s ${0.04 * idx}s cubic-bezier(.2,.7,.3,1) backwards`,
            }}>
              <TableCard table={t} palette={palette} onEnter={handleEnter}
                isNew={Date.now() - t.createdAt < 4000} />
            </div>
          ))}

          {/* Empty state inside grid (only if no results from filter/search) */}
          {visible.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '60px 24px', textAlign: 'center',
              color: palette.creamSoft, opacity: .6,
            }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginBottom: 6 }}>
                No hay mesas que coincidan
              </div>
              <div style={{ fontSize: 13 }}>Probá quitando filtros o armá la primera vos mismo.</div>
            </div>
          )}
        </main>

        {/* Bottom strip */}
        <footer style={{
          padding: '12px 40px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, color: palette.creamSoft, opacity: .7,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: palette.verde, boxShadow: `0 0 8px ${palette.verde}` }} />
            <strong style={{ color: palette.cream }}>{onlineCount.toLocaleString('es-CO')}</strong> cafeteros en línea
            &nbsp;·&nbsp;
            <strong style={{ color: palette.cream }}>{tables.length}</strong> mesas activas
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
            STOMP · /topic/parques/lobby · {latency}ms
          </span>
        </footer>
      </div>

      <CreateTableModal
        open={createOpen}
        palette={palette}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: palette.cream, color: palette.deep,
          padding: '14px 22px', borderRadius: 999,
          fontWeight: 700, fontSize: 14, zIndex: 1100,
          boxShadow: '0 20px 40px rgba(0,0,0,.4)',
          animation: 'toast-in .3s ease-out',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 999,
            background: palette.verde,
            animation: 'ff-pulse 1.2s ease-in-out infinite',
          }} />
          {toast}
        </div>
      )}

      {enteringTable && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(5,9,6,.86)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 18,
          animation: 'modal-bg-in .25s ease-out',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 999,
            border: `3px solid ${palette.amarillo}33`,
            borderTopColor: palette.amarillo,
            animation: 'spin .9s linear infinite',
          }} />
          <div style={{ textAlign: 'center', color: palette.cream }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, lineHeight: 1, marginBottom: 6 }}>
              Sentándote en "{enteringTable.name}"…
            </div>
            <div style={{ fontSize: 13, opacity: .7 }}>Saludando a los demás cafeteros.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionChip({ palette, status, latency }) {
  const cfg = {
    connecting:   { color: palette.amarillo, label: 'Conectando…', pulse: true },
    connected:    { color: palette.verde,    label: 'En vivo',     pulse: false },
    reconnecting: { color: palette.amarillo, label: 'Reconectando…', pulse: true },
    disconnected: { color: palette.rojo,     label: 'Desconectado', pulse: false },
  }[status] || { color: palette.creamSoft, label: status, pulse: false };

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
      {status === 'connected' && (
        <span style={{ color: palette.creamSoft, opacity: .55, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}>
          {latency}ms
        </span>
      )}
    </span>
  );
}

window.ParquesLobby = ParquesLobby;
