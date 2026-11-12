import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Methodology | vsyde", description: "How vsyde intends to evaluate public websites fairly." };
export default function Page() {
  return <InfoPage eyebrow="How it works" title="Methodology" intro="A consistent, buyer-focused comparison should explain not only the verdict but the evidence behind it." sections={[
    {heading:"One rubric, two websites", content:"The current free scan reads publicly accessible text from both homepages and up to three actually linked pages per website (pricing, product/features, and trust/about). A separate screenshot request captures each homepage. A site without readable internal links may have fewer pages checked, which limits conclusions."},
    {heading:"The five weighted signals", content:<ul><li>Offer clarity — 25%. What is offered, to whom, and what outcome it supports.</li><li>Trust signals — 20%. Visible credible proof, transparent business details and help information.</li><li>Pricing clarity — 20%. Understandable pricing or a clear route to the next pricing step.</li><li>CTA path — 20%. Whether the primary action is visible, clear and relevant.</li><li>Buying friction — 15%. Observable confusion or obstacles along an accessible public buying path.</li></ul>},
    {heading:"Evidence, confidence and coverage", content:"Each detected text signal includes its source URL. The result lists the pages read and pages that were inaccessible. It does not guess pages that were not found in a site’s navigation or treat missing information as proof that a business is weaker."},
    {heading:"Possible outcomes", content:"The initial preview only compares detected public-page signals. When coverage is substantially unequal, it avoids declaring a leader. A missing or blocked page never automatically counts as a loss."},
    {heading:"What a website scan cannot establish", content:"A public website analysis cannot infer real conversion rates, purchase behavior, traffic numbers, SEO ranking or actual user preferences. Improvements are proposed website changes, not guaranteed sales outcomes."},
    {heading:"Current implementation status", content:"Live homepage screenshots, publicly linked multi-page text checks, and source-linked rule-based reports are available. Full visual AI reasoning, interaction-based buyer testing, paid checkout and private report delivery are not launched. The sample report on the landing page remains explicitly a UI preview."},
  ]}/>;
}
