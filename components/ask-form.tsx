"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Large search bar for the /ask page. Submits to /ask?q=... */
export function AskForm({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/ask?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <textarea
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(e as unknown as React.FormEvent);
          }
        }}
        rows={2}
        placeholder="e.g. I'm a junior at UT studying CS and want a quant internship"
        className="w-full resize-none rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 pr-28 text-base leading-relaxed text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent)] sm:text-lg"
      />
      <button
        type="submit"
        className="btn btn-primary absolute bottom-4 right-4"
        disabled={!q.trim()}
      >
        Find videos →
      </button>
    </form>
  );
}
