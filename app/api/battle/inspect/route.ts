import { NextRequest, NextResponse } from "next/server";
import { validatePublicWebsite, allowRequest, requestIdentity } from "@/lib/battle-security";
import { sameWebsite } from "@/lib/url-validation";
import type { BattleInspection, InspectionSite, InspectedPage, EvidenceSignal } from "@/lib/battle-types";
import { emptySignals, parseHomepage } from "@/lib/page-signal-parser";
import { discoverInspectionPages, type PageRole } from "@/lib/site-page-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

async function readPublicText(address: string, timeout: number): Promise<string | null> {
  // Only call the fixed third-party public text reader. Never fetch an arbitrary
  // user-supplied hostname directly from the server.
  try {
    const response = await fetch("https://r.jina.ai/" + address, {
      redirect:"error",cache:"no-store",signal:AbortSignal.timeout(timeout),
      headers:{Accept:"text/plain","X-Respond-With":"markdown","X-Cache-Tolerance":"300"},
    });
    if (!response.ok || !response.body) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (bytes < 110_000) {
        const item = await reader.read();
        if (item.done) break;
        chunks.push(item.value);
        bytes += item.value.byteLength;
      }
    } finally { await reader.cancel().catch(() => {}); }
    const decoder = new TextDecoder();
    return chunks.map(chunk => decoder.decode(chunk,{stream:true})).join("") + decoder.decode();
  } catch { return null; }
}

function createPage(address: string, role: PageRole, markdown: string | null): InspectedPage {
  const blank: InspectedPage = {
    url:address,role,title:role === "homepage" ? "Homepage" : role,
    status:"unavailable",signals:emptySignals(),
  };
  if (!markdown) return {...blank,note:"Page text unavailable or blocked."};
  const parsed = parseHomepage(markdown);
  if (!parsed.usable) return {...blank,note:"Not enough readable public content."};
  return {
    ...blank,status:"inspected",title:parsed.title,
    signals:parsed.signals.map(s => ({...s,sourceUrl:s.observed ? address : undefined})),
  };
}

function combineSignals(pages: InspectedPage[]): EvidenceSignal[] {
  const checked = pages.filter(p=>p.status === "inspected");
  return emptySignals().map(blank => {
    // A heading from /about is not evidence of homepage offer clarity.
    const possible = blank.key === "headline" ? checked.filter(p=>p.role === "homepage") : checked;
    const found = possible.flatMap(p=>p.signals).find(s=>s.key === blank.key && s.observed);
    return found ? {...found} : blank;
  });
}

async function readSite(site: URL): Promise<InspectionSite> {
  const base: InspectionSite = {
    url:site.href,domain:site.hostname,title:"Public homepage",
    status:"unavailable",signals:emptySignals(),pages:[],
  };
  const homepageText = await readPublicText(site.href,12000);
  const home = createPage(site.href,"homepage",homepageText);
  if (home.status !== "inspected" || !homepageText) {
    return {...base,pages:[home],note:"Homepage was not readable; linked pages could not safely be discovered."};
  }
  // Scan only first-party pages discovered from actual public navigation.
  // A missing or inaccessible page stays explicitly marked as uninspected.
  const targets = discoverInspectionPages(homepageText,site).slice(0,3);
  const others = await Promise.all(targets.map(async target => createPage(
    target.url,target.role,await readPublicText(target.url,10000)
  )));
  const pages = [home,...others];
  const inspected = pages.filter(p=>p.status === "inspected").length;
  return {
    ...base,title:home.title,status:"inspected",signals:combineSignals(pages),pages,
    inspectedAt:new Date().toISOString(),
    note:inspected < pages.length
      ? String(inspected) + " of " + pages.length + " discovered pages readable."
      : targets.length === 0
        ? "Only the homepage was linked in the supported page categories."
        : undefined,
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!allowRequest(requestIdentity(request.headers,"inspect"),4)) {
    return NextResponse.json({error:"Too many comparisons. Please try again shortly."},{status:429,headers:{"Cache-Control":"no-store"}});
  }
  const [own,competitor] = await Promise.all([
    validatePublicWebsite(request.nextUrl.searchParams.get("own") || ""),
    validatePublicWebsite(request.nextUrl.searchParams.get("competitor") || ""),
  ]);
  if (!own || !competitor || sameWebsite(own,competitor)) {
    return NextResponse.json({error:"Enter two different, accessible public websites."},
      {status:400,headers:{"Cache-Control":"no-store"}});
  }
  const [siteA,siteB] = await Promise.all([readSite(own),readSite(competitor)]);
  const complete = siteA.status === "inspected" && siteB.status === "inspected";
  const any = siteA.status === "inspected" || siteB.status === "inspected";
  const counts = [siteA,siteB].map(s=>s.signals.filter(item=>item.observed).length);
  const coverage = [siteA,siteB].map(s=>s.pages?.filter(p=>p.status === "inspected").length || 0);
  let summary = "Unable to compare the available public website content.";
  let leader: "own" | "competitor" | null = null;
  if (complete) {
    if (Math.abs(coverage[0]-coverage[1]) > 1) {
      summary = "Page coverage differs substantially between sites; avoid drawing a winner from this scan.";
    } else if (Math.abs(counts[0]-counts[1]) >= 2 && Math.max(...counts) >= 3) {
      leader = counts[0] > counts[1] ? "own" : "competitor";
      summary = (leader === "own" ? siteA.domain : siteB.domain) +
        " has more detectable signals across the inspected public pages.";
    } else {
      summary = "The inspected public pages show a similar number of detectable signals.";
    }
  } else if (any) {
    summary = "Only one website could be inspected; a fair comparison is unavailable.";
  }
  const payload: BattleInspection = {
    status:complete ? "complete" : any ? "partial" : "unavailable",
    createdAt:new Date().toISOString(),own:siteA,competitor:siteB,summary,leader,
    methodology:"Up to four linked first-party pages per website: homepage, pricing, features/product, and trust/about. Only pages discovered in public navigation are requested. Signals are text detections with individual source URLs; inaccessible and undiscovered pages are not inspected. No conversion or buyer behavior measurement.",
  };
  return NextResponse.json(payload,{headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
