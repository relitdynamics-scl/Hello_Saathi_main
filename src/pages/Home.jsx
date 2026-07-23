import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Wind, Droplets, Sun, ShieldCheck } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import GrowingVine from '../components/GrowingVine';
import Reveal from '../components/Reveal';
import PlantPortrait from '../components/PlantPortrait';
import PlantPhoto from '../components/PlantPhoto';
import { PLANTS } from '../data/plants';
import './Home.css';

const HIGHLIGHTS = [
  { icon: Wind, title: 'Air that breathes easier', text: 'Every plant we stock is chosen for what it clears from the air around you.' },
  { icon: Droplets, title: 'Grown with real care', text: 'Hand-watered, hand-checked — nothing leaves the nursery unless we would keep it ourselves.' },
  { icon: Sun, title: 'Matched to your light', text: 'Tell us your window, your room, your routine — we find the plant that survives it.' },
  { icon: ShieldCheck, title: 'A companion, not a chore', text: 'Saathi means companion. We set you up to succeed, with care notes for every plant.' },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const vineProgress = useTransform(heroProgress, [0, 0.9], [0, 1]);
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  const featured = PLANTS.slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero__vine hero__vine--left">
          <GrowingVine progress={vineProgress} width={140} height={220} />
        </div>
        <div className="hero__vine hero__vine--right">
          <GrowingVine progress={vineProgress} width={140} height={220} color="var(--terracotta)" />
        </div>

        <motion.div
          className="container hero__content"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <h1 className="hero__title">
            {'Plants that'.split(' ').map((w, i) => (
              <AnimatedWord key={i} word={w} delay={0.15 + i * 0.06} />
            ))}
            <br />
            <span className="hero__title-accent">
              {'become companions.'.split(' ').map((w, i) => (
                <AnimatedWord key={i} word={w} delay={0.3 + i * 0.06} accent />
              ))}
            </span>
          </h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            Hello Saathi is a small nursery in Delhi, growing air-purifying,
            low-maintenance plants and helping you find the one that actually survives at your place.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <MagneticButton to="/plants" variant="primary">
              Browse our plants <ArrowRight size={16} />
            </MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Visit us
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="section highlights">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Why Hello Saathi</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section__title">Every plant earns its spot on our shelves.</h2>
          </Reveal>

          <div className="highlights__grid">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={0.1 + i * 0.08}>
                <div className="highlight-card">
                  <div className="highlight-card__icon">
                    <h.icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER VINE */}
      <DividerVine />

      {/* FEATURED PLANTS */}
      <section className="section featured">
        <div className="container">
          <div className="featured__head">
            <div>
              <Reveal>
                <span className="eyebrow">From the nursery floor</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="section__title">A few of our regulars.</h2>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <Link to="/plants" className="featured__see-all">
                See the full catalog <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>

          <div className="featured__grid">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={0.05 * i} y={40}>
                <FeaturedCard plant={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section cta-band">
        <div className="container cta-band__inner">
          <Reveal>
            <h2 className="cta-band__title">
              Come see them in person — <span className="hero__title-accent">bring your window.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <MagneticButton to="/contact" variant="primary">
              Get directions <ArrowRight size={16} />
            </MagneticButton>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function AnimatedWord({ word, delay, accent }) {
  return (
    <span className="word-reveal">
      <motion.span
        className={accent ? 'hero__title-accent-inner' : ''}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {word}&nbsp;
      </motion.span>
    </span>
  );
}

function FeaturedCard({ plant }) {
  return (
    <div className="plant-card">
      <div className="plant-card__portrait-wrap">
        <PlantPhoto id={plant.id} alt={plant.common} size={110} />
      </div>
      <div className="plant-card__body">
        <span className="plant-card__family">{plant.family}</span>
        <h3 className="plant-card__common">{plant.common}</h3>
        <p className="plant-card__botanical">{plant.botanical}</p>
        <ul className="plant-card__benefits">
          {plant.benefits.slice(0, 2).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DividerVine() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const progress = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  // a handful of plants placed along the vine, each popping in as the
  // vine's growth passes their position
  const dividerPlants = [
    { family: 'Palm', id: 2, t: 0.16, side: 'up' },
    { family: 'Flowering', id: 7, t: 0.38, side: 'down' },
    { family: 'Vine', id: 17, t: 0.58, side: 'up' },
    { family: 'Fern', id: 13, t: 0.8, side: 'down' },
  ];

  return (
    <div className="divider-vine" ref={ref}>
      <GrowingVine progress={progress} width={900} height={40} strokeWidth={1.5} orientation="horizontal" />
      <div className="divider-vine__plants">
        {dividerPlants.map((p, i) => (
          <DividerPlant key={i} {...p} progress={progress} />
        ))}
      </div>
    </div>
  );
}

function DividerPlant({ family, id, t, side, progress }) {
  const opacity = useTransform(progress, [t - 0.08, t + 0.04], [0, 1]);
  const scale = useTransform(progress, [t - 0.08, t + 0.04], [0.4, 1]);
  const y = useTransform(progress, [t - 0.08, t + 0.04], [side === 'up' ? 14 : -14, 0]);

  return (
    <motion.div
      className={`divider-vine__plant divider-vine__plant--${side}`}
      style={{ left: `${t * 100}%`, x: '-50%', opacity, scale, y }}
    >
      <PlantPortrait family={family} id={id} size={56} />
    </motion.div>
  );
}