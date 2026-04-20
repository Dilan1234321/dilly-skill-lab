import Link from "next/link";
import { COHORTS_BY_NAME } from "@/lib/cohorts";
import type { ReceiptCohort } from "@/lib/receipts";

/**
 * Mastery Signals — Dilly Skills' answer to the LinkedIn skill tag.
 * Every cohort the user has touched shows as a chip with its receipt
 * weight: total minutes + videos engaged. At three thresholds we add
 * a tier label: Exploring → Building → Developing → Fluent.
 *
 * This is display-only for now. Phase 4 will make these claimable onto
 * the recruiter-facing profile.
 */

const TIERS = [
  { min: 600, label: "Fluent" },      // 10+ hours
  { min: 240, label: "Developing" },  // 4+ hours
  { min: 60, label: "Building" },     // 1+ hour
  { min: 0, label: "Exploring" },     // anything
];

function tierFor(minutes: number): string {
  for (const t of TIERS) if (minutes >= t.min) return t.label;
  return "Exploring";
}

export function MasterySignals({ cohorts }: { cohorts: ReceiptCohort[] }) {
  if (cohorts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--color-border-strong)] p-5 text-sm text-[color:var(--color-muted)]">
        No receipts yet. Watch a video and share a one-sentence takeaway — your
        signal will appear here.
      </div>
    );
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {cohorts.map((c) => {
        const minutes = Math.round(c.seconds / 60);
        const tier = tierFor(minutes);
        const match = COHORTS_BY_NAME[c.cohort];
        const href = match ? `/cohort/${match.slug}` : "#";
        return (
          <li key={c.cohort}>
            <Link
              href={href}
              className="group flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-3.5 transition hover:border-[color:var(--color-accent)]"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[color:var(--color-text)]">
                  {c.cohort}
                </div>
                <div className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                  {formatMinutes(minutes)} · {c.videos} video{c.videos === 1 ? "" : "s"}
                </div>
              </div>
              <span className="chip chip-accent shrink-0">{tier}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}
