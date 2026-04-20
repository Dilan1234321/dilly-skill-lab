// Mini-courses — Skill Lab's packaged learning. Each course is a sequenced
// set of videos pulled from a single cohort's top picks, presented as a
// course with a clear outcome. This is the core "structured learning, not a
// playlist" differentiator.
//
// We don't store course metadata in the DB. Instead, each course maps to a
// cohort slug + a count, and the homepage fills the course by fetching the
// cohort's top N videos at render time. Keeps the editorial layer light and
// eliminates manual video-id curation drift.

export type MiniCourse = {
  slug: string;
  title: string;
  outcome: string;
  cohort: string;
  videoCount: number;
  accent: "navy" | "green" | "amber";
};

export const MINI_COURSES: MiniCourse[] = [
  {
    slug: "system-design-90",
    title: "System design in 90 minutes",
    outcome:
      "Reason about load balancers, caches, and queues the way senior engineers actually do.",
    cohort: "software-engineering-cs",
    videoCount: 3,
    accent: "navy",
  },
  {
    slug: "sql-fundamentals",
    title: "SQL fundamentals, done right",
    outcome:
      "Write queries you trust. Window functions, joins, subqueries — no magic.",
    cohort: "data-science-analytics",
    videoCount: 4,
    accent: "green",
  },
  {
    slug: "financial-modeling-core",
    title: "Financial modeling, from zero",
    outcome:
      "Build a DCF by the end of the weekend. Ready for an analyst interview.",
    cohort: "finance-accounting",
    videoCount: 3,
    accent: "amber",
  },
  {
    slug: "case-interview-crash",
    title: "Case interview crash course",
    outcome:
      "Structure problems under pressure and sound like you've done this before.",
    cohort: "consulting-strategy",
    videoCount: 3,
    accent: "navy",
  },
];
