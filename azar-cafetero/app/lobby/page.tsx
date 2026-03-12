"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../../context/UserContext";
import LobbyView from "@/components/lobby/LobbyView";

export default function LobbyPage() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;
  return <LobbyView />;
}
