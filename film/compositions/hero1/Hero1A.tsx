import { useCurrentFrame } from "remotion";
import tracks from "../../../blender/exports/hero1a.json";
import { applyHomography, homography, homographyMatrix3d, type Quad } from "../../block/homography";
import { Plate, quadAt, type TrackData } from "../../block/plate";
import { BUSINESS, GAP } from "../../data/joes";
import { IN, OUT, PLANE, ramp, sec } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { Line, Mono, Numeral, Words } from "../../primitives/Type";
import { COLOR, FONT, HEIGHT, WIDTH } from "../../tokens";
import { LEFT, PAGE_END_SEC, SettledBlock, Vignette } from "./common";

const T = tracks as unknown as TrackData;

/**
 * HERO 1 · VARIANT A · THE PAGE IS THE PAVEMENT
 *
 * The page is a photograph of the sidewalk in front of Joe's, straight down,
 * blown to paper. At the cut nothing moves: the cream lifts off and the
 * concrete is already there under the number, the hairline is the curb, the
 * dark band under it is the road. Then the camera lifts off the ground and
 * the page — number, rule — stays on the pavement where it was printed,
 * foreshortening as the block rises into view. The morning comes up in the
 * exposure. The 3 lies on the sidewalk like a painted bay number until the
 * camera settles across the street, when it stands up as the mark.
 */
const PAGE_END = sec(PAGE_END_SEC);
const PLATE_FRAMES = T.frames;
const HOLD = (T.meta.hold as number) ?? 22;
const LIFT_END = ((T.meta.tilt as number[]) ?? [22, 100])[1];
const SETTLE = PAGE_END + LIFT_END + 6;
export const HERO1A_FRAMES = PAGE_END + PLATE_FRAMES;

// the page's own layout: the number at the left on the sidewalk, the sentence beside it, the hairline where the curb is
const NUM_X = LEFT;
const NUM_CY = 0.42 * HEIGHT;
const NUM_SIZE = 640;
const RULE_Y = 0.7 * HEIGHT;
const SENT_X = LEFT + 620;
const SENT_Y = RULE_Y - 66;
// where the number's centre is, on the page and so on the pavement
const MARK_UV: [number, number] = [NUM_X + NUM_SIZE * 0.27, NUM_CY];

export const Hero1A = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PAGE_END));
  const onPlate = frame >= PAGE_END;

  const headIn = ramp(frame, sec(0.1), sec(0.5), OUT);
  const numeralIn = ramp(frame, sec(0.6), sec(0.7), OUT);
  const ruleIn = ramp(frame, sec(1.2), sec(0.8), OUT);
  const wordsAt = frame < sec(1.7) ? -1 : Math.min(GAP.sentence.split(" ").length - 1, Math.floor((frame - sec(1.7)) / 3));

  // the page's four corners on the ground, tracked: at plate frame 0 this is the frame itself
  const fp = quadAt(T, "fp", pf);
  const ground: Quad = [
    [fp[0].x, fp[0].y],
    [fp[1].x, fp[1].y],
    [fp[2].x, fp[2].y],
    [fp[3].x, fp[3].y],
  ];
  const H = onPlate ? homography(WIDTH, HEIGHT, ground) : null;
  const pageMatrix = onPlate ? homographyMatrix3d(WIDTH, HEIGHT, ground) : "none";
  const [markX, markY] = H ? applyHomography(H, MARK_UV[0], MARK_UV[1]) : MARK_UV;
  const land = { x: markX, y: markY, depth: 0 };

  // the cream lifts off the concrete; the sentence goes first, the rule hands over to the curb as the camera lifts
  const paper = onPlate ? 1 - ramp(frame, PAGE_END, 18, PLANE) : 1;
  const sentenceOut = ramp(frame, PAGE_END + 12, 20, IN);
  const ruleOut = ramp(frame, PAGE_END + HOLD + 30, 30, IN);
  // the printed 3 darkens with the morning, then stands up as the mark
  const lift = ramp(frame, PAGE_END + LIFT_END - 12, 22, PLANE);
  const risen = ramp(frame, PAGE_END + HOLD, LIFT_END - HOLD, PLANE);

  return (
    <Frame>
      <Plate src="film-rd/plates/hero1a.mp4" from={PAGE_END} frames={PLATE_FRAMES} />
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: paper }} />
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, mixBlendMode: "multiply", opacity: onPlate ? 0.55 * (1 - ramp(frame, PAGE_END + 10, 40, PLANE)) : 0 }} />
      {/* the page, printed on the pavement */}
      <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, transform: pageMatrix, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: NUM_X, top: NUM_CY, transform: "translate(0, -50%)", opacity: numeralIn * (1 - lift) }}>
          <Numeral value={GAP.visits} size={NUM_SIZE} color={COLOR.ink} weight={200} />
        </div>
        <div style={{ position: "absolute", left: SENT_X, top: SENT_Y, width: 1000, opacity: 1 - sentenceOut }}>
          <Line size={40} color={COLOR.inkSoft}>
            <Words text={GAP.sentence} visible={wordsAt} />
          </Line>
        </div>
        <div style={{ position: "absolute", left: NUM_X, top: RULE_Y, width: (WIDTH - 2 * LEFT) * ruleIn, height: 1.5, background: COLOR.inkHair, opacity: 1 - ruleOut }} />
      </div>
      {/* the header and the disclaimer belong to the page, not the pavement: they cut */}
      <div style={{ position: "absolute", left: LEFT, top: 84, opacity: onPlate ? 0 : headIn }}>
        <Mono color={COLOR.inkFaint}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
        <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
          {GAP.when} · {GAP.window}
        </Mono>
      </div>
      <div style={{ position: "absolute", left: LEFT, bottom: 84, opacity: onPlate ? 0 : headIn * 0.9 }}>
        <Mono color={COLOR.inkFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
      {/* the mark: the 3 standing up where it lay */}
      <div style={{ position: "absolute", left: land.x, top: land.y, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * lift})`, opacity: lift, fontFamily: FONT.sans, fontWeight: 500, fontSize: 36, color: COLOR.ink, lineHeight: 1 }}>
        {GAP.visits}
      </div>
      <Vignette opacity={risen * 0.7} />
      <Grain opacity={0.08 * (1 - paper)} />
      <SettledBlock frame={frame} settleAt={SETTLE} land={land} plateFrame={pf} T={T} />
    </Frame>
  );
};
