import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Terms of use | vsyde", description: "Current preview scope and intended comparison terms." };
export default function Page() {
  return <InfoPage eyebrow="Information · Pre-launch" title="Terms of use" intro="The current preview is a look at vsyde’s planned comparison experience—not a live paid service." notice="These are pre-launch terms for an informational frontend. The final legal terms, merchant details, governing law and paid-service conditions require review before the live service opens." sections={[
    {heading:"Current experience", content:"This website currently provides a demonstration interface with form-format validation and illustrative sample results. There is no active website-scanning engine, AI report generation, checkout, account system or report delivery."},
    {heading:"How comparisons are intended to work", content:"vsyde is designed to compare two publicly accessible websites using the same buyer-experience criteria. Scores and verdicts will be directional assessments of visible information, not measurements of actual conversion rates, market preference or business success."},
    {heading:"Permitted scope", content:"The planned tool will inspect public website pages. It is not intended to log into third-party accounts, bypass paywalls, access protected data, or carry out disruptive actions on other websites."},
    {heading:"Results and limitations", content:"A site may block automated inspection, require authentication or use dynamic pages that cannot be evaluated fairly. Such cases should be shown as limited or inconclusive rather than automatically marking one site as the winner."},
    {heading:"Planned purchases", content:"The product blueprint proposes a $29 USD one-time payment per completed full battle. No charge is possible through this frontend preview. Final purchase, report access, refund and support terms must be displayed before a production checkout is enabled."},
    {heading:"Intellectual property and third-party pages", content:"Website screenshots and excerpts are intended solely as contextual evidence in permitted comparisons. Their content belongs to the relevant owners; vsyde does not endorse or represent those third-party websites."},
  ]}/>;
}
