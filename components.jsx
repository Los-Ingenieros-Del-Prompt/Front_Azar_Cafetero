/* Small shared bits for the waiting room. Attaches to window for sibling babel scripts. */

const ParchCorner = ({ where }) => (
  <svg className={`parch-corner ${where}`} viewBox="0 0 32 32" fill="none">
    <path
      d="M2 30 C 2 14, 14 2, 30 2"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M2 30 C 6 18, 18 6, 30 2"
      stroke="currentColor"
      strokeWidth="0.6"
      fill="none"
      opacity="0.7"
    />
    <circle cx="3" cy="29" r="1.2" fill="currentColor" />
    <circle cx="29" cy="3" r="1.2" fill="currentColor" />
    <path d="M10 22 q 4 -8 12 -12" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5"/>
  </svg>
);

const ParchCorners = () => (
  <>
    <ParchCorner where="tl" />
    <ParchCorner where="tr" />
    <ParchCorner where="bl" />
    <ParchCorner where="br" />
  </>
);

const BrambleBg = () => (
  <svg className="bg-brambles" viewBox="0 0 1440 500" preserveAspectRatio="xMidYEnd slice" fill="none">
    {/* horizon hills */}
    <path d="M0 380 L 200 320 L 380 360 L 560 300 L 760 350 L 980 290 L 1180 340 L 1440 320 L 1440 500 L 0 500 Z"
          fill="#0a1612" opacity="0.6"/>
    <path d="M0 420 L 240 380 L 460 410 L 700 370 L 920 400 L 1180 380 L 1440 410 L 1440 500 L 0 500 Z"
          fill="#08130e" opacity="0.8"/>
    {Array.from({length: 12}).map((_, i) => {
      const x = 60 + i * 120 + (i % 2 === 0 ? 20 : -30);
      const h = 260 + (i * 37) % 140;
      const y = 380 - h + (i % 3) * 20;
      return (
        <g key={i} stroke="#0a1f15" strokeWidth="1.2" opacity="0.85" transform={`translate(${x} ${380})`}>
          <line x1="0" y1="0" x2="0" y2={-h}/>
          {Array.from({length: 9}).map((_, j) => {
            const yy = -j * (h/9) - 12;
            const len = 28 + ((i*j) % 14);
            return <g key={j}>
              <line x1="0" y1={yy} x2={-len} y2={yy - 16}/>
              <line x1="0" y1={yy-4} x2={len} y2={yy - 14}/>
            </g>;
          })}
        </g>
      );
    })}
    {/* fireflies */}
    {[[140,260],[320,310],[600,200],[880,260],[1100,300],[1280,240],[480,360],[760,330]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="2.2" fill="#f5d547" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${2.5 + (i%4)*0.5}s`} repeatCount="indefinite"/>
      </circle>
    ))}
  </svg>
);

const TopBar = ({ user, grains, bono }) => (
  <header className="topbar">
    <div className="topbar-left">
      <div className="logo-mark"></div>
      <button className="back-btn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3 L 5 7 L 9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>
      <span className="divider-v"></span>
      <span className="eyebrow"><span className="eyebrow-mute">MESA · </span>BRISCA</span>
    </div>
    <div className="topbar-right">
      <div className="user-pill">
        <div className="user-avatar"></div>
        <div className="user-info">
          <div className="user-name">{user}</div>
          <div className="user-grains"><span className="coin"></span> {grains} <span style={{opacity:0.7}}>granos</span></div>
        </div>
      </div>
      <div className="bono-line">Próximo bono en <strong>{bono}</strong></div>
    </div>
  </header>
);

const SideNav = () => (
  <nav className="sidenav">
    <button title="Perfil">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20 c 0 -4 4 -7 8 -7 s 8 3 8 7"/>
      </svg>
    </button>
    <button className="active" title="Lobby">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 11 L 12 4 L 21 11 V 20 H 14 V 14 H 10 V 20 H 3 Z"/>
      </svg>
    </button>
    <button title="Sonido">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 9 H 8 L 13 5 V 19 L 8 15 H 4 Z" strokeLinejoin="round"/>
        <path d="M16 9 q 3 3 0 6"/>
      </svg>
    </button>
  </nav>
);

Object.assign(window, { ParchCorners, ParchCorner, BrambleBg, TopBar, SideNav });
