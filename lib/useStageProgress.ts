"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp01, onScrollFrame } from "@/lib/scroll";
import { reportStage, type StageSlot } from "@/lib/three/stage-bus";

type Options = {
  /**
   * Called with 0–1 progress every frame the section is on screen, and with
   * `null` when it leaves. Use it to drive CSS custom properties directly —
   * never React state, which would re-render the page on every scroll frame.
   */
  onProgress?: (progress: number | null) => void;
};

/**
 * Maps a tall section's scroll position to 0–1 across its pinned viewport, and
 * publishes it to the shared WebGL layer.
 */
export function useStageProgress(
  slot: StageSlot,
  ref: RefObject<HTMLElement | null>,
  { onProgress }: Options = {}
) {
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let wasVisible = false;

    const unsubscribe = onScrollFrame(() => {
      const vh = window.innerHeight || 1;
      const r = el.getBoundingClientRect();
      const visible = r.bottom > 0 && r.top < vh;

      if (!visible) {
        if (wasVisible) {
          wasVisible = false;
          reportStage(slot, null);
          callback.current?.(null);
        }
        return;
      }

      wasVisible = true;
      const progress = clamp01(-r.top / Math.max(1, r.height - vh));
      reportStage(slot, progress);
      callback.current?.(progress);
    });

    return () => {
      unsubscribe();
      reportStage(slot, null);
    };
  }, [ref, slot]);
}
