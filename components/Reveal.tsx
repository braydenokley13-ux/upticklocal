"use client";

import { useEffect, useLayoutEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type RevealProps<T extends ElementType> = {
  as?: T;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Scroll reveal, ported from the prototype's `[data-rv]` pass: anything already
 * inside (or near) the first viewport renders as-is — only content the visitor
 * scrolls to earns the 26px rise.
 */
export default function Reveal<T extends ElementType = "div">({
  as,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as || "div") as ElementType;
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

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
