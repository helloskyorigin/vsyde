import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Privacy | vsyde", description: "Privacy information for vsyde visitors." };
export default function Page() {
  return <InfoPage eyebrow="Privacy" title="Privacy & data" intro="How vsyde handles information when you visit the website and use the comparison form." notice="This page describes current site behavior. Retention schedules, processors and data-handling terms for future automated scans and checkout must be confirmed before those features launch." sections={[
    {heading:"Website addresses",content:"The current comparison form checks website address formats in your browser. It does not submit URLs to a vsyde analysis API, begin a scan or create a report."},
    {heading:"Technical website requests",content:"As with other hosted websites, your browser and hosting infrastructure may exchange IP addresses and technical request information to deliver the site. Logging and retention depend on the final hosting configuration."},
    {heading:"Planned comparison reports",content:"If scanning launches, the service may process publicly accessible pages, screenshots, excerpts, scan metadata and report access records. Before collection begins, this policy will specify providers, retention, deletion and relevant sharing practices."},
    {heading:"Report access",content:"The planned account-free model uses private report links. Anyone with a report link may be able to open the associated report. No private report links are generated at present."},
    {heading:"Cookies and analytics",content:"Any analytics or optional tracking services used in the live website must be described here according to the actual production configuration."},
    {heading:"Privacy questions",content:<p>For privacy questions or requests, email <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a>. Do not include passwords or sensitive personal information.</p>},
  ]}/>;
}
