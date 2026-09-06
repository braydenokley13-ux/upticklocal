import type { ComponentType } from "react";
import { Sequence } from "remotion";
import { HERO1A_FRAMES, Hero1A } from "./hero1/Hero1A";
import { Hero2, HERO2_TIMELINE } from "./Hero2";
import { Hero4Offer } from "./Hero4";
import { ACT5_FRAMES, Act5Approve } from "./acts/Act5Approve";
import { ACT6_FRAMES, Act6TwoWays } from "./acts/Act6TwoWays";
import { ACT8_FRAMES, Act8Redeem } from "./acts/Act8Redeem";
import { ACT9_FRAMES, Act9Return } from "./acts/Act9Return";
import { ACT12_FRAMES, Act12Resolve } from "./acts/Act12Resolve";
import { Sound } from "./Sound";

/**
 * UPTICK GROWTH · the film. Twelve acts on one timeline; every act begins
 * on the object the last one ended on, or on a cut the header's clock
 * motivates.
 */
export type Act = { id: string; name: string; frames: number; component: ComponentType; note: string };


export const ACTS: Act[] = [
  { id: "I", name: "The gap", frames: HERO1A_FRAMES, component: Hero1A, note: "3 → the sidewalk in front of Joe's, Friday 07:12" },
  { id: "II–IV", name: "Owner speaks · understands · one plan", frames: HERO2_TIMELINE.end, component: Hero2, note: "Friday mornings are slow → instruments → Morning Coffee Drop" },
  { id: "V", name: "Thought becomes action", frames: ACT5_FRAMES, component: Act5Approve, note: "Approve → one line → the block at dusk, delivered where Joe already has a way in" },
  { id: "VI", name: "Two ways in", frames: ACT6_FRAMES, component: Act6TwoWays, note: "a text Thursday evening · the café screen Friday 7:04 → the same Offer" },
  { id: "VII", name: "The relationship is useful", frames: 216, component: Hero4Offer, note: "Does diesel count? → the approved plan answers · 38 handled, 2 went to Joe" },
  { id: "VIII", name: "Offer → Pass → Redeem now", frames: ACT8_FRAMES, component: Act8Redeem, note: "the same slab; staff see it; two taps; the block becomes the live redeemed state" },
  { id: "IX–XI", name: "Physical · the build · the proof", frames: ACT9_FRAMES, component: Act9Return, note: "the pass goes into a pocket; 1 · 4 · 9 · 14 · 21; the page returns with the door's warmth" },
  { id: "XII", name: "Resolve", frames: ACT12_FRAMES, component: Act12Resolve, note: "Uptick Growth · Tell Uptick what you want more of." },
];

export const FILM_FRAMES = ACTS.reduce((s, a) => s + a.frames, 0);

export function actStarts(): number[] {
  const out: number[] = [];
  let f = 0;
  for (const a of ACTS) {
    out.push(f);
    f += a.frames;
  }
  return out;
}

export const Film = () => {
  const starts = actStarts();
  return (
    <>
      {ACTS.map((a, i) => {
        const C = a.component;
        return (
          <Sequence key={a.id} from={starts[i]} durationInFrames={a.frames} layout="none" name={`${a.id} · ${a.name}`}>
            <C />
          </Sequence>
        );
      })}
      <Sound />
    </>
  );
};
