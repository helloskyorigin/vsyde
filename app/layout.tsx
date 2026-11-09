import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VSYDE — Your website. Their website. Who wins?",
  description:
    "Compare your website with a competitor from a buyer's perspective. Discover what is clearer, more credible, and easier to act on. Free preview, $29 one-time full report.",
  openGraph: {
    title: "VSYDE — Your website. Their website. Who wins?",
    description: "A clearer view of how two public websites compare.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f9ff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
