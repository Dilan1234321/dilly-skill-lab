// Shared tier chip. Used by /profile (private) and /u/[slug] (public).

const TIERS = [
  { min: 600, label: "Fluent" },      // 10+ hours
  { min: 240, label: "Developing" },  // 4+ hours
  { min: 60, label: "Building" },     // 1+ hour
  { min: 0, label: "Exploring" },
];

export function tierLabel(minutes: number): string {
  for (const t of TIERS) if (minutes >= t.min) return t.label;
  return "Exploring";
}

export function MasteryTierChip({ minutes }: { minutes: number }) {
  const label = tierLabel(minutes);
  return <span className="chip chip-accent shrink-0">{label}</span>;
}
