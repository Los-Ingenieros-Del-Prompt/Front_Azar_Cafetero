"use client";

// usamos placeholders hasta tener los avatares reales
const AVATARS = [
    "/images/avatars/avatar1.png",
    "/images/avatars/avatar2.png",
    "/images/avatars/avatar3.png",
    "/images/avatars/avatar4.png",
    "/images/avatars/avatar5.png",
    "/images/avatars/avatar6.png",
];

interface Props {
    selected: string;
    onSelect: (url: string) => void;
}

export default function AvatarSelector({ selected, onSelect }: Props) {
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar seleccionado actualmente */}
            <div className="relative">
                <img
                    src={selected || "/images/avatars/avatar1.png"}
                    alt="Avatar actual"
                    className="w-24 h-24 rounded-full border-4
                        border-green-500 object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-green-500
                    rounded-full p-1 text-white text-xs">✏️</span>
            </div>

            {/* Grid de avatares disponibles */}
            <div className="grid grid-cols-3 gap-3">
                {AVATARS.map((url) => (
                    <img
                        key={url}
                        src={url}
                        alt="Avatar opción"
                        onClick={() => onSelect(url)}
                        className={`w-16 h-16 rounded-full cursor-pointer
                            object-cover transition-all duration-200
                            ${selected === url
                                ? "border-4 border-green-500 scale-110"
                                : "border-2 border-gray-600 hover:border-green-400"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}