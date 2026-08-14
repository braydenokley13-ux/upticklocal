"use client";

import { useEffect, useRef } from "react";
import { onScrollFrame, prefersReducedMotion } from "@/lib/scroll";

type Props = {
  /** Fraction of viewport height travelled across a full pass. */
  amount: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * Slow foreground/background separation on the photography. The plane is
 * inset beyond its frame so the travel never exposes an edge.
 */
export default function Parallax({ amount, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    return onScrollFrame(() => {
      const vh = innerHeight;
      const r = el.getBoundingClientRect();
      const centered = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translateY(${(-centered * amount * 100).toFixed(1)}px)`;
    });
  }, [amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
