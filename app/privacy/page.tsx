import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Privacy | vsyde", description: "Pre-launch privacy information for the vsyde comparison preview." };
export default function Page() {
  return <InfoPage eyebrow="Information · Pre-launch" title="Privacy & data" intro="A clear explanation of what the current vsyde experience does with the details you type into it." notice="This page describes the current frontend preview and the intended product design. Data processing terms, retention periods, operator details, and privacy contacts must be confirmed and updated before live scans or payments begin." sections={[
    {heading:"What happens today", content:"The current landing page validates the format of the two website addresses inside your browser. Submitting the form does not trigger a vsyde scan, upload the entered URLs to a vsyde analysis API, create a report, or initiate payment."},
    {heading:"Basic website requests", content:"Your browser and hosting provider may process standard technical requests needed to deliver the site, such as IP addresses and request metadata. The exact infrastructure and logging setup will be documented after the live hosting configuration is confirmed."},
    {heading:"When website scanning launches", content:"The planned scanner will visit public pages, collect only the evidence needed for a comparison, and may store screenshots, extracted page information, and report-access records. The live privacy policy must explain retention, deletion, providers and any transfers before this functionality is enabled."},
    {heading:"Accounts, reports and sharing", content:"The planned product will not require an account. Full reports are intended to be opened with secure private links; anyone holding a report link may be able to access that report. The frontend preview does not create report links."},
    {heading:"Cookies and analytics", content:"This page does not assume a specific tracking, analytics or cookie system has been installed. Any such services must be documented based on the actual production configuration."},
    {heading:"Requests and questions", content:"A verified privacy and support channel will be added here before live personal-data collection starts. Until then, this is a frontend preview rather than a functioning scanning service."},
  ]}/>;
}
