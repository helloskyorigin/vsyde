import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { normalizePublicURL } from "@/lib/url-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function publicAddress(address: string): boolean {
  const ip = address.toLowerCase();
  if (ip.includes(":")) {
    if (ip === "::1" || ip === "::" || ip.startsWith("fe80:") ||
      ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("ff") ||
      ip.startsWith("::ffff:") || ip.startsWith("2001:db8:")) return false;
    return true;
  }
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = octets;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)));
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest): Promise<Response> {
  const raw = request.nextUrl.searchParams.get("url") || "";
  if (raw.length > 300) return errorResponse("The website address is too long.", 400);
  const target = normalizePublicURL(raw);
  if (!target || (target.port && !["80", "443"].includes(target.port))) {
    return errorResponse("Enter a valid public website address.", 400);
  }
  if (/\.(local|localhost|internal|test|invalid)$/i.test(target.hostname)) {
    return errorResponse("Only public websites can be previewed.", 400);
  }

  try {
    const addresses = await lookup(target.hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(record => !publicAddress(record.address))) {
      return errorResponse("This address does not resolve to a public website.", 400);
    }
  } catch {
    return errorResponse("We couldn't resolve this website.", 422);
  }

  // The only outbound HTTP request is to the fixed screenshot provider.
  // This route never directly fetches user-supplied website URLs.
  const imageURL = "https://image.thum.io/get/width/960/crop/820/noanimate/maxAge/24/" + target.href;
  try {
    const response = await fetch(imageURL, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(22000),
      headers: { Accept: "image/png,image/jpeg,image/webp" },
    });
    if (!response.ok) {
      if (response.status === 429) return errorResponse("Too many previews right now. Please retry shortly.", 429);
      return errorResponse("Screenshot unavailable for this website. Try again or open the site.", 502);
    }
    const type = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!["image/png", "image/jpeg", "image/webp"].includes(type)) {
      return errorResponse("Screenshot service did not return a usable image.", 502);
    }
    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > 5_000_000) return errorResponse("This preview is too large to display.", 502);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength < 100 || bytes.byteLength > 5_000_000) {
      return errorResponse("Screenshot was incomplete. Please retry.", 502);
    }
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return errorResponse("Screenshot request timed out. Please retry.", 504);
  }
}
