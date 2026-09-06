import { useCurrentFrame } from "remotion";
import tracks from "../../blender/exports/hero1.json";
import { PLATES, Plate, trackAt, type TrackData } from "../block/plate";
import { BUSINESS, GAP, JOES } from "../data/joes";
import { IN, OUT, PLANE, ramp, sec, typeset, window as hold } from "../motion";
import { Frame } from "../primitives/Frame";
import { Line, Mono, Numeral, Rule, Words } from "../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../tokens";

const T = tracks as unknown as TrackData;

/**
 * HERO 1 · 3 → THE PHYSICAL BLOCK
 *
 * 0–4s   Direction 1. A warm page, one number, one sentence, silence.
 * 4–7s   The page becomes the sidewalk in front of Joe's: the camera lifts
 *        off the concrete and the block rises into view. The hairline under
 *        the 3 is the curb. The 3 shrinks and stays pinned to Joe's lot.
 * 7–11s  The block, Friday 07:12. Activity everywhere except Joe's.
 */
const PAGE_END = sec(4); // the plate begins here (plate frame 0)
const PLATE_FRAMES = T.frames; // 168
const TILT_END = PAGE_END + 72;

export const Hero1 = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PAGE_END));

  // --- page layout (Direction 1) ---------------------------------------
  // The numeral's final position is the tracked sidewalk point at plate frame 0,
  // so the whole page is laid out around where the 3 will land.
  const land0 = trackAt(T, "joes_walk", 0);
  const curb0w = trackAt(T, "joes_curb_w", 0);
  const curb0e = trackAt(T, "joes_curb_e", 0);
  const curbY0 = (curb0w.y + curb0e.y) / 2;

  const numeralIn = ramp(frame, sec(0.6), sec(0.7), OUT);
  const wordsAt = typeset(frame, sec(1.7), GAP.sentence.split(" ").length, 3);
  const headIn = ramp(frame, sec(0.1), sec(0.5), OUT);

  // --- the transition ----------------------------------------------------
  const tilt = ramp(frame, PAGE_END, 72, PLANE); // camera lift, in the plate
  const pageOut = 1 - ramp(frame, PAGE_END + 4, 30, PLANE); // the paper gains grain
  const shrink = ramp(frame, PAGE_END - 6, 40, PLANE); // the 3 becomes a mark
  const land = trackAt(T, "joes_walk", pf);
  const curbW = trackAt(T, "joes_curb_w", pf);
  const curbE = trackAt(T, "joes_curb_e", pf);

  // The big 3 sits with its optical centre slightly above the landing point.
  const bigX = land0.x;
  const bigY = land0.y;
  const size = 840 - (840 - 36) * shrink;
  const x = bigX + (land.x - bigX) * shrink;
  const y = bigY + (land.y - bigY) * shrink;
  const numeralColor = shrink < 0.5 ? COLOR.ink : COLOR.onMarine;

  // The hairline: on the page it is the rule under the number; once the plate is
  // in, it is the curb, and it fades as the real curb takes over.
  const curbAngle = Math.atan2(curbE.y - curbW.y, curbE.x - curbW.x);
  const curbLen = Math.hypot(curbE.x - curbW.x, curbE.y - curbW.y);
  const ruleAlpha = frame < PAGE_END ? ramp(frame, sec(1.2), sec(0.8), OUT) : 1 - ramp(frame, PAGE_END + 40, 40, IN);
  const rulePageX = bigX - 20;
  const rulePageW = 560;
  // interpolate from the page rule to the full projected curb line
  const ruleX = rulePageX + (curbW.x - rulePageX) * shrink;
  const ruleY = curbY0 + (curbW.y - curbY0) * shrink;
  const ruleW = rulePageW + (curbLen - rulePageW) * shrink;
  const ruleRot = curbAngle * shrink;

  // --- the block's own annotations ---------------------------------------
  const settled = ramp(frame, TILT_END + 6, sec(0.6), OUT);
  const label = ramp(frame, TILT_END - 10, sec(0.5), OUT);
  const sameStreet = hold(frame, TILT_END + sec(1.4), sec(11), sec(0.6), sec(0.3));

  return (
    <Frame>
      {/* the world */}
      <Plate src={PLATES.hero1} from={PAGE_END} frames={PLATE_FRAMES} />

      {/* the page, dissolving into the concrete */}
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: frame < PAGE_END ? 1 : pageOut }} />

      {/* mono header: business, then the street */}
      <div style={{ position: "absolute", left: 96, top: 84, opacity: headIn * (1 - tilt) }}>
        <Mono color={COLOR.inkFaint}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
        <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
          {GAP.when} · {GAP.window}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: 96, top: 84, opacity: settled }}>
        <Mono color={COLOR.onMarineSoft}>
          {JOES.BLOCK.street} · Friday · 07:12
        </Mono>
      </div>

      {/* the hairline → the curb */}
      <Rule x={ruleX} y={ruleY} w={ruleW} rotate={ruleRot} opacity={ruleAlpha} color={shrink < 0.5 ? COLOR.inkHair : "rgba(241,237,229,0.55)"} thickness={shrink < 0.5 ? 1.5 : 2} />

      {/* the sentence, on the page only */}
      <div style={{ position: "absolute", left: bigX - 20, top: curbY0 + 28, width: 760, opacity: 1 - ramp(frame, PAGE_END - 8, 24, IN) }}>
        <Line size={40} color={COLOR.inkSoft}>
          <Words text={GAP.sentence} visible={wordsAt} />
        </Line>
      </div>

      {/* the 3: a number, then a mark on a place */}
      <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity: numeralIn }}>
        <Numeral value={GAP.visits} size={size} color={numeralColor} weight={shrink > 0.5 ? 500 : 300} style={shrink > 0.5 ? { fontFamily: undefined } : undefined} />
      </div>
      {/* the mark's caption, once it has landed */}
      <div style={{ position: "absolute", left: land.x + 30, top: land.y - 12, opacity: label * settled }}>
        <Mono color={COLOR.onMarineSoft} size={20}>
          {GAP.window} · {GAP.visits}
        </Mono>
      </div>
      {/* the dot that fixes the mark to the pavement */}
      <div style={{ position: "absolute", left: land.x - 5, top: land.y + 30, width: 10, height: 10, borderRadius: 5, background: COLOR.onMarine, opacity: label * shrink }} />

      {/* the line that says it */}
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: sameStreet }}>
        <Line size={34} color={COLOR.onMarine} weight={400}>
          Same street. Same morning.
        </Line>
      </div>
      <div style={{ position: "absolute", right: 96, bottom: 92, opacity: settled * 0.8 }}>
        <Mono color={COLOR.onMarineFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: (1 - ramp(frame, PAGE_END - 20, 20, IN)) * headIn }}>
        <Mono color={COLOR.inkFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
      {/* a vignette that keeps the eye inside the world once the page is gone */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: (1 - pageOut) * 0.55, background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)`, width: WIDTH, height: HEIGHT }} />
    </Frame>
  );
};
