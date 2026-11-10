import { NextRequest, NextResponse } from "next/server";
import { validatePublicWebsite, allowRequest, requestIdentity } from "@/lib/battle-security";
import { sameWebsite } from "@/lib/url-validation";
import type { BattleInspection, InspectionSite } from "@/lib/battle-types";
import { emptySignals, parseHomepage } from "@/lib/page-signal-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function readSite(url: URL): Promise<InspectionSite> {
  const base: InspectionSite = {
    url: url.href, domain: url.hostname, title: "Public homepage",
    status: "unavailable", signals: emptySignals(),
  };
  try {
    // The server contacts this fixed external reader endpoint, not the user-supplied site.
    const requestURL = "https://r.jina.ai/" + url.href;
    const response = await fetch(requestURL, {
      redirect: "error", cache: "no-store", signal: AbortSignal.timeout(19000),
      headers: { Accept: "text/plain", "X-Respond-With": "markdown", "X-Cache-Tolerance": "300" },
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
    const parsed = parseHomepage(markdown);
    if (!parsed.usable) return { ...base, note: "Not enough public page content was available." };
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
