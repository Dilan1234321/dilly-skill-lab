// School id → full name. Mirrored from projects/dilly/api/schools.py so we
// can render "University of Tampa" instead of "utampa" on the profile.
// Keep in sync when new schools are added in Dilly.

export const SCHOOLS: Record<string, string> = {
  utampa: "University of Tampa",
};

/** Returns the canonical name for a school id, or the id itself as fallback. */
export function schoolName(id: string | null | undefined): string {
  if (!id) return "";
  const trimmed = id.trim();
  if (!trimmed) return "";
  return SCHOOLS[trimmed.toLowerCase()] ?? trimmed;
}
