import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VSYDE — Your website. Their website. One verdict.",
  description:
    "Compare two public websites through an evidence-based buyer-experience assessment. Start with a free preview and unlock the full report for $29 once.",
  openGraph: {
    title: "VSYDE — Your website. Their website. One verdict.",
    description: "A clearer view of how your site compares with a competitor.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08090b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
