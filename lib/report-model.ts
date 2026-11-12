import type { BattleInspection, EvidenceSignal, InspectionSite, SignalKey } from "./battle-types";

export type Detection = "found" | "unconfirmed" | "unavailable" | "not-checked";
export type Factor = { key: SignalKey | "friction"; label: string; weight: string; own: Detection; competitor: Detection };
export type Finding = { title: string; body: string; source: string; otherSource?: string; tag: string };
export type Fix = { title: string; detail: string; priority: "01" | "02" | "03" };
export type ReportModel = {
  verdict: string; explanation: string; tone: "lead" | "close" | "limited";
  factors: Factor[]; findings: Finding[]; fixes: Fix[];
};

const FACTORS: { key: SignalKey | "friction"; label: string; weight: string }[] = [
  { key: "headline", label: "Offer clarity", weight: "25%" },
  { key: "trust", label: "Trust signals", weight: "20%" },
  { key: "pricing", label: "Pricing clarity", weight: "20%" },
  { key: "action", label: "CTA path", weight: "20%" },
  { key: "friction", label: "Buying friction", weight: "15%" },
];
const NAMES: Record<SignalKey, string> = {
  headline: "headline", trust: "trust information", pricing: "pricing information", action: "primary action",
};
function findSignal(site: InspectionSite, key: SignalKey): EvidenceSignal | undefined {
  return site.signals.find(s => s.key === key);
}
function state(site: InspectionSite, key: SignalKey | "friction"): Detection {
  if (key === "friction") return "not-checked";
  if (site.status !== "inspected") return "unavailable";
  return findSignal(site, key)?.observed ? "found" : "unconfirmed";
}
function quote(text: string): string {
  const safe = text.trim().slice(0, 115);
  return safe ? "“" + safe + (text.length > 115 ? "…" : "") + "”" : "";
}

export function buildReportModel(report: BattleInspection): ReportModel {
  const factors: Factor[] = FACTORS.map(f => ({ ...f, own: state(report.own, f.key), competitor: state(report.competitor, f.key) }));
  const complete = report.status === "complete";
  const pagesA = report.own.pages?.filter(p => p.status === "inspected").length || (report.own.status === "inspected" ? 1 : 0);
  const pagesB = report.competitor.pages?.filter(p => p.status === "inspected").length || (report.competitor.status === "inspected" ? 1 : 0);
  const comparableCoverage = Math.abs(pagesA - pagesB) <= 1;
  const ownCount = factors.filter(f => f.own === "found").length;
  const otherCount = factors.filter(f => f.competitor === "found").length;
  let verdict = "Comparison inconclusive";
  let explanation = "Not enough comparable public-page evidence was available. Try scanning again or inspect both websites directly.";
  let tone: ReportModel["tone"] = "limited";
  if (complete) {
    if (!comparableCoverage) {
      verdict = "Uneven page coverage";
      explanation = "Different numbers of public pages were readable for each site, so a fair overall verdict cannot be drawn. Check the page list and sources below.";
    } else if (Math.abs(ownCount - otherCount) >= 2) {
      const leader = ownCount > otherCount ? report.own : report.competitor;
      verdict = leader.domain + " shows more visible signals";
      explanation = "More of the four checkable on-page signals were detected in its captured public-page text. This is a visibility comparison, not a judgment of which business converts better.";
      tone = "lead";
    } else {
      verdict = "A close match on visible signals";
      explanation = "The available homepage text reveals a similar number of signals across the inspected pages. A reliable overall winner cannot be determined from these checks alone.";
      tone = "close";
    }
  } else if (report.status === "partial") {
    verdict = "Limited comparison";
    explanation = "Only one website could be inspected. A fair website-to-website verdict requires evidence from both pages.";
  }

  const findings: Finding[] = [];
  for (const factor of FACTORS.filter(f => f.key !== "friction")) {
    const key = factor.key as SignalKey;
    const a = findSignal(report.own, key);
    const b = findSignal(report.competitor, key);
    if (a?.observed && !b?.observed && complete && comparableCoverage) {
      findings.push({
        title: "Detected on " + report.own.domain,
        body: factor.label + ": " + quote(a.excerpt) + ". A matching signal was not identified in the competitor's captured page text.",
        source: a.sourceUrl || report.own.url, tag: factor.label,
      });
    } else if (b?.observed && !a?.observed && complete && comparableCoverage) {
      findings.push({
        title: "Detected on " + report.competitor.domain,
        body: factor.label + ": " + quote(b.excerpt) + ". A matching signal was not identified in your site's captured page text.",
        source: b.sourceUrl || report.competitor.url, tag: factor.label,
      });
    } else if (a?.observed && b?.observed && complete && comparableCoverage) {
      findings.push({
        title: "Both websites show " + NAMES[key],
        body: "Your site: " + quote(a.excerpt) + " · Competitor: " + quote(b.excerpt),
        source: a.sourceUrl || report.own.url, otherSource: b.sourceUrl || report.competitor.url, tag: factor.label,
      });
    } else if ((!complete || !comparableCoverage) && a?.observed && report.own.status === "inspected") {
      findings.push({ title: "Found on your inspected pages", body: factor.label + ": " + quote(a.excerpt), source: a.sourceUrl || report.own.url, tag: factor.label });
    } else if ((!complete || !comparableCoverage) && b?.observed && report.competitor.status === "inspected") {
      findings.push({ title: "Found on the competitor pages", body: factor.label + ": " + quote(b.excerpt), source: b.sourceUrl || report.competitor.url, tag: factor.label });
    }
    if (findings.length === 3) break;
  }

  const recommendations: Record<SignalKey, { title: string; missing: string; present: string }> = {
    headline: {
      title: "Sharpen your first-screen message",
      missing: "No main heading was identified on the captured homepage. Make sure your main offer is clear to visitors.",
      present: "Review the detected headline against your ideal buyer's needs and make the promise specific.",
    },
    action: {
      title: "Make the next step obvious",
      missing: "A primary action link was not identified in the captured text. Give visitors one clearly labelled next step.",
      present: "Review whether the detected CTA communicates what happens after a visitor clicks.",
    },
    pricing: {
      title: "Clarify pricing or the next pricing step",
      missing: "No explicit pricing signal was found on the inspected public pages. Link clearly to pricing or explain how buyers obtain a quote.",
      present: "Check that visitors can tell what is included and where to find price details.",
    },
    trust: {
      title: "Surface credible reassurance",
      missing: "No trust or support signal was found on the inspected public pages. Check that verifiable proof and help information are easy to find.",
      present: "Make sure any proof near the main CTA is specific, current and verifiable.",
    },
  };

  const order: SignalKey[] = ["headline", "action", "pricing", "trust"];
  const fixes: Fix[] = [];
  if (report.own.status === "inspected") {
    const missing = order.filter(k => state(report.own, k) === "unconfirmed");
    const present = order.filter(k => state(report.own, k) === "found");
    for (const key of [...missing, ...present].slice(0, 3)) {
      const row = recommendations[key];
      fixes.push({ title: row.title, detail: state(report.own, key) === "unconfirmed" ? row.missing : row.present, priority: String(fixes.length + 1).padStart(2, "0") as Fix["priority"] });
    }
  }
  return { verdict, explanation, tone, factors, findings, fixes };
}
