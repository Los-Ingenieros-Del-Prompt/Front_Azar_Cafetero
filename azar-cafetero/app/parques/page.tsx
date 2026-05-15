"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import ParquesLobbyView from "@/components/parques/ParquesLobbyView";
import { Loader2 } from "lucide-react";

export default function ParquesFloor() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUserContext();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1610]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FCD116]" />
      </div>
    );
  }

  if (!user) return null;

  return <ParquesLobbyView />;
}
