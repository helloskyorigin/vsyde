import type { Metadata } from "next";
import Link from "next/link";
import BattleRoom from "@/components/BattleRoom";
import { normalizePublicURL, sameWebsite } from "@/lib/url-validation";

export const metadata: Metadata = {
  title: "Battle Room",
  description: "Compare two public websites side by side on vsyde.",
  robots: { index: false, follow: false },
};

type BattleQuery = { own?: string | string[]; competitor?: string | string[] };
export default async function Page({ searchParams }: { searchParams: Promise<BattleQuery> }) {
  const query = await searchParams;
  const own = typeof query.own === "string" && query.own.length <= 300 ? normalizePublicURL(query.own) : null;
  const competitor = typeof query.competitor === "string" && query.competitor.length <= 300 ? normalizePublicURL(query.competitor) : null;
  if (!own || !competitor || sameWebsite(own, competitor)) {
    return (
      <main className="battle-page battle-invalid">
        <div className="battle-invalid-card">
          <span className="battle-kicker">vsyde / Battle Room</span>
          <h1>Two websites. One battle.</h1>
          <p>Enter two different public website addresses to start your comparison.</p>
          <Link className="battle-button" href="/#compare">Choose websites <span aria-hidden="true">→</span></Link>
        </div>
      </main>
    );
  }
  return <BattleRoom ownSite={own.href} competitorSite={competitor.href}/>;
}
