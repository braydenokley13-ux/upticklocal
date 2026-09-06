import type { CSSProperties } from "react";
import { type Pt, type TrackData, trackAt } from "../../block/plate";
import { BUSINESS, GAP, JOES } from "../../data/joes";
import { OUT, ramp } from "../../motion";
import { Line, Mono, Numeral, Words } from "../../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../../tokens";

/**
 * What every Hero 1 variant shares: the editorial page (one number, one
 * sentence, silence), the mark the number becomes on Joe's lot, and the
 * block's own annotations once the world has settled. The variants differ
 * in how the page becomes the place.
 */
export const LEFT = 96;
export const PAGE_END_SEC = 4;

/** The page laid out around where the 3 will land (A, B) or low, on a wide baseline (C). */
export type PageLayout = "high" | "low";

export function PageHeader({ opacity, layout }: { opacity: number; layout?: PageLayout }) {
  return (
    <>
      <div style={{ position: "absolute", left: LEFT, top: 84, opacity }}>
        <Mono color={COLOR.inkFaint}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
        <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
          {GAP.when} · {GAP.window}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: LEFT, bottom: 84, opacity: opacity * 0.9 }}>
        <Mono color={COLOR.inkFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
      {layout === "low" && null}
    </>
  );
}

/** The number, the rule under it, the sentence. `size` at 720 is the page; the caller animates it down to a mark. */
export function BigNumeral({ x, y, size, opacity, color = COLOR.ink, weight = 200 }: { x: number; y: number; size: number; opacity: number; color?: string; weight?: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity }}>
      <Numeral value={GAP.visits} size={size} color={color} weight={weight} />
    </div>
  );
}

export function Sentence({ x, y, frame, start, opacity, size = 40, width = 760 }: { x: number; y: number; frame: number; start: number; opacity: number; size?: number; width?: number }) {
  const words = GAP.sentence.split(" ").length;
  const visible = frame < start ? -1 : Math.min(words - 1, Math.floor((frame - start) / 3));
  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
      <Line size={size} color={COLOR.inkSoft}>
        <Words text={GAP.sentence} visible={visible} />
      </Line>
    </div>
  );
}

/** Once the world has settled: the street's header, the mark on Joe's lot with its caption, the line, the disclaimer. */
export function SettledBlock({ frame, settleAt, land, plateFrame, T }: { frame: number; settleAt: number; land: Pt; plateFrame: number; T: TrackData }) {
  const settled = ramp(frame, settleAt, 14, OUT);
  const label = ramp(frame, settleAt - 8, 12, OUT);
  const line = ramp(frame, settleAt + 30, 16, OUT);
  const clock = String(T.meta.clock ?? "Friday · 07:12");
  void plateFrame;
  return (
    <>
      <div style={{ position: "absolute", left: LEFT, top: 84, opacity: settled }}>
        <Mono color={COLOR.onMarineSoft}>
          {JOES.BLOCK.street} · {clock}
        </Mono>
      </div>
      {/* the mark's caption and its dot on the pavement */}
      <div style={{ position: "absolute", left: land.x + 30, top: land.y - 12, opacity: label }}>
        <Mono color={COLOR.onMarineSoft} size={20}>
          {GAP.window} · {GAP.visits}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: land.x - 5, top: land.y + 30, width: 10, height: 10, borderRadius: 5, background: COLOR.onMarine, opacity: label, boxShadow: "0 0 10px rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", left: LEFT, bottom: 84, opacity: line }}>
        <Line size={34} color={COLOR.onMarine} weight={400} style={{ textShadow: "0 1px 14px rgba(0,0,0,0.65)" }}>
          Same street. Same morning.
        </Line>
      </div>
      <div style={{ position: "absolute", right: LEFT, bottom: 92, opacity: settled * 0.8 }}>
        <Mono color={COLOR.onMarineFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
    </>
  );
}

/** A vignette that keeps the eye inside the world once the page is gone. */
export function Vignette({ opacity }: { opacity: number }) {
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: opacity * 0.5, background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)`, width: WIDTH, height: HEIGHT }} />;
}

/** The mark: the 3 as a small type mark pinned to a tracked point. */
export function markStyle(land: Pt): CSSProperties {
  return { position: "absolute", left: land.x, top: land.y, transform: "translate(-50%, -50%)" };
}

export function landAt(T: TrackData, name: string, pf: number) {
  return trackAt(T, name, pf);
}
