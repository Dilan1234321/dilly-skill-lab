import { NextResponse } from "next/server";
import { getProfile, patchProfile } from "@/lib/api";

// Merges cross-link privacy toggles into web_profile_settings and PATCHes
// the whole blob back. Keeps whatever other settings are already there.
const ALLOWED = new Set([
  "skills_show_career",
  "skills_show_learning",
]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const incoming: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k) && typeof v === "boolean") incoming[k] = v;
  }
  if (Object.keys(incoming).length === 0) {
    return NextResponse.json({ error: "nothing-to-update" }, { status: 400 });
  }

  // Read current settings so we don't clobber other keys
  const profile = await getProfile().catch(() => null);
  const current =
    (profile?.web_profile_settings as Record<string, unknown> | undefined) ?? {};

  const merged = { ...current, ...incoming };
  const ok = await patchProfile({ web_profile_settings: merged });
  if (!ok) {
    return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
