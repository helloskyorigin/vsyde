export type Candidate = { name: string; url: string; domain: string; description: string };
export type RawSearchHit = { title: string; url: string; description: string };

const EXCLUDED = [
  "google.com", "bing.com", "yahoo.com", "duckduckgo.com", "reddit.com",
  "quora.com", "youtube.com", "facebook.com", "linkedin.com", "instagram.com",
  "x.com", "twitter.com", "medium.com", "wikipedia.org", "g2.com",
  "capterra.com", "alternativeto.net", "producthunt.com", "trustpilot.com",
  "techcrunch.com", "forbes.com", "zapier.com", "blogspot.com",
];

function cleaned(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/&(?:amp|#38);/gi, "&")
    .replace(/&(?:quot|#34);/gi, '"').replace(/&(?:apos|#39);/gi, "'")
    .replace(/&(?:lt|#60);/gi, "<").replace(/&(?:gt|#62);/gi, ">")
    .replace(/\s+/g, " ").trim().slice(0, 240);
}
export function domainOf(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    const name = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!name.includes(".") || name.length > 150 || url.port && !["80","443"].includes(url.port)) return null;
    return name;
  } catch { return null; }
}
export function parseBingRSS(xml: string): RawSearchHit[] {
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)).slice(0, 25).map(([, item]) => ({
    title: cleaned(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""),
    url: cleaned(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || ""),
    description: cleaned(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || ""),
  }));
}
export function candidatesFromHits(hits: RawSearchHit[], ownDomain: string): Candidate[] {
  const seen = new Set<string>([ownDomain.replace(/^www\./,"").toLowerCase()]);
  const results: Candidate[] = [];
  for (const hit of hits) {
    const domain = domainOf(hit.url);
    if (!domain || seen.has(domain) || EXCLUDED.some(blocked => domain === blocked || domain.endsWith("." + blocked))) continue;
    const url = new URL(hit.url);
    const lowerPath = url.pathname.toLowerCase();
    if (/(\/blog\/|\/news\/|\/articles?\/|\/alternatives?\/|\/compare\/|\/reviews?\/|\/posts?\/|\/202[0-9]\/)/.test(lowerPath)) continue;
    seen.add(domain);
    const name = cleaned(hit.title).split(/\s+[-|–—]\s+/)[0].slice(0, 64) || domain;
    results.push({name,domain,url:url.origin + "/",description:cleaned(hit.description).slice(0, 180)});
    if (results.length === 6) break;
  }
  return results;
}
export function searchQuery(markdown: string, fallbackDomain: string): { query: string; title: string } {
  const title = cleaned(markdown.match(/^Title:\s*(.+)$/mi)?.[1] || "").slice(0, 95);
  const firstHeading = cleaned(markdown.match(/^#\s+(.+)$/m)?.[1] || "");
  const base = (title || firstHeading || fallbackDomain.split(".")[0]).split(/\s+[-|–—]\s+/)[0];
  // Avoid sending an entire page, user-supplied search operators or URL as a search query.
  const brand = base.replace(/[^\p{L}\p{N} .-]/gu, " ").replace(/\s+/g," ").trim().slice(0, 65);
  const terms = firstHeading.replace(/[^\p{L}\p{N} .-]/gu, " ").replace(/\s+/g," ").trim().slice(0, 95);
  return { query: [brand, "alternatives competitors", terms && !terms.toLowerCase().includes(brand.toLowerCase()) ? terms : ""].filter(Boolean).join(" ").slice(0, 160), title: title || fallbackDomain };
}
