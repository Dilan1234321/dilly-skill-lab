import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/api";

/**
 * Bidirectional proxy to Dilly's /profile/photo endpoint. The browser can't
 * call the Dilly API directly (auth cookie is httpOnly on our domain), so
 * this route forwards the bearer token and streams the response.
 *
 * GET  → returns the photo bytes (image/*), or 404 if none
 * POST → accepts multipart file upload, forwards to Dilly
 */

const API = process.env.DILLY_API_URL ?? "http://localhost:8000";

async function bearer(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function GET() {
  const token = await bearer();
  if (!token) return new NextResponse(null, { status: 401 });

  const res = await fetch(`${API}/profile/photo`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": res.headers.get("content-type") ?? "image/jpeg",
      // Cache briefly - change of photo invalidates via a query param
      "cache-control": "private, max-age=120",
    },
  });
}

export async function POST(req: Request) {
  const token = await bearer();
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Forward the multipart body as-is to Dilly
  const form = await req.formData();
  const upstream = new FormData();
  for (const [key, value] of form.entries()) {
    upstream.append(key, value as Blob | string);
  }

  const res = await fetch(`${API}/profile/photo`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: upstream,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: text || "upload-failed" },
      { status: res.status },
    );
  }
  return NextResponse.json({ ok: true });
}
