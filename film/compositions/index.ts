import type { ShotDef } from "../shots";
import { Hero1 } from "./Hero1";
import { Hero2 } from "./Hero2";
import { Hero3 } from "./Hero3";
import { Hero4 } from "./Hero4";
import { Hero5 } from "./Hero5";

export const SHOTS: ShotDef[] = [
  { id: "Hero1", index: 1, name: "3 → the physical block", line: "One business metric becomes one physical local reality.", seconds: 11, proves: "one metric → one place", component: Hero1 },
  { id: "Hero2", index: 2, name: "Friday mornings are slow → plan", line: "The sentence is the interface. Meaning becomes space, then one plan.", seconds: 17, proves: "owner speaks normally → structured understanding", component: Hero2 },
  { id: "Hero3", index: 3, name: "Approve → block → café screen", line: "One approved plan uses the reach that exists; a stranger becomes a relationship.", seconds: 15.5, proves: "screens belong inside Growth", component: Hero3 },
  { id: "Hero4", index: 4, name: "Does diesel count? → provenance", line: "Answered automatically, from the approved details, visibly.", seconds: 9, proves: "grounded, not invented", component: Hero4 },
  { id: "Hero5", index: 5, name: "Redeemed → return → 21", line: "A digital state becomes a person at a door, then a number Joe can count.", seconds: 14, proves: "digital → physical → measurable", component: Hero5 },
];
