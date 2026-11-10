"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import type { BattleInspection, InspectionSite } from "@/lib/battle-types";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleAlert,
  ClipboardCheck, ExternalLink, LoaderCircle, Mail, RefreshCw, ShieldCheck,
} from "lucide-react";

function SiteEvidence({ site, own }: { site: InspectionSite; own: boolean }) {
  const count = site.signals.filter(s => s.observed).length;
  return <article className={"results-site " + (own ? "results-site--own" : "")}>
    <div className="results-site-head">
      <span className="results-site-role">{own ? "YOUR WEBSITE" : "COMPETITOR"}</span>
      <span className={"results-count " + (site.status === "inspected" ? "" : "results-count--limited")}>
        {site.status === "inspected" ? count + "/4 visible signals" : "Limited"}
      </span>
    </div>
    <h2>{site.domain}</h2>
    <p className="results-site-title">{site.title}</p>
    {site.status === "inspected" ? <div className="results-evidence">
      {site.signals.map(signal => <div className="results-signal" key={signal.key}>
        <span className={"results-observed " + (signal.observed ? "yes" : "no")}>{signal.observed ? <Check size={16} aria-hidden="true"/> : <CircleAlert size={16} aria-hidden="true"/>}</span>
        <div><strong>{signal.label}</strong><small>{signal.observed ? signal.excerpt : "Not identified in the available page text"}</small></div>
      </div>)}
    </div> : <p className="results-limited">{site.note || "Public website content could not be inspected reliably."}</p>}
    <a href={site.url} target="_blank" rel="noopener noreferrer" className="results-source">View source website <ExternalLink size={15}/></a>
  </article>;
}

export default function ResultsView({ ownSite, competitorSite }: { ownSite: string; competitorSite: string }) {
  const params = new URLSearchParams({ own: ownSite, competitor: competitorSite });
  const battleURL = "/battle?" + params.toString();
  const editURL = "/?" + params.toString() + "#compare";
  const key = "vsyde:report:" + params.toString();
  const [data, setData] = useState<BattleInspection | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    try {
      const saved = sessionStorage.getItem(key);
      if (saved && attempt === 0) {
        const report = JSON.parse(saved) as BattleInspection;
        if (report.own?.url === ownSite && report.competitor?.url === competitorSite && report.createdAt) {
          setData(report);
          setState("ready");
          return () => controller.abort();
        }
      }
    } catch { /* session storage may be disabled */ }
    fetch("/api/battle/inspect?" + params.toString(), { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || "The comparison could not be loaded.");
        }
        return response.json() as Promise<BattleInspection>;
      })
      .then(report => {
        if (controller.signal.aborted) return;
        setData(report);
        setState("ready");
        try { sessionStorage.setItem(key, JSON.stringify(report)); } catch { /* storage optional */ }
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "The report could not be loaded.");
      });
    return () => controller.abort();
  }, [ownSite, competitorSite, key, attempt]);

  return <div className="battle-page results-page">
    <header className="battle-header">
      <div className="battle-nav battle-width">
        <Link href="/" className="battle-brand" aria-label="vsyde homepage"><img src="/icon.png" width={35} height={35} alt=""/><strong>vsyde</strong></Link>
        <div className="battle-nav-right"><span className="battle-nav-tag">Free Results</span><ThemeToggle variant="icon"/><Link href={battleURL} className="battle-back"><ArrowLeft size={18}/><span>Battle Room</span></Link></div>
      </div>
    </header>
    <main className="results-main battle-width">
      <div className="results-heading">
        <span className="battle-kicker"><ClipboardCheck size={16}/> THE FREE PREVIEW</span>
        <h1>Your comparison, <em>clearly explained.</em></h1>
        <p>A first look at observable information from your two public websites.</p>
      </div>
      {state === "loading" && <div className="results-loading" role="status"><LoaderCircle className="battle-spin" size={25}/> Checking page evidence…</div>}
      {state === "error" && <div className="results-loading" role="alert">
        <p>{message}</p><button type="button" className="battle-result-button" onClick={() => setAttempt(a => a + 1)}><RefreshCw size={17}/> Retry inspection</button>
      </div>}
      {state === "ready" && data && <>
        <section className="results-summary">
          <div>
            <span className="results-overline">PRELIMINARY OBSERVATION</span>
            <h2>{data.status === "complete" ? "What we could verify." : "Some evidence is unavailable."}</h2>
            <p>{data.summary}</p>
          </div>
          <span className={"results-coverage " + (data.status !== "complete" ? "is-limited" : "")}>
            {data.status === "complete" ? "Both pages inspected" : data.status === "partial" ? "Partial coverage" : "Inconclusive"}
          </span>
        </section>
        <section className="results-compare" aria-label="Website evidence comparison">
          <SiteEvidence site={data.own} own/>
          <SiteEvidence site={data.competitor} own={false}/>
        </section>
        <div className="results-method"><ShieldCheck size={20} aria-hidden="true"/><p>{data.methodology} A missing mention does not prove that information is absent from the website.</p></div>
        <section className="results-unlock">
          <div><span className="results-overline">DEEPER WEBSITE INTELLIGENCE</span><h2>Unlock the Full Battle.</h2><p>Detailed evidence, clearer priorities and practical improvement prompts. One-time price, no subscription.</p></div>
          <div className="results-unlock-action"><strong>$19 <span>/ battle</span></strong><a className="battle-result-button" href={"mailto:hello.skyorigin@gmail.com?subject=" + encodeURIComponent("vsyde full report — " + data.own.domain + " vs " + data.competitor.domain)}>Ask about full reports <Mail size={17}/></a><small>Checkout will open when paid reports are ready.</small></div>
        </section>
      </>}
      <div className="results-navigation"><Link href={editURL}><ArrowLeft size={17}/> Change websites</Link><Link href={battleURL}>Review screenshots <ArrowRight size={17}/></Link></div>
    </main>
    <footer className="battle-footer battle-width"><span>© {new Date().getFullYear()} vsyde</span><a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a></footer>
  </div>;
}
