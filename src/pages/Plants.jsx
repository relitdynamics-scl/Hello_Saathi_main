import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import Reveal from '../components/Reveal';
import PlantPhoto from '../components/PlantPhoto';
import PlantPortrait from '../components/PlantPortrait';
import { PLANTS, FAMILIES } from '../data/plants';
import './Plants.css';

export default function Plants() {
  const [family, setFamily] = useState('All');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);

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
                  type="text"
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search plants"
                />
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

          <motion.div layout className="plants-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.button
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="plant-tile"
                  onClick={() => setActive(p)}
                >
                  <div className="plant-tile__portrait">
                    {p.photo ? (
                      <PlantPhoto id={p.id} alt={p.common} size={104} />
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
        {active && <PlantModal plant={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  );
}

function PlantModal({ plant, onClose }) {
  return (
    <motion.div
      className="plant-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="plant-modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={plant.common}
      >
        <button className="plant-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="plant-modal__portrait">
          {plant.photo ? (
            <PlantPhoto id={plant.id} alt={plant.common} size={140} />
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
      </motion.div>
    </motion.div>
  );
}