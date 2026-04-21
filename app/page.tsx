import { TodayPanel } from "@/components/today-panel";
import { LearnAnything } from "@/components/learn-anything";
import { Reveal } from "@/components/reveal";
import {
  getProfile,
  getSession,
  getVideo,
  listPopulatedCohorts,
  listTrending,
  listVideosByCohort,
} from "@/lib/api";
import { getMyReceipts } from "@/lib/receipts";
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
  // Only fetch profile + receipts when signed in - anonymous visits stay cheap.
  const [profile, receipts] = session
    ? await Promise.all([
        getProfile().catch(() => null),
        getMyReceipts().catch(() => null),
      ])
    : [null, null];
  const firstName = firstNameFrom(profile, session?.email);

  // Populated cohort names drive the "library, today" index
  const populatedCohorts = await listPopulatedCohorts().catch(() => []);
  const populatedNames = populatedCohorts
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((c) => c.name);

  // The hero video is, in order of preference:
  //   1. The video the user was actively watching (resumes from localStorage
  //      position on the video page)
  //   2. The top video in their last-watched cohort (so it still feels personal)
  //   3. Trending across the whole library
  //   4. A final fallback to the default cohort so the page always renders
  const resumeVideo = lastWatched
    ? await getVideo(lastWatched.id).catch(() => null)
    : null;

  const cohortTop = lastWatched
    ? await listVideosByCohort(lastWatched.cohort, { limit: 8, sort: "best", lang }).catch(() => [])
    : [];
  const trendingTop =
    cohortTop.length === 0
      ? await listTrending(8, lang).catch(() => [])
      : [];

  const todaySources = cohortTop.length > 0 ? cohortTop : trendingTop;

  const nonResumePick =
    todaySources.find((v) => v.id !== lastWatched?.id) ?? todaySources[0] ?? null;

  const fallback =
    !resumeVideo && !nonResumePick
      ? await listVideosByCohort(DEFAULT_COHORT, { limit: 1, sort: "best", lang }).catch(() => [])
      : [];

  const pick = resumeVideo ?? nonResumePick ?? fallback[0] ?? null;
  const isResume = Boolean(resumeVideo && pick && pick.id === resumeVideo.id);

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

      {/* ═══ The living front door - one pick, your state ═══ */}
      {pick ? (
        <TodayPanel
          video={pick}
          streak={streak}
          lastWatched={lastWatched}
          fresh={freshCount}
          session={session}
          resume={isResume}
          receipts={receipts}
        />
      ) : (
        <FirstRunHero firstVisit={firstVisit} />
      )}

      {/* ═══ Universal "anyone can learn anything" block ═══ */}
      <Reveal as="section">
        <LearnAnything populatedNames={populatedNames} />
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
