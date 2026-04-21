"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "./avatar";

/**
 * Avatar that tries to load the Dilly profile photo and falls back to initials
 * when it 404s. Used in the nav and on the /profile page.
 *
 * `bust` is an optional cache-busting token - pass something that changes
 * when the user uploads a new photo (e.g. last-updated timestamp).
 */
export function PhotoAvatar({
  name,
  size = 32,
  className,
  bust,
}: {
  name: string;
  size?: number;
  className?: string;
  bust?: string | number;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) return <InitialsAvatar name={name} size={size} className={className} />;

  const src = bust ? `/api/profile-photo?v=${bust}` : `/api/profile-photo`;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{ width: size, height: size }}
      className={cn(
        "rounded-full object-cover ring-1 ring-white/40",
        className,
      )}
    />
  );
}
