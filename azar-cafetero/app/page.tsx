"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Background from "../components/common/Background";
import LoginCard from "../components/login/LoginCard";
import LoginHero from "../components/login/LoginHero";
import { useUserContext } from "../context/UserContext";

export default function HomePage() {
  const { token, isLoading } = useUserContext();
  const router = useRouter();

  // Si ya tiene sesión activa, redirige directamente al lobby
  useEffect(() => {
    if (!isLoading && token) {
      router.replace("/lobby");
    }
  }, [token, isLoading, router]);

  if (isLoading) return null; // evita flash de login si ya hay sesión

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden">
      <Background />
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        <LoginCard />
        <LoginHero />
      </div>
    </div>
  );
}
