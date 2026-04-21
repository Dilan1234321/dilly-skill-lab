import Link from "next/link";
import { COHORTS } from "@/lib/cohorts";
import type { LangCode } from "@/lib/i18n";
import { listPopulatedCohorts } from "@/lib/api";

/**
 * Index-style cohort list. Only shows cohorts that actually have videos
 * in the library — empty cohorts stay hidden until the next ingest fills
 * them. Fetched server-side; silently falls back to the full list if the
 * /cohorts/populated endpoint is unavailable.
 */
export async function CohortGrid({ lang }: { lang: LangCode }) {
  void lang;

  const populated = await listPopulatedCohorts().catch(() => []);
  const populatedSlugs =
    populated.length > 0 ? new Set(populated.map((p) => p.slug)) : null;
  const visible = populatedSlugs
    ? COHORTS.filter((c) => populatedSlugs.has(c.slug))
    : COHORTS;

  if (visible.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-[color:var(--color-muted)]">
        Cohorts fill in as the nightly ingest runs. Come back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-border)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((c) => (
        <Link
          key={c.slug}
          href={`/cohort/${c.slug}`}
          className="group flex flex-col gap-1 bg-[color:var(--color-surface)] p-5 transition hover:bg-[color:var(--color-lavender)]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-[0.95rem] font-semibold leading-snug text-[color:var(--color-text)]">
              {c.name}
            </span>
            <span className="mt-0.5 shrink-0 text-sm text-[color:var(--color-dim)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent)]">
              →
            </span>
          </div>
          <span className="editorial text-sm italic leading-snug text-[color:var(--color-muted)]">
            {c.tagline}
          </span>
        </Link>
      ))}
    </div>
  );
}
