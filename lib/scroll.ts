"use client";

/**
 * One rAF-throttled scroll/resize loop shared by every scroll-driven effect on
 * the page. The prototype ran a single `fx()` on a global listener; this keeps
 * the same one-pass-per-frame budget no matter how many effects subscribe.
 */

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let listening = false;
let queued = false;

function flush() {
  queued = false;
  subscribers.forEach((fn) => fn());
}

function onEvent() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

export function onScrollFrame(fn: Subscriber): () => void {
  subscribers.add(fn);
  if (!listening) {
    listening = true;
    addEventListener("scroll", onEvent, { passive: true });
    addEventListener("resize", onEvent);
  }
  fn();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && listening) {
      listening = false;
      removeEventListener("scroll", onEvent);
      removeEventListener("resize", onEvent);
    }
  };
}

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
