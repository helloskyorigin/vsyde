# VSYDE

Premium website-versus-website comparison landing page. This is **frontend UI/UX only** — no AI scanning, checkout, account creation, or backend requests are implemented yet.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck` and `npm run build` before shipping.

## Current scope

- Responsive landing hero and two-URL form with **client-side UX validation only**
- CSS-illustrated comparison artwork and clearly labelled **illustrative sample** (not real scan evidence)
- Battle experience, benefits, price presentation, FAQs and final CTA
- Mobile navigation, accessible interactions, reduced-motion styles

Submitting valid URLs shows a clear **frontend demo only** message; it does **not** perform a website scan. The $29 report is not purchasable in this phase. Legal pages, the battle room, results and all backend work belong to future phases.

## Implementation

Next.js App Router + React + TypeScript + custom CSS design system. Client-side sections are in `components/LandingPage.tsx`; global design and responsive motion rules are in `app/globals.css`.

## Design notes

Visual reference: the supplied VSYDE landing page screenshot. The sample battle uses stylized placeholder websites, sample scores and prominent demo labels to avoid misrepresenting actual analysis. The VSYDE icon is a vector approximation; replace it with the exact supplied approved logo asset when available.
