// Client-side learning-path commitments. Zero server state - everything
// lives in localStorage so anonymous users get the full commit/progress
// experience, and signed-in users get a durable record once we wire this
// into the profile receipts stream.
//
// A path is identified by its cohort slug (one path per cohort for v1).
// Every video on a cohort's "Start here" list counts as a step. When the
// user watches a step video ≥30s (the existing "markWatched" threshold in
// progress-client.ts), we also mark the matching path step as complete.
//
// This module is small and independent of the Dilly backend. Upgrades
// later can sync to /skill-lab/paths if we want cross-device progress.

"use client";

const KEY_PATHS = "skilllab.paths.v1";

type PathState = {
  cohort: string;           // cohort slug
  startedAt: string;        // ISO
  videoIds: string[];       // ordered step video ids
  completed: string[];      // video ids the user has watched
};

type PathsMap = Record<string, PathState>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function loadAll(): PathsMap {
  if (typeof window === "undefined") return {};
  return safeParse<PathsMap>(localStorage.getItem(KEY_PATHS), {});
}

function saveAll(map: PathsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_PATHS, JSON.stringify(map));
  // Fire a custom event so other tabs/components can react without polling
  window.dispatchEvent(new CustomEvent("dilly:paths"));
}

// ── Public API ────────────────────────────────────────────────────────────

export function getPath(cohortSlug: string): PathState | null {
  return loadAll()[cohortSlug] ?? null;
}

export function startPath(cohortSlug: string, videoIds: string[]): PathState {
  const map = loadAll();
  const existing = map[cohortSlug];
  if (existing) {
    // Refresh the step list in case curation changed, but keep completions
    const stillValid = existing.completed.filter((id) => videoIds.includes(id));
    const next: PathState = { ...existing, videoIds, completed: stillValid };
    map[cohortSlug] = next;
    saveAll(map);
    return next;
  }
  const fresh: PathState = {
    cohort: cohortSlug,
    startedAt: new Date().toISOString(),
    videoIds,
    completed: [],
  };
  map[cohortSlug] = fresh;
  saveAll(map);
  return fresh;
}

export function leavePath(cohortSlug: string): void {
  const map = loadAll();
  delete map[cohortSlug];
  saveAll(map);
}

export function markStepComplete(cohortSlug: string, videoId: string): PathState | null {
  const map = loadAll();
  const state = map[cohortSlug];
  if (!state) return null;
  if (!state.videoIds.includes(videoId)) return state;
  if (state.completed.includes(videoId)) return state;
  const next: PathState = {
    ...state,
    completed: [...state.completed, videoId],
  };
  map[cohortSlug] = next;
  saveAll(map);
  return next;
}

export function pathProgress(state: PathState | null): {
  done: number;
  total: number;
  fraction: number;
} {
  if (!state) return { done: 0, total: 0, fraction: 0 };
  const total = state.videoIds.length;
  const done = state.completed.length;
  return { done, total, fraction: total ? done / total : 0 };
}

/**
 * For a given video, returns the cohort slug of an active path it belongs to
 * - if any. Used by the video player to auto-mark a step complete when the
 * user finishes (or engages 30s+ with) the video.
 */
export function activePathForVideo(videoId: string): string | null {
  const map = loadAll();
  for (const [cohort, state] of Object.entries(map)) {
    if (state.videoIds.includes(videoId)) return cohort;
  }
  return null;
}
