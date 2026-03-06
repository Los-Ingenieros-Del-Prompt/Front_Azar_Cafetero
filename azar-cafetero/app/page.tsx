"use client";

import Background from "../components/common/Background";
import LoginCard from "../components/login/LoginCard";
import LoginHero from "../components/login/LoginHero";

export default function LoginPage() {
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