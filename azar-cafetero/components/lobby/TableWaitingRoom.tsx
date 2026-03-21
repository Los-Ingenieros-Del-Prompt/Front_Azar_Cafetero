"use client";

import { Home, Users, Clock3, Trophy, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type PlayerSeat = {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
};

type TableWaitingRoomProps = {
  gameLabel: "Brisca" | "Parqués";
  tableId: string;
  tableName: string;
  minPlayers: number;
  maxPlayers: number;
  players: PlayerSeat[];
  accentClass: string;
  bgImage: string;
  roomRoutePrefix: string;
};

export default function TableWaitingRoom({
  gameLabel,
  tableId,
  tableName,
  minPlayers,
  maxPlayers,
  players,
  accentClass,
  bgImage,
  roomRoutePrefix,
}: TableWaitingRoomProps) {
  const router = useRouter();
  const currentPlayers = players.length;
  const waitingCount = Math.max(minPlayers - currentPlayers, 0);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.92), rgba(2,6,23,0.75)), url('${bgImage}')`,
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push(`/${roomRoutePrefix}`)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            <Home size={16} />
            Volver a mesas
          </button>
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">
            Sala de espera
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <p className="mb-2 text-xs uppercase tracking-[0.26em] text-white/70">
              Bienvenido parcero
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              {tableName}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">
              Estás en la antesala de {gameLabel}. Relájate, tómate un tinto y espera a la
              tropa antes de empezar la mano.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-slate-900/50 p-4">
                <p className="text-xs text-white/60">Mesa</p>
                <p className="text-lg font-semibold">{tableId}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-slate-900/50 p-4">
                <p className="text-xs text-white/60">Jugadores</p>
                <p className="text-lg font-semibold">
                  {currentPlayers}/{maxPlayers}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-slate-900/50 p-4">
                <p className="text-xs text-white/60">Mínimo para iniciar</p>
                <p className="text-lg font-semibold">{minPlayers}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${accentClass}`}
              >
                <Clock3 size={15} />
                {waitingCount > 0
                  ? `Faltan ${waitingCount} para arrancar`
                  : "¡Mesa lista para jugar!"}
              </span>

              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                disabled={waitingCount > 0}
              >
                Empezar partida
                <ArrowRight size={16} />
              </button>
            </div>
          </article>

          <aside className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">La mesa</h2>
              <Users size={18} className="text-white/70" />
            </div>

            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-base">
                      {player.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{player.name}</p>
                      <p className="text-xs text-white/60">
                        {player.isHost ? "Anfitrión de la mesa" : "Jugador en espera"}
                      </p>
                    </div>
                  </div>
                  {player.isHost && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/15 px-2 py-1 text-[11px] font-semibold text-amber-200">
                      <Trophy size={12} />
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
