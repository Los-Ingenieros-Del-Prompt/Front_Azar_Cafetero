"use client";

import { useState } from "react";
import GoogleButton from "./GoogleButton";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginCard() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-sm shadow-2xl flex flex-col items-center gap-6 min-h-[28rem]">

      {/* Logo + nombre */}
      <div className="flex items-center gap-4">
        <img
          src="/images/logo.jpeg"
          alt="Logo Azar Cafetero"
          className="w-22 h-22 object-contain -ml-2"
        />
        <div className="flex flex-col leading-none">
          <span className="text-3xl font-bold text-gray-900">Azar</span>
          <span className="text-2xl font-bold text-gray-900">Cafetero</span>
        </div>
      </div>

      {/* Bienvenida */}
      <div className="text-center">
        <p className="text-gray-700 font-medium">¡Qué chimba tenerte por acá!</p>
        <p className="text-gray-700 font-medium">¿Listo para que la suerte te guiñe un ojo?</p>
      </div>

      {/* Botón Google */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="animate-spin text-[#1A8D44] w-8 h-8" />
          <p className="text-sm text-gray-500">Verificando con Google…</p>
        </div>
      ) : (
        <GoogleButton onError={setError} onLoadingChange={setIsLoading} />
      )}

      {/* Mensaje de error / cancelación */}
      {error && (
        <div className="w-full flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <p className="text-center text-gray-500 text-sm mt-auto">
        Al continuar aceptas nuestros{" "}
        <button className="text-[#1A8D44] font-bold hover:underline">
          términos y condiciones
        </button>
      </p>
    </div>
  );
}
