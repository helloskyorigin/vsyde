# vsyde

Responsive website-comparison app with live homepage screenshots, linked public-page text inspection, category-filtered competitor discovery, and an evidence-based free report. **Full AI visual analysis, checkout and paid report delivery are not yet connected.** The landing sample report is explicitly an interface preview; live report findings use only observed page text.

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
- Centered dual-URL form with an optional desktop-side competitor finder, independent field validation, accessible errors and honest preview message
- Interactive fictional sample report: Overview / Evidence / Fix plan, with keyboard arrow tabs
- A consistent five-factor scoring rubric, evidence policy, clear three-step process and honest free/$19 pricing
- Readable mobile layouts, content-first scroll reveals, native system font stack, reduced-motion behavior
- FAQ, footer, legal/information routes and public frontend-feedback issue template
- SEO metadata, automatically generated OpenGraph card, configurable robots/sitemap with `NEXT_PUBLIC_SITE_URL`

## Production configuration

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin (e.g. your real custom domain, **not a placeholder**) to publish absolute canonical links and a sitemap. The homepage URL is unknown until deployment, so no origin is invented.

## Release blockers

- **No comprehensive AI scanning or payment**: the current live public text scan is not an interactive buyer journey audit. Server-side DNS checks and fixed external readers are in place, but further abuse protection and provider reliability testing are required before high-volume launch.
- **Legal pages are pre-launch drafts**: verify the operator's identity, merchant country, retention/deletion practices, payment provider, exact refund conditions, and privacy/support contacts before real transactions.
- **Contact is not private support**: public GitHub issues are for nonsensitive frontend feedback only.
- Run the actual GitHub Actions build, a deployed mobile/desktop browser test, cross-browser accessibility checks, and confirm Web Vitals before launch.

## Battle Room (screenshot preview)

The landing form now navigates to `/battle?own=...&competitor=...`. Battle Room validates both public URLs and requests live public-page screenshots through `/api/battle/preview`, proxied from Thum.io. Failed captures show retry and an open-site link; no mock scoring or simulated processing percentages. The stage list reflects live screenshot requests and public-page text inspection; it does not simulate AI evaluation. URLs are sent to the screenshot provider, as described in Privacy. Throttle and abuse controls should be implemented before high traffic. The screenshot provider is an external dependency and public websites may block captures.

## Free Results and public signal checks

A lightweight real-content inspection uses Jina Reader to read each homepage and up to three actual same-origin navigation links (pricing, product/features, trust/about) per site, with a four-signal rule-based summary, precise source URLs, and page-coverage status. These are observed text signals—not LLM-generated analysis, conversion predictions or a verified website-quality score. If evidence is incomplete, results remain partial/inconclusive. Battle Room adds fullscreen screenshot zoom, mobile A/B selection, original URL restoration when editing, and a linked free results screen. The free report is held in browser sessionStorage and refreshed if missing. Paid checkout is not live.

API routes limit supplied URL length, reject private and nonpublic DNS answers, and use fixed third-party providers. A per-instance request limiter reduces casual misuse, but **production-scale distributed throttling/WAF rules remain necessary**. Third-party rate limits and blocked sites can cause incomplete results.

## Battle Report V1

The result at `/results` is free and includes exactly four sections: a cautious evidence-based visibility verdict, a five-factor signal matrix (no fabricated numeric scores), up to three source-linked findings, and up to three actionable website improvements. Missing signals are *not found in captured text*, not proof that content is absent. Buying friction is explicitly not tested by the automated text inspection. The app offers re-scan, return-to-screenshots and edit actions, with mobile and dark-theme layout. There is no results paywall. The real scan is limited to Jina Reader public linked-page text with rule-based extraction; it is not a comprehensive conversion audit or generative AI analysis.
