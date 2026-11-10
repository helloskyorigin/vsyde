/** Frontend-only format guidance. Server-side DNS and redirect checks are still required before crawling. */
export function normalizePublicURL(raw: string): URL | null {
  const value = raw.trim();
  if (!value || /\s/.test(value) || /[?#]/.test(value)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!(["http:", "https:"].includes(url.protocol)) || url.username || url.password) return null;
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(host)) return null;
    if (["localhost", "0.0.0.0"].includes(host) || /\.(local|internal|localhost)$/.test(host)) return null;
    return url;
  } catch { return null; }
}

export function sameWebsite(first: URL, second: URL): boolean {
  return first.hostname.toLowerCase().replace(/^www\./, "") === second.hostname.toLowerCase().replace(/^www\./, "");
}
