// useStomp.js — thin STOMP abstraction.
//
// In production, swap the body of `createClient()` for the real @stomp/stompjs
// Client. The hook contract stays the same so components don't change.
//
//   const { status, tables, publish } = useStomp({
//     url: 'wss://api.azarcafetero.com/ws',
//     subscriptions: {
//       '/topic/parques/lobby':     (msg) => ...,
//       '/topic/parques/lobby/diff': (msg) => ...,
//     },
//   });
//
// Real swap:
//   import { Client } from '@stomp/stompjs';
//   const client = new Client({ brokerURL: url, reconnectDelay: 2000 });
//   client.onConnect = () => Object.entries(subs).forEach(([dest, cb]) =>
//     client.subscribe(dest, (m) => cb(JSON.parse(m.body))));
//   client.activate();
//
// For the prototype we run a simulator that emits the same shape of messages
// (table create/update/delete) so the UI feels alive without a backend.

function useStompLobby({ initialTables = [] } = {}) {
  const [status, setStatus] = React.useState('connecting'); // connecting | connected | reconnecting | disconnected
  const [tables, setTables] = React.useState(initialTables);
  const [onlineCount, setOnlineCount] = React.useState(1847);
  const [latency, setLatency] = React.useState(42);
  const clientRef = React.useRef(null);

  React.useEffect(() => {
    // —— Simulated STOMP client ——
    // Swap this whole block for the @stomp/stompjs Client when wiring to
    // the real backend. Keep the dispatch shape:
    //   { type: 'table.create' | 'table.update' | 'table.delete' | 'lobby.stats', ... }
    let stopped = false;

    const dispatch = (msg) => {
      if (stopped) return;
      switch (msg.type) {
        case 'table.create':
          setTables(prev => [msg.table, ...prev]);
          break;
        case 'table.update':
          setTables(prev => prev.map(t => t.id === msg.id ? { ...t, ...msg.patch } : t));
          break;
        case 'table.delete':
          setTables(prev => prev.filter(t => t.id !== msg.id));
          break;
        case 'lobby.stats':
          setOnlineCount(msg.online);
          break;
      }
    };

    // connection lifecycle
    const connectTimer = setTimeout(() => {
      if (stopped) return;
      setStatus('connected');
    }, 700);

    // simulate seat fills / new tables / leaves
    const tickTimer = setInterval(() => {
      if (stopped) return;
      const r = Math.random();
      setLatency(30 + Math.floor(Math.random() * 90));
      setOnlineCount(c => Math.max(1500, c + (Math.floor(Math.random() * 21) - 10)));

      setTables(prev => {
        if (prev.length === 0) return prev;
        const i = Math.floor(Math.random() * prev.length);
        const t = prev[i];

        if (r < 0.55 && t.seats.filter(s => !s.occupant).length > 0) {
          // someone joins
          const emptyIdx = t.seats.findIndex(s => !s.occupant);
          const next = [...prev];
          next[i] = {
            ...t,
            seats: t.seats.map((s, j) =>
              j === emptyIdx ? { ...s, occupant: pickName(), joinedAt: Date.now() } : s),
          };
          return next;
        }
        if (r < 0.85 && t.seats.some(s => s.occupant && !s.host)) {
          // someone leaves
          const occIdx = t.seats.findIndex(s => s.occupant && !s.host);
          if (occIdx < 0) return prev;
          const next = [...prev];
          next[i] = {
            ...t,
            seats: t.seats.map((s, j) =>
              j === occIdx ? { ...s, occupant: null, joinedAt: null } : s),
          };
          return next;
        }
        return prev;
      });
    }, 2600);

    clientRef.current = {
      // publish(destination, body) — sends to server
      publish(destination, body) {
        if (destination === '/app/parques/create') {
          // Simulate server ack
          setTimeout(() => dispatch({
            type: 'table.create',
            table: makeTable(body),
          }), 250);
        }
        if (destination === '/app/parques/leave') {
          setTimeout(() => dispatch({ type: 'table.delete', id: body.id }), 200);
        }
      },
      deactivate() { stopped = true; },
    };

    return () => {
      stopped = true;
      clearTimeout(connectTimer);
      clearInterval(tickTimer);
    };
  }, []);

  const publish = React.useCallback((destination, body) => {
    if (clientRef.current) clientRef.current.publish(destination, body);
  }, []);

  return { status, tables, onlineCount, latency, publish };
}

const SAMPLE_NAMES = [
  'Camila R.', 'Andrés M.', 'Sofía P.', 'Mateo G.', 'Valentina L.',
  'Sebastián J.', 'Isabela O.', 'Daniel T.', 'Mariana Q.', 'Tomás V.',
  'Luciana B.', 'Felipe N.', 'Catalina A.', 'Esteban Z.', 'Manuela C.',
];
function pickName() {
  return SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
}
function pickColor(idx) {
  return ['#CE1126', '#003893', '#FCD116', '#1B7A4C'][idx];
}

function makeTable({ name, bet, host = 'Vos', maxSeats = 4 }) {
  return {
    id: 't-' + Math.random().toString(36).slice(2, 8),
    name,
    host,
    bet,
    type: 'parques',
    visibility: 'publica',
    createdAt: Date.now(),
    isNew: true,
    seats: Array.from({ length: maxSeats }).map((_, i) => ({
      color: pickColor(i),
      occupant: i === 0 ? host : null,
      host: i === 0,
      joinedAt: i === 0 ? Date.now() : null,
    })),
  };
}

// Seed: 6 demo tables for the prototype.
function seedTables() {
  return [
    { name: 'La de los compas',  bet: 100, host: 'Camila R.',   maxSeats: 4, fillCount: 3 },
    { name: 'Café & fichas',     bet: 50,  host: 'Andrés M.',   maxSeats: 4, fillCount: 2 },
    { name: 'Sin apuesta amistosa', bet: 0,  host: 'Sofía P.',  maxSeats: 4, fillCount: 4, status: 'jugando' },
    { name: 'Pa\u2019 los duros', bet: 500, host: 'Mateo G.',   maxSeats: 4, fillCount: 1 },
    { name: 'Tarde de domingo',  bet: 25,  host: 'Valentina L.', maxSeats: 4, fillCount: 2 },
    { name: 'Mesa rápida',       bet: 75,  host: 'Sebastián J.', maxSeats: 4, fillCount: 3 },
  ].map((t, idx) => ({
    id: 't-seed-' + idx,
    name: t.name,
    host: t.host,
    bet: t.bet,
    type: 'parques',
    visibility: 'publica',
    status: t.status || 'esperando',
    createdAt: Date.now() - (idx * 60000),
    seats: Array.from({ length: t.maxSeats }).map((_, i) => ({
      color: pickColor(i),
      occupant: i < t.fillCount ? (i === 0 ? t.host : pickName()) : null,
      host: i === 0,
      joinedAt: i < t.fillCount ? Date.now() - (i * 30000) : null,
    })),
  }));
}

window.useStompLobby = useStompLobby;
window.seedTables = seedTables;
