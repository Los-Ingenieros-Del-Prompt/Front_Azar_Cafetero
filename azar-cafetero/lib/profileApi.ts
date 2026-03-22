const BASE_URL = process.env.NEXT_PUBLIC_USER_URL || "http://localhost:8082";

function getHeaders() {
    const token = localStorage.getItem("azar_jwt");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getProfileStatus() {
    const res = await fetch(`${BASE_URL}/profile/status`, {
        headers: getHeaders(),
    });
    if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
    }
    return res.json();
}

export async function updateAvatar(avatarUrl: string) {
    const res = await fetch(`${BASE_URL}/profile/avatar`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ avatarUrl }),
    });
    if (!res.ok) throw new Error("Error al actualizar avatar");
    return res.json();
}

export async function updateUsername(username: string) {
    const res = await fetch(`${BASE_URL}/profile/username`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ username }),
    });

    return { status: res.status, data: await res.json() };
}