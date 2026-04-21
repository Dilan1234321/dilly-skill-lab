import type { Video } from "@/lib/types";

/**
 * Renders the pre-generated bulleted summary for a video. Comes from one of
 * two sources — parsed creator chapters or a cached Haiku pass — and is
 * fetched as plain text from the DB. Zero LLM at request time.
 *
 * Silent when no summary exists (not every video has one).
 */
export function WhatYoullLearn({ video }: { video: Video }) {
  const raw = video.summary?.trim();
  if (!raw) return null;

  // Parse "- Foo\n- Bar\n- Baz" → ["Foo", "Bar", "Baz"]
  const bullets = raw
    .split("\n")
    .map((l) => l.trim().replace(/^[-•·*]\s*/, ""))
    .filter((l) => l.length > 0 && l.length <= 200);

  if (bullets.length === 0) return null;

  const sourceLabel =
    video.summary_source === "chapters"
      ? "From the creator's chapters"
      : video.summary_source === "ai"
      ? "Auto-summarized"
      : "Overview";

  return (
    <section className="mt-6 rounded-2xl border border-[color:var(--color-border)] bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="eyebrow">What you&apos;ll learn</div>
        <span className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-dim)]">
          {sourceLabel}
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[0.95rem] leading-relaxed text-[color:var(--color-text)]"
          >
            <span
              aria-hidden
              className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-accent)]"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
