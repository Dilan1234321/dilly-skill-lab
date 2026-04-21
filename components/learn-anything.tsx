import Link from "next/link";
import { HomeAskInput } from "./home-ask-input";

/**
 * "Learn anything" - the universal, anyone-can-learn block that replaces
 * the old role-segmented editorial paths. Dilly Skills positions itself
 * as a library everyone shares, not a set of pre-defined tracks.
 *
 * Four pieces, in order of gravity:
 *   1. Oversize manifesto-feel headline + the ask input front and center.
 *   2. Quick-prompt tag cloud to seed ideas for anyone arriving cold.
 *   3. "Pillars" - three plainly-written promises, not role tracks.
 *   4. Link to the full cohort browser.
 */
export function LearnAnything({ populatedNames }: { populatedNames: string[] }) {
  return (
    <div className="container-app pt-24 sm:pt-32">
      {/* ── Manifesto ─────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl text-center">
        <div className="eyebrow">One library. Everyone.</div>
        <h2 className="editorial mt-4 text-[2.5rem] leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
          Anyone can learn{" "}
          <span className="italic text-[color:var(--color-accent)]">anything.</span>
        </h2>
        <p className="editorial mx-auto mt-6 max-w-2xl text-lg italic text-[color:var(--color-muted)] sm:text-xl">
          No tracks, no gatekeepers, no prerequisites. Type what you&apos;re
          curious about. We&apos;ll bring the best teachers on the internet to
          you.
        </p>
      </div>

      {/* ── The single input: Ask - real input, Enter submits ─────── */}
      <div className="mx-auto mt-10 max-w-3xl">
        <HomeAskInput />
      </div>

      {/* ── Quick prompts - shows range, sparks ideas ─────── */}
      <div className="mx-auto mt-6 max-w-4xl">
        <div className="mb-3 text-center text-xs uppercase tracking-wider text-[color:var(--color-dim)]">
          Or try one of these
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_PROMPTS.map((p) => (
            <Link
              key={p}
              href={`/ask?q=${encodeURIComponent(p)}`}
              className="rounded-full border border-[color:var(--color-border)] bg-white px-3.5 py-1.5 text-sm text-[color:var(--color-text)] transition hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-lavender)]"
            >
              {p}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Three promises (not role tracks) ──────────────── */}
      <div className="mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-3">
        <Pillar
          glyph="✦"
          title="Curated, not crawled"
          body="Every video earned its place. We throw out the clickbait, the 30-minute ramble, and the intro that never gets to the point."
        />
        <Pillar
          glyph="◇"
          title="Free, forever"
          body="No account needed to browse. No paywalls. No upsells on the video page. Learning should be infrastructure, not a product."
        />
        <Pillar
          glyph="○"
          title="Built for real skill"
          body="Save what helps, revisit when you want, build a receipt of what you've learned. The library works for the student, not the other way around."
        />
      </div>

      {/* ── Cohorts, as a library index ───────────────────── */}
      {populatedNames.length > 0 && (
        <div className="mx-auto mt-24 max-w-5xl text-center">
          <div className="eyebrow">The library, today</div>
          <h3 className="editorial mt-3 text-2xl tracking-tight sm:text-3xl">
            {populatedNames.length} fields open for exploring.
          </h3>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[color:var(--color-muted)]">
            {populatedNames.map((name) => (
              <span key={name} className="text-sm">
                {name}
              </span>
            ))}
          </div>
          <Link
            href="/browse"
            className="btn btn-ghost mt-8"
          >
            Browse everything →
          </Link>
        </div>
      )}
    </div>
  );
}

function Pillar({
  glyph,
  title,
  body,
}: {
  glyph: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card flex flex-col gap-3 p-6 sm:p-7">
      <span
        aria-hidden
        className="text-2xl text-[color:var(--color-accent)]"
      >
        {glyph}
      </span>
      <h4 className="editorial text-[1.15rem] leading-tight tracking-tight">
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
        {body}
      </p>
    </div>
  );
}

// Deliberately mixed: code, medicine, finance, writing, design, music-adjacent,
// liberal arts. Signals "literally anything."
const QUICK_PROMPTS = [
  "SQL window functions",
  "Financial modeling basics",
  "System design for a junior engineer",
  "MCAT biochemistry",
  "Writing a research paper",
  "Public speaking under pressure",
  "UX research interviews",
  "CRISPR gene editing",
  "Econometrics for beginners",
  "Teaching fractions to kids",
  "Case interview structure",
  "Constitutional law basics",
];
