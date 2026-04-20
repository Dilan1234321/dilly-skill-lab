"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * One-line editable tagline on the profile page. Click to edit, Enter or
 * blur to save. PATCHes /profile via our existing `patchProfile` server
 * action through a small route handler so the session cookie stays httpOnly.
 */
export function TaglineEditor({ initial }: { initial: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function commit() {
    setEditing(false);
    if (value === saved) return;
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/profile-field", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile_tagline: value.slice(0, 140) }),
      });
      if (!res.ok) {
        setError("Couldn't save.");
        setValue(saved);
      } else {
        setSaved(value);
        router.refresh();
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex max-w-2xl items-center gap-2 text-left text-lg italic text-[color:var(--color-muted)] transition hover:text-[color:var(--color-accent)] sm:text-xl"
      >
        <span>{saved || "Add a tagline…"}</span>
        <span className="text-xs text-[color:var(--color-dim)] opacity-0 transition group-hover:opacity-100">
          ✎
        </span>
      </button>
    );
  }

  return (
    <div className="max-w-2xl">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setValue(saved);
            setEditing(false);
          }
        }}
        maxLength={140}
        rows={2}
        disabled={pending}
        placeholder="One line about you…"
        className="editorial w-full resize-none rounded-lg border border-[color:var(--color-accent)] bg-white p-2 text-lg italic text-[color:var(--color-text)] outline-none sm:text-xl"
      />
      <div className="mt-1 text-xs text-[color:var(--color-dim)]">
        Enter to save · Esc to cancel · {value.length}/140
      </div>
      {error && <div className="mt-1 text-xs text-[color:var(--color-red)]">{error}</div>}
    </div>
  );
}
