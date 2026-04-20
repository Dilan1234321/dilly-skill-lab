import { NextResponse } from "next/server";
import { patchProfile } from "@/lib/api";

// Fields Skill Lab lets users edit in-page. Everything else is "Edit in Dilly".
const ALLOWED = new Set(["profile_tagline", "profile_bio"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED.has(k)) continue;
    if (typeof v !== "string" && v !== null) continue;
    payload[k] = v === null ? "" : v.toString().slice(0, 500);
  }
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "nothing-to-update" }, { status: 400 });
  }
  const ok = await patchProfile(payload);
  if (!ok) return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
