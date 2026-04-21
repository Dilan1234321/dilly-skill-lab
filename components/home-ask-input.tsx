"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Homepage Ask input. User types; Enter submits to /ask?q=... with the
 * query pre-filled. Clicking the Ask button without typing sends them
 * to a blank /ask so they can still browse the example prompts.
 */
export function HomeAskInput() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/ask?q=${encodeURIComponent(trimmed)}` : "/ask");
  }

  return (
    <form
      onSubmit={go}
      className="group relative flex items-center gap-3 rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 py-4 shadow-[0_2px_0_rgba(28,34,100,0.04)] transition focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_8px_32px_-16px_rgba(28,34,100,0.25)] hover:border-[color:var(--color-accent)] sm:px-6 sm:py-5"
    >
      <span aria-hidden className="flex-shrink-0 text-[color:var(--color-accent)]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go(e);
        }}
        placeholder="What do you want to learn? — anything goes."
        aria-label="Ask Dilly Skills"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        name="skills-home-ask"
        className="flex-1 bg-transparent text-base text-[color:var(--color-text)] placeholder:italic placeholder:text-[color:var(--color-muted)] focus:outline-none sm:text-lg"
      />
      <button
        type="submit"
        aria-label="Ask"
        className="flex-shrink-0 rounded-full bg-[color:var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white transition hover:px-4"
      >
        Ask →
      </button>
    </form>
  );
}
