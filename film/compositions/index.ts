import type { ShotDef } from "../shots";
import { Hero1A } from "./hero1/Hero1A";
import { Hero1B } from "./hero1/Hero1B";
import { Hero1C } from "./hero1/Hero1C";
import { Hero2 } from "./Hero2";
import { Hero3 } from "./Hero3";
import { Hero4 } from "./Hero4";
import { Hero5 } from "./Hero5";

export const SHOTS: ShotDef[] = [
  { id: "Hero1", index: 1, variant: "A", name: "3 → the block · A · the page is the pavement", line: "The plate arrives paper-white, straight down on the sidewalk; the camera lifts and the block rises. The hairline is the curb.", seconds: 10, proves: "one metric → one place", component: Hero1A },
  { id: "Hero1B", index: 1, variant: "B", name: "3 → the block · B · the descent", line: "The page is a plan from 70 m; the 3 stamps onto Joe's lot; a crane-down settles into the street.", seconds: 10, proves: "one metric → one place", component: Hero1B },
  { id: "Hero1C", index: 1, variant: "C", name: "3 → the block · C · the page tilts in", line: "The page itself tilts into the street's ground plane: its footprint is Joe's lot, its bottom edge the curb.", seconds: 9, proves: "one metric → one place", component: Hero1C },
  { id: "Hero2", index: 2, name: "Friday mornings are slow → plan", line: "The sentence is the interface. Meaning becomes space, then one plan.", seconds: 17, proves: "owner speaks normally → structured understanding", component: Hero2 },
  { id: "Hero3", index: 3, name: "Approve → block → café screen", line: "One approved plan uses the reach that exists; a stranger becomes a relationship.", seconds: 15.5, proves: "screens belong inside Growth", component: Hero3 },
  { id: "Hero4", index: 4, name: "Does diesel count? → provenance", line: "Answered automatically, from the approved details, visibly.", seconds: 9, proves: "grounded, not invented", component: Hero4 },
  { id: "Hero5", index: 5, name: "Redeemed → return → 21", line: "A digital state becomes a person at a door, then a number Joe can count.", seconds: 14, proves: "digital → physical → measurable", component: Hero5 },
];
