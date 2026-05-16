"use client";

import BriscaLobbyView from "@/components/brisca/BriscaLobbyView";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BriscaFloor() {
  const router = useRouter();
  const { user, isLoading } = useUserContext();

  // Simple auth check, BriscaLobbyView handles the rest
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0E1610",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 999,
          border: "3px solid rgba(252, 209, 22, 0.2)",
          borderTopColor: "#FCD116",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <BriscaLobbyView />;
}

