"use client";

import { useEffect, useLayoutEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * `as` is deliberately limited to intrinsic tags. Passing a component (say
 * `next/link`) from a Server Component would mean handing a function across the
 * server/client boundary, which React rejects — see RevealLink for that case.
 */
type IntrinsicTag = keyof React.JSX.IntrinsicElements;

type RevealProps<T extends IntrinsicTag> = {
  as?: T;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Scroll reveal, ported from the prototype's `[data-rv]` pass: anything already
 * inside (or near) the first viewport renders as-is — only content the visitor
 * scrolls to earns the 26px rise.
 */
export function useReveal() {
  const ref = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < innerHeight * 0.88) return;

    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

export default function Reveal<T extends IntrinsicTag = "div">({
  as,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as || "div") as ElementType;
  const ref = useReveal();

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
