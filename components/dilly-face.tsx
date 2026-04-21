// The Dilly smiley - the same face that lives inside the "i" in the dilly
// wordmark. Kept as a pure SVG component so it scales crisply and we don't
// pull another asset into /public.

export function DillyFace({
  size = 80,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dilly"
      className={className}
    >
      <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#1c2264" strokeWidth="5" />
      <circle cx="38" cy="46" r="3.5" fill="#1c2264" />
      <circle cx="62" cy="46" r="3.5" fill="#1c2264" />
      <path
        d="M36 58 Q50 72 64 58"
        stroke="#1c2264"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
