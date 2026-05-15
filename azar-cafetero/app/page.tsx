"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../context/UserContext";
import LoginView from "@/components/login/LoginView";

export default function HomePage() {
  const { user, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/lobby");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return <LoginView />;
}
