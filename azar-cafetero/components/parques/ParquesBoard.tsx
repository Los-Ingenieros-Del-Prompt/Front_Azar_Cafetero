"use client";

export default function ParquesBoard() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1a] via-[#0d1f0d] to-[#1a2e1a]">
          {/* Wood texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                #2a4a2a 0px,
                #1a3a1a 2px,
                #2a4a2a 4px
              )`,
            }}
          />
          {/* Ambient lights */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-green-900/10 rounded-full blur-3xl" />
        </div>

        {/* Parqués board placeholder — reemplaza con el tablero real */}
        <div className="relative z-10 w-full max-w-2xl aspect-square flex items-center justify-center px-8">
          <div className="relative w-full h-full">
            {/* Outer frame */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0a1f0a] via-[#1a3a1a] to-[#0a1f0a] shadow-2xl">
              {/* Inner board area */}
              <div className="absolute inset-6 rounded-xl overflow-hidden">
  <svg
    viewBox="0 0 1000 1000" 
    className="w-full h-full"
    preserveAspectRatio="xMidYMid slice"
  >
    <image
      href="/images/parques-board.png"
      width="1000"
      height="1000"
    />
  </svg>
</div>
                {/* Grid lines */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "12.5% 12.5%",
                  }}
                />
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <span className="text-white/30 text-4xl font-bold">P</span>
                </div>
                {/* Corner zones — colores de Parqués */}
                <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-red-600/40 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-blue-600/40 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yellow-500/40 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-green-600/40 rounded-br-xl" />
                {/* Light overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-full blur-2xl" />
                {/* Edge shadow */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)" }}
                />
              </div>
            </div>
            {/* Table shadow */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/40 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
