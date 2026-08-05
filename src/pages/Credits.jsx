import { ExternalLink } from 'lucide-react';
import Reveal from '../components/Reveal';
import { PHOTO_CREDITS } from '../data/photoCredits';
import './Credits.css';

const NEEDS_ATTRIBUTION = /^cc by/i;

export default function Credits() {
  return (
    <>
      <section className="credits-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Fair use</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="credits-hero__title">
              Photo <em>credits.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="credits-hero__subtitle">
              Where a plant in our catalog doesn't yet have a photo from our own nursery
              floor, we've used an openly-licensed photo from Wikimedia Commons instead
              of leaving it blank. Every one of those is credited here, as its licence
              requires.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section credits-body">
        <div className="container">
          <Reveal>
            <div className="credits-table" role="table" aria-label="Photo credits">
              <div className="credits-row credits-row--head" role="row">
                <span role="columnheader">Plant</span>
                <span role="columnheader">Photographer</span>
                <span role="columnheader">Licence</span>
                <span role="columnheader">Source</span>
              </div>
              {PHOTO_CREDITS.map((c) => (
                <div className="credits-row" role="row" key={c.plantId}>
                  <span role="cell" className="credits-row__plant">
                    {c.common}
                  </span>
                  <span role="cell" className="credits-row__artist">
                    {c.artist}
                  </span>
                  <span role="cell">
                    <span
                      className={`credits-licence ${NEEDS_ATTRIBUTION.test(c.licence) ? 'credits-licence--attr' : ''}`}
                    >
                      {c.licence}
                    </span>
                  </span>
                  <span role="cell">
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="credits-row__link"
                    >
                      Wikimedia Commons <ExternalLink size={12} />
                    </a>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
