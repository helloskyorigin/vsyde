"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight, ArrowUpRight, BarChart3, Check, CheckCircle2, ChevronDown,
  CircleHelp, Crown, FileCheck2, FileText, Gift, Globe2, Lightbulb,
  LockKeyhole, Menu, MoveUpRight, ShieldCheck, Sparkles, X, Zap,
  Share2, Target, Layers3, ChartNoAxesCombined,
} from "lucide-react";

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`} aria-label="VSYDE">
      <svg className="brand-symbol" viewBox="0 0 80 70" role="img" aria-label="VSYDE split V symbol">
        <defs>
          <linearGradient id="v-blue" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#03d7ef"/><stop offset=".55" stopColor="#2769fa"/><stop offset="1" stopColor="#7156f4"/></linearGradient>
          <linearGradient id="v-violet" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7757ff"/><stop offset="1" stopColor="#f529cc"/></linearGradient>
        </defs>
        <path d="M2 8h26L45 41 33 65z" fill="url(#v-blue)"/>
        <path d="M36 55 53 8h25L45 65H33z" fill="url(#v-violet)"/>
        <path d="M29 8h22L35 42z" fill="#17d5ef" opacity=".94"/>
        <path d="M30 8h6L47 29 42 40z" fill="#fff" opacity=".2"/>
      </svg>
      <span className="brand-wordmark">VSYDE</span>
    </span>
  );
}

function Pill({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return <span className={`eyebrow-pill ${accent ? "eyebrow-pill--accent" : ""}`}>{children}</span>;
}

function BrowserBar({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className={`browser-bar ${isDark ? "browser-bar--dark" : ""}`}>
      <span/><span/><span/>
      <i/><i/>
    </div>
  );
}

function HeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__wash"/>
      <div className="orbit orbit--back"/>
      <div className="hero-browser hero-browser--left">
        <BrowserBar/>
        <div className="hero-browser__body">
          <div className="hero-picture hero-picture--light"><div className="mountain-silhouette"/><div className="sun-dot"/></div>
          <div className="hero-lines"><i/><i/><i/><i/><span/></div>
        </div>
        <div className="hero-browser__footer"><span/><span/><span/></div>
      </div>
      <div className="hero-browser hero-browser--right">
        <BrowserBar isDark/>
        <div className="hero-browser__body">
          <div className="hero-lines hero-lines--dark"><i/><i/><i/><i/><span/></div>
          <div className="hero-picture hero-picture--dark"><div className="mountain-silhouette"/><div className="sun-dot"/></div>
        </div>
        <div className="hero-browser__footer"><span/><span/><span/></div>
      </div>
      <div className="orbit orbit--front"/>
      <div className="hero-vs">VS</div>
      <span className="hero-art__spark hero-art__spark--one"/>
      <span className="hero-art__spark hero-art__spark--two"/>
    </div>
  );
}

function DemoWebsite({ variant }: { variant: "a" | "b" }) {
  const isB = variant === "b";
  return (
    <div className={`demo-site demo-site--${variant}`} aria-label={`Illustrative website ${variant.toUpperCase()} screenshot mockup`}>
      <BrowserBar isDark={isB}/>
      <div className="demo-site__body">
        <div className="demo-site__nav">
          <span className="demo-site__fake-logo"><i/>{isB ? "SITE B" : "SITE A"}</span>
          <div className="demo-site__nav-links"><span>Product</span><span>Pricing</span><span>Resources</span></div>
          <span className="demo-site__button">{isB ? "Try Free" : "Get Started"}</span>
        </div>
        <div className="demo-site__content">
          <div className="demo-site__words">
            <strong>{isB ? <>Smarter solutions<br/>for modern teams.</> : <>Build a better<br/>tomorrow.</>}</strong>
            <span>{isB ? "One place to move work forward." : "Everything you need to grow."}</span>
            <b>{isB ? "Try Free" : "Get Started"}</b>
          </div>
          <div className={`demo-site__building demo-site__building--${variant}`}>
            <span/><span/><span/><span/><span/><span/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreTile({ score, variant }: { score: number; variant: "a" | "b" }) {
  return (
    <div className={`score-tile score-tile--${variant}`}>
      <strong>{score}<small>/100</small></strong>
      <span>Overall sample score</span>
      <div className="score-track"><i style={{ width: `${score}%` }}/></div>
    </div>
  );
}

const benefits = [
  { title: "AI-Powered Analysis", text: "Compare two sites using a consistent buyer-focused rubric.", Icon: Zap },
  { title: "Detailed Reports", text: "Understand the differences with evidence and clear scores.", Icon: BarChart3 },
  { title: "Actionable Fixes", text: "Know what to change first and why it matters.", Icon: Lightbulb },
  { title: "Share Results", text: "Keep a private result link and share it when you choose.", Icon: Share2 },
];

const faqs = [
  { q: "Is VSYDE free to try?", a: "The planned product includes a free, evidence-backed comparison preview. A deeper report will be available for a $29 one-time payment. The current page is a frontend demo; scans and checkout are not active yet." },
  { q: "Do I need an account?", a: "No mandatory signup is planned. Purchased reports will be accessible through a secure private link when report delivery is implemented." },
  { q: "How accurate are the results?", a: "VSYDE is designed to compare visible buyer experience across both public websites using one consistent rubric. Automated scores are directional, not proven conversion rates or guarantees of real sales." },
  { q: "Can I share the report?", a: "The planned full report will have a private, shareable link. Anyone who has the link may be able to view it, so treat it as confidential." },
  { q: "What if a website blocks scanning?", a: "The intended behavior is to show a limited or inconclusive comparison, explain what could not be checked, and provide a retry path rather than declare an unfair winner." },
  { q: "Is $29 a subscription?", a: "No. The planned Full Battle Report costs $29 for one completed battle, paid once. There are no recurring charges." },
];

function normalizeURL(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!(["http:", "https:"].includes(url.protocol)) || url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes(".") || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return null;
    if (/\s/.test(trimmed)) return null;
    return url.href;
  } catch { return null; }
}

export default function LandingPage() {
  const [yourURL, setYourURL] = useState("");
  const [competitorURL, setCompetitorURL] = useState("");
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (menuOpen) {
      const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
      window.addEventListener("keydown", onEscape);
      return () => window.removeEventListener("keydown", onEscape);
    }
  }, [menuOpen]);

  const startFromCTA = () => {
    setMenuOpen(false);
    document.getElementById("start-battle")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => firstInputRef.current?.focus({ preventScroll: true }), 300);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormNotice("");
    const own = normalizeURL(yourURL);
    const other = normalizeURL(competitorURL);
    if (!own) {
      setFormError("Enter a valid public website domain for your site (for example, yoursite.com).");
      firstInputRef.current?.focus();
      return;
    }
    if (!other) {
      setFormError("Enter a valid public website domain for the competitor (for example, competitor.com).");
      secondInputRef.current?.focus();
      return;
    }
    if (new URL(own).hostname.replace(/^www\./, "") === new URL(other).hostname.replace(/^www\./, "")) {
      setFormError("Choose two different website domains to compare.");
      secondInputRef.current?.focus();
      return;
    }
    setFormError("");
    setFormNotice("Frontend preview only — URL format looks valid, but no scan was started. The comparison engine will be connected in a later phase.");
  };

  return (
    <div className="site-shell">
      <div className="ambient ambient--top" aria-hidden="true"/>
      <header className="site-header" id="top">
        <div className="container header-inner">
          <a href="#top" className="brand-link" aria-label="VSYDE home"><BrandMark/></a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#sample-battle">Sample Battle</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="button gradient-button nav-cta" onClick={startFromCTA}>Start Battle <ArrowRight size={17}/></button>
          <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={25}/> : <Menu size={25}/>}</button>
        </div>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <a href="#sample-battle" onClick={() => setMenuOpen(false)}>Sample Battle</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button className="button gradient-button" onClick={startFromCTA}>Start Battle <ArrowRight size={17}/></button>
          </nav>
        )}
      </header>

      <main>
        <section className="hero-section container" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <Pill><Zap size={16} fill="currentColor"/> AI-POWERED WEBSITE COMPARISON</Pill>
            <h1 id="hero-heading">Your Website.<br/>Their Website.<br/><span className="gradient-text">Who Wins?</span></h1>
            <p className="hero-description">See how your website compares with a competitor—and discover exactly where you can improve.</p>
            <form id="start-battle" className="battle-form" onSubmit={submit} noValidate>
              <div className="input-pair">
                <label className="url-input"><Globe2 size={18}/><span className="sr-only">Your website</span><input ref={firstInputRef} value={yourURL} onChange={e=>{setYourURL(e.target.value);setFormError("");setFormNotice("");}} type="url" inputMode="url" autoComplete="url" placeholder="yourwebsite.com" aria-describedby={formError ? errorId : undefined}/></label>
                <span className="input-vs" aria-hidden="true">VS</span>
                <label className="url-input"><Globe2 size={18}/><span className="sr-only">Competitor website</span><input ref={secondInputRef} value={competitorURL} onChange={e=>{setCompetitorURL(e.target.value);setFormError("");setFormNotice("");}} type="url" inputMode="url" placeholder="competitor.com" aria-describedby={formError ? errorId : undefined}/></label>
              </div>
              <button className="button gradient-button hero-submit" type="submit">Start Free Battle <ArrowRight size={18}/></button>
              {formError && <p className="form-message form-message--error" id={errorId} role="alert">{formError}</p>}
              {formNotice && <p className="form-message form-message--notice" role="status">{formNotice}</p>}
            </form>
            <div className="hero-promises"><span><Zap size={14} fill="currentColor"/> No Signup</span><span><Gift size={14}/> Free Preview</span><span><Crown size={15}/> $29 Full Report</span></div>
          </div>
          <HeroArtwork/>
        </section>

        <section className="container" id="sample-battle" aria-labelledby="experience-heading">
          <div className="experience-panel">
            <div className="experience-copy">
              <div className="experience-title"><ChartNoAxesCombined size={26}/><h2 id="experience-heading">The Battle Experience</h2></div>
              <p>Get a detailed AI analysis with real screenshots and evidence-backed scores.</p>
              <ul className="check-list"><li><Check size={15}/> Side-by-side comparison</li><li><Check size={15}/> Clear winner & reasons</li><li><Check size={15}/> Actionable improvement tips</li></ul>
              <a className="outline-button" href="#how-it-works">See Demo <ArrowRight size={16}/></a>
            </div>
            <div className="experience-preview">
              <span className="demo-flag">ILLUSTRATIVE DEMO · NOT A REAL SCAN</span>
              <div className="experience-site"><DemoWebsite variant="a"/><ScoreTile score={72} variant="a"/></div>
              <span className="experience-vs">VS</span>
              <div className="experience-site experience-site--winner"><span className="winner-pill"><Crown size={14} fill="currentColor"/> Sample leader</span><DemoWebsite variant="b"/><ScoreTile score={86} variant="b"/></div>
            </div>
          </div>
        </section>

        <section className="benefits-section container" id="how-it-works" aria-labelledby="benefits-heading">
          <div className="section-heading"><Pill accent><Zap size={13} fill="currentColor"/> Why Choose VSYDE?</Pill><h2 id="benefits-heading">Get Real Insights. <span className="gradient-text">Instantly.</span></h2><p>Go beyond basic checks. VSYDE is designed for evidence-based comparisons and actionable results.</p></div>
          <div className="benefit-grid">
            {benefits.map(({title,text,Icon}) => <div className="benefit-card" key={title}><Icon size={30} strokeWidth={2.3}/><h3>{title}</h3><p>{text}</p></div>)}
          </div>
          <div className="workflow-strip"><span className="workflow-step"><b>01</b> Enter two public URLs</span><ArrowRight size={16}/><span className="workflow-step"><b>02</b> Compare the visible buyer experience</span><ArrowRight size={16}/><span className="workflow-step"><b>03</b> Review evidence & next steps</span></div>
        </section>

        <section className="pricing-section container" id="pricing" aria-labelledby="pricing-heading">
          <div className="section-heading pricing-heading"><Pill>Simple & Transparent Pricing</Pill><h2 id="pricing-heading">Unlock the Complete Report</h2><p>Get detailed analysis, competitor strengths and prioritized improvements.</p></div>
          <div className="pricing-layout">
            <div className="pricing-checks"><p><CheckCircle2/> Detailed five-factor analysis</p><p><CheckCircle2/> Evidence-backed insights</p><p><CheckCircle2/> Five actionable improvements</p><p><CheckCircle2/> Copy-ready coding prompts</p></div>
            <div className="pricing-card"><strong>$29</strong><span>One-Time Payment · Per Battle</span><button className="button gradient-button pricing-button" onClick={startFromCTA}>Start with Free Preview <ArrowRight size={19}/></button><small>Full report unlock comes after a successful preview. Checkout not active in this UI demo.</small></div>
            <div className="report-visual" aria-label="Illustrative full report preview">
              <div className="report-paper"><div className="report-head"><BrandMark compact/><span>REPORT / DEMO</span></div><div className="report-lines"><i/><i/><i/></div><div className="report-graph"><span/><span/><span/><span/><span/></div><div className="report-below"><div className="report-circle">92<small>/100</small></div><ul><li><Check size={12}/> Strengths</li><li><Check size={12}/> Weaknesses</li><li><Check size={12}/> Improvement Tips</li></ul></div></div>
            </div>
          </div>
        </section>

        <section className="faq-section container" id="faq" aria-labelledby="faq-heading">
          <div className="faq-heading"><div className="faq-heading-copy"><span className="question-icon"><CircleHelp size={21}/></span><div><h2 id="faq-heading">Frequently Asked Questions</h2><p>Everything you need to know about VSYDE.</p></div></div><a href="#start-battle" className="faq-link" onClick={(e)=>{e.preventDefault();startFromCTA();}}>Start a battle <ArrowRight size={15}/></a></div>
          <div className="faq-grid">{faqs.map(({q,a},i)=><div className={`faq-item ${activeFAQ===i?"faq-item--open":""}`} key={q}><button aria-expanded={activeFAQ===i} onClick={()=>setActiveFAQ(activeFAQ===i?null:i)}><span>{q}</span><ChevronDown size={17}/></button>{activeFAQ===i&&<p>{a}</p>}</div>)}</div>
        </section>

        <section className="container final-cta-wrap" aria-label="Start your first battle"><div className="final-cta"><span className="final-cta-mark"><BrandMark compact/></span><span className="final-cta-divider"/><div className="final-cta-copy"><h2>Ready to see who wins?</h2><p>Start your first battle with a free comparison preview.</p></div><button className="button gradient-button final-cta-button" onClick={startFromCTA}>Start Battle <ArrowRight size={18}/></button></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><a href="#top" aria-label="Back to VSYDE home"><BrandMark compact/></a><div className="footer-links"><span title="Coming in a later phase">Privacy Policy</span><span title="Coming in a later phase">Terms of Service</span><span title="Coming in a later phase">Methodology</span><span title="Coming in a later phase">Contact</span></div><small>© {new Date().getFullYear()} VSYDE · UI Preview</small></div></footer>
    </div>
  );
}
