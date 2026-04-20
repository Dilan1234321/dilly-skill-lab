// Maps Cohort.accent (a tailwind-esque color name) to an RGB hex + a tint
// we can use in gradients. Keeps cohort pages visually distinct without
// drowning the calm cream base of the site.

const PALETTE: Record<string, string> = {
  sky:     "#7cb6ff",
  indigo:  "#7b9fff",
  rose:    "#ff9ea0",
  amber:   "#f5b942",
  orange:  "#ff9e59",
  emerald: "#5ecfb0",
  teal:    "#6dd1c8",
  green:   "#8ac996",
  slate:   "#8a93ad",
  pink:    "#ff95c2",
  stone:   "#b0a595",
  violet:  "#b9a0f2",
  cyan:    "#7fd3e8",
  red:     "#ff8b8b",
  lime:    "#b7d966",
  blue:    "#6895ff",
  zinc:    "#a3a8b5",
  fuchsia: "#e89cd6",
  purple:  "#c9a8f1",
  yellow:  "#f4d76a",
  neutral: "#b3b3b3",
};

export function cohortHex(accent: string): string {
  return PALETTE[accent] ?? "#7b9fff";
}

/** Hex → rgba with given opacity (0–1). */
export function hexWithAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
