# vsyde

Premium, responsive website-comparison landing-page frontend. **The AI scanner, checkout and paid report delivery are not yet connected.** All displayed report values and findings are explicitly fictional examples.

## Stack

- Next.js App Router 15.5.29 (patched maintenance LTS), React 19.1.10, TypeScript
- CSS-only responsive design with platform-native font stack (no third-party font requests)
- Lucide icon components
- No analytics, cookies, image hosts, or remote UI assets added in this phase

## Run

```bash
npm install
npm run test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm run dev
```

GitHub Actions runs unit tests, type checking, production build and browser viewport/interaction checks on pushes and PRs. The repository does not yet include a committed `package-lock.json` because the implementation environment cannot reach the npm registry. After network access is available, run `npm install` and **commit the resulting lockfile**, then change the CI installation command to `npm ci`.

## Delivered UI

- Sticky floating navigation and responsive mobile menu
- Centered dual-URL form, independent field validation, accessible errors and honest preview message
- Interactive fictional sample report: Overview / Evidence / Fix plan, with keyboard arrow tabs
- A consistent five-factor scoring rubric, evidence policy, clear three-step process and honest free/$19 pricing
- Readable mobile layouts, content-first scroll reveals, native system font stack, reduced-motion behavior
- FAQ, footer, legal/information routes and public frontend-feedback issue template
- SEO metadata, automatically generated OpenGraph card, configurable robots/sitemap with `NEXT_PUBLIC_SITE_URL`

## Production configuration

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin (e.g. your real custom domain, **not a placeholder**) to publish absolute canonical links and a sitemap. The homepage URL is unknown until deployment, so no origin is invented.

## Release blockers

- **No live scanning or payment**: frontend-only demo until backend is explicitly built and verified. The URL format check does not replace server-side SSRF, DNS and redirect protections.
- **Legal pages are pre-launch drafts**: verify the operator's identity, merchant country, retention/deletion practices, payment provider, exact refund conditions, and privacy/support contacts before real transactions.
- **Contact is not private support**: public GitHub issues are for nonsensitive frontend feedback only.
- Run the actual GitHub Actions build, a deployed mobile/desktop browser test, cross-browser accessibility checks, and confirm Web Vitals before launch.

## Battle Room (screenshot preview)

The landing form now navigates to `/battle?own=...&competitor=...`. Battle Room validates both public URLs and requests live public-page screenshots through `/api/battle/preview`, proxied from Thum.io. Failed captures show retry and an open-site link; no mock scoring or simulated processing percentages. The 5-stage list is deliberately limited to screenshot capture until actual server-driven comparison jobs exist. URLs are sent to the screenshot provider, as described in Privacy. Throttle and abuse controls should be implemented before high traffic. The screenshot provider is an external dependency and public websites may block captures.

## Free Results and public signal checks

A lightweight real-content inspection uses Jina Reader for publicly visible homepage text, with a four-signal rule-based summary and source snippets. These are observed text signals—not LLM-generated analysis, conversion predictions or a verified website-quality score. If evidence is incomplete, results remain partial/inconclusive. Battle Room adds fullscreen screenshot zoom, mobile A/B selection, original URL restoration when editing, and a linked free results screen. The free report is held in browser sessionStorage and refreshed if missing. The $19 full-report CTA opens a business email because paid checkout is not live.

API routes limit supplied URL length, reject private and nonpublic DNS answers, and use fixed third-party providers. A per-instance request limiter reduces casual misuse, but **production-scale distributed throttling/WAF rules remain necessary**. Third-party rate limits and blocked sites can cause incomplete results.
