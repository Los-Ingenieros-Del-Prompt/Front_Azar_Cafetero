"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../../context/UserContext";
import LobbyView from "@/components/lobby/LobbyView";

export default function LobbyPage() {
  const { token, isLoading } = useUserContext();
  const router = useRouter();

  // Proteger ruta — redirige al login si no hay sesión
  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/");
    }
  }, [token, isLoading, router]);

  if (isLoading || !token) return null;

  return <LobbyView />;
}
