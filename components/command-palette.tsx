"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COHORTS } from "@/lib/cohorts";
import { INDUSTRIES } from "@/lib/industries";
import { cohortHex } from "@/lib/cohort-colors";
import type { Video } from "@/lib/types";

/**
 * Header command palette — the power-tool search. Does five things:
 *
 *   1. Live video search via GET /skill-lab/ask?q=...  (Postgres FTS, no LLM)
 *   2. Fuzzy-matches cohorts, industries, and in-app actions locally
 *   3. Remembers recent searches in localStorage
 *   4. Shows "ask the library" as a first-class option when the query is a
 *      full phrase, so any input always leads somewhere useful
 *   5. Full keyboard: ⌘K to open, / to open outside inputs, ↑↓ move, ↵ open,
 *      ⌘↵ open in new tab, Esc close.
 */

// ── Static items ──────────────────────────────────────────────────────────

type StaticItem = {
  kind: "industry" | "cohort" | "action";
  label: string;
  sub?: string;
  href: string;
};

const ACTIONS: StaticItem[] = [
  { label: "Ask the library", sub: "Describe what you want to learn", href: "/ask", kind: "action" },
  { label: "Your library", sub: "Saved videos", href: "/library", kind: "action" },
  { label: "Browse everything", sub: "Roles and fields", href: "/browse", kind: "action" },
  { label: "Your profile", sub: "Learning trail + receipts", href: "/profile", kind: "action" },
];

const STATIC_ITEMS: StaticItem[] = [
  ...ACTIONS,
  ...INDUSTRIES.map<StaticItem>((i) => ({
    kind: "industry",
    label: i.name,
    sub: i.tagline,
    href: `/industry/${i.slug}`,
  })),
  ...COHORTS.map<StaticItem>((c) => ({
    kind: "cohort",
    label: c.name,
    sub: c.tagline,
    href: `/cohort/${c.slug}`,
  })),
];

function staticScore(q: string, item: StaticItem): number {
  if (!q) return 0;
  const needle = q.toLowerCase();
  const label = item.label.toLowerCase();
  const sub = (item.sub || "").toLowerCase();
  if (label === needle) return 100;
  if (label.startsWith(needle)) return 80;
  if (label.includes(needle)) return 60;
  if (sub.includes(needle)) return 30;
  let li = 0;
  for (const ch of label) {
    if (ch === needle[li]) li++;
    if (li === needle.length) return 10;
  }
  return 0;
}

// ── Recent searches (localStorage) ────────────────────────────────────────

const RECENT_KEY = "skilllab.recent_asks.v1";
const MAX_RECENT = 5;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined") return;
  const trimmed = q.trim();
  if (!trimmed) return;
  try {
    const prev = loadRecent().filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const next = [trimmed, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

// ── Types used by the rendered rows ──────────────────────────────────────

type Row =
  | { kind: "ask"; phrase: string }
  | { kind: "video"; video: Video }
  | { kind: "static"; item: StaticItem }
  | { kind: "recent"; phrase: string };

// ── Trigger button in the nav ─────────────────────────────────────────────

export function CommandTrigger({ label = "Search" }: { label?: string }) {
  // Mount separate from visible state so the exit animation can play.
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"open" | "closed">("closed");

  function open() {
    setMounted(true);
    // Next frame: the CSS enter animation runs.
    requestAnimationFrame(() => setState("open"));
  }
  function close() {
    setState("closed");
    // Unmount after the exit animation finishes (match the ~200ms card-out).
    window.setTimeout(() => setMounted(false), 200);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        open();
        return;
      }
      if (k === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2.5 text-sm text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)] sm:gap-4 sm:px-4 sm:py-3.5"
        aria-label="Open command palette"
      >
        <SearchIcon />
        <span className="flex-1 truncate text-left text-xs sm:text-sm">
          <span className="sm:hidden">Search</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] px-2 py-0.5 font-mono text-[0.7rem] text-[color:var(--color-dim)] sm:inline-flex">
          ⌘K
        </kbd>
      </button>
      {mounted && <CommandModal state={state} onClose={close} />}
    </>
  );
}

// ── The modal ─────────────────────────────────────────────────────────────

function CommandModal({
  state,
  onClose,
}: {
  state: "open" | "closed";
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Hydrate recents once
  useEffect(() => {
    setRecent(loadRecent());
    inputRef.current?.focus();
  }, []);

  // Debounced live video search via /ask
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setVideos([]);
      setLoadingVideos(false);
      return;
    }
    setLoadingVideos(true);
    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setVideos(Array.isArray(data?.videos) ? data.videos.slice(0, 6) : []);
      } catch {
        if (!controller.signal.aborted) setVideos([]);
      } finally {
        if (!controller.signal.aborted) setLoadingVideos(false);
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [q]);

  // Build the row list
  const rows: Row[] = useMemo(() => {
    const trimmed = q.trim();
    const out: Row[] = [];

    if (trimmed.length > 0) {
      // Always offer the "ask" escape hatch first when the user is typing
      out.push({ kind: "ask", phrase: trimmed });
      videos.forEach((v) => out.push({ kind: "video", video: v }));

      const scored = STATIC_ITEMS.map((it) => ({ it, s: staticScore(trimmed, it) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 10);
      scored.forEach((x) => out.push({ kind: "static", item: x.it }));
    } else {
      // Empty state: recents + top suggestions
      recent.forEach((p) => out.push({ kind: "recent", phrase: p }));
      STATIC_ITEMS.slice(0, 10).forEach((it) => out.push({ kind: "static", item: it }));
    }
    return out;
  }, [q, videos, recent]);

  // Reset cursor when rows change shape
  useEffect(() => {
    setCursor(0);
  }, [q]);

  // Navigate or invoke the active row
  function openRow(row: Row, inNewTab = false) {
    let href = "";
    if (row.kind === "ask") {
      href = `/ask?q=${encodeURIComponent(row.phrase)}`;
      pushRecent(row.phrase);
    } else if (row.kind === "recent") {
      href = `/ask?q=${encodeURIComponent(row.phrase)}`;
      pushRecent(row.phrase);
    } else if (row.kind === "video") {
      href = `/video/${row.video.id}`;
    } else {
      href = row.item.href;
    }
    if (inNewTab && typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
      onClose();
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(rows.length - 1, c + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const picked = rows[cursor];
        if (picked) openRow(picked, e.metaKey || e.ctrlKey);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cursor, onClose]);

  // Scroll focus into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <div
      className="palette-overlay fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]"
      data-state={state}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[rgba(23,28,68,0.45)] backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="palette-card relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-[0_30px_80px_-20px_rgba(28,34,100,0.35)]"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] px-5 py-4">
          <span className="text-[color:var(--color-accent)]">
            <SearchIcon size={18} />
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search videos, roles, fields — or ask anything."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="skills-search"
            className="flex-1 bg-transparent text-[1rem] text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-dim)]"
          />
          {loadingVideos && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--color-border)] border-t-[color:var(--color-accent)]" />
          )}
          <kbd className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[color:var(--color-dim)]">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[62vh] overflow-auto py-1">
          <GroupedRows
            rows={rows}
            cursor={cursor}
            setCursor={setCursor}
            onPick={(row, meta) => openRow(row, meta)}
            q={q}
          />

          {rows.length === 0 && (
            <div className="px-5 py-8 text-sm text-[color:var(--color-muted)]">
              Nothing matches{" "}
              <span className="text-[color:var(--color-text)]">&ldquo;{q}&rdquo;</span>.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] px-4 py-2 text-[0.65rem] text-[color:var(--color-muted)]">
          <span>
            <kbd className="font-mono">↑↓</kbd> move ·{" "}
            <kbd className="font-mono">↵</kbd> open ·{" "}
            <kbd className="font-mono">⌘↵</kbd> new tab ·{" "}
            <kbd className="font-mono">esc</kbd> close
          </span>
          <span className="font-semibold">dilly Skills</span>
        </div>
      </div>
    </div>
  );
}

// ── Grouped row rendering ────────────────────────────────────────────────

function GroupedRows({
  rows,
  cursor,
  setCursor,
  onPick,
  q,
}: {
  rows: Row[];
  cursor: number;
  setCursor: (n: number) => void;
  onPick: (row: Row, meta: boolean) => void;
  q: string;
}) {
  // Group row indices by kind for nice section headings, preserving order
  const groups: { title: string; indices: number[] }[] = [];
  const pushTo = (title: string, idx: number) => {
    const g = groups.find((g) => g.title === title);
    if (g) g.indices.push(idx);
    else groups.push({ title, indices: [idx] });
  };
  rows.forEach((row, i) => {
    if (row.kind === "ask") pushTo("Ask the library", i);
    else if (row.kind === "video") pushTo("Videos", i);
    else if (row.kind === "recent") pushTo("Recent", i);
    else if (row.kind === "static") {
      if (row.item.kind === "action") pushTo("Quick actions", i);
      else if (row.item.kind === "industry") pushTo("Roles", i);
      else pushTo("Fields", i);
    }
  });

  return (
    <div>
      {groups.map((g) => (
        <div key={g.title} className="pt-2">
          <div className="px-5 pb-1 pt-2 text-[0.65rem] font-bold uppercase tracking-wider text-[color:var(--color-dim)]">
            {g.title}
          </div>
          {g.indices.map((i) => {
            const row = rows[i];
            return (
              <RowButton
                key={`${row.kind}-${i}`}
                index={i}
                row={row}
                active={i === cursor}
                onHover={() => setCursor(i)}
                onClick={(meta) => onPick(row, meta)}
                q={q}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function RowButton({
  index,
  row,
  active,
  onHover,
  onClick,
  q,
}: {
  index: number;
  row: Row;
  active: boolean;
  onHover: () => void;
  onClick: (meta: boolean) => void;
  q: string;
}) {
  const cls =
    "flex w-full items-center gap-3 px-5 py-2.5 text-left transition " +
    (active ? "bg-[color:var(--color-lavender)]" : "hover:bg-[color:var(--color-bg-soft)]");

  if (row.kind === "ask") {
    return (
      <button
        data-index={index}
        onMouseEnter={onHover}
        onClick={(e) => onClick(e.metaKey || e.ctrlKey)}
        className={cls}
      >
        <KindTag label="ask" tone="accent" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[color:var(--color-text)]">
            Ask: <span className="italic">&ldquo;{row.phrase}&rdquo;</span>
          </div>
          <div className="text-xs text-[color:var(--color-muted)]">
            Full natural-language search across the library
          </div>
        </div>
        {active && <EnterHint />}
      </button>
    );
  }

  if (row.kind === "recent") {
    return (
      <button
        data-index={index}
        onMouseEnter={onHover}
        onClick={(e) => onClick(e.metaKey || e.ctrlKey)}
        className={cls}
      >
        <KindTag label="↻" tone="dim" />
        <div className="min-w-0 flex-1 truncate text-sm text-[color:var(--color-text)]">
          {row.phrase}
        </div>
        {active && <EnterHint />}
      </button>
    );
  }

  if (row.kind === "video") {
    const v = row.video;
    const cohort = COHORTS.find((c) => c.name === v.cohort);
    const dot = cohort ? cohortHex(cohort.accent) : "#7b9fff";
    return (
      <button
        data-index={index}
        onMouseEnter={onHover}
        onClick={(e) => onClick(e.metaKey || e.ctrlKey)}
        className={cls}
      >
        <img
          src={v.thumbnail_url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="h-9 w-16 shrink-0 rounded bg-black object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-medium text-[color:var(--color-text)]">
            <Highlight text={v.title} q={q} />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[color:var(--color-muted)]">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: dot }}
            />
            <span className="truncate">{v.channel_title}</span>
            <span>·</span>
            <span className="shrink-0">{formatDuration(v.duration_sec)}</span>
          </div>
        </div>
        {active && <EnterHint />}
      </button>
    );
  }

  // static
  const it = row.item;
  const toneMap = {
    action: "dim",
    industry: "mint",
    cohort: "accent",
  } as const;
  const labelMap = { action: "go", industry: "role", cohort: "field" };
  return (
    <button
      data-index={index}
      onMouseEnter={onHover}
      onClick={(e) => onClick(e.metaKey || e.ctrlKey)}
      className={cls}
    >
      <KindTag label={labelMap[it.kind]} tone={toneMap[it.kind]} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[color:var(--color-text)]">
          <Highlight text={it.label} q={q} />
        </div>
        {it.sub && (
          <div className="truncate text-xs text-[color:var(--color-muted)]">{it.sub}</div>
        )}
      </div>
      {active && <EnterHint />}
    </button>
  );
}

// ── Small bits ────────────────────────────────────────────────────────────

function Highlight({ text, q }: { text: string; q: string }) {
  const needle = q.trim();
  if (!needle) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[rgba(28,34,100,0.12)] text-[color:var(--color-accent)]">
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  );
}

function KindTag({ label, tone }: { label: string; tone: "accent" | "mint" | "dim" }) {
  const cls =
    tone === "accent"
      ? "bg-[color:var(--color-accent)] text-white"
      : tone === "mint"
      ? "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]"
      : "bg-[color:var(--color-bg-soft)] text-[color:var(--color-muted)]";
  return (
    <span
      className={
        "inline-flex w-14 shrink-0 items-center justify-center rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider " +
        cls
      }
    >
      {label}
    </span>
  );
}

function EnterHint() {
  return (
    <kbd className="shrink-0 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[color:var(--color-dim)]">
      ↵
    </kbd>
  );
}

function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function formatDuration(sec: number): string {
  if (!sec || sec < 0) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    t.isContentEditable
  );
}
