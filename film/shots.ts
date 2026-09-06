import type { ComponentType } from "react";
import { FPS } from "./tokens";

/**
 * The five gates. One registry feeds the Remotion root and the lab, so a
 * shot's duration and name never drift between the two.
 */
export type ShotDef = {
  id: string;
  /** Variants of one gate share an index; the lab groups them. */
  variant?: string;
  index: number;
  name: string;
  line: string;
  seconds: number;
  /** Exact length, when the shot is cut to the frame; `seconds` is then descriptive. */
  frames?: number;
  /** The product test the shot has to pass. */
  proves: string;
  component: ComponentType;
};

export const shotFrames = (s: Pick<ShotDef, "seconds" | "frames">) => s.frames ?? Math.round(s.seconds * FPS);
