import type { ShotDef } from "../shots";
import { Hero1A } from "./hero1/Hero1A";
import { Hero1B } from "./hero1/Hero1B";
import { Hero1C } from "./hero1/Hero1C";
import { Hero2 } from "./Hero2";
import { Hero4Offer } from "./Hero4";
import { ACT5_FRAMES, Act5Approve } from "./acts/Act5Approve";
import { ACT6_FRAMES, Act6TwoWays } from "./acts/Act6TwoWays";
import { ACT8_FRAMES, Act8Redeem } from "./acts/Act8Redeem";
import { ACT9_FRAMES, Act9Return } from "./acts/Act9Return";
import { ACT12_FRAMES, Act12Resolve } from "./acts/Act12Resolve";
import { FILM_FRAMES, Film } from "./Film";
import { TEASER_FRAMES, Teaser } from "./Teaser";

export const SHOTS: ShotDef[] = [
  { id: "Hero1", index: 1, variant: "A", name: "3 → the block · A · the page is the pavement", line: "The page is a photograph of the sidewalk in front of Joe's, blown to paper. The cream lifts, the camera lifts, the printed 3 stays on the pavement and stands up as the mark.", seconds: 10.5, proves: "one metric → one place", component: Hero1A },
  { id: "Hero1B", index: 1, variant: "B", name: "3 → the block · B · the descent", line: "The page is a plan from 70 m; the 3 stamps onto Joe's lot; a crane-down settles into the street.", seconds: 10, proves: "one metric → one place", component: Hero1B },
  { id: "Hero1C", index: 1, variant: "C", name: "3 → the block · C · the page tilts in", line: "The page itself tilts into the street's ground plane: its footprint is Joe's lot, its bottom edge the curb.", seconds: 9, proves: "one metric → one place", component: Hero1C },
  { id: "Hero2", index: 2, name: "Friday mornings are slow → plan", line: "The sentence is the interface. Meaning becomes space, then one plan.", seconds: 17, proves: "owner speaks normally → structured understanding", component: Hero2 },
  { id: "Hero3", index: 3, variant: "A", name: "Approve → the block, delivered", line: "One tap. The plan becomes one line, and the block lights only where Joe already has a way in.", seconds: ACT5_FRAMES / 24, frames: ACT5_FRAMES, proves: "thought becomes action, with nothing Joe doesn't have", component: Act5Approve },
  { id: "Hero3B", index: 3, variant: "B", name: "Two ways in → the same Offer", line: "A text to someone who said yes; a café screen for a stranger. Both arrive at one object.", seconds: ACT6_FRAMES / 24, frames: ACT6_FRAMES, proves: "screens belong inside Growth", component: Act6TwoWays },
  { id: "Hero4", index: 4, name: "Does diesel count? → provenance", line: "Answered automatically, from the approved details, visibly.", seconds: 9, proves: "grounded, not invented", component: Hero4Offer },
  { id: "Hero5", index: 5, variant: "A", name: "Offer → Pass → Redeem now", line: "The same slab becomes the pass; two taps; the block becomes the live redeemed state.", seconds: ACT8_FRAMES / 24, frames: ACT8_FRAMES, proves: "redemption without merchant work", component: Act8Redeem },
  { id: "Hero5B", index: 5, variant: "B", name: "Return → 1 · 4 · 9 · 14 · 21 → the proof", line: "A digital state goes into a pocket and through a door; a number Joe can count comes back to the page.", seconds: ACT9_FRAMES / 24, frames: ACT9_FRAMES, proves: "digital → physical → measurable", component: Act9Return },
  { id: "Resolve", index: 6, name: "Resolve · Uptick Growth", line: "The proof leaves; the name and one earned line remain.", seconds: ACT12_FRAMES / 24, frames: ACT12_FRAMES, proves: "the end is quiet", component: Act12Resolve },
  { id: "Teaser", index: 0, name: "Teaser · the silent loop", line: "Ten seconds of the thesis, cut to loop.", seconds: TEASER_FRAMES / 24, frames: TEASER_FRAMES, proves: "the film works muted", component: Teaser },
  { id: "Film", index: 0, name: "Uptick Growth · the film", line: "Twelve acts, one timeline.", seconds: FILM_FRAMES / 24, frames: FILM_FRAMES, proves: "the whole", component: Film },
];
