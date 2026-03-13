"use client";

import { useState } from "react";
import { User, DollarSign, Home, LogOut, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Room = {
  id: number;
  name: string;
  players: number;
  max: number;
};

const BottleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 200" className={className} fill="currentColor">
    <path d="M30 40 C 30 20, 70 20, 70 40 L 70 60 C 70 80, 90 90, 90 120 L 90 180 C 90 195, 80 200, 50 200 C 20 200, 10 195, 10 180 L 10 120 C 10 90, 30 80, 30 60 Z" />
    <rect x="40" y="10" width="20" height="15" rx="2" />
  </svg>
);

export default function BriscaFloor() {
  const router = useRouter();

  const [rooms] = useState<Room[]>([
    { id: 3, name: "Mesa 3", players: 3, max: 4 },
    { id: 2, name: "Mesa 2", players: 1, max: 4 },
    { id: 1, name: "Mesa 1", players: 2, max: 4 },
  ]);

  const enterRoom = (id: number) => {
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
        <button className="p-2 hover:bg-white/20 rounded-full text-red-400"><LogOut size={24} /></button>
      </nav>

      {/* main */}
      <main className="relative z-10 container mx-auto px-12 py-16 flex flex-col items-end min-h-screen">
        <header className="text-right mb-16 max-w-2xl">
          <h2 className="text-3xl font-light mb-2">
            La suerte ayuda,
          </h2>
          <h2 className="text-4xl font-semibold mb-4">
            pero la maña gana.
          </h2>
          <h1 className="text-7xl font-bold tracking-tight">
            Elige Tu Mesa
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-5xl">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group relative flex flex-col items-center justify-end h-50 cursor-pointer hover:-translate-y-2 transition"
              onClick={() => enterRoom(room.id)}
            >
              <div className="absolute bottom-2 w-24 h-4 bg-black/20 blur-xl rounded-full scale-x-150" />

              <div className="relative z-10 w-25 drop-shadow-2xl">
                <BottleIcon className="text-white opacity-95 group-hover:text-yellow-50 transition" />

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 text-slate-900">
                  <span className="text-xl font-black uppercase">
                    {room.name}
                  </span>

                  <span className="text-lg font-bold">
                    <span className={room.players > 3 ? "text-red-600" : "text-green-600"}>
                      {room.players}
                    </span>
                    /{room.max}
                  </span>
                </div>

                <button className="absolute -right-4 bottom-6 bg-yellow-700 p-3 rounded-2xl shadow-xl group-hover:scale-110">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}