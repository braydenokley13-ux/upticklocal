import { RESULT } from "../../data/joes";
import { OUT, ramp } from "../../motion";
import { Line, Mono, Numeral } from "../../primitives/Type";
import { COLOR } from "../../tokens";

/**
 * THE BUILD · shared by Acts VIII and IX
 *
 * The count of people through Joe's door, re-set by hand at each threshold:
 * 1 · 4 · 9 · 14 · 21. Never incremented, never a counter. It stands at the
 * page's left, where the 3 stood, and persists across the cut from the
 * forecourt into the store and back out.
 */
export const COUNT = { x: 96, top: 300, size: 380 } as const;

/** How many thresholds have happened by `frame`, and the count they set. */
export function buildState(frame: number, thresholds: number[]) {
  const stepIndex = thresholds.filter((f) => frame >= f).length; // 0..5
  const count = stepIndex === 0 ? 0 : RESULT.steps[stepIndex - 1];
  const prev = stepIndex > 1 ? RESULT.steps[stepIndex - 2] : 0;
  const lastStep = stepIndex > 0 ? thresholds[stepIndex - 1] : -100;
  const reset = ramp(frame, lastStep, 7, OUT);
  const doorMark = stepIndex > 0 ? Math.max(0, 1 - (frame - lastStep) / 14) : 0;
  return { stepIndex, count, prev, lastStep, reset, doorMark };
}

/** The count and its caption, on the marine world. `top`/`size` let Act IX grow it into the proof's numeral. */
export function BuildCount({ frame, thresholds, top = COUNT.top, size = COUNT.size, grow = 0, ink = false, caption = 1 }: { frame: number; thresholds: number[]; top?: number; size?: number; grow?: number; ink?: boolean; caption?: number }) {
  const { stepIndex, count, prev, reset } = buildState(frame, thresholds);
  if (stepIndex === 0) return null;
  return (
    <>
      {grow === 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 720, pointerEvents: "none", background: "linear-gradient(to right, rgba(4,12,16,0.5), rgba(4,12,16,0.28) 42%, rgba(4,12,16,0))" }} />}
      <div style={{ position: "absolute", left: COUNT.x, top }}>
        {reset < 1 && prev > 0 && grow === 0 && (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - reset }}>
            <Numeral value={prev} size={size} color={COLOR.onMarine} weight={200} />
          </div>
        )}
        <div style={{ opacity: grow > 0 ? 1 : reset, transform: grow > 0 ? "none" : `translateY(${(1 - reset) * 6}px)` }}>
          <Numeral value={count} size={size} color={ink ? COLOR.ink : COLOR.onMarine} weight={200} />
        </div>
      </div>
      {grow === 0 && caption > 0 && (
        <div style={{ position: "absolute", left: COUNT.x + 4, top: COUNT.top + COUNT.size * 0.82 + 10, opacity: caption }}>
          <Line size={30} color={COLOR.onMarineSoft}>
            through the door
          </Line>
        </div>
      )}
    </>
  );
}

/** A person at the door, each time: the amber mark on the threshold. */
export function DoorMark({ x, y, t }: { x: number; y: number; t: number }) {
  if (t <= 0) return null;
  return <div style={{ position: "absolute", left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: 5, background: COLOR.amber, opacity: t, boxShadow: `0 0 18px 5px rgba(226,162,79,${0.45 * t})` }} />;
}

/** The world's header: the street and the clock on the left, the plan live on the right. */
export function WorldHeader({ left, right, opacity, live = true }: { left: string; right: string; opacity: number; live?: boolean }) {
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 210, pointerEvents: "none", opacity, background: "linear-gradient(to bottom, rgba(4,12,16,0.42), rgba(4,12,16,0.16) 55%, rgba(4,12,16,0))" }} />
      <div style={{ position: "absolute", left: 96, top: 84, opacity }}>
        <Mono color={COLOR.onMarineSoft}>{left}</Mono>
      </div>
      <div style={{ position: "absolute", right: 96, top: 84, opacity, display: "flex", alignItems: "center", gap: 12 }}>
        {live && <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOR.mint, display: "inline-block" }} />}
        <Mono color={COLOR.onMarineSoft}>{right}</Mono>
      </div>
    </>
  );
}
