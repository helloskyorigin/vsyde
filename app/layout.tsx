import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vsyde — Your website. Their website. Who wins?",
  description: "Compare your website with a competitor from a buyer-experience perspective. See the evidence, understand the differences, and know what to improve.",
  openGraph: {
    title: "vsyde — Your website. Their website. Who wins?",
    description: "Evidence-backed website comparisons. Free preview, $29 one-time full report.",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fafbff" };

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
