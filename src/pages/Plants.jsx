import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Search, Sparkles, X } from 'lucide-react';
import Reveal from '../components/Reveal';
import PlantPhoto from '../components/PlantPhoto';
import PlantPortrait from '../components/PlantPortrait';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useScrollLock, useEscapeKey } from '../hooks/useScrollLock';
import { PLANTS, FAMILIES } from '../data/plants';
import './Plants.css';

// On phones the catalog is rendered in chunks as you scroll. Mounting all 291
// tiles at once put ~6000 nodes and ~1800 SVG paths on the page, which made
// every filter tap freeze the UI.
const MOBILE_BATCH = 24;

export default function Plants() {
  const [family, setFamily] = useState('All');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    return PLANTS.filter((p) => {
      const matchesFamily = family === 'All' || p.family === family;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.common.toLowerCase().includes(q) ||
        p.botanical.toLowerCase().includes(q) ||
        (p.alt && p.alt.toLowerCase().includes(q));
      return matchesFamily && matchesQuery;
    });
  }, [family, query]);

  const [visibleCount, setVisibleCount] = useState(MOBILE_BATCH);
  const sentinelRef = useRef(null);

  // start the list over whenever the result set changes
  useEffect(() => {
    setVisibleCount(MOBILE_BATCH);
  }, [family, query]);

  const visible = isMobile ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = isMobile && visibleCount < filtered.length;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => c + MOBILE_BATCH);
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visible.length]);

  const closeModal = useCallback(() => setActive(null), []);

  return (
    <>
      <section className="plants-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">The catalog</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="plants-hero__title">
              {PLANTS.length} plants, each earning <em>its</em> keep.
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="plants-hero__subtitle">
              Every plant on our shelves clears something from the air, or asks for
              so little that it's nearly impossible to lose. Filter by type, or search
              for what you already have in mind.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section plants-directory">
        <div className="container">
          <Reveal>
            <div className="plants-controls">
              <div className="plants-search">
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search plants"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                {query && (
                  <button
                    type="button"
                    className="plants-search__clear"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="plants-filters" role="tablist" aria-label="Filter by plant family">
                {FAMILIES.map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={family === f}
                    className={`plants-filter ${family === f ? 'plants-filter--active' : ''}`}
                    onClick={() => setFamily(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <p className="plants-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'plant' : 'plants'}
            {family !== 'All' && ` in ${family}`}
          </p>

          {/* Layout projection across hundreds of tiles is what janks on a
              phone, so mobile gets a plain fade instead. */}
          <motion.div layout={!isMobile} className="plants-grid">
            <AnimatePresence mode={isMobile ? 'sync' : 'popLayout'} initial={false}>
              {visible.map((p) => (
                <motion.button
                  key={p.id}
                  layout={!isMobile}
                  initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  animate={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  transition={{ duration: isMobile ? 0.22 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="plant-tile"
                  onClick={() => setActive(p)}
                >
                  <div className="plant-tile__portrait">
                    {p.photo ? (
                      <PlantPhoto id={p.id} alt={p.common} size={104} family={p.family} />
                    ) : (
                      <PlantPortrait family={p.family} id={p.id} size={104} />
                    )}
                  </div>
                  <span className="plant-tile__family">{p.family}</span>
                  <h3>{p.common}</h3>
                  {p.alt && <p className="plant-tile__alt">a.k.a. {p.alt}</p>}
                  <p className="plant-tile__botanical">{p.botanical}</p>
                  <span className="plant-tile__benefit-count">
                    <Sparkles size={12} /> {p.benefits.length} highlight{p.benefits.length > 1 ? 's' : ''}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          {hasMore && (
            <div className="plants-more" ref={sentinelRef}>
              <button
                className="plants-more__btn"
                onClick={() => setVisibleCount((c) => c + MOBILE_BATCH)}
              >
                Show more plants
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="plants-empty">
              <p>No plant matches “{query}” in {family === 'All' ? 'the catalog' : family}.</p>
              <button
                className="plants-empty__reset"
                onClick={() => {
                  setQuery('');
                  setFamily('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {active && <PlantModal plant={active} onClose={closeModal} />}
      </AnimatePresence>
    </>
  );
}

function PlantModal({ plant, onClose }) {
  const isMobile = useIsMobile();
  useScrollLock(true);
  useEscapeKey(true, onClose);

  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Drag is started from the grab handle only. Putting the listener on the
  // whole sheet makes framer set touch-action on it, which would swallow the
  // vertical scroll of the content inside.
  const dragControls = useDragControls();

  // The page-transition wrapper (<motion.main>) carries a transform, which
  // makes it the containing block for position:fixed children — the backdrop
  // was sizing to the full page instead of the viewport, so the sheet landed
  // thousands of pixels below the fold. Portalling to <body> escapes it.
  return createPortal(
    <motion.div
      className="plant-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="plant-modal"
        initial={isMobile ? { y: '100%' } : { opacity: 0, y: 30, scale: 0.96 }}
        animate={isMobile ? { y: '0%' } : { opacity: 1, y: 0, scale: 1 }}
        exit={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.96 }}
        transition={
          isMobile
            ? { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }
            : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
        drag={isMobile ? 'y' : false}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 550) onClose();
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={plant.common}
      >
        <span
          className="plant-modal__grab-area"
          onPointerDown={(e) => isMobile && dragControls.start(e)}
          aria-hidden="true"
        >
          <span className="plant-modal__grabber" />
        </span>
        <button
          ref={closeRef}
          className="plant-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="plant-modal__scroll">
          <div className="plant-modal__portrait">
            {plant.photo ? (
              <PlantPhoto id={plant.id} alt={plant.common} size={140} family={plant.family} />
            ) : (
              <PlantPortrait family={plant.family} id={plant.id} size={140} />
            )}
          </div>
          <div className="plant-modal__body">
            <span className="plant-tile__family">{plant.family}</span>
            <h2>{plant.common}</h2>
            {plant.alt && <p className="plant-modal__alt">a.k.a. {plant.alt}</p>}
            <p className="plant-modal__botanical">{plant.botanical}</p>

            <div className="plant-modal__section">
              <span className="plant-modal__label">Highlights</span>
              <ul>
                {plant.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="plant-modal__section">
              <span className="plant-modal__label">Light &amp; care</span>
              <p>{plant.care}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
