"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  Globe2,
  LockKeyhole,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

const factors = [
  { number: "01", name: "Offer clarity", weight: "25%", detail: "Can a new visitor understand what you do and who it’s for?" },
  { number: "02", name: "Trust signals", weight: "20%", detail: "Are the claims, proof and business details easy to find?" },
  { number: "03", name: "Pricing clarity", weight: "20%", detail: "Can buyers understand the price or the next pricing step?" },
  { number: "04", name: "CTA path", weight: "20%", detail: "Is the next action obvious and connected to buyer intent?" },
  { number: "05", name: "Buying friction", weight: "15%", detail: "What creates uncertainty or unnecessary steps?" },
];

const steps = [
  { title: "Enter two URLs", detail: "Your public website and one competitor." },
  { title: "Review the preview", detail: "A preliminary verdict with visible evidence." },
  { title: "Unlock the full battle", detail: "Deeper buyer-path analysis for $29 once." },
  { title: "Make the improvements", detail: "Prioritized fixes and copy-ready coding prompts." },
];

const faqs = [
  {
    question: "Is VSYDE free to try?",
    answer: "The planned service includes a free, evidence-backed comparison preview. A deeper report costs $29 once per battle. This first UI release is a frontend demo; live scans are not enabled yet.",
  },
  {
    question: "Do I need an account?",
    answer: "No mandatory account is planned. Once the backend is available, paid reports will be accessible through a private, unguessable link.",
  },
  {
    question: "What exactly does VSYDE measure?",
    answer: "Visible website experience across five factors: offer clarity, trust signals, pricing clarity, CTA path and buying friction. The results are directional automated assessments, not measured sales or conversion rates.",
  },
  {
    question: "What happens if a website can't be inspected?",
    answer: "A blocked or incomplete scan should be marked Limited or Inconclusive. An inaccessible website never automatically loses the comparison.",
  },
  {
    question: "Is the $29 report a subscription?",
    answer: "No. The planned $29 Full Battle Report is a single, one-time payment for one completed battle. Checkout is not implemented in this frontend phase.",
  },
];

function BrandMark({ small = false }: { small?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <span className={`brand ${small ? "brand--small" : ""}`}>
      <svg className="brand__icon" viewBox="0 0 70 62" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#13D1EB" />
            <stop offset=".65" stopColor="#457CFA" />
            <stop offset="1" stopColor="#6478FE" />
          </linearGradient>
          <linearGradient id={`${id}-right`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#8975FD" />
            <stop offset="1" stopColor="#C678FA" />
          </linearGradient>
        </defs>
        <path d="M2 6h25L42 34 31 58z" fill={`url(#${id}-left)`} />
        <path d="M36 47 50 6h18L41 58H30z" fill={`url(#${id}-right)`} />
        <path d="M26 6h21L34 32z" fill="#58D2E7" />
      </svg>
      <span>VSYDE</span>
    </span>
  );
}

function normalizePublicUrl(raw: string): URL | null {
  const input = raw.trim();
  if (!input || /\s/.test(input)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    const hostname = url.hostname.toLowerCase();
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username || url.password ||
      hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") ||
      !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(hostname) ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

function SiteSkeleton({ competitor = false }: { competitor?: boolean }) {
  return (
    <div className={`site-skeleton ${competitor ? "site-skeleton--competitor" : ""}`} aria-hidden="true">
      <div className="site-skeleton__nav">
        <span className="site-skeleton__logo" />
        <span className="site-skeleton__navline" />
        <span className="site-skeleton__navline site-skeleton__navline--short" />
        <span className="site-skeleton__navcta" />
      </div>
      <div className="site-skeleton__body">
        <div className="site-skeleton__copy">
          <span className="site-skeleton__label" />
          <span className="site-skeleton__headline" />
          <span className="site-skeleton__headline site-skeleton__headline--short" />
          <span className="site-skeleton__bodyline" />
          <span className="site-skeleton__bodyline site-skeleton__bodyline--short" />
          <span className="site-skeleton__button" />
        </div>
        <div className="site-skeleton__visual">
          <div className="site-skeleton__visual-ring" />
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, first, second }: { label: string; first: number; second: number }) {
  return (
    <div className="metric-row">
      <span className="metric-row__label">{label}</span>
      <div className="metric-row__scores">
        <div className="metric-row__score metric-row__score--first"><span>{first}/10</span><i style={{ width: `${first * 10}%` }} /></div>
        <div className="metric-row__score metric-row__score--second"><span>{second}/10</span><i style={{ width: `${second * 10}%` }} /></div>
      </div>
    </div>
  );
}

function PreviewWindow() {
  return (
    <div className="preview-window" role="group" aria-label="Illustrative website comparison interface">
      <div className="preview-window__toolbar">
        <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
        <span className="preview-window__path">VSYDE / Sample battle</span>
        <span className="preview-window__sample">Illustrative demo</span>
      </div>
      <div className="preview-window__body">
        <div className="preview-topline"><span className="micro-label">BATTLE OVERVIEW</span><span className="preview-topline__timestamp">Example values · Not a real scan</span></div>
        <div className="preview-sites">
          <article className="preview-site">
            <div className="preview-site__title"><span className="site-dot site-dot--a"/><div><span>YOUR WEBSITE</span><strong>site-a.example</strong></div></div>
            <SiteSkeleton />
          </article>
          <span className="preview-vs" aria-hidden="true">VS</span>
          <article className="preview-site">
            <div className="preview-site__title"><span className="site-dot site-dot--b"/><div><span>COMPETITOR</span><strong>site-b.example</strong></div></div>
            <SiteSkeleton competitor />
          </article>
        </div>
        <div className="preview-verdict">
          <div className="preview-verdict__label"><span className="dot-pulse"/> PRELIMINARY VERDICT · EXAMPLE</div>
          <div className="preview-verdict__main"><h3>Site A leads on clarity.</h3><p>A clearer first impression and more direct next step, based on this fictional example.</p></div>
        </div>
        <div className="metrics"><div className="metrics__head"><strong>Comparison signals</strong><span><i className="legend-a"/> Site A <i className="legend-b"/> Site B</span></div><MiniMetric label="Offer clarity" first={8} second={6}/><MiniMetric label="Trust signals" first={7} second={7}/><MiniMetric label="CTA path" first={9} second={6}/></div>
        <div className="evidence-note"><span className="micro-label">EVIDENCE · EXAMPLE</span><p>Site B’s hero does not clearly state its core buyer outcome. Actual reports will link observations to captured public pages.</p></div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [yourSite, setYourSite] = useState("");
  const [competitorSite, setCompetitorSite] = useState("");
  const [validationError, setValidationError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const yourInput = useRef<HTMLInputElement>(null);
  const competitorInput = useRef<HTMLInputElement>(null);
  const messageId = useId();

  function focusForm() {
    setMobileNavOpen(false);
    document.querySelector("#start-battle")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => yourInput.current?.focus({ preventScroll: true }), 220);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const first = normalizePublicUrl(yourSite);
    const second = normalizePublicUrl(competitorSite);
    if (!first) {
      setValidationError("Enter your public website domain (for example, yoursite.com).");
      yourInput.current?.focus();
      return;
    }
    if (!second) {
      setValidationError("Enter a valid competitor website domain (for example, competitor.com).");
      competitorInput.current?.focus();
      return;
    }
    if (first.hostname.replace(/^www\./, "") === second.hostname.replace(/^www\./, "")) {
      setValidationError("Choose two different domains to compare.");
      competitorInput.current?.focus();
      return;
    }
    setValidationError("");
    setNotice("Both URLs look valid. This is a UI preview—no live comparison has started yet.");
  }

  function updateInput(value: string, site: "yours" | "competitor") {
    if (site === "yours") setYourSite(value);
    else setCompetitorSite(value);
    setValidationError("");
    setNotice("");
  }

  return (
    <div className="app-shell">
      <header className="site-header" id="top">
        <div className="container site-header__inner">
          <a href="#top" className="brand-link" aria-label="VSYDE home"><BrandMark /></a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#sample">Product</a><a href="#signals">Methodology</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
          </nav>
          <button className="header-action" type="button" onClick={focusForm}>Start a battle <ArrowUpRight size={16}/></button>
          <button className="mobile-menu-button" type="button" aria-label={mobileNavOpen ? "Close menu" : "Open menu"} aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" onClick={() => setMobileNavOpen(v => !v)}>{mobileNavOpen ? <X size={22}/> : <Menu size={22}/>}</button>
        </div>
        {mobileNavOpen && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation"><a href="#sample" onClick={() => setMobileNavOpen(false)}>Product</a><a href="#signals" onClick={() => setMobileNavOpen(false)}>Methodology</a><a href="#pricing" onClick={() => setMobileNavOpen(false)}>Pricing</a><a href="#faq" onClick={() => setMobileNavOpen(false)}>FAQ</a><button type="button" onClick={focusForm}>Start a battle <ArrowUpRight size={16}/></button></nav>}
      </header>

      <main>
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero__copy">
            <div className="eyebrow hero__eyebrow"><span className="status-dot"/> WEBSITE EXPERIENCE INTELLIGENCE</div>
            <h1 id="hero-title">Your website.<br/>Their website.<br/><span>One verdict.</span></h1>
            <p>See which website gives buyers the clearer path to understand, trust and act. Then know exactly what to improve.</p>
          </div>
          <form className="battle-form" id="start-battle" onSubmit={handleSubmit} noValidate>
            <div className="battle-form__heading"><span>START A COMPARISON</span><span className="battle-form__scope"><LockKeyhole size={12}/> Public websites only</span></div>
            <div className="battle-form__inputs">
              <label className="website-field"><span className="website-field__label"><span className="site-dot site-dot--a"/> YOUR WEBSITE</span><span className="website-field__input"><Globe2 size={18}/><input ref={yourInput} inputMode="url" autoComplete="url" type="text" value={yourSite} onChange={e => updateInput(e.target.value, "yours")} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? messageId : undefined} placeholder="yourwebsite.com"/></span></label>
              <span className="vs-separator" aria-hidden="true">VS</span>
              <label className="website-field"><span className="website-field__label"><span className="site-dot site-dot--b"/> COMPETITOR WEBSITE</span><span className="website-field__input"><Globe2 size={18}/><input ref={competitorInput} inputMode="url" type="text" value={competitorSite} onChange={e => updateInput(e.target.value, "competitor")} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? messageId : undefined} placeholder="competitor.com"/></span></label>
            </div>
            {validationError && <p className="form-feedback form-feedback--error" role="alert" id={messageId}>{validationError}</p>}
            {notice && <p className="form-feedback form-feedback--notice" role="status">{notice}</p>}
            <button className="primary-button battle-form__button" type="submit">Start Free Battle <ArrowUpRight size={18}/></button>
            <p className="battle-form__foot">No signup <span/> Evidence-backed preview <span/> $29 one-time full report</p>
          </form>
          <div className="hero__endnote"><span className="hero__endline"/> BUILT FOR FOUNDERS WHO WANT ANSWERS, NOT ANOTHER DASHBOARD <span className="hero__endline"/></div>
        </section>

        <section className="product-section section-pad" id="sample" aria-labelledby="sample-title">
          <div className="container"><div className="section-intro"><div><span className="eyebrow section-kicker">01 / THE PRODUCT</span><h2 id="sample-title">Proof over opinions.</h2></div><p>Two public websites. One consistent rubric. A clear explanation of what helped or hurt the buyer experience.</p></div><PreviewWindow/><p className="section-caption">Product preview with fictional domains and illustrative scores. Actual scans require the backend, which is not active in this UI phase.</p></div>
        </section>

        <section className="signals-section section-pad" id="signals" aria-labelledby="signals-title"><div className="container"><div className="section-intro"><div><span className="eyebrow section-kicker">02 / THE METHOD</span><h2 id="signals-title">Five signals. One standard.</h2></div><p>Each site is checked against the same buyer-focused criteria—not guessed conversion rates or invented customer behavior.</p></div><div className="signal-list">{factors.map(factor => <div className="signal-item" key={factor.number}><span className="signal-item__number">{factor.number}</span><h3>{factor.name}</h3><p>{factor.detail}</p><span className="signal-item__weight">{factor.weight}</span></div>)}</div></div></section>

        <section className="workflow-section section-pad" id="how-it-works" aria-labelledby="workflow-title"><div className="container"><div className="section-intro"><div><span className="eyebrow section-kicker">03 / THE PROCESS</span><h2 id="workflow-title">From comparison to action.</h2></div><p>No account setup. No dashboards to learn. Just a straight path to a more effective website.</p></div><ol className="steps">{steps.map((step,index) => <li key={step.title}><span className="steps__number">0{index+1}</span><h3>{step.title}</h3><p>{step.detail}</p>{index !== steps.length - 1 && <ArrowRight className="steps__arrow" aria-hidden="true" size={17}/>}</li>)}</ol></div></section>

        <section className="pricing-section section-pad" id="pricing" aria-labelledby="pricing-title"><div className="container"><div className="section-intro"><div><span className="eyebrow section-kicker">04 / PRICING</span><h2 id="pricing-title">Know before you pay.</h2></div><p>See a useful preliminary comparison for free. Pay only if you want the deeper, actionable report.</p></div><div className="price-grid"><article className="price-card"><span className="price-card__tier">FREE PREVIEW</span><div className="price-card__price">$0</div><p>A useful starting point, backed by visible website evidence.</p><ul><li><Check size={16}/> Preliminary comparison verdict</li><li><Check size={16}/> Selected factor scores</li><li><Check size={16}/> One specific observed issue</li><li><Check size={16}/> Scan scope and limitations</li></ul><button type="button" className="secondary-button price-card__button" onClick={focusForm}>Start free <ArrowUpRight size={17}/></button></article><article className="price-card price-card--featured"><div className="price-card__tier-row"><span className="price-card__tier">FULL BATTLE REPORT</span><span className="price-card__once">ONE TIME</span></div><div className="price-card__price">$29<span> / battle</span></div><p>Real evidence and a prioritized plan you can put to work.</p><ul><li><Check size={16}/> All five comparison factors</li><li><Check size={16}/> Deeper supported buyer-path test</li><li><Check size={16}/> Five ranked improvements</li><li><Check size={16}/> Copy-ready implementation prompts</li></ul><button type="button" className="primary-button price-card__button" onClick={focusForm}>Start with free preview <ArrowUpRight size={17}/></button></article></div><div className="pricing-assurance"><ShieldCheck size={17}/><span>No subscription. No required login. Secure hosted checkout is planned for the backend phase.</span></div></div></section>

        <section className="faq-section section-pad" id="faq" aria-labelledby="faq-title"><div className="container faq-layout"><div className="faq-layout__intro"><span className="eyebrow section-kicker">05 / FAQ</span><h2 id="faq-title">Good questions.<br/>Clear answers.</h2><p>What VSYDE does, what it doesn’t, and what to expect.</p></div><div className="faq-list">{faqs.map((item,index) => <div className={`faq-item ${openFaq === index ? "faq-item--open" : ""}`} key={item.question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{item.question}</span><ChevronDown size={18}/></button>{openFaq === index && <p>{item.answer}</p>}</div>)}</div></div></section>

        <section className="final-section"><div className="container final-section__inner"><span className="eyebrow section-kicker">READY WHEN YOU ARE</span><h2>See your website<br/><span>with fresh eyes.</span></h2><p>A clearer view of your competition starts with two URLs.</p><button type="button" className="primary-button final-section__button" onClick={focusForm}>Start Free Battle <ArrowUpRight size={18}/></button></div></section>
      </main>

      <footer className="footer"><div className="container footer__main"><a href="#top" aria-label="Return to VSYDE home"><BrandMark small/></a><nav aria-label="Footer navigation"><a href="#sample">Product</a><a href="#signals">Methodology</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav><span>© {new Date().getFullYear()} VSYDE</span></div><div className="container footer__note"><CircleCheck size={14}/><span>Frontend preview only — live scanning, checkout and legal pages are not yet available.</span></div></footer>
    </div>
  );
}
