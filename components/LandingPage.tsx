"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Link2,
  Menu,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

type Signal = { title: string; description: string; weight: string; icon: typeof Target };

const signals: Signal[] = [
  { title: "Offer clarity", description: "Can new visitors understand what you do and who it’s for?", weight: "25%", icon: Target },
  { title: "Trust signals", description: "Are claims, proof, and business details easy to find?", weight: "20%", icon: ShieldCheck },
  { title: "Pricing clarity", description: "Can buyers find the price or the next pricing step?", weight: "20%", icon: Tag },
  { title: "CTA path", description: "Is the next action obvious and relevant to buyer intent?", weight: "20%", icon: MousePointer2 },
  { title: "Buying friction", description: "What creates uncertainty or unnecessary steps?", weight: "15%", icon: Zap },
];

const faq = [
  { q: "Is VSYDE free to try?", a: "Yes. VSYDE is designed to offer an evidence-backed preliminary comparison for free. A deeper battle report is planned at $29 one time. This frontend preview does not run live scans yet." },
  { q: "Do I need an account?", a: "No account is planned for the V1 experience. When report delivery is available, a private access link will let you reopen a paid report." },
  { q: "What exactly does VSYDE measure?", a: "VSYDE evaluates visible buyer experience: offer clarity, trust signals, pricing clarity, the main call-to-action path, and buying friction. It does not measure real sales or human conversion rates." },
  { q: "What if a website cannot be inspected?", a: "An inaccessible or blocked page should produce a limited or inconclusive result, not an automatic loss. The future scanner will explain what could not be checked." },
  { q: "Is the $29 report a subscription?", a: "No. The planned Full Battle Report is a single $29 payment per completed comparison. Payment checkout is not connected in the current frontend preview." },
];

function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "brand--small" : ""}`}>
      <img src="/favicon.svg" width="35" height="35" alt="" aria-hidden="true" />
      <span>VSYDE</span>
    </span>
  );
}

function normalizePublicURL(raw: string): URL | null {
  const input = raw.trim();
  if (!input || /\s/.test(input)) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(host)) return null;
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
    return parsed;
  } catch {
    return null;
  }
}

function Illustration() {
  return (
    <div className="evidence-illustration" aria-hidden="true">
      <div className="mini-browser-top"><span/><span/><span/><i/></div>
      <div className="mini-browser-lines"><span/><span/><span/><span/></div>
      <div className="mini-browser-button" />
    </div>
  );
}

function ScoreCard({ domain, score, color }: { domain: string; score: string; color: "blue" | "purple" }) {
  return (
    <div className={`score-card score-card--${color}`}>
      <div className="score-card__domain"><span className="score-dot"/>{domain}</div>
      <div className="score-value">{score}<span>/10</span></div>
      <div className="score-bar"><div style={{ width: `${Number(score) * 10}%` }}/></div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="report-preview" aria-label="Illustrative comparison report preview">
      <div className="report-topline">
        <Brand small />
        <span className="report-name">Comparison report</span>
        <span className="report-demo">Example layout · Not a real scan</span>
      </div>
      <div className="report-highlights">
        <div className="report-scores">
          <ScoreCard domain="yourwebsite.com" score="8.3" color="blue" />
          <ScoreCard domain="competitor.com" score="6.7" color="purple" />
        </div>
        <div className="verdict-panel">
          <span className="verdict-icon"><Trophy size={25} strokeWidth={2}/></span>
          <div><strong>Example: Your website leads</strong><p>A clearer offer and stronger CTA path give it an advantage.</p></div>
        </div>
      </div>
      <div className="report-details">
        <div className="evidence-block">
          <Illustration />
          <div><span className="micro-label">Evidence example</span><p>The competitor’s hero does not clearly explain the main buyer outcome.</p></div>
        </div>
        <div className="fixes-block">
          <h3>Recommended improvements</h3>
          <ul>
            <li><Check size={16}/>Make the hero offer more specific</li>
            <li><Check size={16}/>Add visible, verifiable trust signals</li>
            <li><Check size={16}/>Clarify the pricing or next step</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [yourSite, setYourSite] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const secondInput = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const noticeId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function focusForm(fromPaid = false) {
    setMenuOpen(false);
    if (fromPaid) setNotice("Start with a free preview. The $29 full report would be offered after a successful comparison; checkout is not live yet.");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("compare")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
    window.setTimeout(() => firstInput.current?.focus({ preventScroll: true }), reduced ? 0 : 350);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const siteA = normalizePublicURL(yourSite);
    const siteB = normalizePublicURL(competitor);
    setNotice("");
    if (!siteA) { setError("Enter a valid public website address, like yourwebsite.com."); firstInput.current?.focus(); return; }
    if (!siteB) { setError("Enter a valid public competitor website address."); secondInput.current?.focus(); return; }
    if (siteA.hostname.replace(/^www\./, "") === siteB.hostname.replace(/^www\./, "")) {
      setError("Use two different websites for the comparison."); secondInput.current?.focus(); return;
    }
    setError("");
    setNotice("Both URLs look valid. This is the frontend preview; real scanning and payment will be connected in the next phase.");
  }

  function clearFeedback() { setError(""); setNotice(""); }

  return (
    <div className="page-shell" id="top">
      <div className="ambient ambient--left" aria-hidden="true"/>
      <div className="ambient ambient--right" aria-hidden="true"/>
      <header className="site-header">
        <div className="nav-wrap">
          <a href="#top" className="logo-link" aria-label="VSYDE — back to top"><Brand /></a>
          <nav className="desktop-nav" aria-label="Primary">
            <a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
          </nav>
          <button type="button" className="primary-button nav-cta" onClick={() => focusForm()}>Start Free Battle</button>
          <button type="button" className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
        </div>
        {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <a onClick={() => setMenuOpen(false)} href="#product">Product</a>
          <a onClick={() => setMenuOpen(false)} href="#how-it-works">How it works</a>
          <a onClick={() => setMenuOpen(false)} href="#pricing">Pricing</a>
          <a onClick={() => setMenuOpen(false)} href="#faq">FAQ</a>
          <button type="button" className="primary-button" onClick={() => focusForm()}>Start Free Battle <ArrowRight size={17}/></button>
        </nav>}
      </header>

      <main>
        <section className="hero content-width" aria-labelledby="hero-title">
          <div className="hero-heading">
            <h1 id="hero-title">Your website. Their website.<br/><span>Who wins?</span></h1>
            <p>Compare your website with a competitor and discover exactly what to improve.</p>
          </div>
          <form id="compare" className="comparison-form" onSubmit={onSubmit} noValidate>
            <label className="sr-only" htmlFor="your-site">Your website</label>
            <div className="form-field"><Link2 size={19} aria-hidden="true"/><input id="your-site" ref={firstInput} type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="url" placeholder="yourwebsite.com" value={yourSite} aria-invalid={!!error && !normalizePublicURL(yourSite)} aria-describedby={error ? errorId : undefined} onChange={e => { setYourSite(e.target.value); clearFeedback(); }}/></div>
            <div className="vs-divider" aria-hidden="true"><span/> <b>VS</b> <span/></div>
            <label className="sr-only" htmlFor="competitor-site">Competitor website</label>
            <div className="form-field"><Link2 size={19} aria-hidden="true"/><input id="competitor-site" ref={secondInput} type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" placeholder="competitor.com" value={competitor} aria-describedby={error ? errorId : undefined} onChange={e => { setCompetitor(e.target.value); clearFeedback(); }}/></div>
            <button type="submit" className="primary-button form-button">Start Free Battle <ArrowRight size={19} aria-hidden="true"/></button>
            <p className="form-footnote">Free preview <span>·</span> No signup <span>·</span> $29 full report</p>
            {error && <p className="form-feedback form-feedback--error" id={errorId} role="alert">{error}</p>}
            {notice && <p className="form-feedback form-feedback--notice" id={noticeId} role="status">{notice}</p>}
          </form>
        </section>

        <section className="product-section content-width" id="product" aria-labelledby="product-heading">
          <div className="section-heading section-heading--center">
            <h2 id="product-heading">What you’ll get</h2>
            <p>A clear side-by-side comparison, evidence you can verify, and specific changes you can make.</p>
          </div>
          <ReportPreview />
        </section>

        <section className="signals-section content-width section-two-column" aria-labelledby="signals-heading">
          <div className="section-aside"><h2 id="signals-heading">What VSYDE<br/>checks</h2><p>Five buyer-focused signals. The same scoring rubric for both websites.</p></div>
          <div className="signal-list">
            {signals.map(({ title, description, weight, icon: Icon }) => (
              <div className="signal-row" key={title}>
                <span className="signal-icon"><Icon size={19} strokeWidth={2}/></span>
                <strong>{title}</strong>
                <span className="signal-desc">{description}</span>
                <span className="signal-weight">{weight}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="how-section content-width" id="how-it-works" aria-labelledby="how-heading">
          <div className="section-heading section-heading--center"><h2 id="how-heading">How it works</h2><p>Three simple steps from your URLs to practical insight.</p></div>
          <div className="steps-grid">
            <div className="step-card"><span className="step-icon"><Link2 size={24}/></span><div><span className="step-number">01</span><h3>Enter 2 URLs</h3><p>Your website and one competitor.</p></div></div>
            <span className="steps-arrow" aria-hidden="true"><ArrowRight size={23}/></span>
            <div className="step-card"><span className="step-icon"><Sparkles size={24}/></span><div><span className="step-number">02</span><h3>Get a free preview</h3><p>See scores, a preliminary verdict and verified evidence.</p></div></div>
            <span className="steps-arrow" aria-hidden="true"><ArrowRight size={23}/></span>
            <div className="step-card"><span className="step-icon"><BarChart3 size={24}/></span><div><span className="step-number">03</span><h3>Unlock the full report</h3><p>Find buyer-path issues and five prioritized fixes for $29.</p></div></div>
          </div>
        </section>

        <section className="pricing-section content-width section-two-column" id="pricing" aria-labelledby="pricing-heading">
          <div className="section-aside"><h2 id="pricing-heading">Simple pricing</h2><p>See a useful preview for free. Pay once, only if you want the deeper report.</p></div>
          <div className="price-grid">
            <article className="price-card">
              <h3>Free preview</h3><p className="price-value">$0</p><p className="price-description">See where you stand.</p>
              <ul><li><Check size={17}/> Preliminary verdict</li><li><Check size={17}/> Selected comparison scores</li><li><Check size={17}/> One evidence-backed issue</li><li><Check size={17}/> Scope and limitations</li></ul>
              <button type="button" className="secondary-button price-action" onClick={() => focusForm()}>Start Free Battle <ArrowUpRight size={18}/></button>
            </article>
            <article className="price-card price-card--featured">
              <h3>Full battle report</h3><p className="price-value">$29 <span>/ battle</span></p><p className="price-description">The evidence and fixes behind the verdict.</p>
              <ul><li><Check size={17}/> Full five-factor comparison</li><li><Check size={17}/> Deeper buyer-path evidence</li><li><Check size={17}/> Five prioritized improvements</li><li><Check size={17}/> Copy-ready implementation prompts</li></ul>
              <button type="button" className="primary-button price-action" onClick={() => focusForm(true)}>Start with free preview <ArrowUpRight size={18}/></button>
            </article>
          </div>
        </section>

        <section className="faq-section content-width section-two-column" id="faq" aria-labelledby="faq-heading">
          <div className="section-aside"><h2 id="faq-heading">FAQ</h2><p>Quick answers about how VSYDE works and what to expect.</p></div>
          <div className="faq-items">
            {faq.map(({ q, a }, i) => <div className={`faq-item ${expandedFAQ === i ? "faq-item--expanded" : ""}`} key={q}>
              <button type="button" aria-expanded={expandedFAQ === i} aria-controls={`faq-answer-${i}`} onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}><span>{q}</span><ChevronDown size={19}/></button>
              <div id={`faq-answer-${i}`} className="faq-answer" hidden={expandedFAQ !== i}><p>{a}</p></div>
            </div>)}
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="footer-inner content-width"><a href="#top" aria-label="VSYDE home"><Brand small /></a><nav aria-label="Footer"><Link href="/methodology">Methodology</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link><Link href="/contact">Contact</Link></nav></div><div className="footer-caption content-width">© {new Date().getFullYear()} VSYDE · Frontend preview. Live analysis and payments are not yet available.</div></footer>
    </div>
  );
}
