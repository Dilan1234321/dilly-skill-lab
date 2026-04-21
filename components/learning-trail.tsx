import type { ReceiptDay } from "@/lib/receipts";

/**
 * Learning Trail - 60-day heatmap of the user's engaged minutes per day.
 * Modeled on GitHub's contribution graph: one cell per day, color intensity
 * scales with minutes. Empty days are shown explicitly - consistency is the
 * story, not volume.
 */
export function LearningTrail({ daily }: { daily: ReceiptDay[] }) {
  const days = buildCalendar(60, daily);
  const maxMin = Math.max(1, ...days.map((d) => Math.round(d.seconds / 60)));

  // Group into weeks for column layout (starting Sunday)
  const weeks: typeof days[] = [];
  let week: typeof days = [];
  for (const d of days) {
    week.push(d);
    if (new Date(d.day).getUTCDay() === 6 && week.length > 0) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  const totalMinutes = days.reduce((s, d) => s + Math.round(d.seconds / 60), 0);
  const activeDays = days.filter((d) => d.seconds > 0).length;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-[color:var(--color-muted)]">
            Last 60 days
          </div>
          <div className="editorial mt-1 text-xl">
            {formatHours(totalMinutes)} invested · {activeDays} active days
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[0.65rem] text-[color:var(--color-dim)]">
          Less
          <Cell intensity={0} />
          <Cell intensity={0.25} />
          <Cell intensity={0.5} />
          <Cell intensity={0.75} />
          <Cell intensity={1} />
          More
        </div>
      </div>

      <div className="mt-5 flex gap-1 overflow-x-auto pb-2">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {wk.map((d) => {
              const min = Math.round(d.seconds / 60);
              const intensity = Math.min(1, min / maxMin);
              return (
                <div
                  key={d.day}
                  className="group relative"
                  title={`${d.day} · ${min} min`}
                >
                  <Cell intensity={intensity} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Cell({ intensity }: { intensity: number }) {
  // Color scale: empty → accent. Uses opacity for light theme, not hue.
  const style = { backgroundColor: cellColor(intensity) };
  return (
    <span
      style={style}
      className="inline-block h-3 w-3 rounded-[2px] border border-[color:var(--color-border)]"
    />
  );
}

function cellColor(intensity: number): string {
  if (intensity <= 0) return "rgba(23, 28, 68, 0.04)";
  if (intensity < 0.25) return "rgba(28, 34, 100, 0.15)";
  if (intensity < 0.5) return "rgba(28, 34, 100, 0.35)";
  if (intensity < 0.75) return "rgba(28, 34, 100, 0.6)";
  return "rgba(28, 34, 100, 0.9)";
}

/** Builds N days ending today, filling in seconds from actual receipts. */
function buildCalendar(
  n: number,
  receipts: ReceiptDay[],
): { day: string; seconds: number }[] {
  const map = new Map(receipts.map((r) => [r.day, r.seconds] as const));
  const out: { day: string; seconds: number }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push({ day: iso, seconds: map.get(iso) ?? 0 });
  }
  return out;
}

function formatHours(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}
