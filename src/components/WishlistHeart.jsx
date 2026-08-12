import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';
import { useWishlist } from '../context/WishlistContext';

// One toggle, reused everywhere a plant can be saved: the catalog tile, the
// detail modal, the Home featured card, and the wishlist page itself.
// Styled via the shared .wishlist-heart rules in global.css (see the
// comment there — same sharing pattern as .price-badge).
export default function WishlistHeart({
  plantId,
  plantName,
  size = 16,
  inline = false,
  label = false,
  className = '',
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const reducedMotion = usePrefersReducedMotion();
  const active = isWishlisted(plantId);

  const classes = [
    'wishlist-heart',
    inline && 'wishlist-heart--inline',
    label && 'wishlist-heart--labeled',
    active && 'wishlist-heart--active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      // Belt-and-suspenders with the --active CSS class: testing turned up
      // cases (a heart sitting inside a Framer Motion layout-animated
      // ancestor) where the class-based color lost the cascade to the base
      // rule despite unambiguously higher specificity — a real, reproducible
      // browser/Framer interaction, not just a CSS authoring mistake. An
      // inline style can't lose that fight, so state-driven color is set
      // directly rather than trusted to the class alone.
      style={active ? { color: 'var(--green-bright)' } : undefined}
      onClick={(e) => {
        // Harmless where the heart already sits outside any clickable
        // ancestor (siblings, not nested), and necessary where it doesn't
        // (the wishlist page's whole card is a button) — cheap enough to
        // apply everywhere rather than track which callers need it.
        e.stopPropagation();
        toggleWishlist(plantId);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${plantName} from your wishlist` : `Save ${plantName} to your wishlist`}
    >
      {/* Keying on the active state forces a remount, replaying the little
          spring pop every toggle — skipped under reduced motion, where the
          key never changes and only the (non-motion) fill color communicates
          the new state. */}
      <motion.span
        key={reducedMotion ? 'static' : String(active)}
        initial={reducedMotion ? false : { scale: 0.55 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 16 }}
        style={{ display: 'flex' }}
      >
        <Heart size={size} strokeWidth={2} />
      </motion.span>
      {label && <span>{active ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
