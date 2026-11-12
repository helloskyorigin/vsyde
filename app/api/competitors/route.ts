import { NextRequest, NextResponse } from "next/server";
import { validatePublicWebsite, allowRequest, requestIdentity } from "@/lib/battle-security";
import { candidatesFromHits, parseBingRSS, searchQuery, type RawSearchHit } from "@/lib/competitor-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function pageContext(site: URL): Promise<{ query: string; title: string }> {
  // Same fixed public-page reader as our inspection API; no direct server-side request to arbitrary hosts.
  try {
    const response = await fetch("https://r.jina.ai/" + site.href, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10500),
      headers: { Accept:"text/plain", "X-Respond-With":"markdown" },
    });
    if (!response.ok) throw new Error("Reader unavailable");
    const markdown = (await response.text()).slice(0, 32_000);
    return searchQuery(markdown, site.hostname);
  } catch {
    return searchQuery("", site.hostname);
  }
}

async function webHits(query: string): Promise<{ provider: string; hits: RawSearchHit[] }> {
  if (process.env.SERPER_API_KEY) {
    const result = await fetch("https://google.serper.dev/search", {
      method: "POST", redirect: "error", cache:"no-store", signal:AbortSignal.timeout(10500),
      headers: { "Content-Type":"application/json", "X-API-KEY":process.env.SERPER_API_KEY },
      body: JSON.stringify({q:query,num:20}),
    });
    if (!result.ok) throw new Error("Search provider unavailable");
    const data = await result.json() as { organic?: {title:string;link:string;snippet?:string}[] };
    return { provider:"web search", hits:(data.organic || []).map(h=>({title:h.title,url:h.link,description:h.snippet || ""})) };
  }
  if (process.env.BRAVE_SEARCH_API_KEY) {
    const result = await fetch("https://api.search.brave.com/res/v1/web/search?" + new URLSearchParams({q:query,count:"20"}), {
      redirect:"error",cache:"no-store",signal:AbortSignal.timeout(10500),
      headers: {"Accept":"application/json","X-Subscription-Token":process.env.BRAVE_SEARCH_API_KEY},
    });
    if (!result.ok) throw new Error("Search provider unavailable");
    const data = await result.json() as {web?:{results?:{title:string;url:string;description?:string}[]}};
    return {provider:"web search",hits:(data.web?.results || []).map(h=>({title:h.title,url:h.url,description:h.description || ""}))};
  }
  // Key-free best-effort fallback; if the public feed is unavailable, show an honest error.
  const response = await fetch("https://www.bing.com/search?" + new URLSearchParams({format:"rss",q:query}), {
    redirect:"error",cache:"no-store",signal:AbortSignal.timeout(10500),
    headers: {Accept:"application/rss+xml, application/xml"},
  });
  if (!response.ok) throw new Error("Search index unavailable");
  return { provider:"public search", hits:parseBingRSS((await response.text()).slice(0,180_000)) };
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!allowRequest(requestIdentity(request.headers,"competitor-search"),3)) {
    return NextResponse.json({error:"Search limit reached. Try again in a minute."},{status:429,headers:{"Cache-Control":"no-store"}});
  }
  const site = await validatePublicWebsite(request.nextUrl.searchParams.get("site") || "");
  if (!site) return NextResponse.json({error:"Enter an accessible public website first."},{status:400});
  const context = await pageContext(site);
  try {
    const result = await webHits(context.query);
    const candidates = candidatesFromHits(result.hits,site.hostname);
    return NextResponse.json({
      site:site.origin, title:context.title, source:result.provider, suggestions:candidates,
      note:"Search suggestions are not independently verified direct competitors. Check each site before comparing.",
    },{headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch {
    return NextResponse.json({error:"Competitor search is temporarily unavailable. You can still enter a competitor URL manually."},
      {status:503,headers:{"Cache-Control":"no-store"}});
  }
}
