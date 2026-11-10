"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { buildReportModel, type Detection } from "@/lib/report-model";
import type { BattleInspection } from "@/lib/battle-types";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight,
  CircleAlert, ClipboardList, ExternalLink, LoaderCircle, RefreshCw,
  ScanSearch, ShieldCheck, Sparkles, Target, Zap,
} from "lucide-react";

function DetectionTag({ status }: { status: Detection }) {
  const label = status === "found" ? "Detected" : status === "unconfirmed" ? "Not found" : status === "unavailable" ? "Unavailable" : "Not tested";
  return <span className={"br-detection br-detection--" + status}>
    {status === "found" ? <Check size={14} aria-hidden="true"/> : status === "unavailable" ? <CircleAlert size={14} aria-hidden="true"/> : null}
    {label}
  </span>;
}

export default function ResultsView({ ownSite, competitorSite }: { ownSite: string; competitorSite: string }) {
  const params = new URLSearchParams({ own: ownSite, competitor: competitorSite });
  const battleURL = "/battle?" + params.toString();
  const editURL = "/?" + params.toString() + "#compare";
  const storageKey = "vsyde:report:" + params.toString();
  const [report, setReport] = useState<BattleInspection | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError("");
    if (retry === 0) {
      try {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
          const data = JSON.parse(cached) as BattleInspection;
          const fresh = Date.now() - new Date(data.createdAt).getTime() < 10 * 60 * 1000;
          if (fresh && data.own?.url === ownSite && data.competitor?.url === competitorSite && Array.isArray(data.own.signals) && Array.isArray(data.competitor.signals)) {
            setReport(data);
            setStatus("ready");
            return () => controller.abort();
          }
        }
      } catch { /* browser storage can be disabled */ }
    }
    const query = new URLSearchParams({ own: ownSite, competitor: competitorSite });
    fetch("/api/battle/inspect?" + query.toString(), { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) {
          const body: { error?: string } | null = await response.json().catch(() => null);
          throw new Error(body?.error || "Could not load the comparison.");
        }
        return response.json() as Promise<BattleInspection>;
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setReport(data);
        setStatus("ready");
        try { sessionStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* optional */ }
      })
      .catch(reason => {
        if (controller.signal.aborted) return;
        setReport(null);
        setError(reason instanceof Error ? reason.message : "Could not inspect the websites.");
        setStatus("failed");
      });
    return () => controller.abort();
  }, [ownSite, competitorSite, storageKey, retry]);

  const model = report ? buildReportModel(report) : null;
  const dateText = report ? new Date(report.createdAt).toLocaleString("en-US", { dateStyle:"medium", timeStyle:"short" }) : "";
  return <div className="battle-page br-page">
    <header className="battle-header">
      <div className="battle-nav battle-width">
        <Link href="/" className="battle-brand" aria-label="vsyde homepage">
          <img src="/icon.png" width={35} height={35} alt=""/><strong>vsyde</strong>
        </Link>
        <div className="battle-nav-right">
          <span className="battle-nav-tag">Battle Report</span>
          <ThemeToggle variant="icon"/>
          <Link href={battleURL} className="battle-back" aria-label="Back to Battle Room">
            <ArrowLeft size={18}/><span>Battle Room</span>
          </Link>
        </div>
      </div>
    </header>
    <main className="br-main battle-width">
      <div className="br-head">
        <div>
          <span className="battle-kicker"><ScanSearch size={16}/> WEBSITE COMPARISON</span>
          <h1>Battle Report<span>.</span></h1>
          <p>What we found, what it means, and what you can improve.</p>
        </div>
        <Link href={editURL} className="br-edit"><ArrowLeft size={16}/> Edit websites</Link>
      </div>
      {status === "loading" && <div className="br-loading" role="status">
        <LoaderCircle size={27} className="battle-spin"/>
        <strong>Checking both websites</strong>
        <span>Collecting public homepage evidence…</span>
      </div>}
      {status === "failed" && <div className="br-loading" role="alert">
        <CircleAlert size={28}/>
        <strong>Couldn't load this comparison</strong>
        <span>{error}</span>
        <button type="button" className="br-primary" onClick={() => setRetry(n => n + 1)}><RefreshCw size={17}/> Try again</button>
      </div>}
      {status === "ready" && report && model && <>
        <section className="br-verdict" aria-labelledby="br-verdict-title">
          <div className="br-verdict-body">
            <div className="br-verdict-kicker"><Sparkles size={16}/> 01 / THE VERDICT</div>
            <h2 id="br-verdict-title">{model.verdict}</h2>
            <p>{model.explanation}</p>
            <div className="br-verdict-meta">
              <span><CheckCircle2 size={15}/> {report.status === "complete" ? "Both homepages inspected" : report.status === "partial" ? "Partial evidence" : "Insufficient evidence"}</span>
              <span>Checked {dateText}</span>
            </div>
          </div>
          <div className="br-versus" aria-label="Compared website domains">
            <div><span>YOUR SITE</span><strong>{report.own.domain}</strong></div>
            <span className="br-versus-circle">VS</span>
            <div><span>COMPETITOR</span><strong>{report.competitor.domain}</strong></div>
          </div>
        </section>

        <section className="br-section" aria-labelledby="br-scorecard">
          <div className="br-section-heading">
            <div><span className="br-section-index">02 / SCORECARD</span><h2 id="br-scorecard">Five-factor comparison</h2></div>
            <span className="br-section-context">Visible homepage signals</span>
          </div>
          <div className="br-scorecard">
            <div className="br-scorecard-head">
              <span>WHAT WE CHECK</span>
              <span>YOUR WEBSITE</span>
              <span>COMPETITOR</span>
            </div>
            {model.factors.map(factor => <div className="br-factor" key={factor.key}>
              <div className="br-factor-title"><strong>{factor.label}</strong><small>{factor.weight} weight</small></div>
              <div className="br-factor-site"><span className="br-mobile-label">YOUR WEBSITE</span><DetectionTag status={factor.own}/></div>
              <div className="br-factor-site"><span className="br-mobile-label">COMPETITOR</span><DetectionTag status={factor.competitor}/></div>
            </div>)}
          </div>
          <p className="br-caption">Detected means a matching signal appeared in the captured text—not a quality score. Buying friction requires deeper interaction testing.</p>
        </section>

        <section className="br-section" aria-labelledby="br-findings">
          <div className="br-section-heading">
            <div><span className="br-section-index">03 / EVIDENCE</span><h2 id="br-findings">Key findings</h2></div>
            <span className="br-section-context">Up to 3 observations</span>
          </div>
          {model.findings.length > 0 ? <div className="br-findings">
            {model.findings.map((item, i) => <article className="br-finding" key={i}>
              <div className="br-finding-index">0{i + 1}</div>
              <div className="br-finding-content">
                <span className="br-finding-tag">{item.tag}</span>
                <h3>{item.title}</h3><p>{item.body}</p>
                <a href={item.source} target="_blank" rel="noopener noreferrer">View source <ExternalLink size={14}/></a>
              </div>
            </article>)}
          </div> : <div className="br-empty"><CircleAlert size={22}/><strong>Not enough evidence yet</strong><p>Neither page returned reliable matching information. Try scanning again or review the sites directly.</p></div>}
        </section>

        <section className="br-section" aria-labelledby="br-fixes">
          <div className="br-section-heading">
            <div><span className="br-section-index">04 / NEXT STEPS</span><h2 id="br-fixes">Top improvements</h2></div>
            <span className="br-section-context">Focus on your website</span>
          </div>
          {model.fixes.length > 0 ? <div className="br-fixes">
            {model.fixes.map(fix => <article className="br-fix" key={fix.priority}>
              <span className="br-fix-number">{fix.priority}</span>
              <div><h3>{fix.title}</h3><p>{fix.detail}</p></div>
              <ChevronRight size={19} aria-hidden="true"/>
            </article>)}
          </div> : <div className="br-empty"><Target size={22}/><strong>Inspect your site to get improvements</strong><p>We couldn't read enough of your homepage to suggest evidence-based next steps.</p></div>}
        </section>
        <div className="br-actions">
          <button type="button" className="br-primary" onClick={() => setRetry(n => n + 1)}><RefreshCw size={17}/> Scan again</button>
          <Link href={battleURL} className="br-secondary">Review screenshots <ArrowUpRight size={17}/></Link>
          <Link href={editURL} className="br-secondary">New comparison <ArrowRight size={17}/></Link>
        </div>
        <p className="br-footnote"><ShieldCheck size={17}/> Based on publicly captured homepage text. This is not a measure of actual customer behavior or conversion performance.</p>
      </>}
    </main>
    <footer className="battle-footer battle-width"><span>© {new Date().getFullYear()} vsyde</span><a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a></footer>
  </div>;
}
