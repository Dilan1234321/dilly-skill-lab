"use client";

import { useEffect, useMemo, useState } from "react";

/** Lightweight confetti - 14 tiny colored rects that fall for 900ms. */
function Confetti() {
  const pieces = useMemo(() => {
    const colors = ["#1c2264", "#7b9fff", "#5ecfb0", "#f5b942"];
    return Array.from({ length: 14 }, (_, i) => ({
      left: 8 + (i * 7) + (i % 3) * 2, // percent
      delay: (i % 5) * 60,
      color: colors[i % colors.length],
      rotate: (i * 37) % 360,
    }));
  }, []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-10px",
            width: 7,
            height: 9,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 1,
            animation: `confetti-fall 900ms ${p.delay}ms cubic-bezier(.2,.6,.4,1) forwards`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Articulation prompt - Dilly Skills's core "receipts" mechanic.
 * Appears below the player after the user has engaged for some time. Asks
 * one sentence. That answer becomes a receipt on their profile and -
 * eventually - evidence a recruiter can click to verify a skill claim.
 *
 * We don't gate watching on the answer. Skipping is fine; answering is
 * what compounds over time.
 */
export function ArticulationPrompt({
  videoId,
  isAuthed,
}: {
  videoId: string;
  isAuthed: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show the prompt after 60 seconds of the video being in the DOM - a proxy
  // for the user having actually engaged, not just opened the page.
  useEffect(() => {
    if (!isAuthed) return;
    const localKey = `skilllab.articulation.done.${videoId}`;
    if (typeof window !== "undefined" && localStorage.getItem(localKey)) {
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 60_000);
    return () => window.clearTimeout(timer);
  }, [videoId, isAuthed]);

  if (!isAuthed || dismissed || !visible) return null;

  async function submit() {
    const trimmed = value.trim();
    if (trimmed.length < 4) {
      setError("A sentence, please - ideally how you'd explain it to a friend.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          video_id: videoId,
          seconds_engaged: 0,
          articulation: trimmed,
        }),
      });
      if (!res.ok) {
        setError("Couldn't save. Try again in a sec.");
        setSaving(false);
        return;
      }
      setSaved(true);
      localStorage.setItem(`skilllab.articulation.done.${videoId}`, "1");
    } catch {
      setError("Couldn't save. Try again in a sec.");
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="card card-featured relative mt-5 overflow-hidden p-5 text-sm">
        <Confetti />
        <div className="relative flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 animate-[receipt-pop_400ms_cubic-bezier(.2,.9,.3,1.4)_both] items-center justify-center rounded-full bg-[color:var(--color-accent)] text-white"
          >
            ✓
          </span>
          <div>
            <div className="editorial text-base font-bold">Receipt saved.</div>
            <div className="mt-1 text-[color:var(--color-muted)]">
              It&apos;s on your profile now. Every receipt compounds into real
              evidence of what you&apos;ve learned.
            </div>
          </div>
        </div>
        <style>{`
          @keyframes receipt-pop {
            0% { transform: scale(0.4); opacity: 0; }
            60% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120px) rotate(540deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="card card-featured mt-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow">A quick receipt</div>
          <div className="editorial mt-1.5 text-lg sm:text-xl">
            In one sentence, what&apos;s the core idea you took away?
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 text-[color:var(--color-dim)] transition hover:text-[color:var(--color-text)]"
        >
          ×
        </button>
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-muted)]">
        Plain words. Like you&apos;re explaining it to a friend at dinner. This
        becomes part of your learning trail - recruiters can click into it later.
      </p>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        maxLength={500}
        rows={3}
        disabled={saving}
        placeholder="e.g. LEFT JOIN keeps every row from the left table, even when there&apos;s no match - useful for finding gaps."
        className="mt-4 w-full resize-none rounded-lg border border-[color:var(--color-border)] bg-white p-3 text-sm text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent)]"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[0.7rem] text-[color:var(--color-dim)]">
          ⌘↵ to save · {value.length}/500
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs font-semibold text-[color:var(--color-muted)] transition hover:text-[color:var(--color-text)]"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || value.trim().length < 4}
            className="btn btn-primary disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save receipt"}
          </button>
        </div>
      </div>
      {error && <div className="mt-2 text-xs text-[color:var(--color-red)]">{error}</div>}
    </div>
  );
}
