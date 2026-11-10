"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowLeft, ArrowUpRight, Check, CheckCircle2, Circle,
  ExternalLink, Globe2, LoaderCircle, RefreshCw, ShieldCheck,
  Sparkles, WandSparkles,
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
    setPreview({ status: "loading", src: "", message: "" });
    async function load() {
      try {
        const response = await fetch("/api/battle/preview?url=" + encodeURIComponent(address), {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          const body: { error?: string } | null = await response.json().catch(() => null);
          throw new Error(body?.error || "Website preview could not be loaded.");
        }
        const file = await response.blob();
        if (!file.type.startsWith("image/")) throw new Error("No website image was available.");
        if (disposed) return;
        blobURL = URL.createObjectURL(file);
        setPreview({ status: "ready", src: blobURL, message: "" });
      } catch (err) {
        if (disposed || controller.signal.aborted) return;
        const text = err instanceof Error ? err.message : "Website preview could not be loaded.";
        setPreview({ status: "failed", src: "", message: text });
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
  const loaded = () => setPreview(state => state.status === "ready" ? { ...state, status: "loaded" } : state);
  const imageFailed = () => setPreview(state => ({ ...state, status: "failed", message: "This website's screenshot could not be displayed." }));
  return { preview, retry, loaded, imageFailed };
}

type PreviewHook = ReturnType<typeof useWebsitePreview>;
function statusText(status: PreviewStatus) {
  if (status === "loaded") return "Preview ready";
  if (status === "failed") return "Unavailable";
  return "Capturing";
}

function SiteCard({ url, label, number, previewer }: { url: string; label: string; number: "one" | "two"; previewer: PreviewHook }) {
  const domain = new URL(url).hostname;
  const { preview, retry, loaded, imageFailed } = previewer;
  const pending = preview.status === "loading" || preview.status === "ready";
  return (
    <article className={"battle-site battle-site--" + number} aria-label={label + ": " + domain}>
      <div className="battle-site-top">
        <span className="battle-site-role"><span className="battle-dot"/>{label}</span>
        <span className={"battle-status battle-status--" + preview.status} aria-live="polite">
          {preview.status === "loaded" && <CheckCircle2 size={14} aria-hidden="true"/>}
          {pending && <LoaderCircle size={14} aria-hidden="true" className="battle-spin"/>}
          {statusText(preview.status)}
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
          {preview.src && <img src={preview.src} alt={"Screenshot preview of " + domain} onLoad={loaded} onError={imageFailed}/>}
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
        </div>
      </div>
      <div className="battle-site-foot">
        <a href={url} target="_blank" rel="noopener noreferrer">Visit website <ArrowUpRight size={15}/></a>
        {preview.status === "loaded" && <span><Check size={15}/> Screenshot available</span>}
        {preview.status === "failed" && <button type="button" onClick={retry}><RefreshCw size={14}/> Retry</button>}
      </div>
    </article>
  );
}

const stages = [
  { number: "01", title: "Website inspection", description: "Public homepage previews" },
  { number: "02", title: "Offer & first impression", description: "Value proposition and clarity" },
  { number: "03", title: "Trust & credibility", description: "Proof, reassurance and confidence" },
  { number: "04", title: "Pricing & conversion path", description: "Prices, next steps and friction" },
  { number: "05", title: "Final verdict", description: "Evidence-led comparison" },
];

export default function BattleRoom({ ownSite, competitorSite }: { ownSite: string; competitorSite: string }) {
  const ownPreview = useWebsitePreview(ownSite);
  const competitorPreview = useWebsitePreview(competitorSite);
  const ready = ownPreview.preview.status === "loaded" && competitorPreview.preview.status === "loaded";
  const limited = ownPreview.preview.status === "failed" || competitorPreview.preview.status === "failed";
  const captureStatus = ready ? "Captured" : limited ? "Limited" : "Capturing";
  const captureDescription = ready
    ? "Both website previews are available."
    : limited ? "One or more previews could not be captured."
    : "Collecting public website previews.";

  return (
    <div className="battle-page">
      <header className="battle-header">
        <div className="battle-nav battle-width">
          <Link href="/" className="battle-brand" aria-label="vsyde homepage"><img src="/icon.png" alt="" width={35} height={35}/><strong>vsyde</strong></Link>
          <div className="battle-nav-right">
            <span className="battle-nav-tag">Battle Room</span>
            <ThemeToggle variant="icon"/>
            <Link href="/#compare" className="battle-back" aria-label="Start another comparison"><ArrowLeft size={18}/><span>Edit websites</span></Link>
          </div>
        </div>
      </header>
      <main className="battle-main battle-width">
        <div className="battle-heading">
          <div><span className="battle-kicker"><Sparkles size={15}/> WEBSITE INTELLIGENCE</span>
            <h1>Your battle starts here<span>.</span></h1>
            <p>Two websites. One clear view. Explore the actual pages as your comparison takes shape.</p>
          </div>
          <span className={"battle-global-status " + (ready ? "is-ready" : limited ? "is-limited" : "")}>
            {ready ? <CheckCircle2 size={17}/> : limited ? <Globe2 size={17}/> : <LoaderCircle size={17} className="battle-spin"/>}
            {ready ? "Previews ready" : limited ? "Limited preview" : "Capturing websites"}
          </span>
        </div>

        <section className="battle-sites" aria-label="Compared websites">
          <SiteCard url={ownSite} label="YOUR WEBSITE" number="one" previewer={ownPreview}/>
          <div className="battle-versus" aria-hidden="true">VS</div>
          <SiteCard url={competitorSite} label="COMPETITOR" number="two" previewer={competitorPreview}/>
        </section>

        <div className="battle-info-grid">
          <section className="battle-steps" aria-labelledby="battle-stages-title">
            <div className="battle-section-title"><div><span className="battle-section-overline">BATTLE WORKFLOW</span><h2 id="battle-stages-title">Analysis stages</h2></div><ShieldCheck size={21}/></div>
            <div className="battle-stage-list">
              {stages.map((stage, i) => (
                <div className={"battle-stage " + (i === 0 ? "battle-stage--current" : "")} key={stage.number}>
                  <span className="battle-stage-index">{stage.number}</span>
                  <div className="battle-stage-text"><strong>{stage.title}</strong><small>{i === 0 ? captureDescription : stage.description}</small></div>
                  {i === 0 ? <span className={"battle-stage-state " + (ready ? "is-done" : limited ? "is-limited" : "")}>{ready ? <CheckCircle2 size={16}/> : limited ? <Globe2 size={16}/> : <LoaderCircle size={16} className="battle-spin"/>}{captureStatus}</span> : <Circle size={15} className="battle-stage-upcoming" aria-label="Not started"/>}
                </div>
              ))}
            </div>
          </section>
          <aside className="battle-insights" aria-labelledby="battle-insights-title">
            <div className="battle-insights-icon"><WandSparkles size={23}/></div>
            <span className="battle-section-overline">COMING INTO FOCUS</span>
            <h2 id="battle-insights-title">AI insights</h2>
            <p>Category findings, supporting evidence and the final verdict belong here as each analysis stage is completed.</p>
            <div className="battle-insight-bar"><span className="battle-insight-bullet"/><span>{captureDescription}</span></div>
            <Link href="/#compare" className="battle-new"><ArrowLeft size={17}/> Compare different websites</Link>
          </aside>
        </div>
      </main>
      <footer className="battle-footer battle-width"><span>© {new Date().getFullYear()} vsyde</span><a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a></footer>
    </div>
  );
}
