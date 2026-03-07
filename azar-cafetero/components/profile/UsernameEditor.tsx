"use client";

import { useState } from "react";
import { updateUsername } from "@/lib/profileApi";

interface Props {
    currentUsername: string;
    canChangeName: boolean;
    daysUntilNextChange: number;
    onSuccess: (newUsername: string) => void;
}

export default function UsernameEditor({
    currentUsername,
    canChangeName,
    daysUntilNextChange,
    onSuccess,
}: Props) {
    const [newUsername, setNewUsername] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!newUsername.trim()) return;
        setLoading(true);
        setSuggestions([]);
        setMessage("");

        const { status, data } = await updateUsername(newUsername);

        if (status === 200) {
            setMessage("✅ Nombre actualizado correctamente");
            setMessageType("success");
            onSuccess(newUsername);
            setNewUsername("");
        } else if (status === 409) {
            setMessage("⚠️ " + data.message);
            setMessageType("error");
            setSuggestions(data.suggestions || []);
        } else if (status === 403) {
            setMessage(`⛔ Debes esperar ${data.daysUntilNextChange} días`);
            setMessageType("error");
        }

        setLoading(false);
    }

    // Si está en cooldown solo muestra el aviso
    if (!canChangeName) {
        return (
            <div className="bg-yellow-900/40 border border-yellow-600
                rounded-lg p-4 text-center">
                <p className="text-yellow-400 font-semibold">
                    ⏳ Puedes cambiar tu nombre en {daysUntilNextChange} días
                </p>
                <p className="text-gray-400 text-sm mt-1">
                    Nombre actual:{" "}
                    <span className="text-white font-bold">{currentUsername}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={currentUsername}
                    maxLength={20}
                    className="flex-1 bg-gray-800 border border-gray-600
                        rounded-lg px-4 py-2 text-white placeholder-gray-500
                        focus:outline-none focus:border-green-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50
                        text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    {loading ? "..." : "Guardar"}
                </button>
            </div>

            {/* Mensaje resultado */}
            {message && (
                <p className={`text-sm ${messageType === "success"
                    ? "text-green-400" : "text-red-400"}`}>
                    {message}
                </p>
            )}

            {/* Sugerencias */}
            {suggestions.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="text-gray-400 text-xs">Nombres disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => setNewUsername(s)}
                                className="bg-gray-700 hover:bg-gray-600 text-white
                                    text-sm px-3 py-1 rounded-full transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}