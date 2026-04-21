"use client";

import { useEffect, useState } from "react";
import { getPath } from "@/lib/paths-client";

/**
 * Replaces the generic step-number bubble when the user is on a committed
 * path — turns into a filled accent dot with a check once the step is done.
 * Returns null on non-committed or non-matching cohorts so the default
 * number keeps rendering.
 */
export function PathStepDot({
  cohortSlug,
  videoId,
  stepNumber,
}: {
  cohortSlug: string;
  videoId: string;
  stepNumber: number;
}) {
  const [status, setStatus] = useState<"none" | "pending" | "done">("none");

  function refresh() {
    const state = getPath(cohortSlug);
    if (!state) return setStatus("none");
    if (state.completed.includes(videoId)) return setStatus("done");
    setStatus("pending");
  }

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("dilly:paths", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("dilly:paths", handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortSlug, videoId]);

  if (status === "none") return null;

  if (status === "done") {
    return (
      <span
        aria-label="Step complete"
        className="step-number mt-0.5 border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 8.5l3.5 3.5L13 4.5" />
        </svg>
      </span>
    );
  }

  // "pending" — still show the number, but with the committed-path ring color
  return (
    <span
      aria-label={`Step ${stepNumber}, not yet watched`}
      className="step-number mt-0.5 border-[color:var(--color-accent)]/70 bg-[color:var(--color-lavender)]"
    >
      {stepNumber}
    </span>
  );
}
