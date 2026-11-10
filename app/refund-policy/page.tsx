import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Refund policy | vsyde", description: "vsyde billing and refund information." };
export default function Page() {
  return <InfoPage eyebrow="Billing & refunds" title="Refund policy" intro="Full battle reports are listed at $19 per completed comparison with no recurring subscription." notice="Checkout is not enabled yet, so no payment can currently be made. Final refund eligibility, refund processing times and merchant details will be confirmed before purchases are accepted." sections={[
    {heading:"Pricing and payment",content:"The listed full report price is $19 USD once per completed comparison. No card payment can be submitted or charged through the current website."},
    {heading:"Report delivery issues",content:"When paid reports become available, failed or incomplete analyses must have a clear retry or support route. A resolution and refund process will be published before checkout launches."},
    {heading:"Failed or canceled payments",content:"The planned checkout must avoid duplicate charges, preserve the related comparison and unlock reports only after server-verified payment."},
    {heading:"Contact",content:<p>For billing questions or refund-policy inquiries, email <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a>.</p>},
  ]}/>;
}
