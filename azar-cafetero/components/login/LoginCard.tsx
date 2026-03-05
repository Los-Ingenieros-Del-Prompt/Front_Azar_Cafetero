"use client";

import GoogleButton from "./GoogleButton";

export default function LoginCard() {
  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-sm shadow-2xl flex flex-col items-center gap-8 min-h-[28rem]">
      <h1 className="text-3xl font-bold text-gray-900 font-sans">Log In</h1>
      <p className="text-gray-700 text-center font-medium font-sans">
        Sumérgete en la diversión y la estrategia del casino.
      </p>

      <GoogleButton />

      <p className="text-center text-gray-700 mt-6 font-sans">
        ¿No tienes cuenta? <button className="text-[#1A8D44] font-bold hover:underline">Crea una</button>
      </p>
    </div>
  );
}