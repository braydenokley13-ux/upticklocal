import { Sequence } from "remotion";
import { Hero1A, HERO1A_FRAMES } from "./hero1/Hero1A";

/**
 * TEASER · the silent loop for the web
 *
 * Seven seconds of the film's thesis, cut to loop: the page with the 3 is
 * already set when the loop begins, the cream lifts, the printed 3 stays on
 * the pavement as the camera rises across the street, and the settle cuts
 * hard back to the page — the film's own I → II grammar, so the join is a
 * cut, not a fade. No sound; the caption and the line carry it muted.
 */
/**
 * Where the loop starts, in Hero 1A's own frames. It has to be a page that is
 * already *set*, because a loop has no run-up: whoever arrives sees this frame
 * first, and sees it again every time round. Act I builds the page over its
 * first two seconds — the header at 2-14, the numeral 14-31, the rule 29-48,
 * the sentence one word every three frames from 31 to 49 — so frame 50 is the
 * first frame on which the whole idea is standing. (An earlier cut opened on
 * frame 12, where the page is empty but for a header still fading up.) The 22
 * frames from here to the cut at 72 are the film's own hold, kept intact.
 */
const HEAD = 50;
export const TEASER_FRAMES = HERO1A_FRAMES - HEAD;

export const Teaser = () => (
  <Sequence from={-HEAD} durationInFrames={HERO1A_FRAMES} layout="none">
    <Hero1A />
  </Sequence>
);
