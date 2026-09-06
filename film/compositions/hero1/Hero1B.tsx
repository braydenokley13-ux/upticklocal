import { useCurrentFrame } from "remotion";
import tracks from "../../../blender/exports/hero1b.json";
import { Plate, trackAt, type TrackData } from "../../block/plate";
import { IN, OUT, PLANE, ramp, sec } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { Rule } from "../../primitives/Type";
import { COLOR } from "../../tokens";
import { BigNumeral, PAGE_END_SEC, PageHeader, Sentence, SettledBlock, Vignette } from "./common";

const T = tracks as unknown as TrackData;

/**
 * HERO 1 · VARIANT B · THE DESCENT
 *
 * The page is a plan. At the cut the plate is paper-white and straight
 * down from 70 m: as the exposure settles, the block's plan emerges under
 * the number — roofs, the road, the lot — and the 3 stamps onto Joe's.
 * Then a crane-down: the camera descends and tilts into the street, the
 * 3 stays pinned, and the block becomes a place.
 */
const PAGE_END = sec(PAGE_END_SEC);
const PLATE_FRAMES = T.frames;
const DESCENT = (T.meta.descent as number[]) ?? [18, 96];
const SETTLE = PAGE_END + DESCENT[1];
export const HERO1B_FRAMES = PAGE_END + PLATE_FRAMES;

export const Hero1B = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PAGE_END));
  const lot0 = trackAt(T, "joes_apron", 0);

  const headIn = ramp(frame, sec(0.1), sec(0.5), OUT);
  const numeralIn = ramp(frame, sec(0.6), sec(0.7), OUT);
  const ruleIn = ramp(frame, sec(1.2), sec(0.8), OUT);

  // the plan emerges under the number while the camera holds; the 3 stamps onto the lot as the descent begins
  const handover = ramp(frame, PAGE_END - 2, 8, PLANE);
  const stamp = ramp(frame, PAGE_END + 10, 28, PLANE);
  const descent = ramp(frame, PAGE_END + DESCENT[0], DESCENT[1] - DESCENT[0], PLANE);
  const lot = trackAt(T, "joes_apron", pf);
  const curbW = trackAt(T, "joes_curb_w", pf);
  const curbE = trackAt(T, "joes_curb_e", pf);

  // on the page the 3 sits where the lot will be seen from above; it stamps down to a mark on the lot, then rides the descent
  const bigX = lot0.x;
  const bigY = lot0.y - 120;
  const pageRuleY = bigY + 330; // under the numeral on the page; it travels to the curb at the stamp
  const size = 720 - (720 - 36) * stamp;
  const x = bigX + (lot.x - bigX) * stamp;
  const y = bigY + (lot.y - bigY) * stamp;
  const markColor = COLOR.ink; // the mark lies on sunlit pavement: ink, like paint

  // the hairline under the number becomes the far curb, seen from above, then from the street
  const curbAngle = Math.atan2(curbE.y - curbW.y, curbE.x - curbW.x);
  const curbLen = Math.hypot(curbE.x - curbW.x, curbE.y - curbW.y);
  const ruleAlpha = frame < PAGE_END ? ruleIn : 1 - ramp(frame, PAGE_END + 60, 36, IN);
  const rulePageX = bigX - 20;
  const rulePageW = 560;
  const ruleX = rulePageX + (curbW.x - rulePageX) * stamp;
  const ruleY = pageRuleY + (curbW.y - pageRuleY) * stamp;
  const ruleW = rulePageW + (curbLen - rulePageW) * stamp;
  const ruleRot = curbAngle * stamp;

  return (
    <Frame>
      <Plate src="film-rd/plates/hero1b.mp4" from={PAGE_END} frames={PLATE_FRAMES} />
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: 1 - handover }} />
      <div style={{ opacity: (1 - descent) * headIn }}>
        <PageHeader opacity={1} />
      </div>
      <Rule x={ruleX} y={ruleY} w={ruleW} rotate={ruleRot} opacity={ruleAlpha} color={stamp < 0.6 ? COLOR.inkHair : "rgba(241,237,229,0.55)"} thickness={stamp < 0.6 ? 1.5 : 2} />
      <Sentence x={bigX - 20} y={pageRuleY + 28} frame={frame} start={sec(1.7)} opacity={1 - ramp(frame, PAGE_END + 6, 20, IN)} />
      <BigNumeral x={x} y={y} size={size} opacity={numeralIn} color={markColor} weight={stamp > 0.6 ? 500 : 200} />
      <Vignette opacity={descent} />
      <Grain opacity={0.08 * handover} />
      <SettledBlock frame={frame} settleAt={SETTLE} land={lot} plateFrame={pf} T={T} />
    </Frame>
  );
};
