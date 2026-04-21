# Skill Lab by Dilly

A living learning library. Free forever. No account required to browse. Curated YouTube videos across 22 academic fields and 16 professional roles, ranked for signal and filtered for topical fit.

Live: https://skills.hellodilly.com

## What it is

- **Free public site.** No paywall, no signup wall, no ads.
- **Editorial curation.** Videos must pass a per-cohort keyword allowlist and a global denylist to appear. Ranked algorithmically — zero LLM calls at request time.
- **Multi-language.** UI localized across English, Spanish, Portuguese, Hindi, French, and Mandarin. Videos filterable by language.
- **Living interface.** Streak tracking, resume playback, ⌘K command palette, keyboard shortcuts. Feels like a tool, not a brochure.
- **Tied to the Dilly account system.** One login works for Skill Lab and the full Dilly app. Profiles created here are first-class Dilly profiles.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Satoshi** (headlines + body) via Fontshare, **Inter** fallback
- **Dilly FastAPI** (`api.trydilly.com`) for auth, profile, video data, and saved library
- **Postgres** (AWS RDS) for video + saved library tables
- **Vercel** for hosting, deployed from this repo

## Project layout

```
app/                      Next.js App Router pages and route handlers
  api/                    Thin proxies to the Dilly FastAPI + cookie handlers
  browse/                 Full industry + cohort index
  cohort/[slug]/          Cohort page (Start here + library)
  industry/[slug]/        Industry page (at-risk vs moat + AI-era skills)
  library/                Saved videos (auth required)
  sign-in/                Email + 6-digit code sign-in
  sign-up/                3-step sign-up that creates a real Dilly profile
  video/[id]/             Video player + where-this-fits sidebar
components/               UI primitives + feature components
  video-player.tsx        YouTube IFrame API wrapper with resume-from-position
  today-panel.tsx         Homepage hero
  command-palette.tsx     ⌘K search
  ...
lib/                      Cohorts, industries, i18n, session state, progress store
db/migrations/            Postgres DDL for Skill Lab tables (applied to the Dilly RDS)
scripts/
  ingest.py               Nightly YouTube Data API crawl + scoring + upsert
```

## Environment variables

See `.env.example`. On Vercel, set:

- `DILLY_API_URL` — `https://api.trydilly.com`
- `NEXT_PUBLIC_SITE_URL` — `https://skills.hellodilly.com`

## Ingest

```bash
YOUTUBE_API_KEY=... \
DATABASE_URL=postgresql://... \
LANGUAGES=en \
python3 scripts/ingest.py
```

YouTube free quota is 10k units/day. One language across 22 cohorts uses ~8k. Rotate `LANGUAGES` across days to fill non-English libraries over the course of a week.

## Development

```bash
npm install
cp .env.example .env.local   # then fill in DILLY_API_URL etc.
npm run dev
```

Open http://localhost:3000.

## Deployment

This repo is linked to the Vercel project `dilly-skill-lab`. Pushes to `main` auto-deploy to production.
