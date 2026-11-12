export type PageRole = "homepage" | "pricing" | "product" | "trust";
export type TargetPage = { url: string; role: PageRole };

const GROUPS: {role: Exclude<PageRole,"homepage">; path:RegExp; label:RegExp}[] = [
  {role:"pricing",path:/(?:^|\/)(?:pricing|plans?|subscriptions?|costs?)(?:\/|$)/i,label:/\b(pricing|plans|costs?|subscriptions?)\b/i},
  {role:"product",path:/(?:^|\/)(?:features?|products?|solutions?|platform|use-cases?|how-it-works)(?:\/|$)/i,label:/\b(features?|products?|solutions?|platform|how it works)\b/i},
  {role:"trust",path:/(?:^|\/)(?:about|customers?|testimonials?|case-studies|security|trust)(?:\/|$)/i,label:/\b(about|customers?|testimonials?|security|trust|case studies)\b/i},
];
const AVOID = /(?:^|\/)(?:login|logout|signin|signup|register|account|checkout|cart|blog|news|docs|privacy|terms|careers?|contact|press|api)(?:\/|$)/i;

/**
 * Select only genuine, same-origin navigation links observed in the homepage.
 * Never guess URLs: an unlinked /pricing page must be reported as not inspected.
 */
export function discoverInspectionPages(markdown: string, site: URL): TargetPage[] {
  const selected = new Map<PageRole, TargetPage>();
  const hits = Array.from(markdown.matchAll(/\[([^\]]{1,110})\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/gi)).slice(0,220);
  for (const [, text, href] of hits) {
    if (/&(?:amp|#38);/i.test(href)) continue;
    let target: URL;
    try { target = new URL(href,site.origin); } catch { continue; }
    if (!["https:","http:"].includes(target.protocol) || target.origin !== site.origin ||
      target.username || target.password || AVOID.test(target.pathname) ||
      /\.(?:pdf|jpe?g|png|webp|gif|zip|json|xml|svg|mp4)$/i.test(target.pathname)) continue;
    // No query parameters: avoids tracking, duplicate, search or action URLs.
    target.search = ""; target.hash = "";
    if (target.pathname === "/" || target.href === site.href || target.href.length > 260) continue;
    for (const group of GROUPS) {
      if (!selected.has(group.role) && (group.path.test(target.pathname) || group.label.test(text))) {
        selected.set(group.role,{url:target.href,role:group.role});
        break;
      }
    }
  }
  return GROUPS.flatMap(group => selected.has(group.role) ? [selected.get(group.role)!] : []);
}
