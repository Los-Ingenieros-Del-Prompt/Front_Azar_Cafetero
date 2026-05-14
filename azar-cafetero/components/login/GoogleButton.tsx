"use client";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import { saveToken } from "@/lib/auth";


const AUTH_API = (
  process.env.NEXT_PUBLIC_AUTH_URL ??
  process.env.NEXT_PUBLIC_GATEWAY_URL ??
  "https://azar-cafetero.duckdns.org"
).replace(/\/$/, "");

interface GoogleButtonProps {
  onError: (message: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function GoogleButton({ onError, onLoadingChange }: GoogleButtonProps) {
  const router = useRouter();
  const { login } = useUserContext();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      onError("No se recibió credencial de Google.");
      return;
    }

    onLoadingChange(true);
    onError("");

    try {
      const res = await fetch(`${AUTH_API}/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error(`Error de autenticación: ${res.status}`);

      const data = await res.json();
      const resolvedUserId =
        data.userId ??
        data.id ??
        data.sub ??
        data.googleId ??
        data.email;

      if (!data.token) {
        throw new Error("La respuesta de autenticación no incluyó token JWT.");
      }
      if (!resolvedUserId) {
        throw new Error("La respuesta de autenticación no incluyó userId.");
      }

      login({ name: data.name, avatarUrl: data.avatarUrl, userId: resolvedUserId });
      saveToken(data.token);

      router.replace("/lobby");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al autenticar";
      onError(message);
      onLoadingChange(false);
    }
  };

  const handleError = () => {
    onError("Autorización cancelada o denegada por Google.");
    onLoadingChange(false);
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="continue_with"
        shape="rectangular"
        theme="outline"
        size="large"
        width="320"
      />
    </div>
  );
}
