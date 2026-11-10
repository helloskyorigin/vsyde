import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Privacy | VSYDE" };
export default function Page() {
  return <InfoPage eyebrow="Information · Draft" title="Privacy" intro="How the VSYDE website preview handles the information you enter." notice="This is a pre-launch explanation, not the final operating privacy policy. The policy will be updated before live scanning and payments launch." sections={[
    { heading: "Current frontend preview", content: "At present, the comparison form validates website addresses in your browser only. It does not send your URLs to a VSYDE scanning service, create reports, or initiate payment." },
    { heading: "Future comparison data", content: "The intended product will inspect publicly accessible websites, capture the page evidence needed for a comparison, and store results for access through a private report link. Exact storage, retention, and deletion details must be published before the live service begins." },
    { heading: "Hosting and analytics", content: "Hosting infrastructure may process ordinary request information. This draft makes no claim about specific analytics or cookie systems until actual deployment configuration is confirmed." },
    { heading: "Questions and deletion requests", content: "A verified support contact and detailed request process will be added before live data collection starts." },
  ]}/>;
}
