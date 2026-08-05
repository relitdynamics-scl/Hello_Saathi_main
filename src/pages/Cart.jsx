import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Check, X, Pencil } from 'lucide-react';
import Reveal from '../components/Reveal';
import MagneticButton from '../components/MagneticButton';
import PlantPhoto from '../components/PlantPhoto';
import PlantPortrait from '../components/PlantPortrait';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useScrollLock, useEscapeKey } from '../hooks/useScrollLock';
import { FIELD_RULES } from '../utils/validation';
import { buildOrderWhatsAppLink } from '../utils/whatsapp';
import { reportError } from '../utils/reportError';
import { formatINR } from '../utils/currency';
import './Cart.css';

export default function Cart() {
  const { lines, itemCount, subtotal, setQty, removeItem, clearCart, MIN_QTY, MAX_QTY } = useCart();
  const { details, hasDetails, forgetDetails } = useCustomer();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [waLink, setWaLink] = useState('');
  const [placeError, setPlaceError] = useState('');

  const closeDetails = () => setDetailsOpen(false);

  const placeOrder = () => {
    setPlaceError('');
    try {
      const link = buildOrderWhatsAppLink(details, lines);
      setWaLink(link);
      setPlaced(true);
      window.open(link, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const { message } = reportError(err, { where: 'cart-place-order' });
      setPlaceError(message);
    }
  };

  const startNewOrder = () => {
    clearCart();
    setPlaced(false);
    setWaLink('');
  };

  if (placed) {
    return (
      <section className="section cart-section">
        <div className="container cart-placed">
          <div className="cart-placed__icon">
            <Check size={26} strokeWidth={2.4} />
          </div>
          <h1>Opening WhatsApp…</h1>
          <p>Finish sending your order there — we reply fastest on WhatsApp.</p>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="cart-placed__link">
            Didn't open? Tap here
          </a>
          <button className="cart-placed__new" onClick={startNewOrder}>
            Start a new order
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="cart-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Your order</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="cart-hero__title">
              {itemCount === 0 ? (
                'Your cart is empty.'
              ) : (
                <>
                  {itemCount} plant{itemCount > 1 ? 's' : ''}, ready when <em>you</em> are.
                </>
              )}
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="section cart-body">
        <div className="container">
          {lines.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={32} strokeWidth={1.5} />
              <p>Nothing here yet — browse the catalog and add a plant that catches your eye.</p>
              <Link to="/plants" className="cart-empty__cta">
                Browse plants
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-lines">
                <AnimatePresence initial={false}>
                  {lines.map(({ plant, qty, lineTotal }) => (
                    <CartLine
                      key={plant.id}
                      plant={plant}
                      qty={qty}
                      lineTotal={lineTotal}
                      min={MIN_QTY}
                      max={MAX_QTY}
                      onChangeQty={(next) => setQty(plant.id, next)}
                      onRemove={() => removeItem(plant.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <div className="cart-summary">
                <div className="cart-summary__card">
                  <h2>Order summary</h2>
                  <div className="cart-summary__row">
                    <span>
                      {itemCount} item{itemCount > 1 ? 's' : ''}
                    </span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="cart-summary__total">
                    <span>Total</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>

                  {hasDetails ? (
                    <div className="cart-customer">
                      <div className="cart-customer__row">
                        <span className="cart-customer__label">Sending as</span>
                        <button
                          className="cart-customer__edit"
                          onClick={() => setDetailsOpen(true)}
                          type="button"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      </div>
                      <p className="cart-customer__name">{details.name}</p>
                      <p className="cart-customer__contact">
                        {details.phone}
                        {details.email ? ` · ${details.email}` : ''}
                      </p>
                    </div>
                  ) : (
                    <button className="cart-summary__details-btn" onClick={() => setDetailsOpen(true)}>
                      Add your details to continue
                    </button>
                  )}

                  {placeError && (
                    <p className="cart-summary__error" role="alert">
                      {placeError}
                    </p>
                  )}

                  <MagneticButton
                    variant="primary"
                    onClick={hasDetails ? placeOrder : () => setDetailsOpen(true)}
                  >
                    {hasDetails ? 'Place order on WhatsApp' : 'Proceed with order'}
                  </MagneticButton>

                  {hasDetails && (
                    <button className="cart-summary__forget" onClick={forgetDetails} type="button">
                      Forget my saved details
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {detailsOpen && <DetailsModal onClose={closeDetails} />}
      </AnimatePresence>
    </>
  );
}

function CartLine({ plant, qty, lineTotal, min, max, onChangeQty, onRemove }) {
  const [draft, setDraft] = useState(String(qty));

  // Only the stepper buttons change `qty` while this input isn't mid-edit —
  // typing itself only updates the local `draft`, so this can't clobber a
  // keystroke in flight. Kept as a plain effect rather than reading
  // document.activeElement during render, which is a DOM read that has no
  // business happening in a pure render pass.
  useEffect(() => {
    setDraft(String(qty));
  }, [qty]);

  const commit = (value) => {
    // A native <input type="number"> silently sanitizes any non-numeric text
    // to '' at the DOM property level — before onChange even sees it. So
    // "the user typed letters" and "the user cleared the field to retype"
    // are indistinguishable here, and Number('') is 0 (not NaN), which would
    // otherwise sail past an isFinite check and reset a cleared field to
    // MIN_QTY instead of leaving the prior quantity alone.
    if (value.trim() === '') {
      setDraft(String(qty));
      return;
    }
    const n = Math.trunc(Number(value));
    const clamped = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : qty;
    onChangeQty(clamped);
    setDraft(String(clamped));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="cart-line"
    >
      <div className="cart-line__portrait">
        {plant.photo ? (
          <PlantPhoto id={plant.id} alt={plant.common} size={72} family={plant.family} />
        ) : (
          <PlantPortrait family={plant.family} id={plant.id} size={72} />
        )}
      </div>

      <div className="cart-line__body">
        <h3>{plant.common}</h3>
        <p className="cart-line__botanical">{plant.botanical}</p>
        <span className="cart-line__unit">{formatINR(plant.price)} each</span>
      </div>

      <div className="cart-line__qty">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= min}
          onClick={() => commit(qty - 1)}
        >
          <Minus size={14} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={`Quantity for ${plant.common}`}
          value={draft}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={qty >= max}
          onClick={() => commit(qty + 1)}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="cart-line__total">{formatINR(lineTotal)}</div>

      <button className="cart-line__remove" onClick={onRemove} aria-label={`Remove ${plant.common}`}>
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}

function DetailsModal({ onClose }) {
  const { details, saveDetails, EMPTY } = useCustomer();
  const isMobile = useIsMobile();
  const [form, setForm] = useState(details || EMPTY);
  const [errors, setErrors] = useState({});
  useScrollLock(true);
  useEscapeKey(true, onClose);

  const firstFieldRef = useRef(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Saving does not open WhatsApp — it only stores the details so
    // "place order" (a separate, explicit click) can use them.
    const { ok, errors: found } = saveDetails(form);
    setErrors(found);
    if (ok) onClose();
  };

  // Portalled to <body> for the same reason PlantModal is: <motion.main>
  // (the page-transition wrapper) carries a transform, which makes it the
  // containing block for position:fixed descendants. Left nested here, this
  // backdrop would size itself to the page instead of the viewport — the
  // exact bug fixed twice already elsewhere in this app.
  return createPortal(
    <motion.div
      className="cart-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="cart-modal"
        initial={isMobile ? { y: '100%' } : { opacity: 0, y: 24, scale: 0.96 }}
        animate={isMobile ? { y: '0%' } : { opacity: 1, y: 0, scale: 1 }}
        exit={isMobile ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.96 }}
        transition={
          isMobile
            ? { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Your details"
      >
        <button className="cart-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <span className="eyebrow">Almost there</span>
        <h2 className="cart-modal__title">Where should we send this order?</h2>
        <p className="cart-modal__subtitle">
          We'll open WhatsApp with everything filled in — you just hit send.
        </p>

        <form className="cart-form" onSubmit={handleSubmit} noValidate>
          <div className={`cart-field ${errors.name ? 'cart-field--error' : ''}`}>
            <label htmlFor="cart-name">Your name</label>
            <input
              ref={firstFieldRef}
              id="cart-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Ananya Sharma"
              autoComplete="name"
              maxLength={FIELD_RULES.name.max}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="cart-field__error">{errors.name}</span>}
          </div>

          <div className={`cart-field ${errors.phone ? 'cart-field--error' : ''}`}>
            <label htmlFor="cart-phone">Phone or WhatsApp</label>
            <input
              id="cart-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              inputMode="tel"
              maxLength={FIELD_RULES.phone.max}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <span className="cart-field__error">{errors.phone}</span>}
          </div>

          <div className={`cart-field ${errors.email ? 'cart-field--error' : ''}`}>
            <label htmlFor="cart-email">Email (optional)</label>
            <input
              id="cart-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={FIELD_RULES.email.max}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="cart-field__error">{errors.email}</span>}
          </div>

          <MagneticButton variant="primary" type="submit">
            Save details
          </MagneticButton>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
