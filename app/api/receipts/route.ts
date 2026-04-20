import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/api";

/** Proxies a learning-receipt beacon from the client to the Dilly backend. */
const API = process.env.DILLY_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const videoId = typeof body?.video_id === "string" ? body.video_id : "";
  const seconds = Number.isFinite(body?.seconds_engaged)
    ? Number(body.seconds_engaged)
    : 0;
  const articulation =
    typeof body?.articulation === "string" ? body.articulation : undefined;

  if (!videoId) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const res = await fetch(`${API}/skill-lab/receipts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      video_id: videoId,
      seconds_engaged: seconds,
      articulation,
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "upstream-failed" }, { status: res.status });
  return NextResponse.json({ ok: true });
}
