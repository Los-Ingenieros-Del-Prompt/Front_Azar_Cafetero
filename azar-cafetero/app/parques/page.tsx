"use client";
import { useState, useEffect, useCallback } from "react";
import { User, DollarSign, Home, LogOut, Plus, Loader2, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import MuteButton from "@/components/common/MuteButton";
import { useUserContext } from "@/context/UserContext";
import { useGameWebSocket, TableDTO } from "@/hooks/useGameWebSocket";

const PARQUES_FLOOR_ID = "00000000-0000-0000-0000-000000000001";
const MAX_PLAYERS = 4;

export default function ParquesFloor() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useUserContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableBet, setNewTableBet] = useState(100);
  const [creating, setCreating] = useState(false);

  const {
    isConnected,
    tables,
    connect,
    fetchTables,
    createTable,
    notifyTableCreated,
    subscribeToFloor,
  } = useGameWebSocket();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

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
    router.push(`/games/parques/room/${tableId}`);
  };

  const handleCreateTable = useCallback(async () => {
    if (!newTableName.trim() || creating) return;
    setCreating(true);
    try {
      const table = await createTable(newTableName, newTableBet, PARQUES_FLOOR_ID, MAX_PLAYERS);
      notifyTableCreated(PARQUES_FLOOR_ID, {
        tableId: table.tableId,
        tableName: table.tableName,
        maxPlayers: MAX_PLAYERS,
        requiredBet: table.requiredBet,
      });
      setShowCreateModal(false);
      setNewTableName("");
      setNewTableBet(100);
      enterRoom(table.tableId);
    } catch (error) {
      console.error("Failed to create table:", error);
      alert("Error al crear la sala");
    } finally {
      setCreating(false);
    }
  }, [newTableName, newTableBet, creating, createTable, notifyTableCreated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-hidden bg-slate-900">
      {/* Background */}
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

      {/* Sidebar */}
      <nav className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
        <button className="p-2 hover:bg-white/20 rounded-full" title={user.name}><User size={24} /></button>
        <button className="p-2 hover:bg-white/20 rounded-full"><DollarSign size={24} /></button>
        <button onClick={() => router.push("/lobby")} className="p-2 hover:bg-white/20 rounded-full"><Home size={24} /></button>
        <div className="h-px bg-white/20 w-8 self-center my-2" />
        <MuteButton variant="sidebar" />
        <div className="h-px bg-white/20 w-8 self-center my-2" />
        <button onClick={logout} className="p-2 hover:bg-white/20 rounded-full text-red-400" title="Salir"><LogOut size={24} /></button>
      </nav>

      {/* Main */}
      <main className="relative z-10 container mx-auto px-12 py-16 flex flex-col items-end min-h-screen">
        <header className="text-right mb-8 max-w-2xl">
          <p className="text-sm text-emerald-400/80 mb-2">Hola, {user.name}</p>
          <h2 className="text-3xl font-light mb-2">Como en casa,</h2>
          <h2 className="text-4xl font-semibold mb-4">pero con más emoción.</h2>
          <h1 className="text-7xl font-bold tracking-tight">Elige Tu Sala</h1>
        </header>

        {/* Connection status */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-white/60">{isConnected ? "Conectado" : "Conectando..."}</span>
        </div>

        {/* Create button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-8 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg"
        >
          <Plus size={20} />
          Crear Nueva Sala
        </button>

        {/* Tables grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {tables.length === 0 && (
            <div className="col-span-full text-center text-white/50 py-12">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay salas disponibles</p>
              <p className="text-sm">¡Crea una nueva sala para empezar!</p>
            </div>
          )}
          {tables.map((table) => (
            <div
              key={table.tableId}
              className="group relative cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-xl transition hover:-translate-y-1 hover:bg-white/15"
              onClick={() => enterRoom(table.tableId)}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{table.tableName}</h3>
                  <p className="text-sm text-white/70">Sala de Parqués</p>
                  <p className="text-xs text-emerald-400 mt-1">${table.requiredBet} apuesta</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    table.playerCount >= (table.maxPlayers || MAX_PLAYERS)
                      ? "bg-red-500/20 text-red-200 border border-red-400/40"
                      : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                  }`}
                >
                  {table.playerCount}/{table.maxPlayers || MAX_PLAYERS} jugadores
                </span>
              </div>

              <div className="h-px w-full bg-white/15" />

              <button className="mt-5 flex w-full items-center justify-between rounded-xl bg-emerald-800/90 px-4 py-3 text-sm font-semibold text-white shadow-lg transition group-hover:bg-emerald-700">
                Entrar a la sala
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6">Crear Nueva Sala</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Nombre de la Sala</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Mi Sala de Parqués"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Apuesta Mínima</label>
                <select
                  value={newTableBet}
                  onChange={(e) => setNewTableBet(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value={50}>$50</option>
                  <option value={100}>$100</option>
                  <option value={250}>$250</option>
                  <option value={500}>$500</option>
                  <option value={1000}>$1,000</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTable}
                disabled={!newTableName.trim() || creating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Sala"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
