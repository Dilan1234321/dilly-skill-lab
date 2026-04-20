"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DillyFace } from "./dilly-face";

/**
 * 5-second break between videos. Shown over the player once the current
 * video ends. Progress bar fills, then we route to the next video.
 * Cancellable — the user can click "Stay here" to stop the auto-advance.
 */
const BREAK_SECONDS = 5;

export function NextVideoBreak({
  show,
  nextTitle,
  nextId,
  onCancel,
}: {
  show: boolean;
  nextTitle: string;
  nextId: string;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const pct = Math.min(1, elapsed / BREAK_SECONDS);
      setProgress(pct);
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        router.push(`/video/${nextId}`);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, nextId, router]);

  if (!show) return null;

  const secondsLeft = Math.max(0, Math.ceil(BREAK_SECONDS * (1 - progress)));

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[rgba(10,12,30,0.92)] p-6 text-center backdrop-blur-sm">
      <DillyFace size={92} className="drop-shadow-[0_8px_40px_rgba(255,255,255,0.25)]" />

      <div>
        <div className="text-[0.7rem] uppercase tracking-wider text-white/60">
          Up next in {secondsLeft}s
        </div>
        <div className="editorial mt-2 line-clamp-2 max-w-xl text-xl font-semibold text-white sm:text-2xl">
          {nextTitle}
        </div>
      </div>

      <div
        className="h-1 w-64 overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="h-full bg-white transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Stay here
        </button>
        <button
          type="button"
          onClick={() => router.push(`/video/${nextId}`)}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1c2264] transition hover:bg-white/90"
        >
          Play now →
        </button>
      </div>
    </div>
  );
}
