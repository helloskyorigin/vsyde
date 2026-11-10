import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./theme.css";

function getSiteURL(): URL | undefined {
  const provided = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!provided) return undefined;
  try {
    const url = new URL(provided);
    return ["http:", "https:"].includes(url.protocol) ? url : undefined;
  } catch { return undefined; }
}

const siteURL = getSiteURL();

export const metadata: Metadata = {
  ...(siteURL ? { metadataBase: siteURL, alternates: { canonical: "/" } } : {}),
  title: { default: "vsyde — Your website. Their website. Who wins?", template: "%s | vsyde" },
  description: "Compare two websites from a buyer's perspective. Understand the difference, see the evidence, and discover what to improve. Free preview and $19 one-time full report planned.",
  applicationName: "vsyde",
  openGraph: {
    title: "vsyde — Your website. Their website. Who wins?",
    description: "See the difference. Know what to improve. Evidence-led website comparison.",
    type: "website",
    siteName: "vsyde",
  },
  twitter: { card: "summary_large_image", title: "vsyde — Your website. Their website. Who wins?", description: "Compare two sites. See what works, what doesn't, and what to improve." },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fafbfe" };

const themeInit = `(function(){try{var saved=localStorage.getItem("vsyde-theme");var mode=saved==="dark"?"dark":"light";document.documentElement.dataset.theme=mode;document.documentElement.style.colorScheme=mode;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeInit }}/></head><body>{children}</body></html>;
}
