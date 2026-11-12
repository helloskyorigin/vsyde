export type Candidate = { name: string; url: string; domain: string; description: string };
export type RawSearchHit = { title: string; url: string; description: string };
export type SearchContext = { query: string; title: string; category: string; keywords: string[] };

const EXCLUDED = [
  "google.com", "bing.com", "yahoo.com", "duckduckgo.com", "reddit.com",
  "quora.com", "youtube.com", "facebook.com", "linkedin.com", "instagram.com",
  "x.com", "twitter.com", "medium.com", "wikipedia.org", "g2.com",
  "capterra.com", "alternativeto.net", "producthunt.com", "trustpilot.com",
  "techcrunch.com", "forbes.com", "zapier.com", "blogspot.com", "stackshare.io",
  "saashub.com", "sourceforge.net", "getapp.com", "softwareadvice.com",
  "slashdot.org", "ycombinator.com", "github.com",
];

function cleaned(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/&(?:amp|#38);/gi, "&")
    .replace(/&(?:quot|#34);/gi, '"').replace(/&(?:apos|#39);/gi, "'")
    .replace(/&(?:lt|#60);/gi, "<").replace(/&(?:gt|#62);/gi, ">")
    .replace(/\s+/g, " ").trim().slice(0, 300);
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
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)).slice(0, 30).map(([, item]) => ({
    title: cleaned(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""),
    url: cleaned(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || ""),
    description: cleaned(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || ""),
  }));
}

// Category matching deliberately uses product-specific phrases, not generic brand titles.
const CATEGORIES: {category:string; keywords:string[]; patterns:RegExp[]}[] = [
  {category:"AI meeting notes and transcription",keywords:["meeting","transcription","notes"],patterns:[/\bmeeting (?:notes|assistant|recording|transcripts?)\b/i,/\b(?:transcri(?:be|ption)|notetaker|note.taker)\b/i]},
  {category:"social media scheduling",keywords:["social media","scheduling","posts"],patterns:[/\bsocial media (?:schedul|manag|publish|content)/i,/\bschedul(?:e|ing) (?:posts?|content)\b/i]},
  {category:"AI writing and copywriting",keywords:["writing","copywriting","content"],patterns:[/\b(?:ai|automated) (?:writing|copywriting|content creation)\b/i,/\b(?:copywriting|writing assistant|write better)\b/i]},
  {category:"SEO and keyword research",keywords:["seo","keyword","rankings"],patterns:[/\bseo\b/i,/\bkeyword research\b/i,/\bsearch engine optimi/i]},
  {category:"email marketing",keywords:["email","marketing","newsletter"],patterns:[/\bemail marketing\b/i,/\bemail campaigns?\b/i,/\bnewsletter (?:platform|tool|software)\b/i]},
  {category:"CRM and sales pipelines",keywords:["crm","sales","pipeline"],patterns:[/\bcrm\b/i,/\bsales pipeline\b/i,/\bcustomer relationship management\b/i]},
  {category:"project and task management",keywords:["project","task","management"],patterns:[/\bproject management\b/i,/\btask management\b/i,/\bteam collaboration\b/i]},
  {category:"customer support helpdesk",keywords:["customer support","helpdesk","ticketing"],patterns:[/\bhelp.?desk\b/i,/\bcustomer support\b/i,/\bsupport tickets?\b/i]},
  {category:"website and landing page builders",keywords:["website","builder","landing page"],patterns:[/\bwebsite builder\b/i,/\blanding page builder\b/i,/\bno.code websites?\b/i]},
  {category:"ecommerce storefront software",keywords:["ecommerce","store","shop"],patterns:[/\be.?commerce\b/i,/\bonline store(?:front)?\b/i,/\b(?:build|create) your (?:own )?store\b/i]},
  {category:"form and survey builders",keywords:["forms","surveys","builder"],patterns:[/\bform builder\b/i,/\bsurvey builder\b/i,/\bonline forms\b/i]},
  {category:"video editing and creation",keywords:["video","editing","creator"],patterns:[/\bvideo edit(?:ing|or)\b/i,/\bvideo generat(?:ion|or)\b/i,/\b(?:create|make) videos?\b/i]},
  {category:"design and image editing",keywords:["design","image","graphics"],patterns:[/\bgraphic design\b/i,/\bimage edit(?:ing|or)\b/i,/\bdesign templates?\b/i]},
  {category:"link in bio tools",keywords:["link in bio","creator","links"],patterns:[/\blink in bio\b/i,/\bbio link\b/i]},
  {category:"website analytics",keywords:["analytics","website","metrics"],patterns:[/\bweb(?:site)? analytics\b/i,/\bvisitor analytics\b/i,/\btrack (?:your )?(?:website|traffic)\b/i]},
  {category:"payments and invoicing",keywords:["payments","invoicing","billing"],patterns:[/\bpayment processing\b/i,/\binvoic(?:e|ing) software\b/i,/\bsubscription billing\b/i]},
  {category:"AI coding assistants",keywords:["coding","developer","code"],patterns:[/\bai coding\b/i,/\bcode assistant\b/i,/\b(?:generate|write) code\b/i]},
  {category:"online courses and learning",keywords:["courses","learning","education"],patterns:[/\bonline courses?\b/i,/\blearning management system\b/i,/\b(?:create|sell) courses?\b/i]},
  {category:"password management and security",keywords:["password","security","vault"],patterns:[/\bpassword manager\b/i,/\bpassword vault\b/i,/\bcredential management\b/i]},
];

export function searchQuery(markdown: string, fallbackDomain: string): SearchContext {
  const title = cleaned(markdown.match(/^Title:\s*(.+)$/mi)?.[1] || "").slice(0, 95);
  const firstHeading = cleaned(markdown.match(/^#\s+(.+)$/m)?.[1] || "");
  const visibleText = markdown.split(/Markdown Content:/i).slice(-1)[0].slice(0, 5000)
    .replace(/\[[^\]]+]\([^)]+\)/g, " ").replace(/https?:\/\/[^\s)]+/gi, " ");
  const haystack = [title, firstHeading, visibleText].join(" ").toLowerCase();
  let best: typeof CATEGORIES[number] | null = null;
  let highest = 0;
  for (const item of CATEGORIES) {
    const score = item.patterns.reduce((sum, pattern) => {
      return sum + (pattern.test(haystack) ? 1 : 0) + (pattern.test((title + " " + firstHeading).toLowerCase()) ? 2 : 0);
    }, 0);
    if (score > highest) { highest = score; best = item; }
  }
  const name = (title || firstHeading || fallbackDomain.split(".")[0]).split(/\s+[-|–—]\s+/)[0]
    .replace(/[^\p{L}\p{N} .-]/gu," ").replace(/\s+/g, " ").trim().slice(0, 45);
  if (!best || highest < 1) return {query:"",title:title || fallbackDomain,category:"",keywords:[]};
  return {
    query: ("best " + best.category + " alternatives to " + name + " -site:" + fallbackDomain).slice(0, 160),
    title: title || fallbackDomain,category:best.category,keywords:best.keywords,
  };
}

function relevance(hit: RawSearchHit, context: SearchContext): number {
  const text = (hit.title + " " + hit.description).toLowerCase();
  const matches = context.keywords.filter(term => text.includes(term)).length;
  const exact = context.category && text.includes(context.category.toLowerCase()) ? 2 : 0;
  // A search hit is a lead, not verified proof of competition; require at least
  // two category hints rather than blindly treating every indexed domain as a rival.
  if (matches < 2 && !exact) return 0;
  if (/\b(top \d+|best \d+|guide to|how to|compare \d+)\b/i.test(hit.title)) return 0;
  return matches + exact;
}
export function candidatesFromHits(hits: RawSearchHit[], ownDomain: string, context?: SearchContext): Candidate[] {
  const normalizedOwn = ownDomain.replace(/^www\./,"").toLowerCase();
  const seen = new Set<string>([normalizedOwn]);
  const ranked: (Candidate & { score: number })[] = [];
  for (const hit of hits) {
    const domain = domainOf(hit.url);
    if (!domain || seen.has(domain) || domain === normalizedOwn || domain.endsWith("." + normalizedOwn) ||
      EXCLUDED.some(blocked => domain === blocked || domain.endsWith("." + blocked))) continue;
    const url = new URL(hit.url);
    const lowerPath = url.pathname.toLowerCase();
    if (/(\/blog\/|\/news\/|\/articles?\/|\/alternatives?\/|\/compare\/|\/reviews?\/|\/posts?\/|\/202[0-9]\/|\/best-)/.test(lowerPath)) continue;
    const score = context ? relevance(hit, context) : 1;
    if (!score) continue;
    seen.add(domain);
    const name = cleaned(hit.title).split(/\s+[-|–—]\s+/)[0].slice(0, 64) || domain;
    ranked.push({name,domain,url:url.origin + "/",description:cleaned(hit.description).slice(0, 180),score});
  }
  return ranked.sort((a,b) => b.score-a.score).slice(0,6).map(({score: _score,...candidate}) => candidate);
}
