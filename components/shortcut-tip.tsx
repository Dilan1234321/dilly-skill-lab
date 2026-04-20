"use client";

import { useEffect, useState } from "react";

/**
 * One-time "Try ⌘K to jump anywhere" tooltip. Appears bottom-right on
 * first visit, auto-dismisses after 8s, can be closed manually, and never
 * comes back (dismissal stored in localStorage).
 */
const KEY = "skilllab.tip.cmdk.dismissed";

export function ShortcutTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    // Delay so it doesn't fight with the initial page load
    const show = window.setTimeout(() => setVisible(true), 2200);
    const hide = window.setTimeout(() => dismiss(), 2200 + 10_000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") localStorage.setItem(KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-xs animate-[tip-in_260ms_cubic-bezier(.2,.8,.2,1)_both] sm:right-8">
      <div className="flex items-start gap-3 rounded-xl border border-[color:var(--color-border-strong)] bg-white p-4 shadow-2xl">
        <span aria-hidden className="text-lg">⌨️</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[color:var(--color-text)]">
            Try ⌘K
          </div>
          <div className="mt-1 text-xs leading-relaxed text-[color:var(--color-muted)]">
            Jump to any field, role, or video in one keystroke. Or press{" "}
            <kbd className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] px-1.5 py-0.5 font-mono text-[0.65rem]">
              /
            </kbd>{" "}
            anywhere.
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-[color:var(--color-dim)] transition hover:text-[color:var(--color-text)]"
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes tip-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
