import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
export const metadata: Metadata = { title: "Privacy | vsyde", description: "Privacy information for vsyde visitors." };
export default function Page() {
  return <InfoPage eyebrow="Privacy" title="Privacy & data" intro="How vsyde handles information when you visit the website and use the comparison form." notice="This page describes current site behavior. Retention schedules, processors and data-handling terms for future automated scans and checkout must be confirmed before those features launch." sections={[
    {heading:"Website addresses",content:"The comparison form checks website address formats in your browser. After you start a battle, the public website addresses are sent to our screenshot endpoint, which uses a third-party capture provider (Thum.io) to request public homepage images. A public-page text check may inspect the entered homepage plus linked first-party pricing, product/features, and trust/about pages, but no AI-generated full report or paid report is created."},
    {heading:"Screenshot and content providers",content:"The two homepage addresses are shared with Thum.io for homepage screenshots. The entered URLs and up to three discovered same-site public page URLs per website are shared with Jina Reader for text extraction. These services may process request data under their own policies. Avoid submitting private or sensitive URLs."},
    {heading:"Session report data",content:"The initial public signal check returns website text observations to your browser. The report is saved in session storage for convenient navigation and generally disappears when the browser tab session ends. No paid report is created."},
    {heading:"Technical website requests",content:"As with other hosted websites, your browser and hosting infrastructure may exchange IP addresses and technical request information to deliver the site. Logging and retention depend on the final hosting configuration."},
    {heading:"Planned comparison reports",content:"A future paid deep scan may process additional public pages, screenshots, excerpts, scan metadata and report access records. Before that launch, this policy will specify its processors, retention, deletion and sharing practices."},
    {heading:"Report access",content:"The planned account-free model uses private report links. Anyone with a report link may be able to open the associated report. No private report links are generated at present."},
    {heading:"Cookies and analytics",content:"Any analytics or optional tracking services used in the live website must be described here according to the actual production configuration."},
    {heading:"Privacy questions",content:<p>For privacy questions or requests, email <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a>. Do not include passwords or sensitive personal information.</p>},
  ]}/>;
}
