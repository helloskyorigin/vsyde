import { NextRequest, NextResponse } from "next/server";
import { validatePublicWebsite, allowRequest, requestIdentity } from "@/lib/battle-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function jsonError(message: string, status: number): Response {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!allowRequest(requestIdentity(request.headers, "screenshot"), 10)) {
    return jsonError("Preview limit reached. Please try again shortly.", 429);
  }
  const target = await validatePublicWebsite(request.nextUrl.searchParams.get("url") || "");
  if (!target) return jsonError("Enter a public website address.", 400);

  // Public homepage screenshot service. User URLs are never fetched directly by this API.
  const refresh = request.nextUrl.searchParams.get("refresh") === "1";
  const imageURL = "https://image.thum.io/get/width/960/crop/820/noanimate/maxAge/" + (refresh ? "0" : "1") + "/" + target.href;
  try {
    const response = await fetch(imageURL, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(22000),
      headers: { Accept: "image/png,image/jpeg,image/webp" },
    });
    if (!response.ok) return jsonError(response.status === 429 ? "Screenshot service is busy. Try again shortly." : "Screenshot unavailable. Try again or visit the website.", response.status === 429 ? 429 : 502);
    const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!["image/png","image/jpeg","image/webp"].includes(contentType)) return jsonError("Screenshot service returned an unsupported image.", 502);
    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > 5_000_000) return jsonError("This screenshot is too large.", 502);
    if (!response.body) return jsonError("No screenshot data was returned.", 502);

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (size <= 5_000_000) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.byteLength;
      }
    } finally { await reader.cancel().catch(() => {}); }
    if (size < 100 || size > 5_000_000) return jsonError("Screenshot is unavailable or too large.", 502);
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return jsonError("Screenshot timed out. Please retry.", 504);
  }
}
