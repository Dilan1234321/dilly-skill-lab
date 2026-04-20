import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getSession, hasProfilePhoto } from "@/lib/api";
import { getMyReceipts } from "@/lib/receipts";
import { schoolName } from "@/lib/schools";
import { PhotoAvatar } from "@/components/photo-avatar";
import { PhotoUpload } from "@/components/photo-upload";
import { TaglineEditor } from "@/components/tagline-editor";
import { LearningTrail } from "@/components/learning-trail";
import { MasterySignals } from "@/components/mastery-signals";

export const metadata = {
  title: "Your profile — Dilly Skills",
  description: "The Dilly profile behind your Dilly Skills account.",
};

// ────────────────────────────────────────────────────────────────────────────
// Field helpers — profile comes from Dilly as an untyped JSON blob
// ────────────────────────────────────────────────────────────────────────────

function s(p: Record<string, unknown> | null, key: string): string | null {
  const v = p?.[key];
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}
function arr(p: Record<string, unknown> | null, key: string): string[] {
  const v = p?.[key];
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}
function n(p: Record<string, unknown> | null, key: string): number | null {
  const v = p?.[key];
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const [session, profile, photoExists, receipts] = await Promise.all([
    getSession().catch(() => null),
    getProfile().catch(() => null),
    hasProfilePhoto().catch(() => false),
    getMyReceipts().catch(() => null),
  ]);
  if (!session) redirect("/sign-in?next=/profile");

  const name =
    s(profile, "full_name") ||
    s(profile, "name") ||
    s(profile, "first_name") ||
    session.email.split("@")[0];
  const email = session.email;

  const tagline = s(profile, "profile_tagline") ?? "";
  const bio = s(profile, "profile_bio");
  const school = schoolName(s(profile, "school") || s(profile, "school_id"));
  const pronouns = s(profile, "pronouns");
  const linkedin = s(profile, "linkedin_url");
  const readableSlug = s(profile, "readable_slug");

  // The public profile URL depends on user_type. Students live at /s/{slug},
  // everyone else at /p/{slug}. Matches projects/dilly/website/src/app/*.
  const userType = s(profile, "user_type") || "";
  const publicProfileUrl = readableSlug
    ? `https://hellodilly.com/${userType === "student" ? "s" : "p"}/${readableSlug}`
    : null;
  const publicProfileLabel = readableSlug
    ? `hellodilly.com/${userType === "student" ? "s" : "p"}/${readableSlug}`
    : null;

  const majors = arr(profile, "majors");
  const major = s(profile, "major");
  // Dedupe case-insensitively — 'major' is often duplicated in 'majors[0]'
  const seenMajors = new Set<string>();
  const allMajors = [major, ...majors]
    .filter((m): m is string => typeof m === "string" && m.trim().length > 0)
    .filter((m) => {
      const k = m.trim().toLowerCase();
      if (seenMajors.has(k)) return false;
      seenMajors.add(k);
      return true;
    });
  const minors = arr(profile, "minors");

  const gradYear = n(profile, "graduation_year");
  const educationLevel = s(profile, "education_level");
  const yearsExperience = n(profile, "years_experience");

  const currentRole = s(profile, "current_role") || s(profile, "current_job_title");
  const mostRecentRole = s(profile, "most_recent_role");
  const mostRecentIndustry = s(profile, "most_recent_industry");
  const applicationTarget =
    s(profile, "application_target_label") || s(profile, "application_target");
  const industryTarget = s(profile, "industry_target");
  const careerGoal = s(profile, "career_goal");
  const title = s(profile, "title");
  const field = s(profile, "field");

  const goals = arr(profile, "goals");
  const interests = arr(profile, "interests");
  const selfTaught = arr(profile, "self_taught_skills");
  const beyondResume =
    s(profile, "beyond_resume") || s(profile, "experience_expansion");
  const achievements = arr(profile, "achievements");

  const cohort = s(profile, "cohort");
  const extraCohorts = arr(profile, "extra_cohorts");
  const cohorts = arr(profile, "cohorts");
  const allCohorts = [cohort, ...extraCohorts, ...cohorts].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  ) as string[];

  // Cache-bust the avatar when anything photo-related changes
  const hasPhotoBust = (profile?.photo_updated_at as string | undefined) ?? String(photoExists);

  return (
    <div className="container-app pb-24 pt-10 sm:pt-16">
      {/* ═══ Hero ═══ */}
      <section className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
        <div className="relative">
          <PhotoAvatar name={name} size={160} bust={hasPhotoBust} className="h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44" />
        </div>
        <div className="min-w-0">
          <div className="eyebrow">Your profile</div>
          <h1 className="editorial mt-2 text-[2rem] leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            {name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[color:var(--color-muted)]">
            {pronouns && <span>{pronouns}</span>}
            {school && <span>·</span>}
            {school && <span>{school}</span>}
            {allMajors.length > 0 && <span>·</span>}
            {allMajors.length > 0 && <span>{allMajors.join(", ")}</span>}
            {gradYear && <span>·</span>}
            {gradYear && <span>Class of {gradYear}</span>}
          </div>
          <div className="mt-5">
            <TaglineEditor initial={tagline} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {publicProfileUrl && publicProfileLabel && (
              <a
                href={publicProfileUrl}
                target="_blank"
                rel="noopener"
                className="chip hover:text-[color:var(--color-accent)]"
              >
                {publicProfileLabel} ↗
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
                target="_blank"
                rel="noopener"
                className="chip hover:text-[color:var(--color-accent)]"
              >
                LinkedIn ↗
              </a>
            )}
            <span className="chip">{email}</span>
          </div>
        </div>
      </section>

      {/* ═══ Photo upload prompt (only when no photo) ═══ */}
      {!photoExists && (
        <section className="mt-10">
          <PhotoUpload hasExisting={false} />
        </section>
      )}

      {/* ═══ Receipts — the evidence trail ═══ */}
      {receipts && (receipts.total_seconds > 0 || receipts.videos_engaged > 0) && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
            <div>
              <div className="eyebrow">Your learning trail</div>
              <h2 className="editorial mt-1.5 text-2xl tracking-tight sm:text-3xl">
                Receipts, not claims.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[color:var(--color-muted)]">
                Every video you engage with, every takeaway you write. This is the
                evidence behind the skills you&apos;re building.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Stat label="Invested" value={formatHM(receipts.total_seconds)} />
            <Stat label="Videos" value={String(receipts.videos_engaged)} />
            <Stat label="Fields" value={String(receipts.cohorts_touched)} />
            <Stat label="Takeaways" value={String(receipts.articulations)} />
          </div>

          <div className="mt-8 card p-5 sm:p-6">
            <LearningTrail daily={receipts.daily} />
          </div>

          <div className="mt-6">
            <div className="eyebrow mb-3">By field</div>
            <MasterySignals cohorts={receipts.by_cohort} />
          </div>
        </section>
      )}

      <div className="rule" />

      {/* ═══ Story ═══ */}
      {(bio || careerGoal || goals.length > 0 || beyondResume) && (
        <Section title="Your story">
          {bio && <Prose>{bio}</Prose>}
          {careerGoal && (
            <LabeledBlock label="Career goal">{careerGoal}</LabeledBlock>
          )}
          {goals.length > 0 && (
            <LabeledBlock label="Goals">
              <ChipList items={goals} />
            </LabeledBlock>
          )}
          {beyondResume && (
            <LabeledBlock label="Beyond the resume">{beyondResume}</LabeledBlock>
          )}
        </Section>
      )}

      {/* ═══ Background ═══ */}
      {(currentRole ||
        mostRecentRole ||
        mostRecentIndustry ||
        yearsExperience != null ||
        educationLevel ||
        applicationTarget ||
        industryTarget ||
        title ||
        field) && (
        <Section title="Background">
          {currentRole && (
            <LabeledBlock label="Current role">{currentRole}</LabeledBlock>
          )}
          {mostRecentRole && (
            <LabeledBlock label="Most recent role">
              {mostRecentRole}
              {mostRecentIndustry ? ` · ${mostRecentIndustry}` : ""}
            </LabeledBlock>
          )}
          {title && <LabeledBlock label="Title">{title}</LabeledBlock>}
          {field && <LabeledBlock label="Field">{field}</LabeledBlock>}
          {yearsExperience != null && (
            <LabeledBlock label="Years of experience">
              {yearsExperience}
            </LabeledBlock>
          )}
          {educationLevel && (
            <LabeledBlock label="Education">{educationLevel}</LabeledBlock>
          )}
          {minors.length > 0 && (
            <LabeledBlock label="Minor">{minors.join(", ")}</LabeledBlock>
          )}
          {applicationTarget && (
            <LabeledBlock label="What you&apos;re aiming at">
              {applicationTarget}
            </LabeledBlock>
          )}
          {industryTarget && (
            <LabeledBlock label="Industry target">{industryTarget}</LabeledBlock>
          )}
        </Section>
      )}

      {/* ═══ Skills & interests ═══ */}
      {(interests.length > 0 || selfTaught.length > 0) && (
        <Section title="Skills & interests">
          {selfTaught.length > 0 && (
            <LabeledBlock label="Self-taught skills">
              <ChipList items={selfTaught} />
            </LabeledBlock>
          )}
          {interests.length > 0 && (
            <LabeledBlock label="Interests">
              <ChipList items={interests} />
            </LabeledBlock>
          )}
        </Section>
      )}

      {/* ═══ Cohort lens ═══ */}
      {allCohorts.length > 0 && (
        <Section title="Cohort lens">
          <div className="flex flex-wrap gap-2">
            {allCohorts.map((c) => (
              <Link
                key={c}
                href={`/cohort/${slugifyCohort(c)}`}
                className="chip chip-accent hover:text-[color:var(--color-accent)]"
              >
                {c}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ Achievements ═══ */}
      {achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="space-y-2">
            {achievements.map((a, i) => (
              <li
                key={i}
                className="rounded-lg border border-[color:var(--color-border)] bg-white p-3 text-sm"
              >
                {a}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ═══ Footer meta + replace photo ═══ */}
      {photoExists && (
        <Section title="Photo">
          <PhotoUpload hasExisting />
        </Section>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// UI primitives
// ────────────────────────────────────────────────────────────────────────────

function Section({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
        <h2 className="editorial text-2xl tracking-tight sm:text-3xl">{title}</h2>
        {editHref && (
          <a
            href={editHref}
            target="_blank"
            rel="noopener"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)] transition hover:text-[color:var(--color-accent)]"
          >
            Edit in Dilly ↗
          </a>
        )}
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function LabeledBlock({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="text-[color:var(--color-text)]">{children}</div>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-3xl whitespace-pre-wrap text-[1.05rem] leading-relaxed text-[color:var(--color-text)]">
      {children}
    </p>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="chip">
          {item}
        </span>
      ))}
    </div>
  );
}

function slugifyCohort(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-white p-4">
      <div className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-dim)]">
        {label}
      </div>
      <div className="editorial mt-1 text-2xl leading-none tracking-tight sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function formatHM(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}
