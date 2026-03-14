"use client";
import { useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

export default function LobbyAmbientAudio() {
  const { playTrack } = useAudio();

  useEffect(() => {
    // Delegates audio creation and playback entirely to the global context.
    // The context holds a single Audio instance — navigating between screens
    // won't create a second one or cut off the current one.
    playTrack("/audio/musicafondo.mp3");
    // No cleanup: the audio lives in the context, not in this component.
    // It will keep playing when this component unmounts (screen change).
  }, [playTrack]);

  return null;
}
