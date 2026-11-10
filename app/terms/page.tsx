import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Terms | VSYDE" };
export default function Page() {
  return <InfoPage eyebrow="Information · Draft" title="Terms of use" intro="A concise explanation of what the current VSYDE frontend preview is—and is not." notice="These are preliminary informational terms. Full legal terms, the operator's verified details and applicable policies must be reviewed before accepting payments." sections={[
    { heading: "Preview only", content: "The current experience is a frontend design preview. It does not deliver live comparison scans, AI evaluation, or paid reports." },
    { heading: "Proposed service scope", content: "VSYDE is intended to compare two publicly accessible websites under the same buyer-experience rubric. Results are directional assessments of visible website experiences, not real buyer conversion measurements or guarantees of sales." },
    { heading: "Public website use", content: "The planned service will focus on accessible public pages. Private credentials, protected content and unauthorized access are outside the product's intended scope." },
    { heading: "Payments and delivery", content: "The proposed Full Battle Report is $29 once per completed battle, with no mandatory account. Purchase terms will be finalized and disclosed before checkout is enabled." },
  ]}/>;
}
