import type { ComponentType } from "react";
import { FPS } from "./tokens";

/**
 * The five gates. One registry feeds the Remotion root and the lab, so a
 * shot's duration and name never drift between the two.
 */
export type ShotDef = {
  id: "Hero1" | "Hero2" | "Hero3" | "Hero4" | "Hero5";
  index: number;
  name: string;
  line: string;
  seconds: number;
  /** The product test the shot has to pass. */
  proves: string;
  component: ComponentType;
};

export const shotFrames = (s: Pick<ShotDef, "seconds">) => Math.round(s.seconds * FPS);
