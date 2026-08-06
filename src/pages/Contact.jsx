import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Camera, MessageCircle, Check } from 'lucide-react';
import Reveal from '../components/Reveal';
import MagneticButton from '../components/MagneticButton';
import { WHATSAPP_NUMBER } from '../utils/whatsapp';
import { FIELD_RULES } from '../utils/validation';
import { useCustomer } from '../context/CustomerContext';
import './Contact.css';

const INFO = [
  { icon: MapPin, title: 'Find us', lines: ['Delhi nursery', 'Exact address shared on request'] },
  { icon: Clock, title: 'Hours', lines: ['Open daily', '9:00 AM – 7:00 PM'] },
  { icon: Phone, title: 'Reach us', lines: ['Save your details below', "We'll have them ready when you check out"] },
];

export default function Contact() {
  const { saveDetails } = useCustomer();
  const [form, setForm] = useState({ name: '', phone: '', note: '' });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // "note" is optional at the shared-schema level (CustomerContext.saveDetails
    // is also called from the cart's own details modal, which never collects
    // one), but this page's entire premise is "tell us what you're looking
    // for" — so that requirement is enforced locally, before saveDetails ever
    // runs, rather than loosened at the schema.
    if (!form.note.trim()) {
      setErrors({ note: "What are you looking for?" });
      return;
    }

    // Saving does not open WhatsApp — it only stores the details (and the
    // note) so a later "place order" from the cart can use them.
    const { ok, errors: found } = saveDetails(form);
    setErrors(found);
    if (ok) setSaved(true);
  };

  return (
    <>
      <section className="contact-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Get in touch</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="contact-hero__title">
              Come say <em>hello</em>, saathi.
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="contact-hero__subtitle">
              Whether you know exactly which plant you want or just know your window
              gets two hours of sun — walk in, or send us a note first.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section contact-body">
        <div className="container contact-grid">
          <Reveal className="contact-info">
            {INFO.map((item, i) => (
              <motion.div
                key={item.title}
                className="contact-info__card"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="contact-info__icon">
                  <item.icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  {item.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="contact-social">
              <a
                href="https://instagram.com/hellosaathi"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social__link"
              >
                <Camera size={16} /> @hellosaathi
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social__link"
              >
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="contact-form-wrap">
            {!saved ? (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className={`contact-field ${errors.name ? 'contact-field--error' : ''}`}>
                  <label htmlFor="name">Your name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ananya Sharma"
                    autoComplete="name"
                    maxLength={FIELD_RULES.name.max}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <span className="contact-field__error" id="name-error" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className={`contact-field ${errors.phone ? 'contact-field--error' : ''}`}>
                  <label htmlFor="phone">Phone or WhatsApp</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={FIELD_RULES.phone.max}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <span className="contact-field__error" id="phone-error" role="alert">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className={`contact-field ${errors.note ? 'contact-field--error' : ''}`}>
                  <label htmlFor="note">What are you looking for?</label>
                  <textarea
                    id="note"
                    name="note"
                    rows={4}
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Low-light plant for a small balcony in Delhi…"
                    maxLength={FIELD_RULES.note.max}
                    aria-invalid={!!errors.note}
                    aria-describedby={errors.note ? 'note-error' : undefined}
                  />
                  {errors.note && (
                    <span className="contact-field__error" id="note-error" role="alert">
                      {errors.note}
                    </span>
                  )}
                </div>

                {errors.form && (
                  <p className="contact-form__error" role="alert">
                    {errors.form}
                  </p>
                )}

                <MagneticButton variant="primary" type="submit">
                  Save my details
                </MagneticButton>
              </form>
            ) : (
              <motion.div
                className="contact-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="contact-success__icon">
                  <Check size={26} strokeWidth={2.4} />
                </div>
                <h3>Details saved.</h3>
                <p>Add plants to your cart whenever you're ready — checkout will already know who you are.</p>
                <Link to="/plants" className="contact-success__link">
                  Browse plants
                </Link>
              </motion.div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}