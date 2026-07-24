import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, MessageCircle, Check } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { buildWhatsAppLink } from '../utils/whatsapp';
import './WelcomePopup.css';

const SESSION_KEY = 'hs-welcome-popup-shown';

const morphTransition = { type: 'tween', duration: 0.55, ease: [0.16, 1, 0.3, 1] };

export default function WelcomePopup() {
  const location = useLocation();
  const [stage, setStage] = useState('closed'); // closed | open | minimized
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [waLink, setWaLink] = useState('');

  useEffect(() => {
    if (stage !== 'closed') return;
    if (location.pathname !== '/') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setStage('open');
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, stage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Tell us your name';
    if (!form.phone.trim()) nextErrors.phone = 'Add a phone number';
    if (!form.message.trim()) nextErrors.message = "What are you looking for?";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      const link = buildWhatsAppLink(form);
      setWaLink(link);
      setSent(true);
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const minimize = () => setStage('minimized');
  const expand = () => setStage('open');

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
                  {!sent ? (
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
                        Drop your details — we usually reply the same day.
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
                            aria-label="Phone or WhatsApp"
                          />
                          {errors.phone && <span className="welcome-field__error">{errors.phone}</span>}
                        </div>

                        <div className={`welcome-field ${errors.message ? 'welcome-field--error' : ''}`}>
                          <textarea
                            name="message"
                            rows={2}
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Low-light plant for a small balcony…"
                            aria-label="What are you looking for?"
                          />
                          {errors.message && <span className="welcome-field__error">{errors.message}</span>}
                        </div>

                        <MagneticButton variant="primary" type="submit">
                          Send message
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
                      <h3>Opening WhatsApp…</h3>
                      <p>Finish sending your message there — we reply fastest on WhatsApp.</p>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="welcome-success__link">
                        Didn't open? Tap here
                      </a>
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
