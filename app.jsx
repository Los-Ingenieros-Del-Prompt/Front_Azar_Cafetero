/* ====== BRISCA WAITING ROOM — POPUP / FFA ====== */

const { useState, useEffect, useMemo } = React;

// ---- mock data ----
const MOCK_BOTS_AVAILABLE = [
  { id: "rosa", name: "Rosa la Cafetera",  initials: "RC" },
  { id: "tito", name: "Tito el Mañoso",    initials: "TM" },
  { id: "mecha", name: "Doña Mecha",       initials: "DM" },
  { id: "chepe", name: "Chepe Tinto",      initials: "CT" },
];

const DIFFICULTIES = [
  { value: "facil", label: "Suave — pa' calentar" },
  { value: "medio", label: "Medio — estrategia" },
  { value: "duro",  label: "Duro — pa' los pros" },
];

const SUITS = [
  { id: "oros",    label: "Oros",    glyph: "●", color: "#f5d547" },
  { id: "copas",   label: "Copas",   glyph: "♥", color: "#c54a3f" },
  { id: "espadas", label: "Espadas", glyph: "♠", color: "#5a89c6" },
  { id: "bastos",  label: "Bastos",  glyph: "♣", color: "#3fa86b" },
];

const fmtCode = (s) => s.match(/.{1,4}/g)?.join("-") ?? s;

// ---- seat ----
const Seat = ({ player, isYou, onAddBot, onKick }) => {
  if (!player) {
    return (
      <button className="seat empty" onClick={onAddBot} aria-label="Asiento libre — sentar bot">
        <div className="seat-avatar empty">
          <span className="plus">+</span>
        </div>
        <div className="seat-name empty">Libre</div>
        <div className="seat-meta">sentar bot</div>
      </button>
    );
  }
  const stateClass = player.isBot ? "bot" : (isYou ? "you" : "");
  return (
    <div className={`seat ${isYou ? "you" : ""}`}>
      {player.isBot && (
        <button className="seat-kick" onClick={() => onKick(player.id)} title="Quitar bot">✕</button>
      )}
      <div className={`seat-avatar ${stateClass}`}>
        {player.isBot
          ? <span className="bot-glyph">🤖</span>
          : <span className="initials">{player.initials}</span>}
        <span className={`status-dot ${player.ready ? "" : "waiting"}`}></span>
      </div>
      <div className="seat-name">{player.name.split(" ")[0]}</div>
      <div className={`seat-meta ${player.ready ? "ready" : ""}`}>
        {isYou
          ? <span className="you-tag">VOS</span>
          : player.isBot
            ? <span>BOT</span>
            : player.ready ? <span>LISTO</span> : <span>ESPERA</span>}
      </div>
    </div>
  );
};

// ---- main ----
function WaitingRoomModal() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "maxSeats": 4,
    "trumpSuit": "oros",
    "mesaName": "Cantina de Juan",
    "isPrivate": false,
    "showRules": true,
    "showTrumpCard": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const maxSeats = Math.max(2, Math.min(4, t.maxSeats || 4));

  const [players, setPlayers] = useState([
    { id: "you", name: "Contreras Juan", initials: "CJ", isYou: true, ready: false },
  ]);
  const [copied, setCopied] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState("medio");
  const [iAmReady, setIAmReady] = useState(false);

  // trim if maxSeats reduces
  useEffect(() => {
    setPlayers(prev => prev.slice(0, maxSeats));
  }, [maxSeats]);

  const mesaCode = "89E8-6DB8-4B02";
  const filledSeats = players.length;
  const minPlayers = 2;

  const canStart = filledSeats >= minPlayers && players.every(p => p.ready || p.isBot);
  const youReady = players.find(p => p.isYou)?.ready;
  const waitingCount = players.filter(p => !p.ready && !p.isBot).length;

  const emptySlots = maxSeats - filledSeats;

  const handleAddBot = () => {
    if (filledSeats >= maxSeats) return;
    const used = new Set(players.filter(p => p.isBot).map(p => p.botBaseId));
    const pick = MOCK_BOTS_AVAILABLE.find(b => !used.has(b.id)) ?? MOCK_BOTS_AVAILABLE[0];
    setPlayers(prev => [...prev, {
      id: `bot-${Date.now()}`,
      botBaseId: pick.id,
      name: pick.name,
      initials: pick.initials,
      isBot: true,
      ready: true,
      difficulty: botDifficulty,
    }]);
  };

  const handleKick = (id) => setPlayers(prev => prev.filter(p => p.id !== id));

  const handleReady = () => {
    setIAmReady(r => {
      const v = !r;
      setPlayers(prev => prev.map(p => p.isYou ? { ...p, ready: v } : p));
      return v;
    });
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    try { navigator.clipboard?.writeText(mesaCode); } catch {}
  };

  const handleStart = () => {
    if (canStart) alert("¡A repartir, parcero!");
  };

  const trump = SUITS.find(s => s.id === t.trumpSuit) ?? SUITS[0];

  // Build seat array of length maxSeats: fill from players list, rest empty
  const seatList = Array.from({ length: maxSeats }).map((_, i) => players[i] ?? null);

  return (
    <>
      {/* Atmosphere */}
      <div className="bg-stage"></div>
      <div className="bg-stars"></div>
      <BrambleBg />

      {/* faded lobby title peeking behind */}
      <div className="lobby-fade">
        <div className="eyebrow-glyph">✦ CANTINA DE BRISCA ✦</div>
        <h1>Busca <em>compañero</em></h1>
      </div>

      {/* scrim */}
      <div className="scrim"></div>

      {/* modal */}
      <div className="modal-wrap">
        <div className="modal">
          {t.showTrumpCard && (
            <div className="trump-card" title={`Pinta de triunfo: ${trump.label}`}>
              <span className="suit" style={{ color: trump.color }}>{trump.glyph}</span>
              <span className="pinta-label">Pinta · {trump.label}</span>
            </div>
          )}

          <ParchCorners />

          <div className="modal-inner">
            {/* header */}
            <div className="m-head">
              <div className="m-eyebrow">Sala de Brisca</div>
              <button className="close-btn" aria-label="Salir">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3 L 11 11 M 11 3 L 3 11"/>
                </svg>
              </button>
            </div>

            <h2 className="m-title">{t.mesaName || "Cantina de Juan"}</h2>
            <p className="m-sub">
              {t.isPrivate ? "Mesa privada · solo con código" : "Mesa abierta · cualquiera se sienta"}
            </p>

            {/* code strip */}
            <div className="code-strip">
              <div>
                <div className="label">Código de mesa</div>
                <div className="code">{mesaCode}</div>
              </div>
              <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>

            {/* players */}
            <div className="players-head">
              <div className="lbl">Jugadores</div>
              <div className="count"><em>{filledSeats}</em> / {maxSeats} en la mesa</div>
            </div>
            <div className="players-row" style={{ gridTemplateColumns: `repeat(${maxSeats}, 1fr)` }}>
              {seatList.map((p, i) => (
                <Seat
                  key={p?.id ?? `empty-${i}`}
                  player={p}
                  isYou={p?.isYou}
                  onAddBot={handleAddBot}
                  onKick={handleKick}
                />
              ))}
            </div>

            {/* banner */}
            <div className={`banner ${canStart ? "ready" : ""}`}>
              <span className="pulse"></span>
              {canStart ? (
                <span><strong>Todos en su puesto.</strong> Repartí cuando quieras, parcero.</span>
              ) : filledSeats < minPlayers ? (
                <span><strong>Faltan {minPlayers - filledSeats} pa' arrancar.</strong> Invitá o sentá un bot.</span>
              ) : (
                <span><strong>{waitingCount} sin marcar listo.</strong> Aguantamos a que confirmen.</span>
              )}
            </div>

            {/* bot picker */}
            {emptySlots > 0 && (
              <>
                <div className="section-title">Agregar bot</div>
                <div className="bot-row">
                  <div className="diff-select-wrap">
                    <select className="diff-select" value={botDifficulty} onChange={(e) => setBotDifficulty(e.target.value)}>
                      {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <button className="add-bot-btn" onClick={handleAddBot}>+ Sentar bot</button>
                </div>
                <div className="bot-foot">Las ganancias se reducen al <strong style={{color:"var(--parch-ink)"}}>50%</strong> en partidas con bots.</div>
              </>
            )}

            {/* rules */}
            {t.showRules && (
              <div className="rules-block">
                <div className="section-title">Reglas</div>
                <div className="rules-pills">
                  <span className="pill">As <span className="v">11</span></span>
                  <span className="pill">Tres <span className="v">10</span></span>
                  <span className="pill">Rey <span className="v">4</span></span>
                  <span className="pill">Caballo <span className="v">3</span></span>
                  <span className="pill">Sota <span className="v">2</span></span>
                </div>
                <div className="rules-foot">
                  Pinta de triunfo: <strong>{trump.label}</strong>. Gana cualquier carta de otro palo. No hay obligación de seguir palo.
                </div>
              </div>
            )}

            {/* actions */}
            <div className="actions">
              <button className="btn-ghost">Salir</button>
              <button
                className={`btn-primary ${canStart ? "go" : ""}`}
                disabled={!canStart && !youReady && filledSeats < minPlayers}
                onClick={canStart ? handleStart : handleReady}
              >
                {canStart
                  ? <><span>⚂</span> Repartir mesa</>
                  : youReady
                    ? <>✓ Listo · esperando</>
                    : <>Estoy listo</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TWEAKS */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Mesa">
          <TweakText label="Nombre" value={t.mesaName} onChange={(v) => setTweak("mesaName", v)} />
          <TweakRadio
            label="Cupo máximo"
            value={String(t.maxSeats)}
            onChange={(v) => setTweak("maxSeats", Number(v))}
            options={[
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
            ]}
          />
          <TweakToggle label="Mesa privada" value={t.isPrivate} onChange={(v) => setTweak("isPrivate", v)} />
          <TweakSelect
            label="Pinta de triunfo"
            value={t.trumpSuit}
            onChange={(v) => setTweak("trumpSuit", v)}
            options={SUITS.map(s => ({ value: s.id, label: s.label }))}
          />
        </TweakSection>
        <TweakSection title="Visualización">
          <TweakToggle label="Mostrar reglas" value={t.showRules} onChange={(v) => setTweak("showRules", v)} />
          <TweakToggle label="Carta de triunfo asomada" value={t.showTrumpCard} onChange={(v) => setTweak("showTrumpCard", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<WaitingRoomModal />);
