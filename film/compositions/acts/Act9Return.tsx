import { useCurrentFrame } from "remotion";
import tracks from "../../../blender/exports/hero5.json";
import { PLATES, Plate, trackAt, type TrackData } from "../../block/plate";
import { BLOCK, BUSINESS, PLAN, RESULT } from "../../data/joes";
import { IN, OUT, PLANE, ramp, typeset } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { PassSlab, SLAB_H, SLAB_W } from "../../primitives/OfferSlab";
import { Line, Mono, Numeral, Words } from "../../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../../tokens";
import { ACT8_FRAMES, REDEEM_AT } from "./Act8Redeem";

const T = tracks as unknown as TrackData;

/**
 * ACTS IX–XI · DIGITAL BECOMES PHYSICAL · THE BUILD · THE PROOF
 *
 * 0–2 s    The redeemed pass, its clock still running. The forecourt comes
 *          up behind it; the pass goes into a pocket — it shrinks onto the
 *          first person walking in — and that person crosses the threshold.
 * 2–8 s    Friday morning under the canopy. People arrive; each crossing is
 *          a person at the door, amber, and the count is re-set by hand:
 *          1 · 4 · 9 · 14 · 21, as the clock runs 07:42 → 09:50.
 * 8–13.7 s The world's light becomes the page, with the door's warmth still
 *          on it. 21 came through the door. Then, quieter: 14 returned.
 *          7 were new.
 */
const PLATE_START = 16;
const PLATE_FRAMES = T.frames; // 216
const THRESHOLDS = ((T.meta.thresholds as number[]) ?? [30, 66, 100, 130, 156]).map((f) => f + PLATE_START);
const RESULT_START = 200;
export const ACT9_FRAMES = RESULT_START + 130; // 330

const CLOCK_FROM = 7 * 60 + 42;
const CLOCK_TO = 9 * 60 + 50;
function clockAt(frame: number) {
  const t = Math.max(0, Math.min(1, (frame - THRESHOLDS[0]) / (THRESHOLDS[THRESHOLDS.length - 1] - THRESHOLDS[0])));
  const m = Math.round(CLOCK_FROM + (CLOCK_TO - CLOCK_FROM) * t);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** The proof's page layout rhymes with the opening page: the number where the 3 was, the sentence beside it, the rule where the curb was. */
export const PROOF = {
  numX: 96,
  numCY: 0.42 * HEIGHT,
  numSize: 640,
  sentX: 900,
  sentY: 0.7 * HEIGHT - 66,
  ruleY: 0.7 * HEIGHT,
} as const;

/** The settled proof page, for Act XII to fade. */
export function ProofSettled({ opacity = 1, residue = 0.25, residueAt }: { opacity?: number; residue?: number; residueAt: { x: number; y: number } }) {
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: residue, background: `radial-gradient(ellipse 560px 380px at ${residueAt.x}px ${residueAt.y}px, rgba(226,162,79,0.34) 0%, rgba(226,162,79,0.12) 40%, rgba(226,162,79,0) 72%)` }} />
      <div style={{ position: "absolute", left: 96, top: 84 }}>
        <Mono color={COLOR.inkFaint}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
        <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
          {RESULT.when} · {RESULT.window}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: PROOF.numX, top: PROOF.numCY, transform: "translate(0, -50%)" }}>
        <Numeral value={RESULT.total} size={PROOF.numSize} color={COLOR.ink} weight={200} />
      </div>
      <div style={{ position: "absolute", left: PROOF.sentX, top: PROOF.sentY, width: 900 }}>
        <Line size={40} color={COLOR.inkSoft}>
          {RESULT.line}
        </Line>
        <Line size={40} color={COLOR.inkSoft} style={{ marginTop: 14, opacity: 0.75 }}>
          {RESULT.returned} {RESULT.returnedLine} {RESULT.newCustomers} {RESULT.newLine}
        </Line>
      </div>
      <div style={{ position: "absolute", left: 96, top: PROOF.ruleY, width: WIDTH - 192, height: 1.5, background: COLOR.inkHair }} />
      <div style={{ position: "absolute", right: 96, bottom: 84, opacity: 0.8 }}>
        <Mono color={COLOR.inkFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
    </div>
  );
}

export const Act9Return = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PLATE_START));
  const door = trackAt(T, "door_joes", pf);
  const first = trackAt(T, "first", pf);
  const doorEnd = trackAt(T, "door_joes", PLATE_FRAMES - 1);

  // ---------------------------------------------------------------- the pass goes into the world
  const clockFrames = ACT8_FRAMES - REDEEM_AT + frame;
  const worldIn = ramp(frame, PLATE_START, 24, PLANE);
  const worldClear = ramp(frame, PLATE_START + 8, 24, PLANE);
  const pocket = ramp(frame, 30, 20, IN); // the pass shrinks onto the first person
  const passX = 960 + (first.x - 960) * pocket;
  const passY = 540 + (first.y - 540) * pocket;
  const passScale = 1 - 0.94 * pocket;
  const carried = ramp(frame, 46, 6, OUT) * (1 - ramp(frame, THRESHOLDS[0] + 4, 10, IN)); // amber on the person until the threshold

  // ---------------------------------------------------------------- the build
  const stepIndex = THRESHOLDS.filter((f) => frame >= f).length; // 0..5
  const count = stepIndex === 0 ? 0 : RESULT.steps[stepIndex - 1];
  const prev = stepIndex > 1 ? RESULT.steps[stepIndex - 2] : 0;
  const lastStep = stepIndex > 0 ? THRESHOLDS[stepIndex - 1] : -100;
  const reset = ramp(frame, lastStep, 7, OUT); // the number is re-set, not incremented
  const doorMark = stepIndex > 0 ? Math.max(0, 1 - (frame - lastStep) / 14) : 0;
  const headerIn = ramp(frame, PLATE_START + 20, 12, OUT);
  const captionIn = ramp(frame, THRESHOLDS[0] + 8, 12, OUT);

  // ---------------------------------------------------------------- the page returns
  const toPage = ramp(frame, RESULT_START, 40, PLANE);
  const grow = ramp(frame, RESULT_START - 6, 44, PLANE);
  const residue = 1 - 0.75 * ramp(frame, RESULT_START + 34, 50, IN);
  const countTop = 300 + (PROOF.numCY - (PROOF.numSize * 0.82) / 2 - 300) * grow;
  const countSize = 380 + (PROOF.numSize - 380) * grow;
  const wordsAt = typeset(frame, RESULT_START + 46, RESULT.line.split(" ").length, 3);
  const ruleIn = ramp(frame, RESULT_START + 40, 22, OUT);
  const secondLine = ramp(frame, RESULT_START + 82, 16, OUT);
  const headerPage = ramp(frame, RESULT_START + 30, 16, OUT);
  const ink = toPage > 0.5;

  return (
    <Frame bg="#040c10">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 980px 680px at 960px 470px, rgba(21,40,48,0.98) 0%, rgba(11,24,31,0.92) 48%, rgba(4,12,16,1) 100%)`, opacity: 1 - worldIn }} />
      {/* the world */}
      <div style={{ position: "absolute", inset: 0, opacity: worldIn * (1 - toPage), filter: worldClear < 1 ? `blur(${10 * (1 - worldClear)}px)` : undefined }}>
        <Plate src={PLATES.hero5} from={PLATE_START} frames={PLATE_FRAMES} />
        <div style={{ position: "absolute", inset: 0, background: COLOR.marine, opacity: 0.5 * (1 - worldClear) }} />
      </div>
      <Grain opacity={0.06 * worldIn * (1 - 0.4 * toPage)} />

      {/* the pass, then the pocket */}
      {pocket < 1 && (
        <div style={{ position: "absolute", left: passX, top: passY, width: SLAB_W, height: SLAB_H, transform: `translate(-50%, -50%) scale(${passScale})`, opacity: 1 - Math.max(0, (pocket - 0.7) / 0.3) }}>
          <PassSlab redeemed={1} tick={1} clockFrames={clockFrames} />
        </div>
      )}
      {carried > 0 && <div style={{ position: "absolute", left: first.x - 5, top: first.y - 5, width: 10, height: 10, borderRadius: 5, background: COLOR.amber, opacity: 0.9 * carried, boxShadow: `0 0 18px 5px rgba(226,162,79,${0.45 * carried})` }} />}

      {/* header · the street and the clock */}
      {frame >= PLATE_START + 20 && frame < RESULT_START + 30 && (
        <>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: headerIn * (1 - toPage) }}>
            <Mono color={COLOR.onMarineSoft}>
              {BLOCK.street} · Friday · {clockAt(frame)}
            </Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: headerIn * (1 - toPage), display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOR.mint, display: "inline-block" }} />
            <Mono color={COLOR.onMarineSoft}>{PLAN.title} · live</Mono>
          </div>
        </>
      )}

      {/* a person at the door, each time */}
      {doorMark > 0 && grow === 0 && <div style={{ position: "absolute", left: door.x - 5, top: door.y - 5, width: 10, height: 10, borderRadius: 5, background: COLOR.amber, opacity: doorMark, boxShadow: `0 0 18px 5px rgba(226,162,79,${0.45 * doorMark})` }} />}

      {/* the count, re-set by hand */}
      {stepIndex > 0 && (
        <div style={{ position: "absolute", left: PROOF.numX, top: countTop }}>
          {reset < 1 && prev > 0 && grow === 0 && (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - reset }}>
              <Numeral value={prev} size={countSize} color={COLOR.onMarine} weight={200} />
            </div>
          )}
          <div style={{ opacity: grow > 0 ? 1 : reset, transform: grow > 0 ? "none" : `translateY(${(1 - reset) * 6}px)` }}>
            <Numeral value={count} size={countSize} color={ink ? COLOR.ink : COLOR.onMarine} weight={200} />
          </div>
        </div>
      )}
      {stepIndex > 0 && grow === 0 && (
        <div style={{ position: "absolute", left: 100, top: 300 + 380 * 0.82 + 10, opacity: captionIn }}>
          <Line size={30} color={COLOR.onMarineSoft}>
            through the door
          </Line>
        </div>
      )}

      {/* the page returns, with the door's warmth still on it */}
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: toPage, pointerEvents: "none" }} />
      {toPage > 0 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: toPage * residue, background: `radial-gradient(ellipse 560px 380px at ${doorEnd.x}px ${doorEnd.y}px, rgba(226,162,79,0.34) 0%, rgba(226,162,79,0.12) 40%, rgba(226,162,79,0) 72%)` }} />
      )}
      {frame >= RESULT_START && (
        <>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: headerPage }}>
            <Mono color={COLOR.inkFaint}>
              {BUSINESS.name} · {BUSINESS.address}
            </Mono>
            <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
              {RESULT.when} · {RESULT.window}
            </Mono>
          </div>
          <div style={{ position: "absolute", left: PROOF.sentX, top: PROOF.sentY, width: 900, opacity: grow }}>
            <Line size={40} color={COLOR.inkSoft}>
              <Words text={RESULT.line} visible={wordsAt} />
            </Line>
            <Line size={40} color={COLOR.inkSoft} style={{ marginTop: 14, opacity: 0.75 * secondLine }}>
              {RESULT.returned} {RESULT.returnedLine} {RESULT.newCustomers} {RESULT.newLine}
            </Line>
          </div>
          <div style={{ position: "absolute", left: 96, top: PROOF.ruleY, width: (WIDTH - 192) * ruleIn, height: 1.5, background: COLOR.inkHair }} />
          <div style={{ position: "absolute", right: 96, bottom: 84, opacity: headerPage * 0.8 }}>
            <Mono color={COLOR.inkFaint} size={16}>
              Illustrative · example business
            </Mono>
          </div>
        </>
      )}
    </Frame>
  );
};

export const PROOF_RESIDUE_AT = () => {
  const d = trackAt(T, "door_joes", PLATE_FRAMES - 1);
  return { x: d.x, y: d.y };
};
