import { useCurrentFrame } from "remotion";
import tracks from "../../../blender/exports/hero1c.json";
import { applyHomography, homography, homographyMatrix3d, lerpQuad, rectQuad, type Quad } from "../../block/homography";
import { Plate, quadAt, type TrackData } from "../../block/plate";
import { GAP } from "../../data/joes";
import { IN, OUT, PLANE, ramp, sec } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { Line, Mono, Numeral, Words } from "../../primitives/Type";
import { COLOR, FONT, HEIGHT, WIDTH } from "../../tokens";
import { BUSINESS } from "../../data/joes";
import { PAGE_END_SEC, SettledBlock, Vignette } from "./common";

const T = tracks as unknown as TrackData;

/**
 * HERO 1 · VARIANT C · THE PAGE TILTS INTO THE STREET
 *
 * The camera barely moves. The page itself — number, rule, sentence — is a
 * plane, and it tilts into the ground plane of the street: its footprint is
 * Joe's lot, its bottom edge is the curb. The plate arrives paper-white
 * beneath it and settles into the morning as the page dissolves into the
 * pavement, leaving the 3 as a mark in front of Joe's.
 */
const PAGE_END = sec(PAGE_END_SEC);
const PLATE_FRAMES = T.frames;
const TILT_START = PAGE_END - 6;
const TILT_FRAMES = 40;
const SETTLE = PAGE_END + 62;
export const HERO1C_FRAMES = PAGE_END + PLATE_FRAMES;

// the page's own layout: the 3 low on a wide baseline, the sentence to its right, the rule near the bottom edge
const NUM_X = 300;
const NUM_Y = HEIGHT * 0.66;
const RULE_Y = HEIGHT * 0.86;

export const Hero1C = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PAGE_END));

  const headIn = ramp(frame, sec(0.1), sec(0.5), OUT);
  const numeralIn = ramp(frame, sec(0.6), sec(0.7), OUT);
  const ruleIn = ramp(frame, sec(1.2), sec(0.8), OUT);
  const wordsAt = frame < sec(1.7) ? -1 : Math.min(GAP.sentence.split(" ").length - 1, Math.floor((frame - sec(1.7)) / 3));

  // the tilt: the page's four corners travel from the frame to the page's footprint on the ground
  const tilt = ramp(frame, TILT_START, TILT_FRAMES, PLANE);
  const q = quadAt(T, "page", pf);
  const ground: Quad = [
    [q[0].x, q[0].y],
    [q[1].x, q[1].y],
    [q[2].x, q[2].y],
    [q[3].x, q[3].y],
  ];
  const quad = lerpQuad(rectQuad(0, 0, WIDTH, HEIGHT), ground, tilt);
  const pageMatrix = homographyMatrix3d(WIDTH, HEIGHT, quad);
  // the plate shows through as the page lies down; the page's surface dissolves into the pavement once flat
  const plateIn = ramp(frame, TILT_START + 6, 26, PLANE);
  const dissolve = ramp(frame, TILT_START + TILT_FRAMES - 4, 22, IN);
  // the 3 stays: it lifts off the flattened page, where it lay, and becomes an upright mark there
  const [markX, markY] = applyHomography(homography(WIDTH, HEIGHT, ground), NUM_X + 640 * 0.27, NUM_Y);
  const land = { x: markX, y: markY, depth: 0 };
  const lift = ramp(frame, TILT_START + TILT_FRAMES - 6, 24, PLANE);

  return (
    <Frame bg={COLOR.marine}>
      <Plate src="film-rd/plates/hero1c.mp4" from={PAGE_END} frames={PLATE_FRAMES} />
      {/* the page, as a plane */}
      <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT, transform: pageMatrix, transformOrigin: "0 0", opacity: 1 - dissolve, background: `rgba(243,240,233,${1 - 0.55 * plateIn})`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 96, top: 84, opacity: headIn * (1 - tilt) }}>
          <Mono color={COLOR.inkFaint}>
            {BUSINESS.name} · {BUSINESS.address}
          </Mono>
          <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
            {GAP.when} · {GAP.window}
          </Mono>
        </div>
        <div style={{ position: "absolute", left: NUM_X, top: NUM_Y, transform: "translate(0, -50%)", opacity: numeralIn * (1 - lift) }}>
          <Numeral value={GAP.visits} size={640} color={COLOR.ink} weight={200} />
        </div>
        <div style={{ position: "absolute", left: NUM_X + 420, top: NUM_Y + 110, width: 900, opacity: 1 - tilt * 1.4 }}>
          <Line size={40} color={COLOR.inkSoft}>
            <Words text={GAP.sentence} visible={wordsAt} />
          </Line>
        </div>
        <div style={{ position: "absolute", left: NUM_X - 20, top: RULE_Y, width: 1500 * ruleIn, height: 1.5, background: COLOR.inkHair, opacity: 1 - dissolve }} />
        <div style={{ position: "absolute", left: 96, bottom: 84, opacity: headIn * 0.9 * (1 - tilt) }}>
          <Mono color={COLOR.inkFaint} size={16}>
            Illustrative · example business
          </Mono>
        </div>
      </div>
      {/* the 3, upright again, as the mark on the pavement */}
      <div style={{ position: "absolute", left: land.x, top: land.y, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * lift})`, opacity: lift, fontFamily: FONT.sans, fontWeight: 500, fontSize: 36, color: COLOR.ink, lineHeight: 1 }}>
        {GAP.visits}
      </div>
      <Vignette opacity={plateIn} />
      <Grain opacity={0.08 * plateIn} />
      <SettledBlock frame={frame} settleAt={SETTLE} land={land} plateFrame={pf} T={T} />
    </Frame>
  );
};
