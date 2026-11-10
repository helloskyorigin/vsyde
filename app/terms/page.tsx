import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Terms of use | vsyde", description: "Terms and conditions for the vsyde website." };
export default function Page() {
  return <InfoPage eyebrow="Terms" title="Terms of use" intro="Information about the current vsyde website and how the planned comparison service will operate." notice="Automated reports and payments are not yet offered. Final operator details, purchase terms and applicable legal conditions must be confirmed before checkout becomes available." sections={[
    {heading:"Current website",content:"The Battle Room captures public website screenshots and extracts publicly visible page text using third-party services. It can summarize detectable signals, not certify buyer conversion performance. AI-generated full reports and payment processing are not currently available. The landing report example contains sample data."},
    {heading:"Comparison principles",content:"The intended service compares two public websites using the same buyer-experience criteria. Ratings are directional evaluations of visible information, not measurements of real conversion rates, traffic or business success."},
    {heading:"Permitted use",content:"Analysis will be limited to publicly accessible information. The service is not intended to bypass sign-ins, paywalls, access controls or interfere with other sites."},
    {heading:"Availability and limitations",content:"A website may block scanning or contain information that cannot be checked reliably. In that case, a report should disclose coverage limitations and may be inconclusive."},
    {heading:"Pricing and purchases",content:"A full battle report is listed at $19 USD per completed comparison, as a one-time purchase without a subscription. Checkout is not available yet; final delivery, purchase and refund terms will be shared before any payment is accepted."},
    {heading:"Third-party content",content:"Any website images or excerpts used as evidence remain the property of their respective owners. vsyde does not represent or endorse those third-party businesses."},
    {heading:"Contact",content:<p>Business or terms-related questions: <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a>.</p>},
  ]}/>;
}
