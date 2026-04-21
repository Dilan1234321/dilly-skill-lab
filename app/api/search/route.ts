import { NextResponse } from "next/server";
import { askSkills } from "@/lib/api";

/** Thin proxy so the client palette can call Dilly's /ask without CORS. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ videos: [], cohorts: [] });
  const result = await askSkills(q, 8).catch(() => ({ videos: [], cohorts: [] }));
  return NextResponse.json(result);
}
