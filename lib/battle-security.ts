import { lookup } from "node:dns/promises";
import { normalizePublicURL } from "@/lib/url-validation";

export function isPublicAddress(address: string): boolean {
  const ip = address.toLowerCase();
  if (ip.includes(":")) {
    if (ip === "::" || ip === "::1" || ip.startsWith("::ffff:") ||
      ip.startsWith("fe8") || ip.startsWith("fe9") || ip.startsWith("fea") || ip.startsWith("feb") ||
      ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("ff") ||
      ip.startsWith("2001:db8:") || ip.startsWith("2001:0:")) return false;
    return true;
  }
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224 ||
      a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 ||
      a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 ||
      a === 192 && b === 0 || a === 192 && b === 88 && c === 99 ||
      a === 198 && (b === 18 || b === 19) || a === 198 && b === 51 && c === 100 ||
      a === 203 && b === 0 && c === 113 || a === 192 && b === 0 && c === 2) return false;
  return true;
}

export async function validatePublicWebsite(raw: string): Promise<URL | null> {
  if (raw.length > 300) return null;
  const url = normalizePublicURL(raw);
  if (!url || (url.port && !["80","443"].includes(url.port)) ||
    /\.(local|localhost|internal|test|invalid|example)$/i.test(url.hostname)) return null;
  try {
    const records = await lookup(url.hostname, { all: true, verbatim: true });
    if (!records.length || records.length > 30 || records.some(entry => !isPublicAddress(entry.address))) return null;
    return url;
  } catch { return null; }
}

// Lightweight per-instance protection. Set a distributed edge/WAF rate limit for production scale.
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
export function allowRequest(key: string, limit: number): boolean {
  const now = Date.now();
  const old = buckets.get(key);
  if (buckets.size > 10000) {
    for (const [k, value] of buckets) if (value.resetAt <= now) buckets.delete(k);
    if (buckets.size > 10000) buckets.clear();
  }
  if (!old || old.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (old.count >= limit) return false;
  old.count++;
  return true;
}
export function requestIdentity(headers: Headers, scope: string): string {
  const ip = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")?.trim()
    || headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  return scope + ":" + ip.slice(0, 128);
}
