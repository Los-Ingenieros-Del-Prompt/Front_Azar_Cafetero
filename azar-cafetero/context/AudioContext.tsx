"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playTrack: (src: string) => void;
  stopTrack: () => void;
}

const AudioCtx = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  playTrack: () => {},
  stopTrack: () => {},
});

const MUTE_STORAGE_KEY = "app_global_muted";

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  // Single audio instance that lives for the entire session
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync mute state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    setIsMuted(stored);
  }, []);

  const playTrack = useCallback(
    (src: string) => {
      // If the same track is already playing, just sync mute and return
      if (audioRef.current && !audioRef.current.paused && audioRef.current.src.endsWith(src)) {
        audioRef.current.muted = isMuted;
        return;
      }

      // Stop any previous track before starting a new one
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.1;
      audio.muted = isMuted;
      audioRef.current = audio;

      const tryPlay = async () => {
        try {
          await audio.play();
        } catch {
          const resume = () => {
            audio.play();
            window.removeEventListener("click", resume);
          };
          window.addEventListener("click", resume);
        }
      };

      tryPlay();
    },
    [isMuted]
  );

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_STORAGE_KEY, String(next));
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  return (
    <AudioCtx.Provider value={{ isMuted, toggleMute, playTrack, stopTrack }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
