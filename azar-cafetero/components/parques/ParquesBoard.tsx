"use client";

import React from "react";

export default function ParquesBoard({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Fondo verde */}
      <div className="absolute inset-0 bg-[#0d1f0d]" />

      {/* SVG PRINCIPAL */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full block"
      >
        <image
          href="/images/parques-board.svg"
          x="0"
          y="0"
          width="1000"
          height="1000"
          preserveAspectRatio="none"
        />

        {/* ← AQUI VAN LAS FICHAS */}
        {children}
      </svg>

      {/* Luz */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Sombra interna */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)" }}
      />
    </div>
  );
}