import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Methodology | VSYDE" };
export default function Page() {
  return <InfoPage eyebrow="How scoring works" title="Our methodology" intro="A fair, evidence-first way to compare two public websites from a buyer's perspective." sections={[
    { heading: "One rubric for both sites", content: "VSYDE applies the same inspection conditions and factor weights to both public websites. It does not change ratings based on who owns a site or who pays for the report." },
    { heading: "The five factors", content: <ul><li>Offer clarity — 25%: what the product does and who it serves.</li><li>Trust signals — 20%: visible proof and credibility cues.</li><li>Pricing clarity — 20%: cost visibility or a clear next pricing step.</li><li>CTA path — 20%: how obvious and relevant the next action is.</li><li>Buying friction — 15%: obstacles in the accessible buyer path.</li></ul> },
    { heading: "Evidence and limitations", content: "Each finding should point to something observed on a public page. Results may be marked close match, partial or inconclusive when evidence is missing or sites cannot be compared fairly. VSYDE does not claim measured conversions, sales, traffic or actual human preference." },
    { heading: "Current implementation", content: "The landing page and example report are frontend previews. The browser scanning and AI comparison services are not yet connected." },
  ]}/>;
}
