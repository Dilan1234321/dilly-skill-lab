"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Smooth in-animation on every route change.
 *
 * Strategy: re-mount on pathname change via the `key` prop. The child subtree
 * plays a CSS keyframe (defined in globals.css as `.page-enter`) on mount,
 * which gives every navigation a consistent fade + subtle lift.
 *
 * Why not framer-motion: App Router + RSC children pass through this client
 * component unchanged. A keyed div is zero-dep, zero-hydration-cost, and
 * survives streaming.
 *
 * Why not the native View Transitions API: it requires intercepting every
 * <Link> click to wrap navigation in document.startViewTransition(), which
 * touches too many call sites and breaks non-standard link patterns
 * (command palette, form submits, server actions). A keyed wrapper is
 * lower risk and still feels polished.
 *
 * Out-animation caveat: we can't hold the outgoing frame in an SPA without
 * a renderer like framer-motion's AnimatePresence. The fade-in happens
 * quickly enough that the transition still reads as smooth - and we match
 * it with a 60ms delay so the incoming page doesn't pop before the router
 * has actually swapped the tree.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
