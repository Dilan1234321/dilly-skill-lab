"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard share chip for the user's own public Dilly Skills
 * profile. Uses the Dilly-convention prefix (/s or /p) passed in by the
 * caller so the shared link matches the user's career profile URL.
 */
export function ShareProfileChip({
  slug,
  prefix = "s",
}: {
  slug: string;
  prefix?: "s" | "p";
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://skills.hellodilly.com";
    const url = `${origin}/${prefix}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: open in a new tab so at least the URL is reachable
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="chip chip-accent transition hover:opacity-90"
      aria-label="Copy your public profile link"
    >
      {copied ? (
        <span className="flex items-center gap-1">
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
          Link copied
        </span>
      ) : (
        <>Share your profile ↗</>
      )}
    </button>
  );
}
