import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Refund policy | vsyde", description: "Pre-launch refund information for future vsyde full reports." };
export default function Page() {
  return <InfoPage eyebrow="Billing · Pre-launch" title="Refund policy" intro="No payment is collected on the current frontend preview." notice="A complete, legally reviewed refund policy and verified merchant/support details must be published before accepting payments. The sections below describe planned product safeguards, not a currently available purchase or refund portal." sections={[
    {heading:"No live checkout today", content:"The $29 Full Battle Report is a planned one-time purchase. No payment provider is connected to this frontend and no credit-card details can be submitted or charged here."},
    {heading:"If a paid report cannot be delivered", content:"The product blueprint requires a clear retry or support path if a promised paid analysis is incomplete. If reasonable retries fail, customers should be offered a clear resolution or refund option. Exact eligibility and processing timelines will be published at launch."},
    {heading:"Canceled or failed payments", content:"The planned checkout must preserve the original comparison and avoid duplicate charges on repeated clicks or canceled purchases. Reports must unlock only after server-verified payment."},
    {heading:"How to request help", content:"When billing is live, this page will provide the verified support contact and instructions for payment disputes, report failures and refund requests. No unmonitored contact form is presented as an active support channel."},
  ]}/>;
}
