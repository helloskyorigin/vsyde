"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import type { BattleInspection, InspectionSite } from "@/lib/battle-types";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Circle, ExternalLink,
  Globe2, LoaderCircle, Maximize2, Minus, Plus, RefreshCw,
  ShieldCheck, Sparkles, X, ScanSearch,
} from "lucide-react";

type PreviewStatus = "loading" | "ready" | "loaded" | "failed";
type PreviewState = { status: PreviewStatus; src: string; message: string };
const blank: PreviewState = { status: "loading", src: "", message: "" };

function useWebsitePreview(address: string) {
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState<PreviewState>(blank);
  useEffect(() => {
    let disposed = false;
    let blobURL = "";
    const controller = new AbortController();
    setPreview(blank);
    async function load() {
      try {
        const params = new URLSearchParams({ url: address });
        if (revision > 0) params.set("refresh", "1");
        const response = await fetch("/api/battle/preview?" + params.toString(), {
          signal: controller.signal, cache: "no-store",
        });
        if (!response.ok) {
          const error: { error?: string } | null = await response.json().catch(() => null);
          throw new Error(error?.error || "This website's preview could not be captured.");
        }
        const file = await response.blob();
        if (!file.type.startsWith("image/")) throw new Error("Screenshot image was not available.");
        if (disposed) return;
        blobURL = URL.createObjectURL(file);
        setPreview({ status: "ready", src: blobURL, message: "" });
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        setPreview({ status: "failed", src: "", message: error instanceof Error ? error.message : "Screenshot unavailable." });
      }
    }
    void load();
    return () => {
      disposed = true;
      controller.abort();
      if (blobURL) URL.revokeObjectURL(blobURL);
    };
  }, [address, revision]);
  const retry = () => setRevision(value => value + 1);
  const loaded = () => setPreview(old => old.status === "ready" ? { ...old, status: "loaded" } : old);
  const imageFailed = () => setPreview({ status: "failed", src: "", message: "Screenshot could not be displayed." });
  return { preview, retry, loaded, imageFailed };
}

function SiteCard({ url, label, slot, active, previewer }: {
  url: string; label: string; slot: "one" | "two"; active: boolean;
  previewer: ReturnType<typeof useWebsitePreview>;
}) {
  const domain = new URL(url).hostname;
  const { preview, retry, loaded, imageFailed } = previewer;
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  const pending = preview.status === "loading" || preview.status === "ready";
  return (
    <article className={"battle-site battle-site--" + slot + (!active ? " battle-site--mobile-inactive" : "")} aria-label={label + ": " + domain}>
      <div className="battle-site-top">
        <span className="battle-site-role"><span className="battle-dot"/>{label}</span>
        <span className={"battle-status battle-status--" + preview.status} role="status">
          {preview.status === "loaded" && <CheckCircle2 size={14} aria-hidden="true"/>}
          {pending && <LoaderCircle size={14} aria-hidden="true" className="battle-spin"/>}
          {preview.status === "loaded" ? "Preview ready" : preview.status === "failed" ? "Unavailable" : "Capturing"}
        </span>
      </div>
      <div className="battle-site-domain">{domain}</div>
      <div className="battle-browser">
        <div className="battle-browser-bar">
          <span className="battle-browser-dots" aria-hidden="true"><i/><i/><i/></span>
          <span className="battle-browser-url">{domain}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={"Open " + domain + " in a new tab"}><ExternalLink size={14}/></a>
        </div>
        <div className="battle-viewport">
          {preview.src && <img src={preview.src} alt={"Screenshot of " + domain} onLoad={loaded} onError={imageFailed}/>}
          {pending && <div className="battle-viewport-progress" aria-label={"Capturing " + domain}>
            <Globe2 size={30} aria-hidden="true"/>
            <span>Getting the website preview</span>
            <small>Capturing the public homepage</small>
          </div>}
          {preview.status === "failed" && <div className="battle-viewport-error">
            <Globe2 size={28} aria-hidden="true"/>
            <strong>Preview unavailable</strong>
            <p>{preview.message}</p>
            <button type="button" onClick={retry}><RefreshCw size={14}/> Retry screenshot</button>
          </div>}
          {preview.status === "loaded" && <button type="button" className="battle-expand" onClick={() => dialog.current?.showModal()} aria-label={"Expand screenshot of " + domain}><Maximize2 size={17}/> Expand</button>}
        </div>
      </div>
      <div className="battle-site-foot">
        <a href={url} target="_blank" rel="noopener noreferrer">Visit website <ArrowUpRight size={15}/></a>
        {preview.status === "loaded" && <span><CheckCircle2 size={15}/> Screenshot available</span>}
        {preview.status === "failed" && <button type="button" onClick={retry}><RefreshCw size={14}/> Retry</button>}
      </div>
      <dialog ref={dialog} className="battle-lightbox" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }} onClose={() => setZoom(1)} aria-label={"Expanded screenshot of " + domain}>
        <div className="battle-lightbox-inner">
          <div className="battle-lightbox-toolbar">
            <span>{domain}</span>
            <div>
              <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - .25).toFixed(2)))} disabled={zoom <= 1} aria-label="Zoom out"><Minus size={18}/></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + .25).toFixed(2)))} disabled={zoom >= 3} aria-label="Zoom in"><Plus size={18}/></button>
              <button type="button" onClick={() => dialog.current?.close()} aria-label="Close expanded screenshot"><X size={21}/></button>
            </div>
          </div>
          <div className="battle-lightbox-scroll">{preview.src && <img src={preview.src} style={{ width: (zoom * 100) + "%" }} alt={"Full screenshot preview of " + domain}/>}</div>
        </div>
      </dialog>
    </article>
  );
}

function Stage({ number, title, description, state }: {
  number: string; title: string; description: string;
  state: "queued" | "working" | "complete" | "limited";
}) {
  return <div className={"battle-stage battle-stage--" + state}>
    <span className="battle-stage-index">{number}</span>
    <div className="battle-stage-text"><strong>{title}</strong><small>{description}</small></div>
    <span className={"battle-stage-state " + (state === "complete" ? "is-done" : state === "limited" ? "is-limited" : "")} aria-label={state}>
      {state === "complete" ? <CheckCircle2 size={17}/> : state === "working" ? <LoaderCircle size={17} className="battle-spin"/> : state === "limited" ? <Globe2 size={17}/> : <Circle size={15}/>}
      <span>{state === "working" ? "Checking" : state === "complete" ? "Done" : state === "limited" ? "Limited" : "Queued"}</span>
    </span>
  </div>;
}

export default function BattleRoom({ ownSite, competitorSite }: { ownSite: string; competitorSite: string }) {
  const ownPreview = useWebsitePreview(ownSite);
  const competitorPreview = useWebsitePreview(competitorSite);
  const [active, setActive] = useState<"own" | "competitor">("own");
  const [inspection, setInspection] = useState<BattleInspection | null>(null);
  const [inspectionStatus, setInspectionStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [inspectionError, setInspectionError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const urlParams = new URLSearchParams({ own: ownSite, competitor: competitorSite });
  const reportURL = "/results?" + urlParams.toString();
  const editURL = "/?" + urlParams.toString() + "#compare";
  const snapshotKey = "vsyde:report:" + urlParams.toString();
  useEffect(() => {
    const controller = new AbortController();
    setInspection(null);
    setInspectionStatus("loading");
    setInspectionError("");
    fetch("/api/battle/inspect?" + new URLSearchParams({ own: ownSite, competitor: competitorSite }), {
      signal: controller.signal, cache: "no-store",
    })
      .then(async response => {
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Page content could not be inspected.");
        }
        return response.json() as Promise<BattleInspection>;
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setInspection(data);
        setInspectionStatus("ready");
        try { sessionStorage.setItem(snapshotKey, JSON.stringify(data)); } catch { /* storage can be restricted */ }
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setInspectionError(error instanceof Error ? error.message : "Unable to inspect page content.");
        setInspectionStatus("failed");
      });
    return () => controller.abort();
  }, [ownSite, competitorSite, attempt, snapshotKey]);

  const screenshotsPending = [ownPreview.preview, competitorPreview.preview].some(p => p.status === "loading" || p.status === "ready");
  const screenshotsLimited = [ownPreview.preview, competitorPreview.preview].some(p => p.status === "failed");
  const scanDone = !screenshotsPending;
  const inspectionDone = inspectionStatus === "ready";
  const extracted = inspectionDone && inspection?.status !== "unavailable";
  const comparisonReady = inspectionDone;
  const pageA: InspectionSite | undefined = inspection?.own;
  const pageB: InspectionSite | undefined = inspection?.competitor;
  const observed = inspection ? [inspection.own,inspection.competitor].flatMap(site =>
    site.status === "inspected" ? site.signals.filter(signal => signal.observed).slice(0, 2).map(signal => ({
      domain:site.domain, label:signal.label, excerpt:signal.excerpt,
    })) : []
  ).slice(0, 3) : [];
  const readSummary = inspectionDone ? (inspection?.summary || "") : inspectionStatus === "failed" ? inspectionError : "Reading publicly visible page content.";
  const status = inspectionStatus === "failed" ? "Limited check" : comparisonReady ? "Evidence ready" : "Checking websites";

  return <div className="battle-page">
    <header className="battle-header">
      <div className="battle-nav battle-width">
        <Link href="/" className="battle-brand" aria-label="vsyde homepage"><img src="/icon.png" alt="" width={35} height={35}/><strong>vsyde</strong></Link>
        <div className="battle-nav-right">
          <span className="battle-nav-tag">Battle Room</span>
          <ThemeToggle variant="icon"/>
          <Link href={editURL} className="battle-back" aria-label="Edit websites"><ArrowLeft size={18}/><span>Edit websites</span></Link>
        </div>
      </div>
    </header>
    <main className="battle-main battle-width">
      <div className="battle-heading">
        <div><span className="battle-kicker"><Sparkles size={15}/> WEBSITE INTELLIGENCE</span>
          <h1>Your battle starts here<span>.</span></h1>
          <p>Inspect both websites, explore their pages, and uncover visible signals that matter to buyers.</p>
        </div>
        <span className={"battle-global-status " + (comparisonReady ? "is-ready" : inspectionStatus === "failed" ? "is-limited" : "")}>
          {comparisonReady ? <CheckCircle2 size={17}/> : inspectionStatus === "failed" ? <Globe2 size={17}/> : <LoaderCircle size={17} className="battle-spin"/>}
          {status}
        </span>
      </div>

      <div className="battle-mobile-picker" role="group" aria-label="Website screenshot selection">
        <button type="button" aria-pressed={active === "own"} className={active === "own" ? "selected" : ""} onClick={() => setActive("own")}>Your website</button>
        <button type="button" aria-pressed={active === "competitor"} className={active === "competitor" ? "selected" : ""} onClick={() => setActive("competitor")}>Competitor</button>
      </div>
      <section className="battle-sites" aria-label="Compared websites">
        <SiteCard url={ownSite} label="YOUR WEBSITE" slot="one" active={active === "own"} previewer={ownPreview}/>
        <div className="battle-versus" aria-hidden="true">VS</div>
        <SiteCard url={competitorSite} label="COMPETITOR" slot="two" active={active === "competitor"} previewer={competitorPreview}/>
      </section>

      <div className="battle-info-grid">
        <section className="battle-steps" aria-labelledby="battle-stages-title">
          <div className="battle-section-title"><div><span className="battle-section-overline">BATTLE WORKFLOW</span><h2 id="battle-stages-title">Analysis stages</h2></div><ShieldCheck size={21}/></div>
          <div className="battle-stage-list">
            <Stage number="01" title="Website screenshots" description="Public homepage capture" state={screenshotsPending ? "working" : screenshotsLimited ? "limited" : "complete"}/>
            <Stage number="02" title="Page content inspection" description="Collect visible homepage text" state={inspectionStatus === "loading" ? "working" : inspectionStatus === "failed" ? "limited" : inspection?.status === "unavailable" ? "limited" : "complete"}/>
            <Stage number="03" title="Offer & first impression" description="Headline and action links" state={!inspectionDone ? "queued" : extracted ? "complete" : "limited"}/>
            <Stage number="04" title="Trust & pricing signals" description="Check available on-page evidence" state={!inspectionDone ? "queued" : extracted ? "complete" : "limited"}/>
            <Stage number="05" title="Preliminary findings" description="Evidence coverage and comparison" state={!inspectionDone ? "queued" : inspection?.status === "complete" ? "complete" : "limited"}/>
          </div>
        </section>
        <aside className="battle-insights" aria-labelledby="battle-insights-title">
          <div className="battle-insights-icon"><ScanSearch size={23}/></div>
          <span className="battle-section-overline">EVIDENCE FIRST</span>
          <h2 id="battle-insights-title">Quick insights</h2>
          <p aria-live="polite">{readSummary}</p>
          {inspection && <div className="battle-insight-bar"><span className="battle-insight-bullet"/><span>{pageA?.domain}: {pageA?.signals.filter(s => s.observed).length} signals found · {pageB?.domain}: {pageB?.signals.filter(s => s.observed).length} signals found</span></div>}
          {observed.length > 0 && <div className="battle-observed" aria-label="Observed homepage signals">
            {observed.map((item,index) => <div key={item.domain+item.label+index}><span>{item.domain} · {item.label}</span><strong>{item.excerpt}</strong></div>)}
          </div>}
          {inspection && <p className="battle-scope-note">Live screenshots and detected text are separate checks. Missing evidence is not proof of a weaker business.</p>}
          {comparisonReady && <Link className="battle-result-button" href={reportURL}>View Battle Report <ArrowRight size={18}/></Link>}
          {(inspectionStatus === "failed" || (inspectionDone && inspection?.status !== "complete")) && <button className="battle-retry-inspect" type="button" onClick={() => setAttempt(a => a + 1)}>Retry page reading <RefreshCw size={16}/></button>}
          <Link href={editURL} className="battle-new"><ArrowLeft size={17}/> Edit website addresses</Link>
        </aside>
      </div>
    </main>
    <footer className="battle-footer battle-width"><span>© {new Date().getFullYear()} vsyde</span><a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a></footer>
  </div>;
}
