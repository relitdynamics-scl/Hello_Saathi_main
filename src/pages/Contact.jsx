import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Camera, MessageCircle, Check } from 'lucide-react';
import Reveal from '../components/Reveal';
import MagneticButton from '../components/MagneticButton';
import { WHATSAPP_NUMBER, buildWhatsAppLink } from '../utils/whatsapp';
import './Contact.css';

const INFO = [
  { icon: MapPin, title: 'Find us', lines: ['Delhi nursery', 'Exact address shared on request'] },
  { icon: Clock, title: 'Hours', lines: ['Open daily', '9:00 AM – 7:00 PM'] },
  { icon: Phone, title: 'Reach us', lines: ['We reply fastest on WhatsApp', 'Or drop a message below'] },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [waLink, setWaLink] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Tell us your name';
    if (!form.phone.trim()) nextErrors.phone = 'Add a phone number so we can reply';
    if (!form.message.trim()) nextErrors.message = "What are you looking for?";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      const link = buildWhatsAppLink(form);
      setWaLink(link);
      setSent(true);
      window.open(link, '_blank', 'noopener,noreferrer');
    }
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
              <a href="#" className="contact-social__link">
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
            {!sent ? (
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
                  />
                  {errors.name && <span className="contact-field__error">{errors.name}</span>}
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
                  />
                  {errors.phone && <span className="contact-field__error">{errors.phone}</span>}
                </div>

                <div className={`contact-field ${errors.message ? 'contact-field--error' : ''}`}>
                  <label htmlFor="message">What are you looking for?</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Low-light plant for a small balcony in Delhi…"
                  />
                  {errors.message && <span className="contact-field__error">{errors.message}</span>}
                </div>

                <MagneticButton variant="primary" type="submit">
                  Send message
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
                <h3>Opening WhatsApp…</h3>
                <p>Finish sending your message there — we reply fastest on WhatsApp.</p>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact-success__link">
                  Didn't open? Tap here
                </a>
              </motion.div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}