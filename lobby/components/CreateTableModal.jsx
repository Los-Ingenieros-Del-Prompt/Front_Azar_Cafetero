// CreateTableModal.jsx — small form: nombre + apuesta required.
// Publishes to /app/parques/create when confirmed.

function CreateTableModal({ open, palette, onClose, onCreate }) {
  const [name, setName] = React.useState('');
  const [bet, setBet] = React.useState(50);
  const [touched, setTouched] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setName('');
      setBet(50);
      setTouched(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const nameError = touched && !name.trim();
  const valid = !!name.trim();

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onCreate({ name: name.trim(), bet });
  };

  // Suggested names — paisa flavor.
  const suggestions = ['La de los compas', 'Mesa del tinto', 'Pa\u2019 ganar', 'Sin estrés', 'Domingo familiar'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'modal-bg-in .25s ease-out',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(5,9,6,.78)', backdropFilter: 'blur(10px)',
      }} />

      <div style={{
        position: 'relative',
        width: 'min(520px, 92vw)',
        background: palette.deepSoft,
        color: palette.cream,
        borderRadius: 22,
        border: `1px solid ${palette.creamSoft}22`,
        boxShadow: '0 40px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04)',
        overflow: 'hidden',
        animation: 'modal-in .35s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ display: 'flex', height: 4 }}>
          <div style={{ flex: 1, background: palette.amarillo }} />
          <div style={{ flex: 1, background: palette.azul }} />
          <div style={{ flex: 1, background: palette.rojo }} />
        </div>

        <div style={{ padding: '28px 32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase',
                color: palette.amarillo, marginBottom: 6,
              }}>Armando mesa de Parqués</div>
              <h2 style={{
                margin: 0, fontFamily: 'DM Serif Display, serif', fontSize: 32, lineHeight: 1,
                letterSpacing: '-.01em',
              }}>¿Cómo le ponés?</h2>
            </div>
            <button onClick={onClose} aria-label="Cerrar" style={{
              all: 'unset', cursor: 'pointer',
              width: 36, height: 36, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,.05)', color: palette.cream,
              transition: 'background .15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>

            {/* Name */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: palette.creamSoft, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Nombre de la mesa
                </label>
                <span style={{ fontSize: 11, color: palette.creamSoft, opacity: .55 }}>
                  {name.length}/24
                </span>
              </div>
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                onBlur={() => setTouched(true)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Ej: La de los compas"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 16px', fontSize: 16,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,.04)',
                  border: `1.5px solid ${nameError ? palette.rojo + 'aa' : palette.creamSoft + '22'}`,
                  color: palette.cream,
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color .15s, background .15s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = palette.amarillo + 'aa'}
              />
              {nameError ? (
                <div style={{ fontSize: 11, color: palette.rojo, marginTop: 6, fontWeight: 600 }}>
                  Ponele un nombre, parcero.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => setName(s)} style={{
                      all: 'unset', cursor: 'pointer',
                      padding: '4px 10px',
                      fontSize: 11, fontWeight: 600,
                      color: palette.creamSoft,
                      background: 'rgba(255,255,255,.04)',
                      borderRadius: 999,
                      border: `1px solid ${palette.creamSoft}1a`,
                      transition: 'all .15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = palette.amarillo + '22'; e.currentTarget.style.color = palette.amarillo; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = palette.creamSoft; }}
                    >{s}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Bet */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: palette.creamSoft, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Apuesta requerida
                </label>
                <span style={{ fontSize: 11, color: palette.creamSoft, opacity: .65 }}>
                  {bet === 0 ? 'Mesa amistosa, sin apuesta.' : `Cada jugador entra con ${bet} granos.`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input type="range" min="0" max="1000" step="25"
                  value={bet} onChange={(e) => setBet(+e.target.value)}
                  style={{ flex: 1, accentColor: palette.amarillo, height: 4 }} />
                <div style={{
                  minWidth: 120, padding: '10px 16px',
                  borderRadius: 10, background: 'rgba(255,255,255,.05)',
                  border: `1px solid ${palette.creamSoft}22`,
                  display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <ellipse cx="8" cy="8" rx="4.5" ry="6.5" fill={palette.amarillo} transform="rotate(-20 8 8)" />
                    <path d="M 8 1.5 Q 5 8 8 14.5" stroke="rgba(0,0,0,.45)" strokeWidth="1" fill="none" transform="rotate(-20 8 8)" />
                  </svg>
                  <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22 }}>{bet}</span>
                </div>
              </div>

              {/* Bet presets */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[0, 25, 50, 100, 250, 500].map(v => (
                  <button key={v} onClick={() => setBet(v)} style={{
                    all: 'unset', cursor: 'pointer', flex: 1,
                    padding: '8px 0', textAlign: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: bet === v ? palette.amarillo : 'rgba(255,255,255,.04)',
                    color: bet === v ? palette.deep : palette.creamSoft,
                    borderRadius: 8,
                    border: `1px solid ${bet === v ? palette.amarillo : palette.creamSoft + '1a'}`,
                    transition: 'all .15s',
                  }}>{v === 0 ? 'Sin' : v}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginTop: 24, paddingTop: 18,
            borderTop: `1px solid ${palette.creamSoft}10`,
          }}>
            <div style={{ flex: 1, fontSize: 11, color: palette.creamSoft, opacity: .55, lineHeight: 1.5 }}>
              Tu mesa será <strong style={{ color: palette.cream }}>pública</strong> y aparecerá en el lobby.
              Vos sos el anfitrión.
            </div>
            <button onClick={onClose} style={{
              all: 'unset', cursor: 'pointer',
              padding: '12px 18px', borderRadius: 999,
              border: `1px solid ${palette.creamSoft}33`,
              color: palette.cream, fontWeight: 700, fontSize: 13,
            }}>Cancelar</button>
            <button onClick={submit} style={{
              all: 'unset', cursor: 'pointer',
              padding: '12px 22px', borderRadius: 999,
              background: palette.amarillo, color: palette.deep,
              fontWeight: 800, fontSize: 13, letterSpacing: '.02em',
              boxShadow: `0 10px 24px ${palette.amarillo}44`,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Armar la mesa
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CreateTableModal = CreateTableModal;
