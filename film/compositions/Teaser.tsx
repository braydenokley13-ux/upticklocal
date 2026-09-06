import { Sequence } from "remotion";
import { Hero1A, HERO1A_FRAMES } from "./hero1/Hero1A";

/**
 * TEASER · the silent loop for the web
 *
 * Ten seconds of the film's thesis, cut to loop: the page with the 3 is
 * already set when the loop begins, the cream lifts, the printed 3 stays on
 * the pavement as the camera rises across the street, and the settle cuts
 * hard back to the page — the film's own I → II grammar, so the join is a
 * cut, not a fade. No sound; the caption and the line carry it muted.
 */
const HEAD = 12;
export const TEASER_FRAMES = HERO1A_FRAMES - HEAD;

export const Teaser = () => (
  <Sequence from={-HEAD} durationInFrames={HERO1A_FRAMES} layout="none">
    <Hero1A />
  </Sequence>
);
