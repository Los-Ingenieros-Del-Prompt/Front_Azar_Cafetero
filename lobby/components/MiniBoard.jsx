// MiniBoard.jsx — small parqués board preview used inside each TableCard.
// Shows the cross board with 4 colored corners (seats). Occupied seats
// have a ficha sitting on them. Renders pure SVG so it scales to any size.

function MiniBoard({ seats, palette, size = 150 }) {
  const sk = palette.cafe;
  const cream = '#F6E9C3';
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="mb-shine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* board cross */}
      <g transform="translate(80,80)">
        {/* shadow */}
        <ellipse cy="62" rx="60" ry="6" fill="#000" opacity=".35" />

        {/* four arms */}
        {[0, 90, 180, 270].map((rot, i) => (
          <g key={i} transform={`rotate(${rot})`}>
            <rect x={-12} y={-58} width={24} height={42} fill={cream} stroke={sk} strokeWidth="1.2" />
            {/* tile dividers */}
            {[1, 2].map(j => (
              <line key={j} x1={-12} y1={-58 + j * 14} x2={12} y2={-58 + j * 14}
                stroke={sk} strokeWidth=".6" opacity=".5" />
            ))}
            {/* colored home lane */}
            <rect x={-4} y={-58} width={8} height={42} fill={seats[i]?.color || '#888'}
              stroke={sk} strokeWidth="1" />
          </g>
        ))}

        {/* center diamond */}
        <rect x={-16} y={-16} width={32} height={32} fill={palette.amarillo} stroke={sk} strokeWidth="1.2" />
        <polygon points="0,-16 16,0 0,16 -16,0" fill={cream} stroke={sk} strokeWidth="1.2" />
        <circle r="5" fill={palette.rojo} stroke={sk} strokeWidth=".8" />

        {/* seat fichas */}
        {seats.map((s, i) => {
          const positions = [[-44, -44], [44, -44], [44, 44], [-44, 44]];
          const [x, y] = positions[i];
          const occupied = !!s.occupant;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              {/* base ring (the cell) */}
              <circle r="11" fill={cream} stroke={sk} strokeWidth="1.2" />
              {occupied && (
                <g style={{
                  transformOrigin: '0 0',
                  animation: s.joinedAt && Date.now() - s.joinedAt < 1500 ? 'ficha-drop .35s ease-out' : 'none',
                }}>
                  <ellipse cy="2" rx="9" ry="2" fill="#000" opacity=".4" />
                  <circle r="9" fill={s.color} stroke={sk} strokeWidth="1.2" />
                  <circle r="9" fill="url(#mb-shine)" opacity=".7" />
                  <circle r="3" fill={cream} />
                </g>
              )}
              {!occupied && (
                <g>
                  <circle r="7" fill="none" stroke={sk} strokeWidth=".8" strokeDasharray="2 2" opacity=".55" />
                  {/* host crown badge for slot 0 only if no occupant yet */}
                </g>
              )}
              {/* host marker */}
              {s.host && occupied && (
                <g transform="translate(0,-13)">
                  <circle r="4" fill={palette.amarillo} stroke={sk} strokeWidth=".6" />
                  <text textAnchor="middle" y="1.5" fontSize="5" fontFamily="DM Serif Display, serif" fill={sk}>★</text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

window.MiniBoard = MiniBoard;
