import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Contact | vsyde", description: "vsyde contact and support availability during the frontend preview." };
export default function Page() {
  return <InfoPage eyebrow="Support · Pre-launch" title="Get in touch" intro="Support should be simple, clear and accessible—once the live product is ready." notice="An official support address has not been provided or verified yet. This page is working, but it is not an active customer-support inbox or ticket form. We won't invent an address or imply someone is monitoring messages." sections={[
    {heading:"Current frontend phase", content:"You can explore the landing page, comparison form design and example report layout. Real scanning, billing, private report recovery and live support are not available in this preview."},
    {heading:"Support once live", content:"Before launch, this page needs a verified support contact for scan issues, inaccessible websites, payment inquiries, refunds, privacy requests and report-access problems."},
    {heading:"Product transparency", content:"Want to understand the planned comparison criteria? Visit the Methodology page from the navigation below for the five-factor rubric and limitations."},
  ]}/>;
}
