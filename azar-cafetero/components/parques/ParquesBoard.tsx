"use client";
import React from "react";

interface ParquesBoardProps {
  children?: React.ReactNode;
}

export default function ParquesBoard({ children }: ParquesBoardProps) {
  return (
    <div className="absolute inset-0 z-0 bg-[#0d1f0d]">
      <div className="relative w-full h-full flex items-center justify-center">

        {/* Contenedor cuadrado — mismo tamaño que antes */}
        <div
          style={{
            position: "relative",
            width:  "min(calc(100vh - 188px), calc(100vw - 100px))",
            height: "min(calc(100vh - 188px), calc(100vw - 100px))",
          }}
        >
          {/* Tu imagen SVG del tablero */}
          <img
            src="/images/parques-board.svg"
            alt="Tablero Parqués"
            style={{ width: "100%", height: "100%", display: "block" }}
            draggable={false}
          />

          {/* Fichas u otros elementos encima */}
          {children && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
              {children}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
