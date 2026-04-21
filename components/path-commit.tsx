"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPath,
  startPath,
  leavePath,
  pathProgress,
} from "@/lib/paths-client";

/**
 * Commit-to-path UI on the cohort page. Before commit: a single "Start the
 * path" CTA. After commit: a progress bar + done/total + "Leave path" option.
 *
 * Commitment and progress both live in localStorage. Zero server cost.
 */
export function PathCommit({
  cohortSlug,
  cohortName,
  videoIds,
  firstVideoId,
}: {
  cohortSlug: string;
  cohortName: string;
  videoIds: string[];
  firstVideoId: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(videoIds.length);

  function refresh() {
    const state = getPath(cohortSlug);
    setCommitted(!!state);
    const p = pathProgress(state);
    setDone(p.done);
    setTotal(p.total || videoIds.length);
  }

  useEffect(() => {
    setMounted(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener("dilly:paths", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("dilly:paths", handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortSlug]);

  function onStart() {
    startPath(cohortSlug, videoIds);
    refresh();
  }

  function onLeave() {
    if (confirm("Leave this path? Your completed steps are kept in your library.")) {
      leavePath(cohortSlug);
      refresh();
    }
  }

  if (!mounted) {
    // Render a stable placeholder pre-hydration so the layout doesn't jump
    return <div className="h-[72px]" aria-hidden />;
  }

  if (!committed) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <div className="eyebrow">Commit to the path</div>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            {total} steps · build real {cohortName.toLowerCase()} fluency. We&apos;ll
            track your progress as you watch.
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="btn btn-primary shrink-0"
        >
          Start the path →
        </button>
      </div>
    );
  }

  const pct = Math.round((done / Math.max(1, total)) * 100);
  const complete = done >= total && total > 0;
  const nextStep = videoIds[done] ?? firstVideoId;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="eyebrow">
            {complete ? "Path complete" : "In progress"}
          </span>
          <span className="text-sm text-[color:var(--color-muted)]">
            {done} of {total}
            {complete ? " · " : null}
            {complete ? <span className="text-[color:var(--color-accent)]">✓ 100%</span> : null}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!complete && nextStep && (
            <Link
              href={`/video/${nextStep}`}
              className="btn btn-primary text-xs"
            >
              Continue →
            </Link>
          )}
          <button
            type="button"
            onClick={onLeave}
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)] transition hover:text-[color:var(--color-accent)]"
          >
            Leave
          </button>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]">
        <div
          className="h-full rounded-full bg-[color:var(--color-accent)] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
