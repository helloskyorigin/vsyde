import type { EvidenceSignal, SignalKey } from "./battle-types";

const keys: { key: SignalKey; label: string }[] = [
  { key: "headline", label: "Page headline" },
  { key: "action", label: "Action link" },
  { key: "pricing", label: "Pricing information" },
  { key: "trust", label: "Trust or support information" },
];

function clean(text: string): string {
  return text.replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#*_~|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 175);
}
export function emptySignals(): EvidenceSignal[] {
  return keys.map(({key,label}) => ({key,label,observed:false,excerpt:""}));
}
export function parseHomepage(input: string): { title: string; signals: EvidenceSignal[]; usable: boolean } {
  const lines = input.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
  const title = clean(lines.find(t => /^Title:\s*/i.test(t))?.replace(/^Title:\s*/i,"") || "");
  const contentIndex = lines.findIndex(t => /^Markdown Content:\s*$/i.test(t));
  const content = (contentIndex >= 0 ? lines.slice(contentIndex + 1) : lines)
    .filter(t => !/^(URL Source|Source|Content type|Title|Published Time|Fetched At):/i.test(t))
    .slice(0, 850);
  const headline = content.find(t => /^#\s+\S/.test(t) && clean(t).length >= 8);
  const actionPattern = /\b(get started|start free|sign up|try free|book a demo|request demo|contact sales|buy now|join now|start now|schedule|request access|create account|compare now|start a battle|try it|explore plans)\b/i;
  const links = content.filter(t => /\[[^\]]{2,85}]\((?:https?:\/\/|\/)[^)]+\)/.test(t));
  const action = links.find(t => actionPattern.test(t));
  const price = content.find(t => /(?:[$€£₹]\s?\d{1,6}(?:[.,]\d{1,2})?\b|\b(?:usd|eur|gbp|inr)\s?\d{1,6}\b|\b(?:per month|\/month|\/year|starting at|pricing plans)\b)/i.test(t));
  const trust = content.find(t => /\b(testimonials?|customer stories|case studies|reviews?|trusted by|security|privacy policy|support center|contact us|help center|customers say|our customers)\b/i.test(t));
  const match: Record<SignalKey,string|undefined> = {headline,action,pricing:price,trust};
  const signals = keys.map(({key,label}) => ({ key,label,observed:!!match[key],excerpt: match[key] ? clean(match[key]!) : "" }));
  return { title: title || clean(headline || "") || "Public homepage", signals, usable: content.join(" ").length >= 70 };
}
