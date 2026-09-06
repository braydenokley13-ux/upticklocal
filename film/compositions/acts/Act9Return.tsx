import { AbsoluteFill, useCurrentFrame } from "remotion";
import trackRise from "../../../blender/exports/rise.json";
import { PLATES, Plate, trackAt, type TrackData } from "../../block/plate";
import { RESULT } from "../../data/joes";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Grain } from "../../primitives/Grain";
import { Line, Numeral } from "../../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../../tokens";

/**
 * ACTS IX–XII · THE MORNING BUILDS, AND THE ONE THING THAT SURVIVES IT
 *
 * No count over the world. No score. Four physical beats — someone leaving the
 * pump, two people along the frontage, the door later with the light moved, and
 * then the lane the first customer walked, from further back and higher, with
 * the morning gone over.
 *
 * The crossing back to the page is a match, not a dissolve. The line where the
 * store meets its forecourt runs level across the last shot; Blender exports
 * that line's two ends; the page's rule is drawn on exactly those pixels. The
 * world washes out from under it and the rule stays, and the 21 sits on it.
 */
const TR = trackRise as unknown as TrackData;

export const SHOTS9 = [
  { src: PLATES.morningPump, in: 3, len: 24 },
  { src: PLATES.morningWalk, in: 2, len: 26 },
  { src: PLATES.morningDoor, in: 2, len: 22 },
  { src: PLATES.rise, in: 0, len: 40 },
] as const;

export const CUTS9 = SHOTS9.reduce<number[]>((acc, s) => [...acc, (acc[acc.length - 1] ?? 0) + s.len], [0]);
const RISE_AT = CUTS9[3];
const WASH = RISE_AT + 20; // the morning takes the set
const PROOF = WASH + 16;
export const ACT9_FRAMES = PROOF + 116;

/** Where the store's base line finished, in page pixels. Act XII keeps the rule there. */
export function residueY() {
  const l = trackAt(TR, "base_l", 39);
  const r = trackAt(TR, "base_r", 39);
  return l.y + (r.y - l.y) * 0.5;
}

export const Act9Return = () => {
  const frame = useCurrentFrame();
  const riseFrame = Math.max(0, Math.min(39, frame - RISE_AT));
  const wash = ramp(frame, WASH, 26, PLANE);
  const l = trackAt(TR, "base_l", riseFrame);
  const r = trackAt(TR, "base_r", riseFrame);
  const ruleY = l.y + (r.y - l.y) * 0.5;

  const numeral = ramp(frame, PROOF + 6, 14, OUT);
  const said = ramp(frame, PROOF + 26, 14, OUT);
  const split = ramp(frame, PROOF + 62, 16, OUT);

  return (
    <AbsoluteFill style={{ background: COLOR.marineDeep }}>
      {SHOTS9.map((s, i) => (
        <Plate key={s.src} src={s.src} from={CUTS9[i] - s.in} frames={s.len + s.in} />
      ))}
      {/* the morning goes over the set and takes it: the page arrives as light, not as a cut */}
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: wash }} />

      {/* the residue: the line the store stands on, which the page keeps */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: ruleY,
          width: WIDTH,
          height: 1,
          background: COLOR.ink,
          opacity: 0.16 + 0.84 * Math.max(0, Math.min(1, (wash - 0.35) / 0.5)),
          transform: `scaleX(${0.34 + 0.66 * Math.max(0, Math.min(1, wash * 1.4))})`,
          transformOrigin: "50% 50%",
        }}
      />

      {/* the proof, standing on it */}
      <div style={{ position: "absolute", left: 96, top: ruleY, transform: "translateY(-100%)", paddingBottom: 22, opacity: numeral }}>
        <Numeral value={RESULT.total} size={520} color={COLOR.ink} weight={200} />
      </div>
      <div style={{ position: "absolute", left: 104, top: ruleY + 38, opacity: said }}>
        <Line size={46} color={COLOR.ink}>
          {RESULT.line}
        </Line>
      </div>
      <div style={{ position: "absolute", left: 104, top: ruleY + 122, opacity: split }}>
        <Line size={30} color={COLOR.inkSoft}>
          {`${RESULT.returned} ${RESULT.returnedLine} ${RESULT.newCustomers} ${RESULT.newLine}`}
        </Line>
      </div>
      <Grain opacity={0.05 * (1 - wash * 0.6)} />
    </AbsoluteFill>
  );
};
