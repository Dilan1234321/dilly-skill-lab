// Server-side helpers for learning receipts - the evidence trail behind
// every skill claim. Reads from Dilly FastAPI.

import { cookies } from "next/headers";

const API = process.env.DILLY_API_URL ?? "http://localhost:8000";
const SESSION_COOKIE = "dilly_session";

export type ReceiptCohort = {
  cohort: string;
  seconds: number;
  videos: number;
};

export type ReceiptDay = {
  day: string; // YYYY-MM-DD
  seconds: number;
};

export type ReceiptsSummary = {
  total_seconds: number;
  videos_engaged: number;
  cohorts_touched: number;
  articulations: number;
  by_cohort: ReceiptCohort[];
  daily: ReceiptDay[];
};

export async function getMyReceipts(): Promise<ReceiptsSummary | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API}/skill-lab/receipts/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ReceiptsSummary;
  } catch {
    return null;
  }
}
