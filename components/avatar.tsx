import { cn } from "@/lib/utils";

/**
 * Avatar - shows the Dilly profile photo if one exists, else initials
 * on a deterministic gradient (same email always lands on the same gradient).
 *
 * The server has no way to know if a photo exists without an extra round-trip,
 * so we always reference the photo URL and rely on the <img onError> fallback
 * handled by the `photo-avatar.tsx` client variant.
 */

const GRADIENTS = [
  "from-[#7b9fff] to-[#b8caff]",
  "from-[#5ecfb0] to-[#9fe2cf]",
  "from-[#f5b942] to-[#f9d58c]",
  "from-[#c9a8f1] to-[#e3cff7]",
  "from-[#ff9ea0] to-[#ffc9ca]",
  "from-[#8fd1ec] to-[#c0e4f4]",
];

function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function initialsFrom(nameOrEmail: string): string {
  const trimmed = nameOrEmail.trim();
  if (!trimmed) return "?";
  if (trimmed.includes("@")) {
    return trimmed[0].toUpperCase();
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function InitialsAvatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = initialsFrom(name);
  const gradient = pickGradient(name);
  const style = { width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.4)) };
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-[#111] ring-1 ring-white/40",
        gradient,
        className,
      )}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
