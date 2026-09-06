import { useCurrentFrame } from "remotion";
import { CONVERSE, MESSAGE, PLAN } from "../data/joes";
import { IN, OUT, PLANE, ramp } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_H, PLAN_PAD, PLAN_ROWS, PLAN_W } from "../primitives/GrowthPlan";
import { Mono, Voice } from "../primitives/Type";
import { COLOR, FONT } from "../tokens";
import { useTextWidths } from "../typography/measure";

/**
 * HERO 4 · DOES DIESEL COUNT? → PROVENANCE → ANSWER
 *
 * A thread with no chrome. A question in the customer's own voice. 900 ms
 * of nothing. Then the approved plan rises into the depth behind the
 * thread, turned and soft, and three words — Regular · Premium · Diesel —
 * leave their slot on the sheet, travel a mint path, and land inside the
 * sentence that answers. The sentence grows around them. The sheet sinks.
 * The viewer sees where the answer came from without being told.
 */
const COL_X = 480;
const COL_W = 860;
const ANSWER_PX = 36;
const ANSWER_FONT = `400 ${ANSWER_PX}px 'Geist Film'`;
const SHEET_PX = 30;
const SHEET_FONT = `400 ${SHEET_PX}px 'Geist Film'`;

// the sheet in depth: scaled, turned, behind the thread
const SHEET_SCALE = 0.62;
const SHEET_BOX = { x: 700, y: 120, w: PLAN_W * SHEET_SCALE, h: PLAN_H * SHEET_SCALE };
const SHEET_ROT = -20; // degrees about Y; the left edge recedes
const PERSPECTIVE = 1100;

const T = {
  history: 0,
  typing: 16,
  question: 32,
  silence: [46, 68] as const,
  sheet: 68,
  lift: 90,
  land: 118,
  sink: 128,
  gone: 164,
  line1: 172,
  line2: 186,
  end: 216,
};

/** Where a point on the turned sheet lands on screen. Same maths as CSS perspective + rotateY about the box centre. */
function project(px: number, py: number, rotDeg: number, box: { x: number; y: number; w: number; h: number }) {
  const th = (rotDeg * Math.PI) / 180;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const rx = px - cx;
  const ry = py - cy;
  const x3 = rx * Math.cos(th);
  const z3 = -rx * Math.sin(th);
  const s = PERSPECTIVE / (PERSPECTIVE - z3);
  return { x: cx + x3 * s, y: cy + ry * s, s };
}

export const Hero4 = () => {
  const frame = useCurrentFrame();
  const v = CONVERSE.answerParts.values; // regular · premium · and diesel
  const w1 = v[0];
  const w2 = v[1];
  const w3 = v[2].replace("and ", "");
  const lead = CONVERSE.answerParts.lead; // "Yes — "
  const a = useTextWidths([lead, `${lead}${w1}`, `${lead}${w1}, `, `${lead}${w1}, ${w2}`, `${lead}${w1}, ${w2}, and `, `${lead}${w1}, ${w2}, and ${w3}`], ANSWER_FONT);
  const s = useTextWidths(["Fuel · ", "Fuel · Regular", "Fuel · Regular · ", "Fuel · Regular · Premium", "Fuel · Regular · Premium · ", "Fuel · Regular · Premium · Diesel"], SHEET_FONT);
  if (!a || !s) return <Frame bg={COLOR.marine} />;

  // --- the thread ---------------------------------------------------------
  const historyIn = ramp(frame, T.history, 14, OUT);
  const typing = ramp(frame, T.typing, 6, OUT) * (1 - ramp(frame, T.question - 2, 4, IN));
  const questionIn = ramp(frame, T.question, 12, PLANE);
  const silence = frame >= T.silence[0] && frame < T.silence[1] ? (frame - T.silence[0]) / (T.silence[1] - T.silence[0]) : frame >= T.silence[1] ? 1 : 0;

  // --- the sheet in depth ---------------------------------------------------
  const sheetUp = ramp(frame, T.sheet, 18, PLANE);
  const sheetSink = ramp(frame, T.sink, T.gone - T.sink, PLANE);
  const sheetOpacity = 0.62 * sheetUp * (1 - sheetSink);
  const sheetBlur = 6 - 3 * sheetUp + 6 * sheetSink;
  const sheetDy = 30 * (1 - sheetUp) + 24 * sheetSink;

  // --- the three words ------------------------------------------------------
  // source: inside the fuel row on the sheet (card space → box space → screen)
  const rowY = PLAN_ROWS.fuel + 23 + SHEET_PX * 0.55; // the value line's vertical centre in card space
  const srcWord = (i: number) => {
    const startW = [s[0], s[2], s[4]][i];
    const wordW = [s[1] - s[0], s[3] - s[2], s[5] - s[4]][i];
    const cx = PLAN_PAD + startW + wordW / 2;
    const p = project(SHEET_BOX.x + cx * SHEET_SCALE, SHEET_BOX.y + rowY * SHEET_SCALE + sheetDy, SHEET_ROT, SHEET_BOX);
    return { x: p.x, y: p.y, size: SHEET_PX * SHEET_SCALE * p.s, w: wordW * SHEET_SCALE * p.s };
  };
  // target: inside the answer's first line
  const ANSWER = { x: COL_X, y: 660 };
  const PAD = 36;
  const lineCY = ANSWER.y + PAD + ANSWER_PX * 0.62;
  const dstWord = (i: number) => {
    const startW = [a[0], a[2], a[4]][i];
    const wordW = [a[1] - a[0], a[3] - a[2], a[5] - a[4]][i];
    return { x: ANSWER.x + PAD + startW + wordW / 2, y: lineCY, size: ANSWER_PX, w: wordW };
  };
  const travel = (i: number) => ramp(frame, T.lift + i * 2, T.land - T.lift - 4, OUT);
  const anyLift = travel(0);
  const allLanded = travel(2) >= 1;
  const tissue = ramp(frame, T.land - 2, 10, OUT); // "Yes —", commas, "fill-ups qualify." grow around the words
  const cardIn = ramp(frame, T.land - 10, 14, OUT);
  const provenance = ramp(frame, T.land + 16, 12, OUT);
  const line1 = ramp(frame, T.line1, 14, OUT);
  const line2 = ramp(frame, T.line2, 14, OUT);

  // the path: from the vacated slot to the answer's left edge, drawn ahead of the words and erased behind them
  const slot = srcWord(0);
  const pathFrom = { x: slot.x - slot.w / 2, y: slot.y };
  const pathTo = { x: ANSWER.x + 2, y: lineCY };
  const drawn = ramp(frame, T.lift - 6, 16, PLANE);
  const erased = ramp(frame, T.lift + 8, T.land - T.lift - 2, PLANE);
  const pathD = `M ${pathFrom.x} ${pathFrom.y} C ${pathFrom.x - 120} ${pathFrom.y + 40}, ${pathTo.x + 260} ${pathTo.y - 120}, ${pathTo.x} ${pathTo.y}`;

  // the field: one soft pool of light, brightest behind the conversation, breathing during the silence
  const breathe = 1 + 0.08 * Math.sin(silence * Math.PI);
  const fieldStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 980px 620px at 900px 480px, rgba(20,38,46,${0.9 * breathe}) 0%, rgba(11,24,31,0.9) 45%, rgba(4,12,16,1) 100%)`,
  };

  return (
    <Frame bg="#040c10">
      <div style={fieldStyle} />

      {/* the sheet, behind the thread, turned into the depth */}
      {sheetUp > 0 && sheetOpacity > 0.005 && (
        <div style={{ position: "absolute", left: SHEET_BOX.x, top: SHEET_BOX.y + sheetDy, width: SHEET_BOX.w, height: SHEET_BOX.h, perspective: PERSPECTIVE, perspectiveOrigin: "50% 50%", opacity: sheetOpacity, filter: `blur(${sheetBlur.toFixed(1)}px)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: SHEET_BOX.w, height: SHEET_BOX.h, transform: `rotateY(${SHEET_ROT}deg)`, transformOrigin: "50% 50%", transformStyle: "preserve-3d" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: PLAN_W, height: PLAN_H, transform: `scale(${SHEET_SCALE})`, transformOrigin: "0 0" }}>
              <GrowthPlanCard x={0} y={0} dark approved rules={false} reveal={{ approve: 0 }} fuelStyle={{ opacity: 1 - Math.min(1, anyLift * 4) }} />
              {/* the vacated slot: the words are gone, the label stays */}
              <div style={{ position: "absolute", left: PLAN_PAD, top: PLAN_ROWS.fuel + 23, width: s[5], height: 40, opacity: Math.min(1, anyLift * 4) }}>
                <div style={{ position: "absolute", left: 0, top: SHEET_PX * 0.55, width: s[0], fontFamily: FONT.sans, fontSize: SHEET_PX, color: COLOR.onMarineSoft, transform: "translateY(-55%)" }}>Fuel ·</div>
                <div style={{ position: "absolute", left: s[0], right: 0, top: SHEET_PX * 0.9, height: 1, background: "rgba(241,237,229,0.28)" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* the path the words take */}
      {drawn > 0 && erased < 1 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={pathD} fill="none" stroke={COLOR.mint} strokeWidth={1.5} pathLength={1} strokeDasharray={`${Math.max(0, drawn - erased)} 1`} strokeDashoffset={-erased} opacity={0.85} />
        </svg>
      )}

      {/* Joe's message, earlier: a warm card, no tail, no metadata line */}
      <div style={{ position: "absolute", left: COL_X, top: 236, opacity: historyIn, transform: `translateY(${(1 - historyIn) * 10}px)` }}>
        <div style={{ background: "rgba(243,240,233,0.95)", color: COLOR.ink, borderRadius: 18, padding: "26px 34px", display: "inline-block", maxWidth: COL_W - 120 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{MESSAGE.text.body}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{MESSAGE.text.detail.replace(/ · /g, ", ")}.</div>
        </div>
      </div>

      {/* typing, anchored where the question will land; then the question, in the customer's voice, unboxed */}
      <div style={{ position: "absolute", right: 1920 - (COL_X + COL_W), top: 452, display: "flex", gap: 10, opacity: typing }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: COLOR.onMarineSoft, opacity: 0.35 + 0.65 * (Math.sin((frame - T.typing) * 0.55 + i) * 0.5 + 0.5) }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 1920 - (COL_X + COL_W), top: 428, opacity: questionIn, transform: `translateX(${(1 - questionIn) * 40}px)`, textAlign: "right" }}>
        <Voice size={58}>{CONVERSE.question}</Voice>
      </div>

      {/* the answer: a surface that receives the words; a mint edge where the path arrives */}
      <div style={{ position: "absolute", left: ANSWER.x, top: ANSWER.y, opacity: cardIn }}>
        <div style={{ background: "rgba(243,240,233,0.95)", color: COLOR.ink, borderRadius: 18, padding: `${PAD}px ${PAD}px ${PAD - 6}px`, display: "inline-block", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: COLOR.mint, opacity: tissue }} />
          <div style={{ fontFamily: FONT.sans, fontSize: ANSWER_PX, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3, whiteSpace: "pre" }}>
            <span style={{ opacity: tissue }}>{lead}</span>
            <span style={{ opacity: allLanded ? 1 : 0 }}>{w1}</span>
            <span style={{ opacity: tissue }}>, </span>
            <span style={{ opacity: allLanded ? 1 : 0 }}>{w2}</span>
            <span style={{ opacity: tissue }}>, and </span>
            <span style={{ opacity: allLanded ? 1 : 0 }}>{w3}</span>
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: ANSWER_PX, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3, opacity: tissue }}>{CONVERSE.answerParts.tail.trim()}</div>
        </div>
        <div style={{ marginTop: 12, marginLeft: 4, opacity: provenance, fontFamily: FONT.sans, fontSize: 20, color: COLOR.onMarineFaint, letterSpacing: "-0.01em" }}>from Joe's approved offer details</div>
      </div>

      {/* the words in flight: the same glyphs from the sheet to the sentence */}
      {[w1, w2, w3].map((word, i) => {
        const t = travel(i);
        if (t <= 0 || allLanded) return null;
        const src = srcWord(i);
        const dst = dstWord(i);
        const x = src.x + (dst.x - src.x) * t;
        const y = src.y + (dst.y - src.y) * t;
        const size = src.size + (dst.size - src.size) * t;
        const text = t < 0.5 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        const color = t < 0.86 ? COLOR.onMarine : COLOR.ink;
        return (
          <div key={word} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -55%)", fontFamily: FONT.sans, fontSize: size, fontWeight: 400, letterSpacing: "-0.02em", color, whiteSpace: "nowrap", textShadow: t > 0.1 && t < 0.9 ? `0 ${6 * Math.sin(t * Math.PI)}px ${18 * Math.sin(t * Math.PI)}px rgba(0,0,0,0.35)` : undefined }}>
            {text}
          </div>
        );
      })}

      {/* time, once, quietly; then the rule, plainly */}
      <div style={{ position: "absolute", left: COL_X, bottom: 84, opacity: questionIn * 0.55 * (1 - line1) }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          Thursday · 6:52 PM
        </Mono>
      </div>
      <div style={{ position: "absolute", left: COL_X, bottom: 84, opacity: line1, fontFamily: FONT.sans, fontSize: 22, color: COLOR.onMarineSoft, letterSpacing: "-0.01em" }}>
        Already in what Joe approved, so Uptick answered.
        <span style={{ opacity: line2, marginLeft: 14, color: COLOR.onMarineFaint }}>Anything else goes to Joe.</span>
      </div>
      {/* the plan title for reference, never shown: keep the fixture honest */}
      <span style={{ display: "none" }}>{PLAN.title}</span>
    </Frame>
  );
};
