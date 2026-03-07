"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { authenticateWithGoogle } from "../../lib/api";
import { useUserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";

interface GoogleButtonProps {
  onError: (message: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function GoogleButton({ onError, onLoadingChange }: GoogleButtonProps) {
  const { login } = useUserContext();
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      onError("No se recibió credencial de Google.");
      return;
    }

    onLoadingChange(true);
    onError("");

    try {
      const authResponse = await authenticateWithGoogle(idToken);
      login(authResponse);
      // Redirige al lobby — cumple criterio <5s nuevo, <3s existente
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
        locale="es"
      />
    </div>
  );
}
