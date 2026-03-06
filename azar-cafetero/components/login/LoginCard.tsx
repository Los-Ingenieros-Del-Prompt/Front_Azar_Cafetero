"use client";

import GoogleButton from "./GoogleButton";

export default function LoginCard() {
  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-sm shadow-2xl flex flex-col items-center gap-8 min-h-[28rem]">
      
      <div className="flex items-center gap-4">
        
        <img
          src="/images/logo.jpeg"
          alt="Logo Azar Cafetero"
          className="w-22 h-22 object-contain -ml-2"
        />

        <div className="flex flex-col leading-none">
          <span className="text-3xl font-bold text-gray-900 font-sans">
            Azar
          </span>
          <span className="text-2xl font-bold text-gray-900 font-sans">
            Cafetero
          </span>
        </div>

      </div>

      <p className="text-gray-700 text-center font-medium font-sans">
        ¡Qué chimba tenerte por acá! 
      </p>
      <p className="text-gray-700 text-center font-medium font-sans">
        ¿Listo para que la suerte te guiñe un ojo?
      </p>

      <GoogleButton />

      <p className="text-center text-gray-700 mt-6 font-sans">
        ¿No tienes cuenta?{" "}
        <button className="text-[#1A8D44] font-bold hover:underline">
          Crea una
        </button>
      </p>
    </div>
  );
}