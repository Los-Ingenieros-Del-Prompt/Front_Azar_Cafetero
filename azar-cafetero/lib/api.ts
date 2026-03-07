const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface AuthResponse {
  token: string;
  name: string;
  avatarUrl: string;
  isNewUser: boolean;
}

/**
 * Envía el idToken de Google al backend y recibe el JWT de la app.
 */
export async function authenticateWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? `Error ${res.status}`);
  }

  return res.json() as Promise<AuthResponse>;
}
