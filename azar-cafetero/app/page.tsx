"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Background from "../components/common/Background";
import LoginCard from "../components/login/LoginCard";
import LoginHero from "../components/login/LoginHero";
import { useUserContext } from "../context/UserContext";

export default function HomePage() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/lobby");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

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
