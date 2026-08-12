import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import Reveal from '../components/Reveal';
import PlantPhoto from '../components/PlantPhoto';
import PlantPortrait from '../components/PlantPortrait';
import WishlistHeart from '../components/WishlistHeart';
import { PlantModal } from './Plants';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import './Wishlist.css';

export default function Wishlist() {
  const { lines, count } = useWishlist();
  const [active, setActive] = useState(null);
  const closeModal = useCallback(() => setActive(null), []);

  return (
    <>
      <section className="wishlist-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Saved for later</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="wishlist-hero__title">
              {count === 0 ? (
                'Nothing saved yet.'
              ) : (
                <>
                  {count} plant{count > 1 ? 's' : ''}, waiting for <em>you</em>.
                </>
              )}
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="section wishlist-body">
        <div className="container">
          {lines.length === 0 ? (
            <div className="wishlist-empty">
              <Heart size={32} strokeWidth={1.5} />
              <p>
                Tap the heart on any plant you're drawn to, and it'll be waiting for you here —
                no pressure to decide right away.
              </p>
              <Link to="/plants" className="wishlist-empty__cta">
                Browse plants
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              <AnimatePresence initial={false}>
                {lines.map((plant) => (
                  <WishlistCard key={plant.id} plant={plant} onOpen={() => setActive(plant)} />
                ))}
              </AnimatePresence>
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

function WishlistCard({ plant, onOpen }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return undefined;
    const t = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(t);
  }, [justAdded]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="wishlist-card"
    >
      {/* The portrait/name area opens the full detail modal — the same one
          the catalog uses, so "see more" behaves identically everywhere. */}
      <button type="button" className="wishlist-card__open" onClick={onOpen}>
        <div className="wishlist-card__portrait">
          {plant.photo ? (
            <PlantPhoto id={plant.id} alt={plant.common} size={96} family={plant.family} />
          ) : (
            <PlantPortrait family={plant.family} id={plant.id} size={96} />
          )}
          <span className="price-badge">{formatINR(plant.price)}</span>
        </div>
        <div className="wishlist-card__info">
          <span className="plant-tile__family">{plant.family}</span>
          <h3>{plant.common}</h3>
          <p className="wishlist-card__botanical">{plant.botanical}</p>
        </div>
      </button>

      <div className="wishlist-card__actions">
        <button
          type="button"
          className={`wishlist-card__add ${justAdded ? 'wishlist-card__add--added' : ''}`}
          onClick={() => {
            addItem(plant.id, 1);
            setJustAdded(true);
          }}
        >
          {justAdded ? (
            <>
              <Check size={14} /> Added
            </>
          ) : (
            <>
              <ShoppingBag size={14} /> Add to cart
            </>
          )}
        </button>
        {/* Already wishlisted by definition here, so this doubles as
            "remove" — one control, one meaning, learned once on the
            catalog and reused rather than adding a second, separate
            remove affordance to figure out. */}
        <WishlistHeart plantId={plant.id} plantName={plant.common} size={17} inline label />
      </div>
    </motion.div>
  );
}
