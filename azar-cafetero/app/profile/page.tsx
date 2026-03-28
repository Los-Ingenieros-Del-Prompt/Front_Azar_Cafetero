"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AvatarGrid from "@/components/profile/AvatarGrid";
import ProfileForm from "@/components/profile/ProfileForm";
import { useUserContext } from "@/context/UserContext";
import { getProfileStatus, updateAvatar, updateUsername } from "@/lib/profileApi";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useUserContext();

    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("");
    const [username, setUsername] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        getProfileStatus()
            .then((data) => {
                setSelectedAvatarUrl(data.avatarUrl);
                setUsername(data.username);
            })
            .catch(() => router.push("/login"))
            .finally(() => setLoading(false));

    }, [authLoading, user, router]);

    async function handleGuardar() {
        setSaving(true);
        setMessage("");
        setSuggestions([]);

        try {
            await updateAvatar(selectedAvatarUrl);

            const { status, data } = await updateUsername(username);

            if (status === 409) {
                setMessage("⚠️ " + data.message);
                setMessageType("error");
                setSuggestions(data.suggestions || []);
                setSaving(false);
                return;
            }

            if (status === 403) {
                setMessage(`⛔ Debes esperar ${data.daysUntilNextChange} días`);
                setMessageType("error");
                setSaving(false);
                return;
            }

            setMessage("✅ Perfil actualizado correctamente");
            setMessageType("success");

        } catch {
            setMessage("❌ Error al guardar, intenta de nuevo");
            setMessageType("error");
        }

        setSaving(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <p className="text-white text-lg">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center 
            p-4 bg-slate-900 relative overflow-hidden">

            {/* Fondo */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/backgroundLogin.jpg')" }}
            />

            {/* Contenedor */}
            <div className="relative z-10 w-full max-w-6xl bg-white/20 
                backdrop-blur-xl border border-white/30 rounded-[3rem] p-8 
                md:p-12 shadow-2xl flex flex-col lg:flex-row gap-8">

                <AvatarGrid
                    selectedUrl={selectedAvatarUrl}
                    onSelect={setSelectedAvatarUrl}
                />

                <ProfileForm
                    username={username}
                    saving={saving}
                    message={message}
                    messageType={messageType}
                    suggestions={suggestions}
                    onUsernameChange={setUsername}
                    onGuardar={handleGuardar}
                />

            </div>
        </div>
    );
}