// Sidebar.jsx — vertical icon rail on the left.
// Profile, wallet (granos), home (lobby), volume, divider, exit at bottom.

function Sidebar({ palette, active = 'home', onAction, muted, onMute }) {
  return (
    <aside style={{
      position: 'relative', zIndex: 4,
      width: 76, padding: '24px 0',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8,
      borderRight: `1px solid ${palette.creamSoft}10`,
      background: 'rgba(14,22,16,.4)',
      backdropFilter: 'blur(8px)',
    }}>
      {/* logo */}
      <div style={{ marginBottom: 18 }}>
        <img src="assets/logo.png" alt="" style={{ width: 36, height: 30, objectFit: 'contain', opacity: .9 }} />
      </div>

      <RailButton icon="user" label="Perfil" palette={palette}
        active={active === 'profile'} onClick={() => onAction?.('profile')} />
      <RailButton icon="wallet" label="Granos" palette={palette}
        active={active === 'wallet'} onClick={() => onAction?.('wallet')} />
      <RailButton icon="home" label="Lobby" palette={palette}
        active={active === 'home'} onClick={() => onAction?.('home')} />

      <span style={{ width: 28, height: 1, background: palette.creamSoft, opacity: .15, margin: '12px 0' }} />

      <RailButton icon={muted ? 'volume-off' : 'volume'} label={muted ? 'Sonido off' : 'Sonido on'}
        palette={palette} onClick={onMute} />

      <div style={{ flex: 1 }} />

      <RailButton icon="exit" label="Salir" palette={palette}
        accent={palette.rojo} onClick={() => onAction?.('exit')} />
    </aside>
  );
}

function RailButton({ icon, label, palette, active, onClick, accent }) {
  const [hover, setHover] = React.useState(false);
  const fg = active ? palette.amarillo : accent || palette.creamSoft;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        all: 'unset', cursor: 'pointer',
        position: 'relative',
        width: 44, height: 44, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? `${palette.amarillo}1a` : hover ? 'rgba(255,255,255,.06)' : 'transparent',
        transition: 'background .15s, color .15s',
      }}>
      <RailIcon name={icon} color={fg} />
      {active && (
        <span style={{
          position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 22, borderRadius: 2, background: palette.amarillo,
        }} />
      )}
      {hover && !active && (
        <span style={{
          position: 'absolute', left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)',
          background: palette.deepSoft, color: palette.cream,
          padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
          whiteSpace: 'nowrap',
          border: `1px solid ${palette.creamSoft}1a`,
          boxShadow: '0 8px 18px rgba(0,0,0,.45)',
          pointerEvents: 'none',
        }}>{label}</span>
      )}
    </button>
  );
}

function RailIcon({ name, color }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'user':   return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>;
    case 'wallet': return <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h14v4H5a2 2 0 0 1-2-2Z" /><path d="M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3" /><circle cx="17" cy="13" r="1.5" /><path d="M21 9v8h-5a3 3 0 1 1 0-6h5z" /></svg>;
    case 'home':   return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>;
    case 'volume': return <svg {...common}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
    case 'volume-off': return <svg {...common}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>;
    case 'exit':   return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    default: return null;
  }
}

window.Sidebar = Sidebar;
