"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarSelector from "@/components/profile/AvatarSelector";
import UsernameEditor from "@/components/profile/UsernameEditor";
import { getProfileStatus, updateAvatar } from "@/lib/profileApi";

interface ProfileStatus {
    username: string;
    avatarUrl: string;
    canChangeName: boolean;
    daysUntilNextChange: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileStatus | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [avatarMessage, setAvatarMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfileStatus()
            .then((data) => {
                setProfile(data);
                setSelectedAvatar(data.avatarUrl);
            })
            .catch(() => router.push("/login"))
            .finally(() => setLoading(false));
    }, []);

    async function handleSaveAvatar() {
        if (!selectedAvatar || selectedAvatar === profile?.avatarUrl) return;
        await updateAvatar(selectedAvatar);
        setProfile((prev) =>
            prev ? { ...prev, avatarUrl: selectedAvatar } : prev
        );
        setAvatarMessage("✅ Avatar actualizado");
        setTimeout(() => setAvatarMessage(""), 3000);
    }

    function handleUsernameSuccess(newUsername: string) {
        setProfile((prev) =>
            prev ? { ...prev, username: newUsername } : prev
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center
                justify-center">
                <p className="text-white text-lg">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4
                flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ← Volver
                </button>
                <h1 className="text-xl font-bold text-green-400">
                    Editar Perfil
                </h1>
            </div>

            <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-8">

                {/* Sección Avatar */}
                <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-green-400">
                        🖼️ Avatar
                    </h2>
                    <AvatarSelector
                        selected={selectedAvatar}
                        onSelect={setSelectedAvatar}
                    />
                    {avatarMessage && (
                        <p className="text-green-400 text-sm text-center">
                            {avatarMessage}
                        </p>
                    )}
                    <button
                        onClick={handleSaveAvatar}
                        disabled={selectedAvatar === profile?.avatarUrl}
                        className="w-full bg-green-600 hover:bg-green-700
                            disabled:opacity-40 disabled:cursor-not-allowed
                            text-white py-2 rounded-lg font-semibold
                            transition-colors"
                    >
                        Guardar Avatar
                    </button>
                </div>

                {/* Sección Username */}
                <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-green-400">
                        ✏️ Nombre de usuario
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Actual:{" "}
                        <span className="text-white font-bold">
                            {profile?.username}
                        </span>
                    </p>
                    {profile && (
                        <UsernameEditor
                            currentUsername={profile.username}
                            canChangeName={profile.canChangeName}
                            daysUntilNextChange={profile.daysUntilNextChange}
                            onSuccess={handleUsernameSuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
