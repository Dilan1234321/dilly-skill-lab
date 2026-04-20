"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal — fades a child up into view when it scrolls into the viewport.
 * Uses IntersectionObserver; falls back to immediate visibility if unsupported.
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            window.setTimeout(() => setShown(true), delay);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [delay]);

  const style: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(14px)",
    transition: "opacity 500ms cubic-bezier(.2,.7,.2,1), transform 520ms cubic-bezier(.2,.7,.2,1)",
    willChange: "opacity, transform",
  };

  // Cast for the polymorphic tag — TS has no first-class way to forward.
  const Element = Tag as unknown as React.ElementType;
  return (
    <Element ref={ref} style={style} className={className}>
      {children}
    </Element>
  );
}
