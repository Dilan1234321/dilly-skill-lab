"use client";

import { useEffect, useState } from "react";
import { isWatched } from "@/lib/progress-client";

/**
 * Thin client sibling to VideoCard. Reads localStorage for watched state
 * on hydration and renders a small check badge + dim overlay when true.
 *
 * Positioned absolutely so it sits inside the card's aspect-video wrapper.
 * Mounted alongside every VideoCard; silent for un-watched videos.
 */
export function WatchedOverlay({ videoId }: { videoId: string }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(videoId));
  }, [videoId]);

  if (!watched) return null;

  return (
    <>
      {/* Dim the thumbnail so watched videos recede visually */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/45"
      />
      {/* The check badge - navy pill with a white check */}
      <span
        aria-label="Watched"
        title="You've watched this"
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-accent)] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow-sm"
      >
        <svg
          width="10"
          height="10"
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
        Watched
      </span>
    </>
  );
}
