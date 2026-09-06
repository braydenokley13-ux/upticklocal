import { useCurrentFrame } from "remotion";
import tracks from "../../../blender/exports/hero1a.json";
import { Plate, trackAt, type TrackData } from "../../block/plate";
import { IN, OUT, PLANE, ramp, sec } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Rule } from "../../primitives/Type";
import { COLOR } from "../../tokens";
import { BigNumeral, PAGE_END_SEC, PageHeader, Sentence, SettledBlock, Vignette } from "./common";

const T = tracks as unknown as TrackData;

/**
 * HERO 1 · VARIANT A · THE PAGE IS THE PAVEMENT
 *
 * The page's light is the morning's. At the cut the plate is paper-white,
 * straight down onto the sidewalk in front of Joe's; the camera lifts off
 * the concrete while the exposure settles, and the block rises into view.
 * The hairline under the 3 is the curb. The 3 shrinks and stays pinned to
 * the pavement in front of Joe's as a mark.
 */
const PAGE_END = sec(PAGE_END_SEC);
const PLATE_FRAMES = T.frames;
const TILT_END = PAGE_END + 78;
export const HERO1A_FRAMES = PAGE_END + PLATE_FRAMES;

export const Hero1A = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PAGE_END));
  const land0 = trackAt(T, "joes_walk", 0);
  const curb0w = trackAt(T, "joes_curb_w", 0);
  const curb0e = trackAt(T, "joes_curb_e", 0);
  const curbY0 = (curb0w.y + curb0e.y) / 2;

  const headIn = ramp(frame, sec(0.1), sec(0.5), OUT);
  const numeralIn = ramp(frame, sec(0.6), sec(0.7), OUT);
  const ruleIn = ramp(frame, sec(1.2), sec(0.8), OUT);

  // the transition: the plate arrives paper-white, so the page needs only a short handover
  const handover = ramp(frame, PAGE_END - 2, 10, PLANE);
  const shrink = ramp(frame, PAGE_END - 4, 42, PLANE);
  const tilt = ramp(frame, PAGE_END, 78, PLANE);
  const land = trackAt(T, "joes_walk", pf);
  const curbW = trackAt(T, "joes_curb_w", pf);
  const curbE = trackAt(T, "joes_curb_e", pf);

  const bigX = land0.x;
  const bigY = land0.y;
  const size = 720 - (720 - 36) * shrink;
  const x = bigX + (land.x - bigX) * shrink;
  const y = bigY + (land.y - bigY) * shrink;
  const markColor = shrink < 0.5 ? COLOR.ink : COLOR.onMarine;

  // the hairline → the curb
  const curbAngle = Math.atan2(curbE.y - curbW.y, curbE.x - curbW.x);
  const curbLen = Math.hypot(curbE.x - curbW.x, curbE.y - curbW.y);
  const ruleAlpha = frame < PAGE_END ? ruleIn : 1 - ramp(frame, PAGE_END + 44, 34, IN);
  const rulePageX = bigX - 20;
  const rulePageW = 560;
  const ruleX = rulePageX + (curbW.x - rulePageX) * shrink;
  const ruleY = curbY0 + (curbW.y - curbY0) * shrink;
  const ruleW = rulePageW + (curbLen - rulePageW) * shrink;
  const ruleRot = curbAngle * shrink;

  return (
    <Frame>
      <Plate src="film-rd/plates/hero1a.mp4" from={PAGE_END} frames={PLATE_FRAMES} />
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: 1 - handover }} />
      <div style={{ opacity: (1 - tilt) * headIn }}>
        <PageHeader opacity={1} />
      </div>
      <Rule x={ruleX} y={ruleY} w={ruleW} rotate={ruleRot} opacity={ruleAlpha} color={shrink < 0.5 ? COLOR.inkHair : "rgba(241,237,229,0.55)"} thickness={shrink < 0.5 ? 1.5 : 2} />
      <Sentence x={bigX - 20} y={curbY0 + 28} frame={frame} start={sec(1.7)} opacity={1 - ramp(frame, PAGE_END - 8, 20, IN)} />
      <BigNumeral x={x} y={y} size={size} opacity={numeralIn} color={markColor} weight={shrink > 0.5 ? 500 : 200} />
      <Vignette opacity={handover} />
      <SettledBlock frame={frame} settleAt={TILT_END} land={land} plateFrame={pf} T={T} />
    </Frame>
  );
};
