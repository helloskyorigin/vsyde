"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { normalizePublicURL, sameWebsite } from "@/lib/url-validation";
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, ClipboardCheck,
  Eye, FileSearch, GitCompareArrows, Link2, LockKeyhole, Menu, MousePointer2,
  ShieldCheck, Sparkles, Tag, Target, X, Zap, Search, LoaderCircle, ExternalLink,
} from "lucide-react";

type Field = "own" | "competitor";
type ReportTab = "overview" | "evidence" | "fixes";
type FieldErrors = Partial<Record<Field, string>>;
type SuggestedCompetitor = { name: string; domain: string; url: string; description: string };
type CompetitorDiscovery = { suggestions: SuggestedCompetitor[]; title: string; source: string; note: string; category?: string; error?: string };

const signals = [
  { name: "Offer clarity", weight: "25%", detail: "Can visitors understand your offer and who it helps?", Icon: Target },
  { name: "Trust signals", weight: "20%", detail: "Is real proof and company information easy to find?", Icon: ShieldCheck },
  { name: "Pricing clarity", weight: "20%", detail: "Can buyers understand the price or next pricing step?", Icon: Tag },
  { name: "CTA path", weight: "20%", detail: "Is the next action obvious and relevant?", Icon: MousePointer2 },
  { name: "Buying friction", weight: "15%", detail: "What creates confusion or unnecessary steps?", Icon: Zap },
];

const faq = [
  { q: "Is vsyde free to try?", a: "A free comparison preview is planned, followed by an optional $19 one-time report. Public-page scans are available now; the optional paid report is not launched yet." },
  { q: "Do I need an account?", a: "No account is planned for V1. When report delivery launches, buyers will access their private report through a secure link." },
  { q: "How does vsyde compare two websites?", a: "The intended analysis uses the same five buyer-experience criteria for both public websites. Every finding should have observable evidence, a confidence note, and a clear limitation where necessary." },
  { q: "What if a site blocks inspection?", a: "Blocked or inaccessible pages should result in a limited or inconclusive evaluation, never an automatic loss." },
  { q: "Is the $19 report a subscription?", a: "No subscription. The listed full battle report price is $19 once per completed comparison. Checkout is not available yet." },
  { q: "Can I share my report?", a: "When report delivery launches, full reports will be private by default and accessible through a shareable, unguessable link. Anyone with that link may be able to open it." },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand--compact" : ""}`}>
      <img src="/icon.png" width={32} height={32} alt="" aria-hidden="true" />
      <span>vsyde</span>
    </span>
  );
}

function SampleReport() {
  const [tab, setTab] = useState<ReportTab>("overview");
  const tabs: { id: ReportTab; title: string }[] = [
    { id: "overview", title: "Overview" }, { id: "evidence", title: "Evidence" }, { id: "fixes", title: "Fix plan" },
  ];
  return <div className="report-window" aria-label="How a live comparison report is organized">
    <div className="report-toolbar">
      <div className="report-toolbar__brand"><span className="toolbar-dots" aria-hidden="true"><i/><i/><i/></span><strong>vsyde <span>/ report</span></strong></div>
      <span className="sample-chip"><span aria-hidden="true"/> Interface preview · Not a live scan</span>
    </div>
    <div className="report-tabs" role="tablist" aria-label="Report sections">
      {tabs.map(({id,title})=><button key={id} type="button" role="tab" id={`tab-${id}`} aria-controls={tab===id ? `panel-${id}` : undefined} aria-selected={tab===id} tabIndex={tab===id?0:-1} className={tab===id?"active":""} onClick={()=>setTab(id)} onKeyDown={e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;e.preventDefault();const index=tabs.findIndex(t=>t.id===tab);const next=tabs[(index+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length].id;setTab(next);document.getElementById(`tab-${next}`)?.focus();}}>{title}</button>)}
    </div>
    <div className="report-body">
      {tab==="overview" && <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="report-panel" key="overview">
        <div className="report-topline"><div><span className="micro-label">Battle overview</span><h3>Both websites. One evidence-led view.</h3></div><span className="confidence-chip">Coverage first</span></div>
        <div className="report-score-grid">
          <div className="report-score"><div className="report-score__heading"><span className="site-dot"/><span>Your website</span></div><strong className="preview-status-text">Public-page inspection</strong><p className="preview-card-description">Linked page evidence plus homepage screenshot after scanning.</p></div>
          <div className="report-score"><div className="report-score__heading"><span className="site-dot site-dot--other"/><span>Selected competitor</span></div><strong className="preview-status-text">Same checks</strong><p className="preview-card-description">One fair standard, with missing evidence labelled.</p></div>
        </div>
        <div className="report-verdict"><span className="verdict-badge"><Sparkles size={18}/></span><div><strong>No invented winner or scores</strong><p>Real observations, coverage limits and a preliminary verdict appear only after checking both sites.</p></div></div>
      </div>}
      {tab==="evidence" && <div role="tabpanel" id="panel-evidence" aria-labelledby="tab-evidence" className="report-panel" key="evidence">
        <div className="report-topline"><div><span className="micro-label">Evidence</span><h3>See where each observation came from.</h3></div><span className="confidence-chip">Source links</span></div>
        <div className="evidence-grid">
          <div className="evidence-item"><span className="evidence-icon"><Eye size={20}/></span><span className="micro-label">VISUAL INSPECTION</span><strong>Public homepage captures</strong><p>Real website screenshot requests show what the page looked like when captured.</p><small>Screenshot availability can vary by website</small></div>
          <div className="evidence-item"><span className="evidence-icon evidence-icon--purple"><FileSearch size={20}/></span><span className="micro-label">TEXT EVIDENCE</span><strong>Exact observed page signals</strong><p>Detected headlines, action links, trust information and pricing text are shown with sources.</p><small>No pretend conversion-rate data</small></div>
        </div>
      </div>}
      {tab==="fixes" && <div role="tabpanel" id="panel-fixes" aria-labelledby="tab-fixes" className="report-panel" key="fixes">
        <div className="report-topline"><div><span className="micro-label">Action plan</span><h3>Less guessing. More shipping.</h3></div><span className="confidence-chip">Based on scan</span></div>
        <div className="fix-list">
          <div className="fix-item"><span>01</span><div><strong>Check the first-screen offer</strong><p>Show if your detected headline explains what the product does.</p></div><small>Offer clarity</small></div>
          <div className="fix-item"><span>02</span><div><strong>Review your next action</strong><p>Look for a clear, identifiable call to action in public page text.</p></div><small>CTA path</small></div>
          <div className="fix-item"><span>03</span><div><strong>Look for reassurance</strong><p>Find the trust and pricing evidence buyers may look for.</p></div><small>Trust + pricing</small></div>
        </div>
        <p className="report-disclaimer">These are the checks the product can perform. Real recommendations appear after a scan.</p>
      </div>}
    </div>
  </div>;
}

export default function LandingPage() {
  const router = useRouter();
  const [yourSite, setYourSite] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [discoverStatus, setDiscoverStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [discoverMessage, setDiscoverMessage] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedCompetitor[]>([]);
  const [discoveryTitle, setDiscoveryTitle] = useState("");
  const [discoveryCategory, setDiscoveryCategory] = useState("");
  const [discoveryNote, setDiscoveryNote] = useState("");
  const discoverController = useRef<AbortController | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const own = qs.get("own");
    const other = qs.get("competitor");
    if (own && normalizePublicURL(own)) setYourSite(own);
    if (other && normalizePublicURL(other)) setCompetitor(other);
  }, []);

  useEffect(() => {
    const track = () => setScrolled(window.scrollY > 22);
    track();
    window.addEventListener("scroll", track, { passive: true });
    return () => window.removeEventListener("scroll", track);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("reveal-visible"); observer.unobserve(entry.target); }
    }, { threshold: 0.09, rootMargin: "0px 0px -35px 0px" });
    targets.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.98) return;
      element.classList.add("reveal-prep"); observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  function focusForm(fromPricing = false) {
    setMenuOpen(false);
    if (fromPricing) setNotice("Full reports will be available for $19 after the free preview. Payments are not open yet.");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("compare")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => firstRef.current?.focus({ preventScroll: true }), reduced ? 0 : 300);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const own = normalizePublicURL(yourSite);
    const other = normalizePublicURL(competitor);
    const next: FieldErrors = {};
    if (!own) next.own = "Enter a valid public website, for example yourwebsite.com.";
    if (!other) next.competitor = "Enter a valid competitor domain, for example competitor.com.";
    if (own && other && sameWebsite(own, other)) {
      next.competitor = "Use a different website from your own.";
    }
    setErrors(next);
    if (next.own) { firstRef.current?.focus(); return; }
    if (next.competitor) { secondRef.current?.focus(); return; }
    const query = new URLSearchParams({ own: own!.href, competitor: other!.href });
    router.push(`/battle?${query.toString()}`);
  }

  async function findCompetitors() {
    discoverController.current?.abort();
    const own = normalizePublicURL(yourSite);
    if (!own) {
      setErrors(old => ({...old, own:"Enter your website first so we can search for related sites."}));
      firstRef.current?.focus();
      return;
    }
    setErrors({});
    setDiscoverOpen(true);
    setDiscoverStatus("loading");
    setDiscoverMessage("");
    setSuggestions([]);
    const controller = new AbortController();
    discoverController.current = controller;
    try {
      const response = await fetch("/api/competitors?" + new URLSearchParams({site:own.href}), {signal:controller.signal,cache:"no-store"});
      const data = await response.json() as CompetitorDiscovery;
      if (!response.ok) throw new Error(data.error || "Search could not be completed.");
      if (controller.signal.aborted) return;
      setDiscoveryTitle(data.title);
      setDiscoveryCategory(data.category || "");
      setDiscoveryNote(data.note || "");
      setSuggestions(data.suggestions || []);
      setDiscoverStatus("done");
      if (!data.suggestions?.length) setDiscoverMessage(data.note || "No reliable matches surfaced. Enter a competitor URL manually.");
    } catch (error) {
      if (controller.signal.aborted) return;
      setDiscoverStatus("error");
      setDiscoverMessage(error instanceof Error ? error.message : "Search is temporarily unavailable.");
    }
  }

  function chooseCompetitor(item: SuggestedCompetitor) {
    setCompetitor(item.url);
    clearError("competitor");
    setDiscoverOpen(false);
    secondRef.current?.focus();
  }

  function clearError(field: Field) { setErrors(old => ({ ...old, [field]: undefined })); setNotice(""); }

  return (
    <div className="page-shell" id="top">
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <div className="nav-wrap content-width">
          <a href="#top" className="brand-link" aria-label="vsyde home"><Brand /></a>
          <nav className="desktop-nav" aria-label="Primary navigation"><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
          <div className="nav-actions"><ThemeToggle variant="icon"/>
          <button type="button" className="primary-button nav-cta" onClick={() => focusForm()}>Start Free Battle <ArrowUpRight size={16} aria-hidden="true"/></button>
          <button type="button" className="menu-toggle" aria-controls="mobile-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button></div>
        </div>
        {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><a href="#product" onClick={() => setMenuOpen(false)}>Product</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a><ThemeToggle variant="menu"/><button type="button" className="primary-button" onClick={() => focusForm()}>Start Free Battle <ArrowRight size={18}/></button></nav>}
      </header>
      <main>
        <section className="hero content-width" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span className="status-dot"/> WEBSITE EXPERIENCE, COMPARED</span>
            <h1 id="hero-heading">Your website.<br/>Their website.<br/><span>Who wins?</span></h1>
            <p>Compare two websites from a buyer’s point of view. Discover what’s clear, what’s missing, and what to improve.</p>
          </div>
          <div className="hero-compare-layout">
          <form className="comparison-form" id="compare" onSubmit={submit} noValidate>
            <div className="form-intro"><span><GitCompareArrows size={17}/> New comparison</span><small><LockKeyhole size={13}/> Public websites only</small></div>
            <label htmlFor="own-url">Your website</label>
            <div className={`input-shell ${errors.own ? "input-shell--invalid" : ""}`}><Link2 size={19} aria-hidden="true"/><input ref={firstRef} id="own-url" type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="yourwebsite.com" value={yourSite} onChange={event => { setYourSite(event.target.value); clearError("own"); discoverController.current?.abort(); setDiscoverStatus("idle"); setDiscoverOpen(false); setSuggestions([]); }} aria-invalid={!!errors.own} aria-describedby={errors.own ? `${errorId}-own` : undefined}/></div>
            {errors.own && <p className="field-error" id={`${errorId}-own`} role="alert">{errors.own}</p>}
            <div className="vs-row" aria-hidden="true"><span/>VS<span/></div>
            <label htmlFor="competitor-url">Competitor website</label>
            <div className={`input-shell ${errors.competitor ? "input-shell--invalid" : ""}`}><Link2 size={19} aria-hidden="true"/><input ref={secondRef} id="competitor-url" type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="competitor.com" value={competitor} onChange={event => { setCompetitor(event.target.value); clearError("competitor"); }} aria-invalid={!!errors.competitor} aria-describedby={errors.competitor ? `${errorId}-competitor` : undefined}/></div>
            {errors.competitor && <p className="field-error" id={`${errorId}-competitor`} role="alert">{errors.competitor}</p>}
            <button type="submit" className="primary-button form-submit">Start Free Battle <ArrowUpRight size={18} aria-hidden="true"/></button>
            <p className="form-footnote">Free preview <span>·</span> No signup <span>·</span> $19 one-time full report</p>
            {notice && <p className="form-notice" role="status">{notice}</p>}
          </form>
          <aside className="competitor-side" aria-label="Optional competitor discovery">
            <div className="competitor-side-head"><Search size={20} aria-hidden="true"/><strong>Competitor finder</strong></div>
            <p className="competitor-side-hint">Not sure which website to compare? Find relevant options after entering your URL.</p>
            <div className="discover-entry">
              <span>Don't know who to compare?</span>
              <button type="button" onClick={() => { if (discoverOpen && discoverStatus !== "loading") setDiscoverOpen(false); else void findCompetitors(); }} aria-expanded={discoverOpen} aria-controls="competitor-discovery-panel">
                <Search size={16} aria-hidden="true"/> Find competitors for me <ArrowRight size={15} aria-hidden="true"/>
              </button>
            </div>
            {discoverOpen && <div className="discover-panel" id="competitor-discovery-panel" aria-live="polite">
              {discoverStatus === "loading" && <div className="discover-loading"><LoaderCircle size={19} className="battle-spin"/><span>Reading your public homepage and searching for related websites…</span></div>}
              {discoverStatus === "error" && <div className="discover-message" role="alert">{discoverMessage}<button type="button" onClick={() => void findCompetitors()}>Retry search</button></div>}
              {discoverStatus === "done" && <>
                <div className="discover-panel-head"><strong>Suggested websites</strong><span>{discoveryCategory ? "Category: " + discoveryCategory : "Based on " + discoveryTitle}</span></div>
                {suggestions.length ? <div className="discover-results">{suggestions.map(item => <button type="button" className="discover-option" key={item.domain} onClick={() => chooseCompetitor(item)}>
                  <span className="discover-option-top"><strong>{item.name}</strong><span>Choose <ArrowRight size={14}/></span></span>
                  <small>{item.domain}</small>
                  {item.description && <span className="discover-option-description">{item.description}</span>}
                </button>)}</div> : <div className="discover-message">{discoverMessage}</div>}
                <p className="discover-disclaimer">{discoveryNote || "Suggestions are unverified leads. Check each site before comparing."} <ExternalLink size={12} aria-hidden="true"/></p>
              </>}
            </div>}
          </aside>
          </div>
          <a className="hero-product-link" href="#product">Explore the report <ArrowRight size={16} aria-hidden="true"/></a>
        </section>

        <section id="product" className="product-section content-width" aria-labelledby="product-title" data-reveal>
          <div className="section-heading"><span className="section-overline">THE EXPERIENCE</span><h2 id="product-title">Make the next move<br/><em>with clarity.</em></h2><p>Not another arbitrary score. A buyer-focused comparison with evidence and improvements you can actually use.</p></div>
          <SampleReport />
        </section>

        <section className="signals-section content-width" aria-labelledby="signals-heading" data-reveal>
          <div className="section-heading"><span className="section-overline">ONE FAIR STANDARD</span><h2 id="signals-heading">Five signals.<br/><em>One clear view.</em></h2><p>Both sites are reviewed against the same criteria, not different rules or claimed conversion numbers.</p></div>
          <div className="signals-panel">{signals.map(({ name, weight, detail, Icon }, i) => <div className="signal-row" key={name}><span className="signal-number">0{i+1}</span><span className="signal-icon"><Icon size={21}/></span><div><strong>{name}</strong><p>{detail}</p></div><span className="signal-weight">{weight}</span></div>)}</div>
        </section>

        <section className="fairness-section content-width" aria-labelledby="fairness-title" data-reveal>
          <div className="fairness-intro"><span className="section-overline">BUILT FOR HONEST COMPARISONS</span><h2 id="fairness-title">Show the proof.<br/><em>Respect the limits.</em></h2><p>A credible comparison must show what was inspected—and admit when a fair verdict isn’t possible.</p><Link href="/methodology" className="text-link">See our methodology <ArrowUpRight size={17}/></Link></div>
          <div className="fairness-points"><div><span><ClipboardCheck size={23}/></span><h3>Same criteria</h3><p>Matching rules and comparable inspection depth on both websites.</p></div><div><span><CircleHelp size={23}/></span><h3>Visible limitations</h3><p>Blocked pages and missing information are labelled, not silently scored as a loss.</p></div></div>
        </section>

        <section id="how-it-works" className="how-section content-width" aria-labelledby="how-title" data-reveal>
          <div className="section-heading"><span className="section-overline">THREE SIMPLE STEPS</span><h2 id="how-title">From two URLs<br/><em>to better decisions.</em></h2></div>
          <div className="steps-list"><div className="step"><span className="step-number">01</span><span className="step-icon"><Link2 size={22}/></span><div><h3>Enter two websites</h3><p>Add a competitor URL or discover related websites without leaving vsyde. No signup.</p></div></div><div className="step"><span className="step-number">02</span><span className="step-icon"><Eye size={22}/></span><div><h3>See the free preview</h3><p>A preliminary verdict, selected scores and a supported finding.</p></div></div><div className="step"><span className="step-number">03</span><span className="step-icon"><Sparkles size={22}/></span><div><h3>Unlock the full report</h3><p>Deeper evidence, prioritized fixes and implementation prompts for $19.</p></div></div></div>
        </section>

        <section id="pricing" className="pricing-section content-width" aria-labelledby="pricing-title" data-reveal>
          <div className="section-heading"><span className="section-overline">TRANSPARENT PRICING</span><h2 id="pricing-title">See the value first.<br/><em>Pay only if you want more.</em></h2></div>
          <div className="price-grid"><article className="price-card"><span className="price-name">Free preview</span><div className="price-amount">$0</div><p>A useful first look at the comparison.</p><ul><li><Check size={17}/> Preliminary verdict</li><li><Check size={17}/> Selected factor scores</li><li><Check size={17}/> One evidence-backed finding</li><li><Check size={17}/> Scope and limitations</li></ul><button type="button" className="secondary-button price-button" onClick={() => focusForm()}>Start free <ArrowUpRight size={18}/></button></article>
          <article className="price-card price-card--featured"><div className="price-card__top"><span className="price-name">Full battle report</span><span className="price-tag">ONE TIME</span></div><div className="price-amount">$19<span> / battle</span></div><p>Everything behind the verdict, ready to act on.</p><ul><li><Check size={17}/> Full five-factor comparison</li><li><Check size={17}/> Deeper buyer-path evidence</li><li><Check size={17}/> Prioritized improvement plan</li><li><Check size={17}/> Copy-ready coding prompts</li></ul><button type="button" className="primary-button price-button" onClick={() => focusForm(true)}>Start with free preview <ArrowUpRight size={18}/></button></article></div>
        </section>

        <section id="faq" className="faq-section content-width" aria-labelledby="faq-title" data-reveal><div className="section-heading"><span className="section-overline">GOOD TO KNOW</span><h2 id="faq-title">Frequently asked<br/><em>questions.</em></h2></div><div className="faq-list">{faq.map(({ q, a }, i) => <div className="faq-item" key={q}><button type="button" aria-controls={`answer-${i}`} aria-expanded={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)}><span>{q}</span><ChevronDown size={20} className={openFAQ === i ? "rotate" : ""}/></button><div id={`answer-${i}`} className="faq-answer" hidden={openFAQ !== i}><p>{a}</p></div></div>)}</div></section>

        <section className="closing-section content-width" aria-labelledby="closing-title" data-reveal><span className="closing-orb" aria-hidden="true"/><span className="section-overline">YOUR NEXT MOVE STARTS HERE</span><h2 id="closing-title">See your website<br/>with fresh eyes.</h2><p>Two URLs. One clear starting point.</p><button type="button" className="closing-button" onClick={() => focusForm()}>Start Free Battle <ArrowUpRight size={20}/></button><small>No account required · Free preview · $19 one-time full report</small></section>
      </main>
      <footer className="site-footer"><div className="footer-inner content-width"><a href="#top" aria-label="vsyde back to top"><Brand compact/></a><nav aria-label="Footer links"><Link href="/methodology">Methodology</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link><Link href="/contact">Contact</Link></nav></div><p className="footer-note content-width">© {new Date().getFullYear()} vsyde · Business inquiries: <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a></p></footer>
    </div>
  );
}
