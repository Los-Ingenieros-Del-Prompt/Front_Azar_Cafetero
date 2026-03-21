"use client";
import { useEffect, useState } from "react";
import { User, DollarSign, Home, LogOut, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import MuteButton from "@/components/common/MuteButton";
import { fetchGameRooms, type GameRoom } from "@/lib/gameTablesApi";

type Room = {
  id: string;
  name: string;
  players: number;
  max: number;
};

const MAX_PLAYERS = 4;
const FALLBACK_ROOMS: Room[] = [
  { id: "3", name: "Mesa 3", players: 3, max: MAX_PLAYERS },
  { id: "2", name: "Mesa 2", players: 1, max: MAX_PLAYERS },
  { id: "1", name: "Mesa 1", players: 2, max: MAX_PLAYERS },
];

export default function BriscaFloor() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>(FALLBACK_ROOMS);

  useEffect(() => {
    fetchGameRooms()
      .then((tables: GameRoom[]) => {
        if (!tables.length) {
          setRooms(FALLBACK_ROOMS);
          return;
        }
        setRooms(
          tables.map((table) => ({
            id: table.id,
            name: table.name,
            players: table.players,
            max: MAX_PLAYERS,
          }))
        );
      })
      .catch(() => {
        setRooms(FALLBACK_ROOMS);
      });
  }, []);

  const enterRoom = (id: string) => {
    router.push(`/brisca/room/${id}`);
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-hidden bg-slate-900">
      {/* background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.5)),
            url('/images/backgroundbrisca.jpg')
          `,
          backgroundPosition: "center 30%",
        }}
      />

      {/* sidebar */}
      <nav className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
        <button className="p-2 hover:bg-white/20 rounded-full"><User size={24} /></button>
        <button className="p-2 hover:bg-white/20 rounded-full"><DollarSign size={24} /></button>
        <button onClick={() => router.push("/lobby")} className="p-2 hover:bg-white/20 rounded-full"><Home size={24} /></button>
        <div className="h-px bg-white/20 w-8 self-center my-2" />
        <MuteButton variant="sidebar" />
        <div className="h-px bg-white/20 w-8 self-center my-2" />
        <button className="p-2 hover:bg-white/20 rounded-full text-red-400"><LogOut size={24} /></button>
      </nav>

      {/* main */}
      <main className="relative z-10 container mx-auto px-12 py-16 flex flex-col items-end min-h-screen">
        <header className="text-right mb-16 max-w-2xl">
          <h2 className="text-3xl font-light mb-2">La suerte ayuda,</h2>
          <h2 className="text-4xl font-semibold mb-4">pero la maña gana.</h2>
          <h1 className="text-7xl font-bold tracking-tight">Elige Tu Mesa</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group relative cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-xl transition hover:-translate-y-1 hover:bg-white/15"
              onClick={() => enterRoom(room.id)}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{room.name}</h3>
                  <p className="text-sm text-white/70">Mesa de Brisca</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    room.players > 3
                      ? "bg-red-500/20 text-red-200 border border-red-400/40"
                      : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                  }`}
                >
                  {room.players}/{room.max} jugadores
                </span>
              </div>

              <div className="h-px w-full bg-white/15" />

              <button className="mt-5 flex w-full items-center justify-between rounded-xl bg-yellow-700/90 px-4 py-3 text-sm font-semibold text-white shadow-lg transition group-hover:bg-yellow-600">
                Entrar a la mesa
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
