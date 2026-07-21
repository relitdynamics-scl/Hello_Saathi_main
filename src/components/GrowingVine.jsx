import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/*
  A single continuous vine line that "grows" — stroke-dashoffset
  animates from fully hidden to fully drawn as the element enters
  view (or is pinned to page scroll, depending on `mode`).
  Small leaf buds pop in with a spring as their point along the
  path is reached.
*/

const VINE_PATH_VERTICAL =
  'M10,190 C 40,150 20,110 55,90 C 90,70 70,40 100,20 C 120,6 150,10 170,-2';

const VINE_PATH_HORIZONTAL =
  'M0,20 C 60,-10 120,50 200,20 C 280,-10 340,50 420,20 C 500,-10 560,50 640,20 C 720,-10 780,50 860,20';

export default function GrowingVine({
  className = '',
  width = 180,
  height = 200,
  color = 'var(--green)',
  progress, // required external motion value (0-1)
  strokeWidth = 2.5,
  orientation = 'vertical', // vertical | horizontal
}) {
  const pathRef = useRef(null);
  const [length, setLength] = useState(0);
  const isHorizontal = orientation === 'horizontal';

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, []);

  const dashoffset = useTransform(progress, [0, 1], [length, 0]);

  const leafPointsVertical = [
    [42, 150],
    [70, 95],
    [78, 55],
    [128, 15],
    [160, -4],
  ];
  const leafPointsHorizontal = [
    [80, 5],
    [250, 5],
    [420, 5],
    [590, 5],
    [760, 5],
  ];
  const leafPoints = isHorizontal ? leafPointsHorizontal : leafPointsVertical;
  const viewBox = isHorizontal ? '0 -20 860 60' : '0 -10 180 210';
  const path = isHorizontal ? VINE_PATH_HORIZONTAL : VINE_PATH_VERTICAL;

  return (
    <svg
      className={className}
      viewBox={viewBox}
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <motion.path
        ref={pathRef}
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{
          strokeDasharray: length,
          strokeDashoffset: length ? dashoffset : length,
        }}
      />
      {leafPoints.map(([px, py], i) => {
        const t = (i + 1) / (leafPoints.length + 1);
        const leafOpacity = useTransform(progress, [t - 0.12, t + 0.02], [0, 1]);
        const leafScale = useTransform(progress, [t - 0.12, t + 0.02], [0.2, 1]);
        const flip = i % 2 === 0 ? 1 : -1;
        return (
          <motion.g
            key={i}
            style={{ opacity: leafOpacity, scale: leafScale, originX: `${px}px`, originY: `${py}px` }}
          >
            <path
              transform={`translate(${px}, ${py}) rotate(${flip * 35})`}
              d="M0,0 C 6,-4 14,-2 16,4 C 14,10 6,10 0,0 Z"
              fill={color}
              opacity={0.85}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
