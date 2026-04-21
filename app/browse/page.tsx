import Link from "next/link";
import { COHORTS } from "@/lib/cohorts";
import { INDUSTRIES } from "@/lib/industries";
import { cohortHex, hexWithAlpha } from "@/lib/cohort-colors";
import { listPopulatedCohorts } from "@/lib/api";

export const metadata = {
  title: "Browse · Dilly Skills",
  description:
    "Every field and role in Dilly Skills. Human-curated videos, ranked without LLMs, updated nightly.",
};

/**
 * Browse surface. Not a grid of tiles, a *library index*. The intent is to
 * signal scale and selectivity at a glance: the top band shows live counts
 * from the populated-cohorts endpoint, the two main sections open into
 * rich cards that hint at the editorial work behind each entry point.
 *
 * Data flow:
 *   listPopulatedCohorts() returns { slug, name, count } for cohorts that
 *   currently have videos. We build a Map<slug, count>, derive the global
 *   metrics off of it, and filter cohorts/industries so empty entries are
 *   hidden until the nightly ingest fills them in.
 */
export default async function BrowsePage() {
  const populated = await listPopulatedCohorts().catch(() => []);
  const videoCountBySlug = new Map<string, number>(
    populated.map((p) => [p.slug, p.count]),
  );
  const populatedSlugs = new Set(populated.map((p) => p.slug));

  const visibleCohorts =
    populatedSlugs.size > 0
      ? COHORTS.filter((c) => populatedSlugs.has(c.slug))
      : COHORTS;
  const visibleIndustries =
    populatedSlugs.size > 0
      ? INDUSTRIES.filter((i) =>
          (i.cohort_slugs ?? []).some((s) => populatedSlugs.has(s)),
        )
      : INDUSTRIES;

  const totalVideos =
    populated.length > 0
      ? populated.reduce((sum, c) => sum + c.count, 0)
      : null;

  return (
    <div className="pb-24">
      {/* ═══ Hero ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(900px 320px at 12% -10%, rgba(123,159,255,0.28), transparent 60%), radial-gradient(800px 320px at 92% 10%, rgba(201,138,43,0.18), transparent 60%)",
          }}
        />
        <div className="container-app relative pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="eyebrow">The library</div>
          <h1 className="editorial mt-3 max-w-4xl text-[2.75rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Every field, every role. <span className="italic font-medium">One shelf.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[color:var(--color-muted)] sm:text-lg">
            Pick a role to see what AI hasn&apos;t taken yet. Pick a field to
            see how the craft is actually practiced today. Both lead into the
            same curated library. Nothing behind a paywall, nothing ranked by
            an LLM.
          </p>

          {/* Live metrics strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-3xl">
            <HeroMetric
              value={totalVideos !== null ? String(totalVideos) : String(visibleCohorts.length * 40)}
              suffix={totalVideos !== null ? "videos curated" : "videos (est.)"}
              emphasis
            />
            <HeroMetric
              value={String(visibleCohorts.length)}
              suffix={`of ${COHORTS.length} fields`}
            />
            <HeroMetric
              value={String(visibleIndustries.length)}
              suffix={`of ${INDUSTRIES.length} roles`}
            />
            <HeroMetric value="0" suffix="LLM calls at request time" />
          </div>

          {/* Jump nav */}
          <div className="mt-10 flex flex-wrap gap-2">
            <a href="#by-role" className="chip chip-accent">
              <span aria-hidden>↓</span> Jump to roles
            </a>
            <a href="#by-field" className="chip">
              <span aria-hidden>↓</span> Jump to fields
            </a>
          </div>
        </div>
      </section>

      {/* ═══ By role ═════════════════════════════════════════════════════ */}
      <section id="by-role" className="container-app scroll-mt-24 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">By role</div>
            <h2 className="editorial mt-2 text-3xl tracking-tight sm:text-4xl">
              I work in&hellip;
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--color-muted)] sm:text-base">
              Each role surfaces the AI-era skills that matter and the parts
              of the craft that still require a human.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-dim)]">
            {visibleIndustries.length} live
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleIndustries.map((i) => {
            const roleVideoCount = (i.cohort_slugs ?? []).reduce(
              (n, s) => n + (videoCountBySlug.get(s) ?? 0),
              0,
            );
            return (
              <Link
                key={i.slug}
                href={`/industry/${i.slug}`}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[color:var(--color-accent)] hover:shadow-[0_8px_24px_-12px_rgba(28,34,100,0.15)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span aria-hidden className="text-3xl sm:text-4xl">{i.emoji}</span>
                  <span className="text-[color:var(--color-dim)] transition group-hover:translate-x-1 group-hover:text-[color:var(--color-accent)]">
                    →
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold leading-tight tracking-tight text-[color:var(--color-text)]">
                    {i.name}
                  </div>
                  <div className="editorial mt-1.5 text-sm italic leading-snug text-[color:var(--color-muted)]">
                    {i.tagline}
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {i.ai_skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] px-2.5 py-0.5 text-[0.7rem] font-medium text-[color:var(--color-muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                  {i.ai_skills.length > 3 && (
                    <span className="px-1 text-[0.7rem] font-medium text-[color:var(--color-dim)]">
                      +{i.ai_skills.length - 3} more
                    </span>
                  )}
                </div>
                {roleVideoCount > 0 && (
                  <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-[color:var(--color-dim)]">
                    {roleVideoCount} video{roleVideoCount === 1 ? "" : "s"} curated
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ By field ════════════════════════════════════════════════════ */}
      <section id="by-field" className="container-app scroll-mt-24 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">By field</div>
            <h2 className="editorial mt-2 text-3xl tracking-tight sm:text-4xl">
              The academic shelf.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--color-muted)] sm:text-base">
              22 cohorts, one for every major track. Each cohort is its own
              starting point with a hand-picked opener and a ranked library.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-dim)]">
            {visibleCohorts.length} populated
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCohorts.map((c) => {
            const hex = cohortHex(c.accent);
            const count = videoCountBySlug.get(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/cohort/${c.slug}`}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(28,34,100,0.15)]"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${hexWithAlpha(hex, 0.07)}, transparent 55%)`,
                }}
              >
                {/* Accent edge */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ background: hex }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold leading-snug tracking-tight text-[color:var(--color-text)]">
                      {c.name}
                    </div>
                    <div className="editorial mt-1 text-sm italic leading-snug text-[color:var(--color-muted)]">
                      {c.tagline}
                    </div>
                  </div>
                  <span className="text-[color:var(--color-dim)] transition group-hover:translate-x-1 group-hover:text-[color:var(--color-accent)]">
                    →
                  </span>
                </div>
                <p className="text-sm leading-snug text-[color:var(--color-muted)]">
                  {c.blurb}
                </p>
                {count !== undefined && count > 0 && (
                  <div className="mt-auto flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-wider text-[color:var(--color-dim)]">
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: hex }}
                    />
                    {count} video{count === 1 ? "" : "s"}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Closing proof strip ═════════════════════════════════════════ */}
      <section className="container-app pt-20">
        <div className="card grid gap-6 p-8 sm:grid-cols-3 sm:p-10">
          <ProofCell
            headline="Human-curated."
            body="Every video passes a per-cohort keyword allowlist and a global denylist. Editorial, not algorithmic slop."
          />
          <ProofCell
            headline="Zero LLM tax."
            body="Ranking runs at ingest time, not per request. Search is Postgres full-text. Nothing waits on a model."
          />
          <ProofCell
            headline="Updated nightly."
            body="A scheduled job walks the YouTube Data API, scores new uploads, and merges them in. Fresh without churn."
          />
        </div>
      </section>
    </div>
  );
}

function HeroMetric({
  value,
  suffix,
  emphasis = false,
}: {
  value: string;
  suffix: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-3 " +
        (emphasis ? "sm:col-span-1" : "")
      }
    >
      <div
        className={
          "editorial leading-none tracking-tight " +
          (emphasis
            ? "text-3xl font-bold text-[color:var(--color-accent)] sm:text-4xl"
            : "text-2xl font-semibold text-[color:var(--color-text)] sm:text-3xl")
        }
      >
        {value}
      </div>
      <div className="mt-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[color:var(--color-dim)]">
        {suffix}
      </div>
    </div>
  );
}

function ProofCell({ headline, body }: { headline: string; body: string }) {
  return (
    <div>
      <div className="editorial text-xl font-semibold tracking-tight text-[color:var(--color-text)]">
        {headline}
      </div>
      <p className="mt-2 text-sm leading-snug text-[color:var(--color-muted)]">
        {body}
      </p>
    </div>
  );
}
