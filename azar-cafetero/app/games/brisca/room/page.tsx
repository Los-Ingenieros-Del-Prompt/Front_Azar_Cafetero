"use client";
import BriscaGame from "@/components/brisca/BriscaGame";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BriscaRoomPage({ params }: PageProps) {
  const { id } = use(params);
  return <BriscaGame roomId={id} />;
}