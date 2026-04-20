import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, serverSignOut } from "@/lib/api";
import { STREAK_COOKIE, LAST_WATCHED_COOKIE } from "@/lib/session-state";

export async function POST(req: Request) {
  // Invalidate server-side first so the token can't be replayed after sign-out.
  await serverSignOut().catch(() => null);
  const store = await cookies();
  // Clear everything user-identifying so the next visitor on this browser
  // sees the clean anonymous Dilly Skills homepage, not someone else's streak.
  store.delete(SESSION_COOKIE);
  store.delete(STREAK_COOKIE);
  store.delete(LAST_WATCHED_COOKIE);
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/", origin), { status: 303 });
}
