import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useScrollLock, useEscapeKey } from '../hooks/useScrollLock';
import './Nav.css';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/plants', label: 'Plants' },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const close = useCallback(() => setOpen(false), []);
  useScrollLock(open);
  useEscapeKey(open, close);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="nav__brand">
          <span className="nav__brand-mark">
            <Leaf size={16} strokeWidth={2.2} />
          </span>
          Hello Saathi
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav__link ${location.pathname === l.to ? 'nav__link--active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav__right">
          <ThemeToggle />
          <Link to="/contact" className="nav__cta">
            Visit the nursery
          </Link>
        </div>

        <div className="nav__mobile-controls">
          <ThemeToggle />
          <button
            className="nav__menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* The drawer is rendered into <body>, not inside the header. The mobile
          bar carries a backdrop-filter, and a filtered element becomes the
          containing block for its position:fixed descendants — nested here,
          the drawer and its backdrop were clipped to the 375x70 bar instead
          of covering the viewport. */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="nav__mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={close}
              />
              <motion.div
                className="nav__mobile-panel"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.4, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70 || info.velocity.x < -450) close();
                }}
              >
                <div className="nav__mobile-links">
                  {LINKS.map((l, i) => (
                    <motion.div
                      key={l.to}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.16 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={l.to}
                        className={`nav__mobile-link ${location.pathname === l.to ? 'nav__mobile-link--active' : ''}`}
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 + LINKS.length * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link to="/contact" className="nav__mobile-cta">
                      Visit the nursery
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
}
