import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Contact | VSYDE" };
export default function Page() {
  return <InfoPage eyebrow="Support" title="Contact VSYDE" intro="Support information for VSYDE's upcoming website-comparison product." notice="The official support email and contact process have not yet been provided. We won't invent a contact address or present an unmonitored form as active support." sections={[
    { heading: "Before launch", content: "The current frontend is a demonstration. You cannot submit a battle, purchase a report, or open a customer service ticket through this preview." },
    { heading: "At launch", content: "This page will provide a verified support channel for scan issues, result access, billing, refunds and privacy requests before those features go live." },
  ]}/>;
}
