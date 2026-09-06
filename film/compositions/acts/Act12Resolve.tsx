import { useCurrentFrame } from "remotion";
import { IN, OUT, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Mono } from "../../primitives/Type";
import { RESULT } from "../../data/joes";
import { Line, Numeral } from "../../primitives/Type";
import { COLOR, FONT, HEIGHT, WIDTH } from "../../tokens";
import { residueY } from "./Act9Return";

/**
 * ACT XII · RESOLVE
 *
 * The proof leaves the page. What remains is the name of the thing that
 * did it, and one line the film has earned: what Joe said, in the form
 * every owner can say it.
 */
export const ACT12_FRAMES = 132;
const CLOSING = "Tell Uptick what you want more of.";

export const Act12Resolve = () => {
  const frame = useCurrentFrame();
  const out = 1 - ramp(frame, 4, 22, IN);
  const nameIn = ramp(frame, 34, 18, OUT);
  const lineIn = ramp(frame, 62, 18, OUT);
  const footIn = ramp(frame, 96, 14, OUT);
  const y = residueY();
  return (
    <Frame>
      {/* the proof goes, and the line the store stood on stays a moment longer */}
      <div style={{ position: "absolute", left: 96, top: y, transform: "translateY(-100%)", paddingBottom: 22, opacity: out }}>
        <Numeral value={RESULT.total} size={520} color={COLOR.ink} weight={200} />
      </div>
      <div style={{ position: "absolute", left: 104, top: y + 38, opacity: out }}>
        <Line size={46} color={COLOR.ink}>
          {RESULT.line}
        </Line>
      </div>
      <div style={{ position: "absolute", left: 104, top: y + 122, opacity: out }}>
        <Line size={30} color={COLOR.inkSoft}>
          {`${RESULT.returned} ${RESULT.returnedLine} ${RESULT.newCustomers} ${RESULT.newLine}`}
        </Line>
      </div>
      <div style={{ position: "absolute", left: 0, top: y, width: WIDTH, height: 1, background: COLOR.ink, opacity: 0.14 + 0.5 * out }} />
      <div style={{ position: "absolute", left: 96, top: 0.42 * HEIGHT, transform: `translate(0, -50%) translateY(${(1 - nameIn) * 10}px)`, opacity: nameIn, display: "flex", alignItems: "center", gap: 28 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: COLOR.mint, display: "inline-block", flex: "none" }} />
        <div style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: 96, letterSpacing: "-0.035em", lineHeight: 1, color: COLOR.ink, whiteSpace: "nowrap" }}>Uptick Growth</div>
      </div>
      <div style={{ position: "absolute", left: 96 + 44, top: 0.42 * HEIGHT + 78, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 8}px)`, fontFamily: FONT.sans, fontWeight: 400, fontSize: 40, letterSpacing: "-0.018em", lineHeight: 1.3, color: COLOR.inkSoft, whiteSpace: "nowrap" }}>{CLOSING}</div>
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: footIn }}>
        <Mono color={COLOR.inkFaint} size={16}>
          upticklocal.com/growth
        </Mono>
      </div>
      <div style={{ position: "absolute", right: 96, bottom: 84, opacity: footIn * 0.8 }}>
        <Mono color={COLOR.inkFaint} size={16}>
          Illustrative · example business
        </Mono>
      </div>
    </Frame>
  );
};
