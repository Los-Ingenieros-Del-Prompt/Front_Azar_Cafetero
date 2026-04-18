"use client";

export default function ParquesBoard() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Fondo SOLO verde */}
        <div className="absolute inset-0 bg-[#0d1f0d]" />

        {/* Board */}
        <div className="relative z-10 w-full max-w-2xl aspect-square flex items-center justify-center px-8">
          <div className="relative w-full h-full">
            
            {/* Outer frame */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0a1f0a] via-[#1a3a1a] to-[#0a1f0a] shadow-2xl overflow-hidden">
              
              {/* Inner board SIN margen */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                
                {/* SVG ocupando TODO */}
                <svg
                  viewBox="0 0 1000 1000"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <image
                    href="/images/parques-board.svg"
                    width="1000"
                    height="1000"
                  />
                </svg>

                {/* Luz */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-full blur-2xl" />

                {/* Sombra interna */}
                <div
                  className="absolute inset-0"
                  style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)" }}
                />
              </div>
            </div>

            {/* Sombra mesa */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/40 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}