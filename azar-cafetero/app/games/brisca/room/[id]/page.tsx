"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import BriscaMultiplayer from "@/components/brisca/BriscaMultiplayer";
import { useUserContext } from "@/context/UserContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BriscaRoomPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading } = useUserContext();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) return null;

  return <BriscaMultiplayer gameId={id} userName={user.name} userId={user.userId} />;
}
