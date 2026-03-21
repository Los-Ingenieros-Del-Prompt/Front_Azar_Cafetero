"use client";
import { useEffect, useState } from "react";
import { User, DollarSign, Home, LogOut, ArrowRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import MuteButton from "@/components/common/MuteButton";
import { fetchGameRooms, createTable, type GameRoom } from "@/lib/gameTablesApi";

type Room = {
  id: string;
  name: string;
  players: number;
  max: number;
};

const MAX_PLAYERS = 10;
const FALLBACK_ROOMS: Room[] = [
  { id: "3", name: "Sala 3", players: 8, max: MAX_PLAYERS },
  { id: "2", name: "Sala 2", players: 2, max: MAX_PLAYERS },
  { id: "1", name: "Sala 1", players: 5, max: MAX_PLAYERS },
];

export default function ParquesFloor() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>(FALLBACK_ROOMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [requiredBet, setRequiredBet] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

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

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tableName.trim()) {
      setError("El nombre de la mesa es requerido");
      return;
    }

    if (!requiredBet || isNaN(Number(requiredBet)) || Number(requiredBet) <= 0) {
      setError("La apuesta requerida debe ser un número mayor a 0");
      return;
    }

    setIsCreating(true);

    try {
      const newRoom = await createTable(tableName.trim(), Number(requiredBet));
      setRooms([...rooms, { ...newRoom, max: MAX_PLAYERS }]);
      setIsModalOpen(false);
      setTableName("");
      setRequiredBet("");
    } catch (err) {
      setError("Error al crear la mesa. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const enterRoom = (id: string) => {
    router.push(`/parques/room/${id}`);
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-hidden bg-slate-900">
      {/* background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.5)),
            url('/images/backgroundparques.jpg')
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
          <h2 className="text-3xl font-light mb-2">Como en casa,</h2>
          <h2 className="text-4xl font-semibold mb-4">pero con más emoción.</h2>
          <h1 className="text-7xl font-bold tracking-tight">Elige Tu Sala</h1>
        </header>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-8 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-lg"
        >
          <Plus size={20} />
          Crear Nueva Mesa
        </button>

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
                  <p className="text-sm text-white/70">Sala de Parqués</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    room.players > 7
                      ? "bg-red-500/20 text-red-200 border border-red-400/40"
                      : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                  }`}
                >
                  {room.players}/{room.max} jugadores
                </span>
              </div>

              <div className="h-px w-full bg-white/15" />

              <button className="mt-5 flex w-full items-center justify-between rounded-xl bg-green-800/90 px-4 py-3 text-sm font-semibold text-white shadow-lg transition group-hover:bg-green-700">
                Entrar a la sala
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Crear Nueva Mesa</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError("");
                  setTableName("");
                  setRequiredBet("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nombre de la Mesa
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Ej: Mesa VIP"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Apuesta Requerida
                </label>
                <input
                  type="number"
                  value={requiredBet}
                  onChange={(e) => setRequiredBet(e.target.value)}
                  placeholder="Ej: 50.0"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  disabled={isCreating}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                    setTableName("");
                    setRequiredBet("");
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Mesa"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
