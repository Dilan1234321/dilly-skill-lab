import Link from "next/link";
import { TodayPanel } from "@/components/today-panel";
import { EditorialPaths } from "@/components/editorial-paths";
import { Reveal } from "@/components/reveal";
import { getProfile, getSession, listTrending, listVideosByCohort } from "@/lib/api";
import { getLang } from "@/lib/lang-server";
import {
  getStreak,
  getLastWatched,
  isFirstVisit,
} from "@/lib/session-state";

const DEFAULT_COHORT = "software-engineering-cs";
const FRESH_WINDOW_MS = 72 * 60 * 60 * 1000;

export default async function HomePage() {
  const lang = await getLang();
  const [streak, lastWatched, firstVisit, session] = await Promise.all([
    getStreak(),
    getLastWatched(),
    isFirstVisit(),
    getSession().catch(() => null),
  ]);
  // Only fetch profile when signed in — anonymous visits stay cheap.
  const profile = session ? await getProfile().catch(() => null) : null;
  const firstName = firstNameFrom(profile, session?.email);

  const todaySources = lastWatched
    ? await listVideosByCohort(lastWatched.cohort, { limit: 8, sort: "best", lang }).catch(() => [])
    : await listTrending(8, lang).catch(() => []);
  const todayVideo =
    todaySources.find((v) => v.id !== lastWatched?.id) ?? todaySources[0] ?? null;

  const fallback = !todayVideo
    ? await listVideosByCohort(DEFAULT_COHORT, { limit: 1, sort: "best", lang }).catch(() => [])
    : [];
  const pick = todayVideo ?? fallback[0] ?? null;

  const freshCount = todaySources.filter((v) => {
    const ts = new Date(v.published_at).getTime();
    return Number.isFinite(ts) && Date.now() - ts < FRESH_WINDOW_MS;
  }).length;

  return (
    <div>
      {/* ═══ Signed-in greeting above the Today panel ═══ */}
      {session && firstName && (
        <section className="container-app pt-10 sm:pt-14">
          <div className="eyebrow">Hey {firstName}</div>
          <h1 className="editorial mt-2 text-[2.2rem] leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            What do you want to learn today?
          </h1>
        </section>
      )}

      {/* ═══ The living front door — one pick, your state ═══ */}
      {pick ? (
        <TodayPanel
          video={pick}
          streak={streak}
          lastWatched={lastWatched}
          fresh={freshCount}
          session={session}
        />
      ) : (
        <FirstRunHero firstVisit={firstVisit} />
      )}

      {/* ═══ Three editorial paths — the curator's pick ═══ */}
      <Reveal as="section" className="container-app pt-20 sm:pt-28">
        <div className="flex items-end justify-between gap-4 border-b border-[color:var(--color-border)] pb-6">
          <div>
            <div className="eyebrow">Start somewhere</div>
            <h2 className="editorial mt-2 text-2xl tracking-tight sm:text-3xl">
              Three places to begin.
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
          >
            All roles & fields →
          </Link>
        </div>
        <div className="mt-8">
          <EditorialPaths />
        </div>
      </Reveal>
    </div>
  );
}

function firstNameFrom(
  profile: Record<string, unknown> | null,
  email?: string | null,
): string | null {
  const pickStr = (k: string) => {
    const v = profile?.[k];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const first = pickStr("first_name");
  if (first) return first;
  const full = pickStr("full_name") || pickStr("name");
  if (full) return full.split(/\s+/)[0];
  if (email) {
    const user = email.split("@")[0];
    // Capitalize the first letter for a friendlier greeting
    return user.charAt(0).toUpperCase() + user.slice(1);
  }
  return null;
}

function FirstRunHero({ firstVisit }: { firstVisit: boolean }) {
  return (
    <section className="container-app pt-16 sm:pt-24">
      <div className="max-w-3xl">
        <div className="eyebrow">{firstVisit ? "Start here" : "Welcome back"}</div>
        <h1 className="editorial mt-3 text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          Learn the skills <span className="italic">AI can&apos;t replace.</span>
        </h1>
        <p className="mt-4 text-[color:var(--color-muted)] sm:text-lg">
          Fetching your first pick…
        </p>
      </div>
    </section>
  );
}
