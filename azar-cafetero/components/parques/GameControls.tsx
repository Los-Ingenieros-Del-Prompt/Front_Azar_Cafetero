import { User, Menu, Volume2, VolumeX, LogOut } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

interface GameControlsProps {
  onProfile?: () => void;
  onMenu?: () => void;
  onExit?: () => void;
}

export function GameControls({ onProfile, onMenu, onExit }: GameControlsProps) {
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
      <button
        onClick={onProfile}
        className="group relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#1a5c2e] to-[#0d4d25] border border-[#2e7a47]/60 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label="Perfil"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-[#247542] to-[#145e32]" />
        <div className="relative flex items-center justify-center h-full">
          <User className="w-5 h-5 text-emerald-100/90 group-hover:text-emerald-50 transition-colors" />
        </div>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-400/20 blur-sm" />
      </button>

      <button
        onClick={onMenu}
        className="group relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#1a5c2e] to-[#0d4d25] border border-[#2e7a47]/60 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label="Menú"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-[#247542] to-[#145e32]" />
        <div className="relative flex items-center justify-center h-full">
          <Menu className="w-5 h-5 text-emerald-100/90 group-hover:text-emerald-50 transition-colors" />
        </div>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-400/20 blur-sm" />
      </button>

      <button
        onClick={toggleMute}
        className="group relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#1a5c2e] to-[#0d4d25] border border-[#2e7a47]/60 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-[#247542] to-[#145e32]" />
        <div className="relative flex items-center justify-center h-full">
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-emerald-200/85 group-hover:text-emerald-100 transition-colors" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-100/90 group-hover:text-emerald-50 transition-colors" />
          )}
        </div>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-400/20 blur-sm" />
      </button>

      <button
        onClick={onExit}
        className="group relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#4a1515] to-[#3d1010] border border-[#6a2525]/50 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label="Salir"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-[#5a1a1a] to-[#4a1515]" />
        <div className="relative flex items-center justify-center h-full">
          <LogOut className="w-5 h-5 text-red-200/90 group-hover:text-red-100 transition-colors" />
        </div>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 blur-sm" />
      </button>
    </div>
  );
}
