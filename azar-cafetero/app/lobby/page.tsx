"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../../context/UserContext";
import LobbyView from "./LobbyView";

export default function LobbyPage() {
  const { token, user, isLoading, logout } = useUserContext();
  const router = useRouter();

  // Proteger ruta — redirige al login si no hay sesión
  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/");
    }
  }, [token, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="relative">
      {/* Barra de usuario en la parte superior del lobby */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#1A8D44] flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-white text-sm font-medium">{user.name.split(" ")[0]}</span>
        <button
          onClick={() => { logout(); router.replace("/"); }}
          className="text-white/50 hover:text-white text-xs transition-colors ml-1"
          title="Cerrar sesión"
        >
          ✕
        </button>
      </div>

      <LobbyView />
    </div>
  );
}
