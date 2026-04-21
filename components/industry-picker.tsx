import Link from "next/link";
import { INDUSTRIES } from "@/lib/industries";
import { listPopulatedCohorts } from "@/lib/api";

/**
 * Industry picker. Each industry maps to a handful of cohorts; we only
 * render industries where at least one mapped cohort has videos, so the
 * browse surface never sends users into a dead end.
 */
export async function IndustryPicker() {
  const populated = await listPopulatedCohorts().catch(() => []);
  const populatedSlugs =
    populated.length > 0 ? new Set(populated.map((p) => p.slug)) : null;

  const visible = populatedSlugs
    ? INDUSTRIES.filter((i) =>
        (i.cohort_slugs ?? []).some((s) => populatedSlugs.has(s)),
      )
    : INDUSTRIES;

  if (visible.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-[color:var(--color-muted)]">
        Role picker opens up as more cohorts fill in.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {visible.map((i) => (
        <Link
          key={i.slug}
          href={`/industry/${i.slug}`}
          className="card group flex min-h-[130px] flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span aria-hidden className="text-2xl sm:text-3xl">{i.emoji}</span>
            <span className="text-[color:var(--color-dim)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent-soft)]">
              →
            </span>
          </div>
          <div>
            <div className="text-[0.95rem] font-semibold leading-snug text-[color:var(--color-text)]">
              {i.name}
            </div>
            <div className="editorial mt-1 text-xs italic leading-snug text-[color:var(--color-muted)]">
              {i.tagline}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
