import type { MetadataRoute } from "next";

/** The production hostname is configured by deployment; never invent one. */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return [];
  try {
    const base = new URL(origin);
    if (!["https:", "http:"].includes(base.protocol)) return [];
    return ["", "methodology", "privacy", "terms", "refund-policy", "contact"].map(path => ({
      url: new URL(path, `${base.toString().replace(/\/$/, "")}/`).toString(),
      changeFrequency: "monthly" as const,
      priority: path ? 0.3 : 1,
    }));
  } catch { return []; }
}
