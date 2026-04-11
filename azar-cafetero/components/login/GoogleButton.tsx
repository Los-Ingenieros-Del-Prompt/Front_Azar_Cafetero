"use client";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://azar-cafetero.duckdns.org";

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
      const res = await fetch(`${GATEWAY}/auth/google`, {
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

      // Guarda nombre y avatar en contexto (el JWT vive en cookie HttpOnly)
      login({ id: resolvedUserId, name: data.name, avatarUrl: data.avatarUrl });

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
