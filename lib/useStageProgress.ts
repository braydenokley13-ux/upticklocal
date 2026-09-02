"use client";

import { useCallback, type RefObject } from "react";
import { reportStage, type StageSlot } from "@/lib/three/stage-bus";
import { useScrollProgress, type ProgressCallback } from "@/lib/useScrollProgress";

type Options = {
  /** See useScrollProgress: drive styles from here, never React state. */
  onProgress?: ProgressCallback;
  /** Only the live cinematic needs this; the still presentation subscribes to nothing. */
  enabled?: boolean;
};

/**
 * Scroll progress for one of the two cinematic sections, published to the
 * shared WebGL layer as well as to the caller.
 */
export function useStageProgress(slot: StageSlot, ref: RefObject<HTMLElement | null>, { onProgress, enabled = true }: Options = {}) {
  const publish = useCallback<ProgressCallback>(
    (progress) => {
      reportStage(slot, progress);
      onProgress?.(progress);
    },
    // The caller's callback is read through a ref inside useScrollProgress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slot]
  );
  useScrollProgress(ref, publish, enabled);
}
