import Link from "next/link";
import { askSkills } from "@/lib/api";
import { COHORTS_BY_NAME } from "@/lib/cohorts";
import { VideoCard } from "@/components/video-card";
import { getLang } from "@/lib/lang-server";
import { AskForm } from "@/components/ask-form";

export const metadata = {
  title: "Ask Dilly Skills",
  description:
    "Describe what you're trying to learn in plain words. We'll find the right videos.",
};

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const lang = await getLang();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const result = query ? await askSkills(query, 18).catch(() => null) : null;

  return (
    <div className="container-app pb-20 pt-10 sm:pt-14">
      <div className="max-w-3xl">
        <div className="eyebrow">Ask</div>
        <h1 className="editorial mt-3 text-[2.25rem] leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
          Describe what you want to learn.
        </h1>
        <p className="mt-4 text-[color:var(--color-muted)] sm:text-lg">
          Plain words. Full sentences. We&apos;ll match it against every curated
          video in the library — no AI cost, no tracking, just search.
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        <AskForm initial={query} />
      </div>

      {query && result && (
        <>
          {result.cohorts.length > 0 && (
            <section className="mt-10">
              <div className="eyebrow">Looks like you&apos;re thinking about</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.cohorts.map(({ cohort }) => {
                  const c = COHORTS_BY_NAME[cohort];
                  if (!c) return null;
                  return (
                    <Link
                      key={cohort}
                      href={`/cohort/${c.slug}`}
                      className="chip chip-accent hover:text-[color:var(--color-accent)]"
                    >
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="flex items-end justify-between border-b border-[color:var(--color-border)] pb-4">
              <div>
                <div className="eyebrow">Matches</div>
                <h2 className="editorial mt-2 text-2xl tracking-tight sm:text-3xl">
                  {result.videos.length > 0
                    ? `${result.videos.length} ${result.videos.length === 1 ? "video" : "videos"} for "${query}"`
                    : "Nothing matched — try a shorter phrase."}
                </h2>
              </div>
            </div>

            {result.videos.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.videos.map((v) => (
                  <VideoCard key={v.id} video={v} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-8 text-center text-sm text-[color:var(--color-muted)]">
                <div className="editorial text-lg">
                  Try rephrasing with fewer words.
                </div>
                <div className="mt-1">
                  Good examples: &quot;landing a consulting internship&quot;,
                  &quot;SQL window functions&quot;, &quot;machine learning for finance&quot;.
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {!query && (
        <section className="mt-10">
          <div className="eyebrow">Some examples</div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <Link
                  href={`/ask?q=${encodeURIComponent(ex)}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-4 transition hover:border-[color:var(--color-accent)]"
                >
                  <span className="text-sm text-[color:var(--color-text)]">
                    {ex}
                  </span>
                  <span className="text-[color:var(--color-dim)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent)]">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const EXAMPLES = [
  "I'm a sophomore trying to get into quant finance",
  "How do I learn system design from scratch",
  "Preparing for a product management interview",
  "CRISPR and gene editing fundamentals",
  "I want to break into consulting from a non-target",
  "SQL window functions with real examples",
  "UX research methods for a capstone project",
  "MCAT biochemistry review",
];
