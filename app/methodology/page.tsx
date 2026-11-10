import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Methodology | vsyde", description: "How vsyde intends to evaluate public websites fairly." };
export default function Page() {
  return <InfoPage eyebrow="How it works" title="Methodology" intro="A consistent, buyer-focused comparison should explain not only the verdict but the evidence behind it." sections={[
    {heading:"One rubric, two websites", content:"Both public sites will be inspected using matching browser conditions, viewport sizes and comparable buyer objectives. Paying for a report will not change the scores. Different business models or missing evidence can make a comparison inconclusive."},
    {heading:"The five weighted signals", content:<ul><li>Offer clarity — 25%. What is offered, to whom, and what outcome it supports.</li><li>Trust signals — 20%. Visible credible proof, transparent business details and help information.</li><li>Pricing clarity — 20%. Understandable pricing or a clear route to the next pricing step.</li><li>CTA path — 20%. Whether the primary action is visible, clear and relevant.</li><li>Buying friction — 15%. Observable confusion or obstacles along an accessible public buying path.</li></ul>},
    {heading:"Evidence, confidence and coverage", content:"A supported finding should reference a captured page, visible excerpt or tested public action. Report confidence and coverage need to be distinguished from the website score. Blocked or unavailable material should be labeled honestly."},
    {heading:"Possible outcomes", content:"The intended verdicts are Your Site Wins, Competitor Wins, Close Match and Inconclusive. A missing or blocked page does not automatically count as a loss."},
    {heading:"What a website scan cannot establish", content:"A public website analysis cannot infer real conversion rates, purchase behavior, traffic numbers, SEO ranking or actual user preferences. Improvements are proposed website changes, not guaranteed sales outcomes."},
    {heading:"Current implementation status", content:"The report preview contains sample data and does not represent an actual website comparison. Automated scans, AI analysis, checkout and delivery have not launched."},
  ]}/>;
}
