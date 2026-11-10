"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Eye,
  CircleCheck,
  Layers,
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
  { q: "Is vsyde free to try?", a: "Yes. vsyde is designed to offer an evidence-backed preliminary comparison for free. A deeper battle report is planned at $29 one time. This frontend preview does not run live scans yet." },
  { q: "Do I need an account?", a: "No account is planned for the V1 experience. When report delivery is available, a private access link will let you reopen a paid report." },
  { q: "What exactly does vsyde measure?", a: "vsyde evaluates visible buyer experience: offer clarity, trust signals, pricing clarity, the main call-to-action path, and buying friction. It does not measure real sales or human conversion rates." },
  { q: "What if a website cannot be inspected?", a: "An inaccessible or blocked page should produce a limited or inconclusive result, not an automatic loss. The future scanner will explain what could not be checked." },
  { q: "Is the $29 report a subscription?", a: "No. The planned Full Battle Report is a single $29 payment per completed comparison. Payment checkout is not connected in the current frontend preview." },
];

function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "brand--small" : ""}`}>
      <img src="/favicon.svg" width="35" height="35" alt="" aria-hidden="true" />
      <span>vsyde</span>
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

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".scroll-reveal"));
    if (!targets.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -65px 0px', threshold: 0.07 });
    targets.forEach((target) => {
      if (target.getBoundingClientRect().top < window.innerHeight * .96) {
        target.classList.add('is-visible');
      } else {
        target.classList.add('will-reveal');
        observer.observe(target);
      }
    });
    return () => observer.disconnect();
  }, []);

  function focusForm(fromPaid = false) {
    setMenuOpen(false);
    if (fromPaid) setNotice("Start with a free preview. The $29 full report would be offered after a successful comparison; checkout is not live yet.");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("compare")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
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
          <a href="#top" className="logo-link" aria-label="vsyde — back to top"><Brand /></a>
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
            <p>Compare two public websites from a buyer’s perspective. See which experience is clearer—and what to improve next.</p>
          </div>
          <form id="compare" className="comparison-form" onSubmit={onSubmit} noValidate>
            <label className="input-caption" htmlFor="your-site"><span className="input-caption-dot"/>Your website</label>
            <div className="form-field"><Link2 size={19} aria-hidden="true"/><input id="your-site" ref={firstInput} type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="url" placeholder="yourwebsite.com" value={yourSite} aria-invalid={!!error && !normalizePublicURL(yourSite)} aria-describedby={error ? errorId : undefined} onChange={e => { setYourSite(e.target.value); clearFeedback(); }}/></div>
            <div className="vs-divider" aria-hidden="true"><span/> <b>VS</b> <span/></div>
            <label className="input-caption" htmlFor="competitor-site"><span className="input-caption-dot input-caption-dot--alt"/>Competitor website</label>
            <div className="form-field"><Link2 size={19} aria-hidden="true"/><input id="competitor-site" ref={secondInput} type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" placeholder="competitor.com" value={competitor} aria-describedby={error ? errorId : undefined} onChange={e => { setCompetitor(e.target.value); clearFeedback(); }}/></div>
            <button type="submit" className="primary-button form-button">Start Free Battle <ArrowRight size={19} aria-hidden="true"/></button>
            <p className="form-footnote">Free preview <span>·</span> No signup <span>·</span> $29 full report</p>
            {error && <p className="form-feedback form-feedback--error" id={errorId} role="alert">{error}</p>}
            {notice && <p className="form-feedback form-feedback--notice" id={noticeId} role="status">{notice}</p>}
          </form>
          <a className="hero-peek" href="#product">See what a report looks like <ArrowRight size={16} aria-hidden="true"/></a>
        </section>

        <section className="product-section content-width scroll-reveal" id="product" aria-labelledby="product-heading">
          <div className="section-heading section-heading--center">
            <h2 id="product-heading">See the difference. Know the next move.</h2>
            <p>A clear comparison is just the beginning. Get the reasons behind the result and a practical path to improve.</p>
          </div>
          <ReportPreview />
        </section>

        <section className="insight-section content-width scroll-reveal" aria-labelledby="insight-heading">
          <div className="insight-intro">
            <span className="section-kicker">Beyond the score</span>
            <h2 id="insight-heading">The important part isn’t who wins.<br/><span>It’s what you can fix.</span></h2>
            <p>vsyde is designed to turn an evidence-backed website comparison into a clear set of changes—so you know where to focus, and why.</p>
          </div>
          <div className="value-grid">
            <article className="value-card">
              <span className="value-symbol"><Eye size={21} /></span>
              <h3>Visible evidence</h3>
              <p>Findings grounded in inspected public pages, with the source and limitations made clear.</p>
              <div className="value-visual value-visual--evidence" aria-hidden="true">
                <span className="visual-browser-dots"><i/><i/><i/></span><span className="visual-ghost-line"/><span className="visual-highlight"/><span className="visual-ghost-line short"/>
              </div>
            </article>
            <article className="value-card">
              <span className="value-symbol"><Layers size={21} /></span>
              <h3>Side-by-side clarity</h3>
              <p>Both websites, one rubric. Understand the strengths and gaps without comparing different things.</p>
              <div className="value-visual value-visual--bars" aria-hidden="true"><div><span/><i/></div><div><span/><i/></div><div><span/><i/></div></div>
            </article>
            <article className="value-card">
              <span className="value-symbol"><Code2 size={21}/></span>
              <h3>Fixes you can ship</h3>
              <p>Prioritized changes with implementation prompts you can adapt in your preferred coding assistant.</p>
              <div className="value-visual value-visual--prompt" aria-hidden="true"><span><CircleCheck size={15}/> Priority 01</span><div>Clarify the headline</div><small>Explain the primary buyer outcome.</small></div>
            </article>
          </div>
        </section>

        <section className="signals-section content-width section-two-column scroll-reveal" aria-labelledby="signals-heading">
          <div className="section-aside"><h2 id="signals-heading">Five signals.<br/>One fair standard.</h2><p>The same buyer-focused rubric, applied to both websites. No guesses about actual sales.</p></div>
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

        <section className="change-section content-width scroll-reveal" aria-labelledby="change-heading">
          <div className="change-copy"><span className="section-kicker">From observation to action</span><h2 id="change-heading">An insight is only useful when you know what to do with it.</h2><p>Every recommendation in the planned full report connects an observed problem to an improvement you can implement. No invented conversion uplift.</p><Link href="/methodology" className="inline-link">Explore the scoring approach <ArrowRight size={17}/></Link></div>
          <div className="change-example"><span className="example-label">Illustrative improvement — not a scan result</span><div className="change-before"><small>BEFORE · Unclear offer</small><strong>Build a better tomorrow.</strong><span>Beautiful, but what does the product actually do?</span></div><div className="change-after"><small>AFTER · Specific outcome</small><strong>Plan projects, assign tasks and ship together.</strong><span>A concrete offer buyers can understand more quickly.</span></div><div className="change-bottom"><Check size={16}/> Practical copy guidance, not a promise of more sales</div></div>
        </section>

        <section className="how-section content-width scroll-reveal" id="how-it-works" aria-labelledby="how-heading">
          <div className="section-heading section-heading--center"><h2 id="how-heading">How it works</h2><p>From two URLs to confident next steps, without learning a complicated dashboard.</p></div>
          <div className="steps-grid">
            <div className="step-card"><span className="step-icon"><Link2 size={24}/></span><div><span className="step-number">01</span><h3>Enter 2 URLs</h3><p>Your website and one competitor.</p></div></div>
            <span className="steps-arrow" aria-hidden="true"><ArrowRight size={23}/></span>
            <div className="step-card"><span className="step-icon"><Sparkles size={24}/></span><div><span className="step-number">02</span><h3>Get a free preview</h3><p>See scores, a preliminary verdict and verified evidence.</p></div></div>
            <span className="steps-arrow" aria-hidden="true"><ArrowRight size={23}/></span>
            <div className="step-card"><span className="step-icon"><BarChart3 size={24}/></span><div><span className="step-number">03</span><h3>Unlock the full report</h3><p>Find buyer-path issues and five prioritized fixes for $29.</p></div></div>
          </div>
        </section>

        <section className="pricing-section content-width section-two-column scroll-reveal" id="pricing" aria-labelledby="pricing-heading">
          <div className="section-aside"><h2 id="pricing-heading">Simple by design.</h2><p>Get useful evidence before spending a dollar. Unlock the complete report for $29 once.</p></div>
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

        <section className="faq-section content-width section-two-column scroll-reveal" id="faq" aria-labelledby="faq-heading">
          <div className="section-aside"><h2 id="faq-heading">FAQ</h2><p>Everything you should know before starting.</p></div>
          <div className="faq-items">
            {faq.map(({ q, a }, i) => <div className={`faq-item ${expandedFAQ === i ? "faq-item--expanded" : ""}`} key={q}>
              <button type="button" aria-expanded={expandedFAQ === i} aria-controls={`faq-answer-${i}`} onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}><span>{q}</span><ChevronDown size={19}/></button>
              <div id={`faq-answer-${i}`} className="faq-answer" hidden={expandedFAQ !== i}><p>{a}</p></div>
            </div>)}
          </div>
        </section>

        <section className="closing-section content-width scroll-reveal" aria-labelledby="closing-heading">
          <div className="closing-glow" aria-hidden="true"/>
          <span>Start with the evidence.</span>
          <h2 id="closing-heading">Your next improvement<br/>starts with a comparison.</h2>
          <p>Two websites. One fair evaluation. A clearer way forward.</p>
          <button type="button" className="closing-button" onClick={() => focusForm()}>Start Free Battle <ArrowUpRight size={20}/></button>
          <small>No signup · Free preview · $29 once for a full report</small>
        </section>
      </main>

      <footer className="site-footer"><div className="footer-inner content-width"><a href="#top" aria-label="vsyde home"><Brand small /></a><nav aria-label="Footer"><Link href="/methodology">Methodology</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link><Link href="/contact">Contact</Link></nav></div><div className="footer-caption content-width">© {new Date().getFullYear()} vsyde · Frontend preview. Live scanning and checkout are not active.</div></footer>
    </div>
  );
}
