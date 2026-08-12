import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Search, Sparkles, X, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import Reveal from '../components/Reveal';
import PlantPhoto from '../components/PlantPhoto';
import PlantPortrait from '../components/PlantPortrait';
import WishlistHeart from '../components/WishlistHeart';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { useScrollLock, useEscapeKey } from '../hooks/useScrollLock';
import { useCart } from '../context/CartContext';
import { PLANTS, FAMILIES, getSimilarPlants } from '../data/plants';
import { formatINR } from '../utils/currency';
import { buildPlantInquiryLink } from '../utils/whatsapp';
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
                // A heart toggle can't nest inside the tile's own click-to-open
                // button (a <button> inside a <button> is invalid HTML), so
                // this wrapper carries the tile's motion/layout instead, and
                // the heart sits beside the button rather than inside it.
                <motion.div
                  key={p.id}
                  layout={!isMobile}
                  initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  animate={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  transition={{ duration: isMobile ? 0.22 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="plant-tile-wrap"
                >
                  <WishlistHeart plantId={p.id} plantName={p.common} />
                  <button type="button" className="plant-tile" onClick={() => setActive(p)}>
                    <div className="plant-tile__portrait">
                      {p.photo ? (
                        <PlantPhoto id={p.id} alt={p.common} size={104} family={p.family} />
                      ) : (
                        <PlantPortrait family={p.family} id={p.id} size={104} />
                      )}
                      <span className="price-badge">{formatINR(p.price)}</span>
                    </div>
                    <span className="plant-tile__family">{p.family}</span>
                    <h3>{p.common}</h3>
                    {p.alt && <p className="plant-tile__alt">a.k.a. {p.alt}</p>}
                    <p className="plant-tile__botanical">{p.botanical}</p>
                    <span className="plant-tile__benefit-count">
                      <Sparkles size={12} /> {p.benefits.length} highlight{p.benefits.length > 1 ? 's' : ''}
                    </span>
                  </button>
                </motion.div>
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
        {active && <PlantModal plant={active} onClose={closeModal} onSelectPlant={setActive} />}
      </AnimatePresence>
    </>
  );
}

// Exported so the Wishlist page can open the exact same detail modal — one
// modal implementation, not two near-identical copies.
export function PlantModal({ plant, onClose, onSelectPlant }) {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  useScrollLock(true);
  useEscapeKey(true, onClose);

  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // A visitor jumping here from "You might also like" swaps `plant` without
  // this component unmounting — reset the scroll position so they don't land
  // mid-scroll in a plant they haven't seen the top of yet.
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [plant.id]);

  const similar = useMemo(() => getSimilarPlants(plant, 4), [plant]);

  const { lines, addItem, MIN_QTY, MAX_QTY } = useCart();
  const [addQty, setAddQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const inCartLine = lines.find((l) => l.plant.id === plant.id);

  // reset the "just added" confirmation if the visitor closes and reopens a
  // different plant's modal without this component unmounting in between
  useEffect(() => {
    setAddQty(1);
    setJustAdded(false);
  }, [plant.id]);

  useEffect(() => {
    if (!justAdded) return undefined;
    const t = setTimeout(() => setJustAdded(false), 1800);
    return () => clearTimeout(t);
  }, [justAdded]);

  const handleAddToCart = () => {
    addItem(plant.id, addQty);
    setAddQty(1);
    setJustAdded(true);
  };

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
        <div className="plant-modal__scroll" ref={scrollRef}>
          {/* Keyed on plant.id so switching plants (via "You might also like")
              fades the new content in rather than hard-cutting to it — the old
              content simply unmounts as this remounts, which is a lighter
              touch than a full crossfade and avoids a layout jump between two
              differently-sized bodies overlapping mid-transition. */}
          <motion.div
            key={plant.id}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="plant-modal__portrait">
              {plant.photo ? (
                <PlantPhoto id={plant.id} alt={plant.common} size={140} family={plant.family} />
              ) : (
                <PlantPortrait family={plant.family} id={plant.id} size={140} />
              )}
              <span className="price-badge">{formatINR(plant.price)}</span>
            </div>
            <div className="plant-modal__body">
              <span className="plant-tile__family">{plant.family}</span>
              <div className="plant-modal__title-row">
                <h2>{plant.common}</h2>
                <WishlistHeart plantId={plant.id} plantName={plant.common} size={18} inline label />
              </div>
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

              <div className="plant-modal__add">
                <div className="plant-modal__add-row">
                  <div className="plant-modal__stepper">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={addQty <= MIN_QTY}
                      onClick={() => setAddQty((q) => Math.max(MIN_QTY, q - 1))}
                    >
                      <Minus size={14} />
                    </button>
                    <span aria-live="polite">{addQty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={addQty >= MAX_QTY}
                      onClick={() => setAddQty((q) => Math.min(MAX_QTY, q + 1))}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="plant-modal__stepper plant-modal__stepper--bulk">
                    <button
                      type="button"
                      aria-label="Decrease quantity by 10"
                      disabled={addQty <= MIN_QTY}
                      onClick={() => setAddQty((q) => Math.max(MIN_QTY, q - 10))}
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      aria-label="Increase quantity by 10"
                      onClick={() => setAddQty((q) => Math.min(MAX_QTY, q + 10))}
                    >
                      +10
                    </button>
                  </div>
                  <div className="plant-modal__stepper plant-modal__stepper--bulk">
                    <button
                      type="button"
                      aria-label="Decrease quantity by 100"
                      disabled={addQty <= MIN_QTY}
                      onClick={() => setAddQty((q) => Math.max(MIN_QTY, q - 100))}
                    >
                      -100
                    </button>
                    <button
                      type="button"
                      aria-label="Increase quantity by 100"
                      onClick={() => setAddQty((q) => Math.min(MAX_QTY, q + 100))}
                    >
                      +100
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={`plant-modal__add-btn ${justAdded ? 'plant-modal__add-btn--added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {justAdded ? (
                    <>
                      <Check size={16} /> Added to cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} /> Add to cart
                    </>
                  )}
                </button>
              </div>
              {inCartLine && (
                <p className="plant-modal__in-cart">
                  {inCartLine.qty} already in your cart — {formatINR(inCartLine.lineTotal)}
                </p>
              )}

              <a
                className="plant-modal__cta"
                href={buildPlantInquiryLink(plant)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Just asking? Message us on WhatsApp
              </a>
              <p className="plant-modal__price-note">
                Price shown is an estimate — pot, size and season can shift it. We'll confirm on WhatsApp.
              </p>

              {similar.length > 0 && (
                <div className="plant-modal__section plant-modal__similar">
                  <span className="plant-modal__label">You might also like</span>
                  <div className="plant-modal__similar-row">
                    {similar.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        className="similar-plant"
                        onClick={() => onSelectPlant(sp)}
                      >
                        <span className="similar-plant__portrait">
                          {sp.photo ? (
                            <PlantPhoto id={sp.id} alt={sp.common} size={64} family={sp.family} />
                          ) : (
                            <PlantPortrait family={sp.family} id={sp.id} size={64} />
                          )}
                        </span>
                        <span className="similar-plant__name">{sp.common}</span>
                        <span className="similar-plant__price">{formatINR(sp.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
