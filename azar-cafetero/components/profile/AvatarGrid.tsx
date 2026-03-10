"use client";

import { ChevronRight } from 'lucide-react';

const AVATARS = [
    { id: 1, imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 2, imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { id: 3, imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheba' },
    { id: 4, imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco' },
];

interface Props {
    selectedUrl: string;
    onSelect: (url: string) => void;
}

export default function AvatarGrid({ selectedUrl, onSelect }: Props) {
    return (
        <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-6">
            {AVATARS.map((avatar) => (
                <div key={avatar.id} className="flex flex-col gap-3">
                    <div className={`bg-white rounded-2xl p-4 flex items-center 
                        justify-between shadow-lg transition-all
                        ${selectedUrl === avatar.imageUrl
                            ? 'ring-4 ring-green-500'
                            : ''
                        }`}>
                        <div className="w-32 h-32 md:w-36 md:h-36 bg-gray-200 
                            rounded-full overflow-hidden border-2 border-gray-100">
                            <img
                                src={avatar.imageUrl}
                                alt={`Avatar ${avatar.id}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => onSelect(avatar.imageUrl)}
                            className={`text-white w-12 h-28 rounded-xl flex 
                                items-center justify-center transition-all 
                                active:scale-95
                                ${selectedUrl === avatar.imageUrl
                                    ? 'bg-green-600'
                                    : 'bg-[#0a3311] hover:bg-[#124d1a]'
                                }`}
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}