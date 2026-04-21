import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublicProfile } from "@/lib/api";
import { schoolName } from "@/lib/schools";
import { COHORTS_BY_NAME } from "@/lib/cohorts";
import { cohortHex, hexWithAlpha } from "@/lib/cohort-colors";
import { MasteryTierChip } from "@/components/mastery-tier-chip";

export const metadata = {
  title: "Learning profile · Dilly Skills",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug).catch(() => null);
  if (!profile) notFound();

  const schoolLabel = schoolName(profile.school);
  const hoursLabel = formatHours(profile.total_seconds);
  const topCohort = profile.by_cohort[0]?.cohort ?? null;
  const topCohortMatch = topCohort ? COHORTS_BY_NAME[topCohort] : null;
  const heroAccent = topCohortMatch ? cohortHex(topCohortMatch.accent) : "#7b9fff";

  return (
    <div>
      {/* ── Hero with the top cohort's color wash ─────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `radial-gradient(1200px 320px at 12% -10%, ${hexWithAlpha(heroAccent, 0.30)}, transparent 65%)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(${hexWithAlpha(heroAccent, 0.14)} 1px, transparent 1.5px)`,
            backgroundSize: "22px 22px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 80%)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 80%)",
          }}
        />
        <div className="container-app relative pb-12 pt-14 sm:pb-16 sm:pt-20">
          <div className="flex items-center gap-3">
            <span className="relative block h-7 w-14 shrink-0">
              <Image
                src="/dilly-logo.png"
                alt="dilly"
                fill
                priority
                sizes="56px"
                className="object-contain object-left"
              />
            </span>
            <span className="editorial text-[1rem] font-bold tracking-tight text-[color:var(--color-text)]">
              Skills
            </span>
            <span className="text-[color:var(--color-dim)]">·</span>
            <span className="text-xs uppercase tracking-wider text-[color:var(--color-dim)]">
              Public learning profile
            </span>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <h1 className="editorial text-[2.5rem] leading-[1.02] tracking-tight text-[color:var(--color-text)] sm:text-5xl lg:text-6xl">
                {profile.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[color:var(--color-muted)]">
                {schoolLabel && <span>{schoolLabel}</span>}
                {profile.majors.length > 0 && schoolLabel && <span>·</span>}
                {profile.majors.length > 0 && <span>{profile.majors.join(", ")}</span>}
              </div>
              {profile.tagline && (
                <p className="editorial mt-5 max-w-2xl text-lg italic text-[color:var(--color-muted)] sm:text-xl">
                  {profile.tagline}
                </p>
              )}
              {profile.career && (
                <a
                  href={profile.career.url}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[color:var(--color-accent)] transition hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-lavender)]"
                >
                  <span aria-hidden>💼</span>
                  Career profile on Dilly
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>

            {/* Hero stats block */}
            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              <HeroStat label="Invested" value={hoursLabel} />
              <HeroStat label="Videos" value={String(profile.videos_engaged)} />
              <HeroStat label="Fields" value={String(profile.cohorts_touched)} />
              <HeroStat label="Receipts" value={String(profile.articulations)} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Career context: why they're learning what they are ────────── */}
      {profile.career &&
        (profile.career.career_goal ||
          profile.career.application_target ||
          profile.career.industry_target ||
          profile.career.goals.length > 0) && (
          <section className="container-app pt-10 sm:pt-14">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="eyebrow">Why they&apos;re learning this</div>
                <a
                  href={profile.career.url}
                  target="_blank"
                  rel="noopener"
                  className="text-[0.65rem] font-semibold uppercase tracking-wider text-[color:var(--color-muted)] transition hover:text-[color:var(--color-accent)]"
                >
                  Full career profile ↗
                </a>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {profile.career.application_target && (
                  <CareerFact
                    label="Aiming for"
                    value={profile.career.application_target}
                  />
                )}
                {profile.career.industry_target && (
                  <CareerFact
                    label="Industry"
                    value={profile.career.industry_target}
                  />
                )}
                {profile.career.career_goal && (
                  <CareerFact
                    label="Career goal"
                    value={profile.career.career_goal}
                    wide
                  />
                )}
                {profile.career.goals.length > 0 && (
                  <CareerFact
                    label="Short-term goals"
                    value={profile.career.goals.join(" · ")}
                    wide
                  />
                )}
              </div>
            </div>
          </section>
        )}

      {profile.by_cohort.length > 0 ? (
        <>
          <div className="container-app">
            <div className="rule" />
          </div>

          {/* ── What they've been building ────────────────────────────── */}
          <section className="container-app pb-10">
            <div className="eyebrow">Skills in motion</div>
            <h2 className="editorial mt-2 text-2xl tracking-tight sm:text-3xl">
              {profile.first_name}&apos;s mastery map.
            </h2>
            <p className="mt-2 max-w-2xl text-[color:var(--color-muted)]">
              Every chip is backed by real engagement — minutes invested,
              videos watched, takeaways articulated. Not self-reported.
            </p>
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {profile.by_cohort.map((c) => {
                const minutes = Math.round(c.seconds / 60);
                const match = COHORTS_BY_NAME[c.cohort];
                const href = match ? `/cohort/${match.slug}` : "#";
                return (
                  <li key={c.cohort}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-4 transition hover:border-[color:var(--color-accent)]"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[color:var(--color-text)]">
                          {c.cohort}
                        </div>
                        <div className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                          {formatMinutes(minutes)} · {c.videos} video{c.videos === 1 ? "" : "s"}
                        </div>
                      </div>
                      <MasteryTierChip minutes={minutes} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      ) : (
        <section className="container-app py-16 text-center text-[color:var(--color-muted)]">
          <div className="editorial text-xl">
            {profile.first_name} is just getting started.
          </div>
          <div className="mt-2 text-sm">
            Skills in motion will show up here as engagement builds.
          </div>
        </section>
      )}

      {/* ── Footer pitch for viewers to join ─────────────────────────── */}
      <section className="container-app pb-20 pt-6">
        <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center sm:px-10">
          <div className="eyebrow">Build your own</div>
          <h3 className="editorial text-2xl tracking-tight sm:text-3xl">
            Your learning, on the record.
          </h3>
          <p className="max-w-lg text-sm text-[color:var(--color-muted)]">
            Dilly Skills is a free library of the best learning videos on the
            internet. Start watching. Write a receipt. Share a profile like
            this of your own.
          </p>
          <div className="mt-2 flex gap-2">
            <Link href="/" className="btn btn-primary">
              Start learning →
            </Link>
            <Link href="/ask" className="btn btn-ghost">
              Ask the library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function CareerFact({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-dim)]">
        {label}
      </div>
      <div className="mt-1 text-[0.95rem] text-[color:var(--color-text)]">
        {value}
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-white p-4">
      <div className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-dim)]">
        {label}
      </div>
      <div className="editorial mt-1 text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function formatHours(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}
