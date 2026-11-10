import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Refund policy | VSYDE" };
export default function Page() {
  return <InfoPage eyebrow="Information · Draft" title="Refund policy" intro="Payments are not enabled in the frontend preview." notice="No purchases can currently be made on this site. A complete refund policy, merchant identity and support channel must be published before paid checkout is activated." sections={[
    { heading: "Current status", content: "The $29 full report is a proposed one-time offer. The existing landing page has no payment integration and does not charge customers." },
    { heading: "Unsuccessful reports", content: "The product blueprint requires clear retry or support options if a paid scan cannot be completed. When the live service launches, exact conditions and a reliable refund process will be published here." },
    { heading: "Checkout protection", content: "Paid results must unlock only after verified payment. Canceled or unsuccessful checkout should not create duplicate charges or cause users to lose a comparison." },
  ]}/>;
}
