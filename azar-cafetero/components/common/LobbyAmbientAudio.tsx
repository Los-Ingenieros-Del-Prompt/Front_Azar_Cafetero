"use client";

import { useEffect, useRef } from "react";

export default function LobbyAmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/musicafondo.mp3");

    audio.loop = true;
    audio.volume = 0.10; 
    audioRef.current = audio;

    const playAudio = async () => {
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

    playAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return null;
}