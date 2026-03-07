"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfileStatus } from "@/lib/profileApi";

export default function ProfileHUD() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        getProfileStatus()
            .then((data) => {
                setUsername(data.username);
                setAvatarUrl(data.avatarUrl);
            })
            .catch(() => {});
    }, []);

    return (
        <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700
                px-3 py-2 rounded-full transition-colors"
        >
            <img
                src={avatarUrl || "/images/avatars/avatar1.png"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border-2
                    border-green-500"
            />
            <span className="text-white text-sm font-semibold">
                {username}
            </span>
        </button>
    );
}