"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PhotoAvatar } from "./photo-avatar";

/**
 * Signed-in user affordance in the nav. Avatar button; click or hover opens
 * a tiny menu with "View profile" and "Sign out".
 */
export function NavUser({
  name,
  email,
  signOutLabel,
}: {
  name: string;
  email: string;
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full ring-2 ring-transparent transition hover:ring-[color:var(--color-accent)]/40 focus-visible:ring-[color:var(--color-accent)]"
      >
        <PhotoAvatar name={name || email} size={36} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white shadow-lg"
        >
          <div className="border-b border-[color:var(--color-border)] p-3">
            <div className="truncate text-sm font-semibold text-[color:var(--color-text)]">
              {name || "You"}
            </div>
            <div className="truncate text-xs text-[color:var(--color-muted)]">{email}</div>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-[color:var(--color-text)] transition hover:bg-[color:var(--color-lavender)] hover:text-[color:var(--color-accent)]"
          >
            View your profile
          </Link>
          <Link
            href="/library"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-[color:var(--color-text)] transition hover:bg-[color:var(--color-lavender)] hover:text-[color:var(--color-accent)]"
          >
            Your library
          </Link>
          <form action="/api/sign-out" method="post" className="border-t border-[color:var(--color-border)]">
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2.5 text-left text-sm text-[color:var(--color-text)] transition hover:bg-[color:var(--color-lavender)] hover:text-[color:var(--color-accent)]"
            >
              {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
