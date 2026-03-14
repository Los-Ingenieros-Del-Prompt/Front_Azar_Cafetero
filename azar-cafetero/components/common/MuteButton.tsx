"use client";
import { useAudio } from "@/context/AudioContext";

interface MuteButtonProps {
  // "floating" → fixed bottom-right corner (default, for pages without sidebar)
  // "sidebar"  → inline, no fixed position, fits inside a nav/sidebar
  variant?: "floating" | "sidebar";
}

export default function MuteButton({ variant = "floating" }: MuteButtonProps) {
  const { isMuted, toggleMute } = useAudio();

  const isFloating = variant === "floating";

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      title={isMuted ? "Activar sonido" : "Silenciar"}
      className={[
        "flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none",
        isFloating
          ? "fixed bottom-5 right-5 z-50 w-11 h-11 border-2 shadow-lg"
          : "p-2",
        isMuted
          ? isFloating
            ? "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500"
            : "text-gray-400 hover:bg-white/20"
          : isFloating
          ? "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
          : "text-white hover:bg-white/20",
      ].join(" ")}
    >
      {isMuted ? (
        // Muted — speaker with X
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
        </svg>
      ) : (
        // Active — speaker with waves
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.061z" />
        </svg>
      )}
    </button>
  );
}
