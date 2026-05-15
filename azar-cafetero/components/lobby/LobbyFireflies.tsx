"use client";

import React, { useMemo } from "react";

const AMARILLO = "#FCD116";

interface LobbyFirefliesProps {
  count?: number;
}

export default function LobbyFireflies({ count = 14 }: LobbyFirefliesProps) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const seed = i * 53 + 11;
        return {
          k: i,
          x: (seed * 13) % 100,
          y: 20 + ((seed * 7) % 70),
          size: 3 + ((seed * 3) % 5),
          delay: ((seed * 11) % 100) / 10,
          duration: 14 + ((seed * 17) % 12),
          hueDelay: ((seed * 5) % 30) / 10,
        };
      }),
    [count]
  );

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes ff-drift {
          0%   { transform: translate3d(0,0,0); opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translate3d(40px, -30px, 0); }
          90%  { opacity: 1; }
          100% { transform: translate3d(-30px, -60px, 0); opacity: 0; }
        }
        @keyframes ff-pulse {
          0%, 100% { filter: blur(4px) brightness(1); }
          50%      { filter: blur(2px) brightness(1.4); }
        }
      `}</style>
      {dots.map((d) => (
        <div
          key={d.k}
          style={{
            position: "absolute",
            left: d.x + "%",
            top: d.y + "%",
            width: d.size,
            height: d.size,
            borderRadius: 999,
            background: AMARILLO,
            boxShadow: `0 0 ${d.size * 3}px ${AMARILLO}cc, 0 0 ${d.size * 6}px ${AMARILLO}66`,
            animation: `ff-drift ${d.duration}s ${d.delay}s ease-in-out infinite, ff-pulse 2.${Math.floor(d.hueDelay)}s ease-in-out infinite`,
            willChange: "transform, opacity, filter",
          }}
        />
      ))}
    </div>
  );
}
