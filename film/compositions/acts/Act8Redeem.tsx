import { AbsoluteFill } from "remotion";
import { useCurrentFrame } from "remotion";
import { PLATES, Plate } from "../../block/plate";
import { Grain } from "../../primitives/Grain";
import { IN, OUT, ramp } from "../../motion";
import { COLOR } from "../../tokens";

/**
 * ACT VIII · REDEMPTION, AS FIVE SHOTS
 *
 * Nothing in this act is composited. The pass is on a phone because a panel
 * inside the shot is emitting it; the press happens because a thumb moves; the
 * reward crosses the counter because a cup does. Remotion's job here is the
 * edit and only the edit — five cuts, no titles, no annotation, no metadata.
 *
 *   A  approach   the forecourt, a person walking to the door
 *   B  threshold  from inside, the door, the crossing
 *   C  counter    the staff's own side: a hand comes up holding a phone
 *   D  device     the pass, close. Redeem now. One press.
 *   E  device     the same frame: the live state
 *   F  coffee     the cup crosses the counter
 *
 * D and E are one continuous shot, because the whole argument is that nothing
 * cuts away between the action and its result.
 */

/** frames of each plate we actually use, and where the cut falls */
export const SHOTS8 = [
  { src: PLATES.approach, in: 4, len: 26 },
  { src: PLATES.threshold, in: 2, len: 24 },
  { src: PLATES.counter, in: 4, len: 24 },
  { src: PLATES.device, in: 6, len: 72 },
  { src: PLATES.coffee, in: 0, len: 26 },
] as const;

export const CUTS = SHOTS8.reduce<number[]>((acc, s) => [...acc, (acc[acc.length - 1] ?? 0) + s.len], [0]);
export const ACT8_FRAMES = CUTS[CUTS.length - 1];

export const Act8Redeem = () => {
  const frame = useCurrentFrame();
  // the room the customer walks into is quieter than the forecourt: one stop down at the cut,
  // recovered over eight frames, so the threshold is felt and not just seen
  const inside = ramp(frame, CUTS[1], 8, OUT);
  const settle = 1 - 0.22 * (1 - inside) * ramp(frame, CUTS[1] - 1, 1, OUT);
  return (
    <AbsoluteFill style={{ background: COLOR.marineDeep }}>
      {SHOTS8.map((s, i) => (
        <Plate key={s.src} src={s.src} from={CUTS[i] - s.in} frames={s.len + s.in} />
      ))}
      {/* the crossing, held for a beat: the doorway's brightness falls away as we go in */}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - settle, pointerEvents: "none" }} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
