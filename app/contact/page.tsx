import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact vsyde for business inquiries, questions and support.",
};

export default function Page() {
  return <InfoPage
    eyebrow="Contact"
    title="Let's talk."
    intro="Have a question about vsyde, a partnership idea or need help? Reach out by email."
    sections={[
      { heading: "Business & support", content: <p>Write to <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a> for business inquiries, product questions or support. Please don't send passwords or payment-card details.</p> },
      { heading: "Product feedback", content: <p>Share what you're trying to compare and the improvements you'd love to see. Email <a href="mailto:hello.skyorigin@gmail.com?subject=vsyde%20feedback">hello.skyorigin@gmail.com</a>.</p> },
      { heading: "Service availability", content: "Automated comparisons, checkout and paid report delivery are not available yet. Details will be published before payments open." },
    ]}
  />;
}
