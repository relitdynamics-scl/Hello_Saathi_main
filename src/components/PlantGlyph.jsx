// Minimal botanical line-icons per plant family, drawn to match the site's vine motif.
export default function PlantGlyph({ family, size = 56 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  };

  switch (family) {
    case 'Palm':
      return (
        <svg {...common}>
          <path d="M32 58V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {[[-1, -18], [1, -22], [-1.6, -12], [1.6, -14], [0, -26]].map(([dx, dy], i) => (
            <path
              key={i}
              d={`M32 30 Q${32 + dx * 6} ${30 + dy * 0.6} ${32 + dx * 10} ${30 + dy}`}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case 'Succulent':
      return (
        <svg {...common}>
          <path d="M32 58V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -90 + (i - 2) * 22;
            const rad = (angle * Math.PI) / 180;
            const x = 32 + Math.cos(rad) * 20;
            const y = 40 + Math.sin(rad) * 20;
            return (
              <path
                key={i}
                d={`M32 40 Q${(32 + x) / 2} ${(40 + y) / 2 - 6} ${x} ${y}`}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );
    case 'Vine':
      return (
        <svg {...common}>
          <path
            d="M14 54 C 24 46, 18 38, 28 32 C 38 26, 32 18, 42 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {[[18, 48], [26, 34], [38, 15]].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y} q 8 -4 6 -10 q -8 2 -6 10 z`}
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
            />
          ))}
        </svg>
      );
    case 'Flowering':
      return (
        <svg {...common}>
          <path d="M32 58V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="18" r="4" fill="currentColor" />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 32 + Math.cos(rad) * 8;
            const y = 18 + Math.sin(rad) * 8;
            return <ellipse key={i} cx={x} cy={y} rx="4" ry="2.4" transform={`rotate(${deg} ${x} ${y})`} stroke="currentColor" strokeWidth="1.2" />;
          })}
          <path d="M32 30 Q24 34 22 40" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      );
    case 'Fern':
      return (
        <svg {...common}>
          <path d="M32 58V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 30 + i * 5;
            const len = 16 - i * 1.6;
            return (
              <g key={i}>
                <path d={`M32 ${y} L${32 - len} ${y - 4}`} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d={`M32 ${y} L${32 + len} ${y - 4}`} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            );
          })}
        </svg>
      );
    case 'Dracaena':
      return (
        <svg {...common}>
          <path d="M32 58V34" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          {[[-14, -1], [14, -1], [-10, -12], [10, -12], [0, -18]].map(([dx, dy], i) => (
            <path
              key={i}
              d={`M32 34 Q${32 + dx * 0.5} ${34 + dy} ${32 + dx} ${28 + dy}`}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
    default: // Foliage
      return (
        <svg {...common}>
          <path d="M32 58V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 32 C 18 30, 14 16, 22 8 C 30 18, 30 26, 32 32 Z" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <path d="M32 40 C 46 38, 50 24, 42 16 C 34 26, 34 34, 32 40 Z" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      );
  }
}
