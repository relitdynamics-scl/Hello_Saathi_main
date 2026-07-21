import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './MagneticButton.css';

export default function MagneticButton({
  children,
  onClick,
  to,
  href,
  variant = 'primary', // primary | ghost
  type = 'button',
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    setPos({ x: relX * 0.35, y: relY * 0.45 });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const className = `magnetic-btn magnetic-btn--${variant}`;

  let inner;
  if (to) {
    inner = (
      <Link to={to} className={className}>
        <span className="magnetic-btn__label">{children}</span>
      </Link>
    );
  } else if (href) {
    inner = (
      <a href={href} className={className}>
        <span className="magnetic-btn__label">{children}</span>
      </a>
    );
  } else {
    inner = (
      <button type={type} className={className} onClick={onClick}>
        <span className="magnetic-btn__label">{children}</span>
      </button>
    );
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.4 }}
      style={{ display: 'inline-block' }}
    >
      {inner}
    </motion.span>
  );
}
