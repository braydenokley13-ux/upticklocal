"use client";

/**
 * The homepage has two cinematic sections separated by five chapters of DOM.
 * Rather than stand up a second WebGL context and a second copy of the block
 * for the finale, one renderer lives in a fixed layer behind the page and both
 * sections report their scroll progress here. The layer renders whichever one
 * is on screen, and stops entirely when neither is.
 */

export type StageSlot = "story" | "finale";

export type StageSnapshot = { slot: StageSlot; progress: number } | null;

const slots: Record<StageSlot, number | null> = { story: null, finale: null };
const listeners = new Set<(snapshot: StageSnapshot) => void>();

function current(): StageSnapshot {
  // The finale wins ties: it is the later section, so if both report in view
  // during a fast scroll we should already be looking at the closing pass.
  if (slots.finale !== null) return { slot: "finale", progress: slots.finale };
  if (slots.story !== null) return { slot: "story", progress: slots.story };
  return null;
}

/** `progress: null` means "this section has left the viewport". */
export function reportStage(slot: StageSlot, progress: number | null) {
  if (slots[slot] === progress) return;
  slots[slot] = progress;
  const snapshot = current();
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribeStage(fn: (snapshot: StageSnapshot) => void) {
  listeners.add(fn);
  fn(current());
  return () => {
    listeners.delete(fn);
  };
}
