import { useCurrentFrame } from "remotion";
import tracks from "../../../blender/exports/hero5.json";
import { PLATES, Plate, trackAt, type TrackData } from "../../block/plate";
import { BLOCK, BUSINESS, PLAN, RESULT } from "../../data/joes";
import { IN, OUT, PLANE, ramp, typeset } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { Line, Mono, Numeral, Words } from "../../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../../tokens";
import { STREET_FRAMES } from "./Act8Redeem";
import { BuildCount, COUNT, DoorMark, WorldHeader, buildState } from "./Build";

const T = tracks as unknown as TrackData;

/**
 * ACTS IX–XI · THE BUILD · THE PROOF
 *
 * 0–5.5 s   Back outside, the same forecourt Act VIII left, the count
 *           standing at 1. People arrive; each crossing is a person at
 *           the door, amber, and the count is re-set by hand: 4 · 9 · 14 ·
 *           21, as the clock runs 07:42 → 09:50.
 * 5.5–11 s  The world's light becomes the page, with the door's warmth
 *           still on it. 21 came through the door. Then, quieter:
 *           14 returned. 7 were new.
 */
const PLATE_START = -(STREET_FRAMES + 2); // the plate continues from where Act VIII cut inside
const PLATE_FRAMES = T.frames; // 216
const THRESHOLDS = ((T.meta.thresholds as number[]) ?? [30, 66, 100, 130, 156]).map((f) => f + PLATE_START); // the first already happened, in Act VIII
const RESULT_START = 140; // the 21 lands on the same film frame it always did
export const ACT9_FRAMES = RESULT_START + 130; // 270

const CLOCK_FROM = 7 * 60 + 42;
const CLOCK_TO = 9 * 60 + 50;
function clockAt(frame: number) {
  const t = Math.max(0, Math.min(1, frame / THRESHOLDS[THRESHOLDS.length - 1]));
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
  const doorEnd = trackAt(T, "door_joes", PLATE_FRAMES - 1);

  // ---------------------------------------------------------------- the build
  const { doorMark } = buildState(frame, THRESHOLDS);

  // ---------------------------------------------------------------- the page returns
  const toPage = ramp(frame, RESULT_START, 40, PLANE);
  const grow = ramp(frame, RESULT_START - 6, 44, PLANE);
  const residue = 1 - 0.75 * ramp(frame, RESULT_START + 34, 50, IN);
  const countTop = COUNT.top + (PROOF.numCY - (PROOF.numSize * 0.82) / 2 - COUNT.top) * grow;
  const countSize = COUNT.size + (PROOF.numSize - COUNT.size) * grow;
  const wordsAt = typeset(frame, RESULT_START + 46, RESULT.line.split(" ").length, 3);
  const ruleIn = ramp(frame, RESULT_START + 40, 22, OUT);
  const secondLine = ramp(frame, RESULT_START + 82, 16, OUT);
  const headerPage = ramp(frame, RESULT_START + 30, 16, OUT);
  const ink = toPage > 0.5;

  return (
    <Frame bg="#040c10">
      {/* the world */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toPage }}>
        <Plate src={PLATES.hero5} from={PLATE_START} frames={PLATE_FRAMES} />
      </div>
      <Grain opacity={0.06 * (1 - 0.4 * toPage)} />

      {/* header · the street and the clock */}
      {frame < RESULT_START + 30 && <WorldHeader left={`${BLOCK.street} · Friday · ${clockAt(frame)}`} right={`${PLAN.title} · live`} opacity={1 - toPage} />}

      {/* a person at the door, each time */}
      {grow === 0 && <DoorMark x={door.x} y={door.y} t={doorMark} />}

      {/* the page returns, with the door's warmth still on it */}
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: toPage, pointerEvents: "none" }} />
      {toPage > 0 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: toPage * residue, background: `radial-gradient(ellipse 560px 380px at ${doorEnd.x}px ${doorEnd.y}px, rgba(226,162,79,0.34) 0%, rgba(226,162,79,0.12) 40%, rgba(226,162,79,0) 70%)` }} />
      )}

      {/* the count, re-set by hand; it crosses the page's arrival and becomes the proof's numeral, so it sits above it */}
      <BuildCount frame={frame} thresholds={THRESHOLDS} top={countTop} size={countSize} grow={grow} ink={ink} />
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
