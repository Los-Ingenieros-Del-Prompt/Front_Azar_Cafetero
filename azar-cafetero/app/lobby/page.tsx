"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../../context/UserContext";
import LobbyView from "@/components/lobby/LobbyView";
import LobbyAmbientAudio from "@/components/common/LobbyAmbientAudio";
import MuteButton from "@/components/common/MuteButton";

export default function LobbyPage() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <>
      <LobbyAmbientAudio />
      <LobbyView />
      <MuteButton />
    </>
  );
}
