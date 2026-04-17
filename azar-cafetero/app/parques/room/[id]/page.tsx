"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ParquesRoomRedirect() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tableId = params.id;

  useEffect(() => {
    if (tableId) {
      router.replace(`/games/parques/room/${tableId}`);
    }
  }, [tableId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-white/70">Entrando a la sala...</p>
      </div>
    </div>
  );
}
