"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp01, onScrollFrame } from "@/lib/scroll";

export type ProgressCallback = (progress: number | null) => void;

/**
 * Maps a tall section's scroll position to 0–1 across the viewport it pins,
 * on the shared per-frame scroll loop. `null` when the section leaves.
 *
 * Drive CSS custom properties or styles directly from the callback — never
 * React state, which would re-render on every scroll frame. With `enabled`
 * false nothing is subscribed at all: a section that is `display: none` at
 * this breakpoint costs no layout reads.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: ProgressCallback, enabled = true) {
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let wasVisible = false;
    const unsubscribe = onScrollFrame(() => {
      const vh = window.innerHeight || 1;
      const r = el.getBoundingClientRect();
      const visible = r.bottom > 0 && r.top < vh;
      if (!visible) {
        if (wasVisible) {
          wasVisible = false;
          callback.current(null);
        }
        return;
      }
      wasVisible = true;
      callback.current(clamp01(-r.top / Math.max(1, r.height - vh)));
    });

    return () => {
      unsubscribe();
      if (wasVisible) callback.current(null);
    };
  }, [ref, enabled]);
}
