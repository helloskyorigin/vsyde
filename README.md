# VSYDE

An evidence-first comparison experience for public websites. This repository currently contains **frontend UI only** — no browser scanning, AI analysis, account system or payment processing is connected.

## Landing design

Minimal, dark, typography-led landing page with polished responsive layouts. No decorative hero artwork or borrowed website screenshots. The product preview uses CSS-built illustrative mock websites and prominently labelled example data.

- Two-URL comparison entry form with **client-side format validation only**
- Clearly illustrative product preview with sample verdict and evidence
- Five-factor methodology and four-step buyer journey
- Free preview vs $29 one-time report description
- Accessible FAQ, responsive navigation, subtle motion and reduced-motion support

Valid URLs show a *frontend demo only* notice. No network scan is triggered. Pricing buttons return visitors to the free form; they do not start checkout. Legal pages will be added when actual terms and policies are ready.

## Run

```bash
npm install
npm run dev
```

Before release:

```bash
npm run typecheck
npm run build
```

## Stack

Next.js 15 App Router, React 19, TypeScript, CSS, Lucide icons. Layout in `components/LandingPage.tsx`, styling in `app/globals.css`.
