import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Contact", description: "How to submit feedback about the vsyde pre-launch frontend preview." };

export default function Page() {
  return <InfoPage eyebrow="Contact · Pre-launch" title="Get in touch" intro="vsyde is still a frontend preview. Here's what you can do today and what isn't available yet." notice="There is no verified private support inbox at this stage. A public GitHub issue is suitable only for non-sensitive frontend feedback; do not share personal data, payment information or private website URLs." sections={[
    { heading: "Report a frontend issue", content: <p>Found a layout bug or accessibility issue? <a href="https://github.com/helloskyorigin/vsyde/issues/new?template=frontend-feedback.yml" target="_blank" rel="noopener noreferrer">Open a public frontend feedback issue ↗</a>. A GitHub account may be required.</p> },
    { heading: "Billing and refund support", content: "Billing, refunds and paid reports aren't active in this preview. A verified private contact channel will be published before the product accepts payments or personal support requests." },
    { heading: "Methodology and limitations", content: "For details on how the planned comparison works and what the tool can and cannot measure, visit Methodology from the navigation below." },
  ]}/>;
}
