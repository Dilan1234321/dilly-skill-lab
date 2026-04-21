"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getPath,
  startPath,
  leavePath,
  pathProgress,
} from "@/lib/paths-client";

// Remember which paths we've already fired a celebration for - we only want
// the confetti to play once per completion, not every time the page loads.
const CELEBRATED_KEY = "skilllab.path_celebrated.v1";
function loadCelebratedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(CELEBRATED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function markCelebrated(slug: string) {
  if (typeof window === "undefined") return;
  const set = loadCelebratedSet();
  if (set.has(slug)) return;
  set.add(slug);
  localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...set]));
}

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
  const [celebrating, setCelebrating] = useState(false);
  const prevDone = useRef(0);

  function refresh() {
    const state = getPath(cohortSlug);
    setCommitted(!!state);
    const p = pathProgress(state);
    const isNewlyComplete =
      p.total > 0 &&
      p.done >= p.total &&
      prevDone.current < p.total &&
      !loadCelebratedSet().has(cohortSlug);
    setDone(p.done);
    setTotal(p.total || videoIds.length);
    prevDone.current = p.done;
    if (isNewlyComplete) {
      setCelebrating(true);
      markCelebrated(cohortSlug);
      // Auto-dismiss after animation time
      window.setTimeout(() => setCelebrating(false), 4800);
    }
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

      {celebrating && (
        <CelebrationOverlay
          cohortName={cohortName}
          steps={total}
          onClose={() => setCelebrating(false)}
        />
      )}
    </div>
  );
}

/**
 * Full-screen takeover for the moment a user finishes a path. Confetti,
 * a big badge with the cohort name, a shareable quote, and one next-step
 * CTA. Auto-dismisses after ~5s but can be closed any time.
 */
function CelebrationOverlay({
  cohortName,
  steps,
  onClose,
}: {
  cohortName: string;
  steps: number;
  onClose: () => void;
}) {
  const pieces = useMemo(() => {
    const colors = ["#1c2264", "#7b9fff", "#5ecfb0", "#f5b942", "#c9a8f1"];
    return Array.from({ length: 42 }, (_, i) => ({
      left: (i * 2.4 + (i % 3) * 1.2) % 100, // percent across the viewport
      delay: (i % 10) * 60,
      color: colors[i % colors.length],
      rotate: (i * 37) % 360,
      width: 6 + (i % 3) * 2,
      height: 9 + (i % 4),
    }));
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[rgba(23,28,68,0.55)] backdrop-blur-sm"
        style={{ animation: "celebrate-fade 260ms ease-out both" }}
      />

      {/* Confetti */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-20px",
              left: `${p.left}%`,
              width: p.width,
              height: p.height,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
              borderRadius: 1,
              animation: `celebrate-fall ${1400 + p.delay}ms ${p.delay}ms cubic-bezier(.2,.55,.3,1) forwards`,
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[color:var(--color-border-strong)] bg-white p-8 text-center shadow-[0_30px_80px_-20px_rgba(28,34,100,0.45)] sm:p-10"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "celebrate-pop 420ms cubic-bezier(.2,.9,.3,1.4) both" }}
      >
        {/* The badge */}
        <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(28,34,100,0.15) 0%, rgba(28,34,100,0) 70%)",
              animation: "celebrate-glow 2.4s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[color:var(--color-accent)] text-white shadow-[0_12px_40px_-10px_rgba(28,34,100,0.55)]"
            style={{ animation: "celebrate-spin 6s linear infinite" }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.12" />
            </svg>
          </div>
        </div>

        <div className="eyebrow mt-6">Path complete</div>
        <h2 className="editorial mt-2 text-[1.85rem] leading-tight tracking-tight sm:text-3xl">
          You just finished the {cohortName} path.
        </h2>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          {steps} videos · real engagement receipts · a mark on your
          learning trail nobody can fake.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
          >
            Keep going →
          </button>
          <Link href="/profile" className="btn btn-ghost" onClick={onClose}>
            See your trail
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes celebrate-fade {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes celebrate-pop {
          0% { opacity: 0; transform: translateY(12px) scale(0.9); }
          60% { transform: translateY(0) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes celebrate-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0.3; }
        }
        @keyframes celebrate-spin {
          from { transform: rotate(-8deg); }
          50%  { transform: rotate(8deg); }
          to   { transform: rotate(-8deg); }
        }
        @keyframes celebrate-glow {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
