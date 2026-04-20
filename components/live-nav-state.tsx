"use client";

import { useEffect, useState } from "react";
import { loadTimeToday, formatMinutes } from "@/lib/progress-client";

/**
 * Tiny live chip in the nav showing "time invested today". Updates every
 * 30s so it feels alive, not static.
 */
export function TimeInvestedChip() {
  const [sec, setSec] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setSec(loadTimeToday().sec);
    tick();
    const id = window.setInterval(tick, 30_000);
    window.addEventListener("storage", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", tick);
    };
  }, []);

  if (sec === null || sec < 60) return null;
  return (
    <span className="chip chip-mint" title="Time invested today">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-mint)]" />
      {formatMinutes(sec)} today
    </span>
  );
}

/**
 * Streak chip with milestone styling.
 *   day 1–2: quiet
 *   day 3+ : accent pulse
 *   day 7+ : fire emoji
 *   day 30+: trophy emoji + stronger glow
 */
export function StreakChip({ streak }: { streak: number }) {
  if (!streak) return null;
  const milestone =
    streak >= 30 ? "trophy" : streak >= 14 ? "fire2" : streak >= 7 ? "fire" : streak >= 3 ? "hot" : "warm";

  const icon =
    milestone === "trophy" ? "🏆" :
    milestone === "fire2" ? "🔥" :
    milestone === "fire" ? "🔥" :
    null;

  const dotClass =
    milestone === "warm"
      ? "bg-white/40"
      : "bg-[color:var(--color-accent)] animate-pulse";

  const chipClass =
    milestone === "trophy"
      ? "chip chip-accent shadow-[0_0_0_4px_rgba(28,34,100,0.08)]"
      : milestone === "warm"
      ? "chip"
      : "chip chip-accent";

  return (
    <span className={chipClass} title={`${streak}-day streak`}>
      {icon ? (
        <span aria-hidden className="text-xs leading-none">{icon}</span>
      ) : (
        <span className={"h-1.5 w-1.5 rounded-full " + dotClass} />
      )}
      {streak}-day streak
    </span>
  );
}
