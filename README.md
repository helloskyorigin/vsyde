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
