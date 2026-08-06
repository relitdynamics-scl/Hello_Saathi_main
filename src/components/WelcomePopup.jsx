import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, MessageCircle, Check } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { useScrollLock, useEscapeKey } from '../hooks/useScrollLock';
import { useCustomer } from '../context/CustomerContext';
import { FIELD_RULES } from '../utils/validation';
import './WelcomePopup.css';

const SESSION_KEY = 'hs-welcome-popup-shown';

// Storage access throws outright in some privacy modes. Failing to read the
// flag should only mean the popup shows again, never a crash.
function readFlag(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeFlag(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // nothing to do — worst case the popup reappears next visit
  }
}

const morphTransition = { type: 'tween', duration: 0.55, ease: [0.16, 1, 0.3, 1] };

export default function WelcomePopup() {
  const location = useLocation();
  const { saveDetails } = useCustomer();
  const [stage, setStage] = useState('closed'); // closed | open | minimized
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (stage !== 'closed') return;
    if (location.pathname !== '/') return;
    // Safari private mode and blocked-cookie settings make sessionStorage
    // throw on access, which took the whole page down from inside an effect.
    if (readFlag(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setStage('open');
      writeFlag(SESSION_KEY, '1');
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, stage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Saving does not open WhatsApp — it only stores the details (and the
    // optional note) so a later "place order" from the cart can use them.
    const { ok, errors: found } = saveDetails(form);
    setErrors(found);
    if (ok) setSaved(true);
  };

  const minimize = useCallback(() => setStage('minimized'), []);
  const expand = useCallback(() => setStage('open'), []);

  // the page used to keep scrolling underneath the open card on phones
  useScrollLock(stage === 'open');
  useEscapeKey(stage === 'open', minimize);

  return (
    <>
      <AnimatePresence>
        {stage === 'open' && (
          <motion.div
            className="welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={minimize}
          />
        )}
      </AnimatePresence>

      <div className="welcome-stage">
        <AnimatePresence>
          {stage === 'open' && (
            <motion.div
              layoutId="welcome-widget"
              className="welcome-card"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ layout: morphTransition, opacity: { duration: 0.22 }, scale: { duration: 0.3 } }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Get in touch with Hello Saathi"
            >
              <motion.div
                className="welcome-card__inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <button className="welcome-card__close" onClick={minimize} aria-label="Minimize">
                  <X size={17} />
                </button>

                <AnimatePresence mode="wait">
                  {!saved ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="eyebrow welcome-card__eyebrow">Quick hello</span>
                      <h3 className="welcome-card__title">
                        Tell us what your plant needs, <em>we'll find it.</em>
                      </h3>
                      <p className="welcome-card__subtitle">
                        Save your details once — checkout is a single tap from here on.
                      </p>

                      <form className="welcome-form" onSubmit={handleSubmit} noValidate>
                        <div className={`welcome-field ${errors.name ? 'welcome-field--error' : ''}`}>
                          <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            autoComplete="name"
                            aria-label="Your name"
                            maxLength={FIELD_RULES.name.max}
                            aria-invalid={!!errors.name}
                          />
                          {errors.name && <span className="welcome-field__error">{errors.name}</span>}
                        </div>

                        <div className={`welcome-field ${errors.phone ? 'welcome-field--error' : ''}`}>
                          <input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Phone or WhatsApp"
                            autoComplete="tel"
                            inputMode="tel"
                            aria-label="Phone or WhatsApp"
                            maxLength={FIELD_RULES.phone.max}
                            aria-invalid={!!errors.phone}
                          />
                          {errors.phone && <span className="welcome-field__error">{errors.phone}</span>}
                        </div>

                        <div className={`welcome-field ${errors.email ? 'welcome-field--error' : ''}`}>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email address (optional)"
                            autoComplete="email"
                            aria-label="Email address"
                            maxLength={FIELD_RULES.email.max}
                            aria-invalid={!!errors.email}
                          />
                          {errors.email && <span className="welcome-field__error">{errors.email}</span>}
                        </div>

                        <div className={`welcome-field ${errors.note ? 'welcome-field--error' : ''}`}>
                          <textarea
                            name="note"
                            rows={2}
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Low-light plant for a small balcony… (optional)"
                            aria-label="Anything we should know?"
                            maxLength={FIELD_RULES.note.max}
                            aria-invalid={!!errors.note}
                          />
                          {errors.note && <span className="welcome-field__error">{errors.note}</span>}
                        </div>

                        {errors.form && (
                          <p className="welcome-field__error" role="alert">
                            {errors.form}
                          </p>
                        )}

                        <MagneticButton variant="primary" type="submit">
                          Save my details
                        </MagneticButton>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      className="welcome-success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="welcome-success__icon">
                        <Check size={22} strokeWidth={2.4} />
                      </div>
                      <h3>Details saved.</h3>
                      <p>Add plants to your cart whenever you're ready — checkout will already know who you are.</p>
                      <Link to="/plants" className="welcome-success__link" onClick={minimize}>
                        Browse plants
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {stage === 'minimized' && (
          <motion.button
            layoutId="welcome-widget"
            className="welcome-bubble"
            transition={{ layout: morphTransition }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={expand}
            aria-label="Open the contact form"
          >
            <motion.span
              className="welcome-bubble__ping"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.45 } }}
            />
            <motion.span
              className="welcome-bubble__icon"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.25 } }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.12 } }}
            >
              <MessageCircle size={22} strokeWidth={2} />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
