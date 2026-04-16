"use client";

export default function PokerTable() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Background - Casino/Bar atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1810] via-[#3d2415] to-[#2d1810]">
          {/* Wood texture overlay */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                #4a2c1a 0px,
                #3d2415 2px,
                #4a2c1a 4px
              )`,
            }}
          />

          {/* Ambient lighting effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-blue-900/10 rounded-full blur-3xl" />
        </div>

        {/* Poker Table */}
        <div className="relative z-10 w-full max-w-5xl aspect-[16/10] flex items-center justify-center px-8">
          {/* Table outer frame - dark wood/leather padding */}
          <div className="relative w-full h-full">
            {/* Outer padding/rail */}
            <div className="absolute inset-0 rounded-[120px] bg-gradient-to-b from-[#1a0f0a] via-[#2d1b12] to-[#1a0f0a] shadow-2xl">
              {/* Rail highlights */}
              <div
                className="absolute inset-0 rounded-[120px] shadow-inner"
                style={{
                  boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 8px rgba(0,0,0,0.5)",
                }}
              />

              {/* Inner felt area */}
              <div className="absolute inset-8 rounded-[100px] bg-gradient-to-br from-[#1a5c2e] via-[#0d4d25] to-[#1a5c2e] shadow-inner overflow-hidden">
                {/* Felt texture */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      rgba(0,0,0,0.03) 2px,
                      rgba(0,0,0,0.03) 4px
                    )`,
                  }}
                />

                {/* Felt lighting - top light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-2xl" />

                {/* Center area glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-emerald-400/5 rounded-full blur-3xl" />

                {/* Shadow around edges */}
                <div
                  className="absolute inset-0 rounded-[100px]"
                  style={{
                    boxShadow: "inset 0 0 40px rgba(0,0,0,0.4), inset 0 0 80px rgba(0,0,0,0.2)",
                  }}
                />
              </div>

              {/* Rail cushion detail */}
              <div
                className="absolute inset-6 rounded-[110px] pointer-events-none"
                style={{
                  boxShadow: "0 0 0 1px rgba(139, 69, 19, 0.3)",
                }}
              />
            </div>

            {/* Table shadow on floor */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/40 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
