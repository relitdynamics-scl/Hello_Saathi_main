// Full botanical "portrait" illustrations: a shaded pot + a leaf silhouette
// per plant family, with per-plant seeded variation (leaf count, tilt, size)
// so the 28 catalog entries read as individually observed rather than
// stamped from one template, while staying visually consistent as a set.

// small deterministic PRNG so the same plant id always renders identically
function seeded(id) {
  let s = id * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const TONES = {
  Palm: { deep: '#3f5c37', mid: '#6f9660', light: '#a9c896' },
  Foliage: { deep: '#3a5a44', mid: '#65916d', light: '#9cc09e' },
  Flowering: { deep: '#4c6b40', mid: '#7fa66b', light: '#e0965f' },
  Vine: { deep: '#37542f', mid: '#5f8a4f', light: '#93b97e' },
  Succulent: { deep: '#3d5a4c', mid: '#6a9481', light: '#a3c4ae' },
  Fern: { deep: '#33502d', mid: '#5a7f4e', light: '#8fb17e' },
  Dracaena: { deep: '#4a4327', mid: '#7c7048', light: '#b7a86e' },
};

const POT_TONES = {
  deep: '#8a4f2e',
  mid: '#c97b4a',
  light: '#e0965f',
};

export default function PlantPortrait({ family, id = 1, size = 120, className = '' }) {
  const rand = seeded(id);
  const tone = TONES[family] || TONES.Foliage;
  const tilt = (rand() - 0.5) * 6; // whole-plant tilt for variety
  const potWobble = (rand() - 0.5) * 3;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`shadow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`pot-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={POT_TONES.light} />
          <stop offset="100%" stopColor={POT_TONES.deep} />
        </linearGradient>
      </defs>

      {/* ambient shadow */}
      <ellipse cx="60" cy="106" rx="26" ry="5" fill={`url(#shadow-${id})`} />

      <g transform={`rotate(${tilt} 60 70)`}>
        {renderFoliage(family, tone, rand, id)}
      </g>

      {/* pot */}
      <g transform={`translate(${potWobble} 0)`}>
        <path
          d="M42 92 L78 92 L74 114 Q60 118 46 114 Z"
          fill={`url(#pot-${id})`}
        />
        <path
          d="M42 92 L78 92 L76.5 99 L43.5 99 Z"
          fill={POT_TONES.deep}
          opacity="0.55"
        />
        <rect x="40" y="88" width="40" height="6" rx="2.5" fill={POT_TONES.light} />
        <rect x="40" y="88" width="40" height="6" rx="2.5" fill={POT_TONES.deep} opacity="0.25" />
      </g>
    </svg>
  );
}

function leafPath(cx, cy, len, width, angleDeg, curve = 1) {
  const rad = (angleDeg * Math.PI) / 180;
  const tipX = cx + Math.cos(rad) * len;
  const tipY = cy + Math.sin(rad) * len;
  const perpX = Math.cos(rad + Math.PI / 2) * width;
  const perpY = Math.sin(rad + Math.PI / 2) * width;
  const midX = cx + Math.cos(rad) * len * 0.5;
  const midY = cy + Math.sin(rad) * len * 0.5;
  const c1x = midX + perpX * curve;
  const c1y = midY + perpY * curve;
  const c2x = midX - perpX * curve * 0.3;
  const c2y = midY - perpY * curve * 0.3;
  return `M${cx},${cy} Q${c1x},${c1y} ${tipX},${tipY} Q${c2x},${c2y} ${cx},${cy} Z`;
}

function renderFoliage(family, tone, rand, id) {
  const baseX = 60;
  const baseY = 92;

  switch (family) {
    case 'Palm': {
      const fronds = 5 + Math.floor(rand() * 2);
      const spread = 130;
      return (
        <g>
          {Array.from({ length: fronds }).map((_, i) => {
            const t = i / (fronds - 1);
            const angle = -90 - spread / 2 + t * spread + (rand() - 0.5) * 8;
            const len = 38 + rand() * 12;
            const isBack = i % 2 === 0;
            return (
              <path
                key={i}
                d={leafPath(baseX, baseY, len, 7 + rand() * 2, angle, 0.9)}
                fill={isBack ? tone.deep : tone.mid}
                opacity={isBack ? 0.85 : 1}
              />
            );
          })}
          <path d={`M${baseX} ${baseY} L${baseX} ${baseY - 10}`} stroke={tone.deep} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }
    case 'Fern': {
      const fronds = 7;
      return (
        <g>
          {Array.from({ length: fronds }).map((_, i) => {
            const t = i / (fronds - 1);
            const angle = -90 - 70 + t * 140;
            const len = 30 + Math.sin(t * Math.PI) * 16;
            return (
              <g key={i}>
                <path d={leafPath(baseX, baseY, len, 5, angle, 0.7)} fill={i % 2 === 0 ? tone.mid : tone.light} opacity="0.95" />
              </g>
            );
          })}
        </g>
      );
    }
    case 'Succulent': {
      const spikes = 7;
      return (
        <g>
          {Array.from({ length: spikes }).map((_, i) => {
            const angle = -90 - 60 + (i / (spikes - 1)) * 120 + (rand() - 0.5) * 6;
            const len = 26 + rand() * 10;
            return (
              <path
                key={i}
                d={leafPath(baseX, baseY, len, 5 + rand() * 2, angle, 0.35)}
                fill={i % 2 === 0 ? tone.mid : tone.light}
              />
            );
          })}
        </g>
      );
    }
    case 'Vine': {
      const segs = 4;
      let x = baseX;
      let y = baseY;
      const path = [`M${x},${y}`];
      const leaves = [];
      for (let i = 0; i < segs; i++) {
        const dir = i % 2 === 0 ? -1 : 1;
        const nx = x + dir * (14 + rand() * 6);
        const ny = y - (18 + rand() * 6);
        path.push(`Q${x + dir * 10},${y - 10} ${nx},${ny}`);
        leaves.push({ x: nx, y: ny, dir });
        x = nx;
        y = ny;
      }
      return (
        <g>
          <path d={path.join(' ')} stroke={tone.deep} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {leaves.map((l, i) => (
            <ellipse
              key={i}
              cx={l.x + l.dir * 6}
              cy={l.y - 3}
              rx="9"
              ry="6.5"
              fill={i % 2 === 0 ? tone.mid : tone.light}
              transform={`rotate(${l.dir * 30} ${l.x + l.dir * 6} ${l.y - 3})`}
            />
          ))}
        </g>
      );
    }
    case 'Flowering': {
      const leaves = 4;
      return (
        <g>
          {Array.from({ length: leaves }).map((_, i) => {
            const angle = -90 - 50 + (i / (leaves - 1)) * 100 + (rand() - 0.5) * 8;
            const len = 24 + rand() * 6;
            return <path key={i} d={leafPath(baseX, baseY, len, 8, angle, 0.8)} fill={tone.deep} opacity="0.9" />;
          })}
          <path d={`M${baseX} ${baseY} L${baseX + 4} ${baseY - 44}`} stroke={tone.deep} strokeWidth="2.5" strokeLinecap="round" />
          <g transform={`translate(${baseX + 4} ${baseY - 48})`}>
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * 360;
              const rad = (a * Math.PI) / 180;
              return (
                <ellipse
                  key={i}
                  cx={Math.cos(rad) * 9}
                  cy={Math.sin(rad) * 9}
                  rx="6"
                  ry="3"
                  fill={tone.light}
                  transform={`rotate(${a} ${Math.cos(rad) * 9} ${Math.sin(rad) * 9})`}
                />
              );
            })}
            <circle r="5" fill={POT_TONES.mid} />
          </g>
        </g>
      );
    }
    case 'Dracaena': {
      const stalks = 2 + Math.floor(rand() * 2);
      return (
        <g>
          {Array.from({ length: stalks }).map((_, s) => {
            const sx = baseX + (s - (stalks - 1) / 2) * 12;
            const sh = 30 + rand() * 14;
            const leaves = 5;
            return (
              <g key={s}>
                <path d={`M${sx} ${baseY} L${sx} ${baseY - sh}`} stroke={tone.deep} strokeWidth="3" strokeLinecap="round" />
                {Array.from({ length: leaves }).map((_, i) => {
                  const angle = -90 - 60 + (i / (leaves - 1)) * 120;
                  const len = 20 + rand() * 8;
                  return (
                    <path
                      key={i}
                      d={leafPath(sx, baseY - sh, len, 4.5, angle, 0.6)}
                      fill={i % 2 === 0 ? tone.mid : tone.light}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      );
    }
    default: {
      const leaves = 5;
      return (
        <g>
          {Array.from({ length: leaves }).map((_, i) => {
            const angle = -90 - 55 + (i / (leaves - 1)) * 110 + (rand() - 0.5) * 6;
            const len = 32 + rand() * 12;
            const isBack = i % 2 === 0;
            return (
              <path
                key={i}
                d={leafPath(baseX, baseY, len, 12 + rand() * 3, angle, 1.1)}
                fill={isBack ? tone.deep : tone.mid}
                opacity={isBack ? 0.85 : 1}
              />
            );
          })}
        </g>
      );
    }
  }
}