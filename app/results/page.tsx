import type { Metadata } from "next";
import Link from "next/link";
import { normalizePublicURL, sameWebsite } from "@/lib/url-validation";
import ResultsView from "@/components/ResultsView";

export const metadata: Metadata = {
  title: "Free Results",
  description: "Review the initial public website evidence from your vsyde comparison.",
  robots: { index: false, follow: false },
};

type Inputs = { own?: string | string[]; competitor?: string | string[] };
export default async function Page({ searchParams }: { searchParams: Promise<Inputs> }) {
  const query = await searchParams;
  const own = typeof query.own === "string" && query.own.length <= 300 ? normalizePublicURL(query.own) : null;
  const competitor = typeof query.competitor === "string" && query.competitor.length <= 300 ? normalizePublicURL(query.competitor) : null;
  if (!own || !competitor || sameWebsite(own, competitor)) return (
    <main className="results-invalid">
      <h1>Start your comparison.</h1>
      <p>Choose two different public website addresses to see an evidence-based preview.</p>
      <Link href="/#compare" className="battle-result-button">Choose websites →</Link>
    </main>
  );
  return <ResultsView ownSite={own.href} competitorSite={competitor.href}/>;
}
