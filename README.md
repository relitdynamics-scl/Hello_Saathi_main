# Hello Saathi — Nursery Website

A minimal, animated website for Hello Saathi, a neighborhood plant nursery
in Bhopal & Delhi. Built with React + Vite + Framer Motion.

## Pages
- **Home** — animated hero with a growing-vine SVG, highlights, featured plants, CTA
- **Plants** — searchable, filterable catalog of all 28 plants from the nursery's
  reference sheet, with a detail modal for each
- **Contact** — nursery info, hours, and a working front-end contact form

## Design
- Palette: deep near-black base with moss-green and terracotta accents
- Type: Fraunces (display/serif) + Inter (body) + JetBrains Mono (labels)
- Signature element: a hand-drawn vine that "grows" via SVG stroke animation,
  tied to scroll position, used in the hero and as a section divider
- Fully responsive down to small phones; mobile gets a full-screen nav menu

## Running it locally

You'll need [Node.js](https://nodejs.org) (v18+) installed.

```bash
# install dependencies
npm install

# start a local dev server (with hot reload)
npm run dev

# or build for production
npm run build
npm run preview   # preview the production build locally
```

The dev server runs at `http://localhost:5173` by default.

## Deploying

The `npm run build` command outputs static files to `dist/` — you can drop
that folder onto any static host: Vercel, Netlify, GitHub Pages, or your own
server. No backend is required; the contact form currently validates and
shows a success state client-side only (wire it up to an email service or
WhatsApp API endpoint when you're ready to receive real messages).

## Editing plant data

All plant info lives in `src/data/plants.js` — edit that file to add,
remove, or update plants. Each entry needs: `botanical`, `common`,
`benefits` (array), `care`, and `family` (used for the filter tabs and the
line-art icon).

## Structure

```
src/
  components/   Nav, Footer, buttons, the growing-vine SVG, plant glyphs
  pages/        Home, Plants, Contact (each with its own .css)
  data/         plants.js — the catalog data
  styles/       global.css — design tokens, fonts, base styles
```
