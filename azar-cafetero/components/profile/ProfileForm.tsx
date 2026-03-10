"use client";

import { User } from 'lucide-react';

interface Props {
    name: string;
    username: string;
    canChangeName: boolean;
    daysUntilNextChange: number;
    saving: boolean;
    message: string;
    messageType: 'success' | 'error';
    suggestions: string[];
    onNameChange: (value: string) => void;
    onUsernameChange: (value: string) => void;
    onGuardar: () => void;
}

export default function ProfileForm({
    name,
    username,
    canChangeName,
    daysUntilNextChange,
    saving,
    message,
    messageType,
    suggestions,
    onNameChange,
    onUsernameChange,
    onGuardar,
}: Props) {
    return (
        <div className="flex-[1.2] bg-white rounded-2xl p-8 flex flex-col 
            items-center shadow-xl">

            <h1 className="text-3xl font-black text-center mb-10 text-gray-800 
                uppercase tracking-tight leading-none">
                Seleccion Avatar<br />y<br />Edicion de username
            </h1>

            <div className="w-full space-y-4">

                {/* Input Name */}
                <div className="flex items-center bg-[#a5b5a7] rounded-xl px-4 py-3">
                    <User className="text-gray-700" size={24} />
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="bg-transparent border-none outline-none ml-3 
                            w-full text-gray-800 placeholder:text-gray-600 
                            font-medium"
                    />
                </div>

                {/* Input Username */}
                <div className="flex items-center bg-[#a5b5a7] rounded-xl px-4 py-3">
                    <User className="text-gray-700" size={24} />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => onUsernameChange(e.target.value)}
                        disabled={!canChangeName}
                        className={`bg-transparent border-none outline-none ml-3 
                            w-full text-gray-800 placeholder:text-gray-600 
                            font-medium
                            ${!canChangeName ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                {/* Aviso cooldown */}
                {!canChangeName && (
                    <p className="text-yellow-700 text-sm text-center 
                        bg-yellow-100 rounded-lg py-2">
                        ⏳ Puedes cambiar username en {daysUntilNextChange} días
                    </p>
                )}

                {/* Mensaje resultado */}
                {message && (
                    <p className={`text-sm text-center font-medium
                        ${messageType === 'success'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                        {message}
                    </p>
                )}

                {/* Sugerencias */}
                {suggestions.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-600 text-xs text-center">
                            Nombres disponibles:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => onUsernameChange(s)}
                                    className="bg-gray-200 hover:bg-gray-300 
                                        text-gray-800 text-sm px-3 py-1 
                                        rounded-full transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Botón Guardar */}
            <button
                onClick={onGuardar}
                disabled={saving}
                className="mt-10 bg-[#0a3311] hover:bg-[#124d1a] 
                    disabled:opacity-50 text-white px-16 py-3 rounded-2xl 
                    font-bold text-xl transition-all shadow-lg active:scale-95"
            >
                {saving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
    );
}