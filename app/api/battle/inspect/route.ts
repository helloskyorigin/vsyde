import { NextRequest, NextResponse } from "next/server";
import { validatePublicWebsite, allowRequest, requestIdentity } from "@/lib/battle-security";
import { sameWebsite } from "@/lib/url-validation";
import type { BattleInspection, InspectionSite, SignalKey, EvidenceSignal } from "@/lib/battle-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const KEYS: { key: SignalKey; label: string }[] = [
  { key: "headline", label: "Page headline" },
  { key: "action", label: "Action link" },
  { key: "pricing", label: "Pricing information" },
  { key: "trust", label: "Trust or support information" },
];

function clean(line: string): string {
  return line.replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, " ").replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#*_~|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}
function parseSignals(input: string): { title: string; signals: EvidenceSignal[] } {
  const lines = input.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
  const title = clean(lines.find(v => /^Title:\s*/i.test(v))?.replace(/^Title:\s*/i, "") || "");
  const contentLines = lines.filter(v => !/^(Title|URL Source|Markdown Content|Content type|Source):/i.test(v)).slice(0, 1800);
  const headline = contentLines.find(v => /^#\s+\S/.test(v));
  const links = contentLines.filter(v => /\[[^\]]{2,70}\]\(https?:\/\//i.test(v));
  const action = links.find(v => /\b(get started|start free|sign up|try free|book a demo|request demo|contact sales|buy now|join now|start now|schedule a demo|request access|create account)\b/i.test(v));
  const price = contentLines.find(v => /(?:[$€£]\s?\d{1,5}(?:[,.]\d{1,2})?\b|\b(?:usd|eur|gbp|inr)\s?\d{1,6}\b|\b(?:per month|\/month|\/year|starting at|pricing plans)\b)/i.test(v));
  const trust = contentLines.find(v => /\b(testimonials?|customer stories|case studies|reviews?|trusted by|security|privacy policy|support center|contact us|help center)\b/i.test(v));
  const chosen: Record<SignalKey,string|undefined> = { headline, action, pricing:price, trust };
  return {
    title: title || clean(headline || "") || "Public homepage",
    signals: KEYS.map(({ key, label }) => ({
      key, label, observed: Boolean(chosen[key]),
      excerpt: chosen[key] ? clean(chosen[key]!) : "",
    })),
  };
}

async function readSite(url: URL): Promise<InspectionSite> {
  const base: InspectionSite = {
    url: url.href, domain: url.hostname, title: "Public homepage",
    status: "unavailable", signals: KEYS.map(({ key, label }) => ({ key, label, observed: false, excerpt: "" })),
  };
  try {
    // The server contacts this fixed external reader endpoint, not the user-supplied site.
    const requestURL = "https://r.jina.ai/" + url.href;
    const response = await fetch(requestURL, {
      redirect: "error", cache: "no-store", signal: AbortSignal.timeout(19000),
      headers: { Accept: "text/plain", "X-Respond-With": "markdown" },
    });
    if (!response.ok || !response.body) {
      return { ...base, note: response.status === 429 ? "Page reading is temporarily rate limited." : "Public page text was not accessible." };
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (bytes < 160_000) {
        const item = await reader.read();
        if (item.done) break;
        chunks.push(item.value);
        bytes += item.value.byteLength;
      }
    } finally { await reader.cancel().catch(() => {}); }
    const decoder = new TextDecoder();
    const markdown = chunks.map(chunk => decoder.decode(chunk, { stream: true })).join("") + decoder.decode();
    if (markdown.trim().length < 65) return { ...base, note: "Not enough public page content was available." };
    const parsed = parseSignals(markdown);
    return { ...base, status: "inspected", title: parsed.title, signals: parsed.signals, inspectedAt: new Date().toISOString() };
  } catch {
    return { ...base, note: "The website content could not be inspected at this time." };
  }
}
export async function GET(request: NextRequest): Promise<Response> {
  if (!allowRequest(requestIdentity(request.headers,"inspect"), 4)) {
    return NextResponse.json({ error: "Too many comparisons. Please try again shortly." }, { status: 429, headers: { "Cache-Control": "no-store" } });
  }
  const ownRaw = request.nextUrl.searchParams.get("own") || "";
  const competitorRaw = request.nextUrl.searchParams.get("competitor") || "";
  const [own, competitor] = await Promise.all([validatePublicWebsite(ownRaw), validatePublicWebsite(competitorRaw)]);
  if (!own || !competitor || sameWebsite(own, competitor)) {
    return NextResponse.json({ error: "Enter two different, accessible public websites." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const [siteA, siteB] = await Promise.all([readSite(own), readSite(competitor)]);
  const complete = siteA.status === "inspected" && siteB.status === "inspected";
  const any = siteA.status === "inspected" || siteB.status === "inspected";
  const counts = [siteA, siteB].map(s => s.signals.filter(item => item.observed).length);
  let summary = "Unable to compare the available website content.";
  let leader: "own" | "competitor" | null = null;
  if (complete) {
    if (Math.abs(counts[0] - counts[1]) >= 2 && Math.max(...counts) >= 3) {
      leader = counts[0] > counts[1] ? "own" : "competitor";
      summary = (leader === "own" ? siteA.domain : siteB.domain) + " has more detectable on-page signals in this limited check.";
    } else {
      summary = "Both pages show a similar number of detectable signals.";
    }
  } else if (any) {
    summary = "Only one homepage could be inspected, so a fair comparison is not available.";
  }
  const payload: BattleInspection = {
    status: complete ? "complete" : any ? "partial" : "unavailable",
    createdAt: new Date().toISOString(),
    own: siteA, competitor: siteB,
    summary, leader,
    methodology: "Automated public-homepage text checks. A detected keyword or link does not verify trustworthiness, buyer behavior, conversion performance or the quality of an offer.",
  };
  return NextResponse.json(payload, { headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
