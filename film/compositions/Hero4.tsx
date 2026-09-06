import { useCurrentFrame } from "remotion";
import { homographyMatrix3d, type Quad } from "../block/homography";
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
 * thread — smaller than the thread, turned in true perspective, soft — and
 * three words leave their slot on it: born on the sheet's plane, they
 * travel a mint trail below the question and land inside the sentence that
 * answers, which wipes open around them from its mint edge. The sheet
 * sinks as the answer rises into its place.
 */
const COL_X = 480;
const COL_W = 860;
const ANSWER_PX = 36;
const ANSWER_FONT = `400 ${ANSWER_PX}px 'Geist Film'`;
const SHEET_PX = 34;
const SHEET_FONT = `300 ${SHEET_PX}px 'Geist Film'`;

// the sheet in depth: half size, turned about Y, behind-right of the thread
const S = 0.5;
const BOX = { x: 900, y: 150, w: PLAN_W * S, h: PLAN_H * S };
const ROT = -24;
const PERSPECTIVE = 1000;

const T = {
  history: 0,
  typing: 16,
  question: 32,
  silence: [46, 68] as const,
  sheet: 68,
  lift: 92,
  land: 122,
  sink: 124,
  gone: 160,
  line1: 168,
  line2: 182,
  end: 216,
};

/** True perspective of a point on the turned sheet (rotation about the box's vertical centre line). */
function project(px: number, py: number, rot = ROT, dy = 0) {
  const th = (rot * Math.PI) / 180;
  const cx = BOX.x + BOX.w / 2;
  const cy = BOX.y + BOX.h / 2 + dy;
  const rx = px - cx;
  const ry = py + dy - cy;
  const x3 = rx * Math.cos(th);
  const z3 = -rx * Math.sin(th);
  const s = PERSPECTIVE / (PERSPECTIVE - z3);
  return { x: cx + x3 * s, y: cy + ry * s, s };
}

function sheetQuad(dy: number): Quad {
  const c = (x: number, y: number) => {
    const p = project(x, y, ROT, dy);
    return [p.x, p.y] as [number, number];
  };
  return [c(BOX.x, BOX.y), c(BOX.x + BOX.w, BOX.y), c(BOX.x + BOX.w, BOX.y + BOX.h), c(BOX.x, BOX.y + BOX.h)];
}

/** A cubic that leaves the sheet, dips under the question and arrives level. */
function flight(from: { x: number; y: number }, to: { x: number; y: number }, t: number) {
  const c1 = { x: from.x - 140, y: from.y + 190 };
  const c2 = { x: to.x + 320, y: to.y + 20 };
  const u = 1 - t;
  return {
    x: u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
    y: u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y,
  };
}

export const Hero4 = () => {
  const frame = useCurrentFrame();
  const v = CONVERSE.answerParts.values;
  const w1 = v[0];
  const w2 = v[1];
  const w3 = v[2].replace("and ", "");
  const lead = CONVERSE.answerParts.lead;
  const a = useTextWidths([lead, `${lead}${w1}`, `${lead}${w1}, `, `${lead}${w1}, ${w2}`, `${lead}${w1}, ${w2}, and `, `${lead}${w1}, ${w2}, and ${w3}`], ANSWER_FONT);
  const s = useTextWidths(["Fuel: ", "Fuel: Regular", "Fuel: Regular, ", "Fuel: Regular, premium", "Fuel: Regular, premium or ", "Fuel: Regular, premium or diesel"], SHEET_FONT);
  if (!a || !s) return <Frame bg="#040c10" />;

  // --- the thread ---------------------------------------------------------
  const historyIn = ramp(frame, T.history, 14, OUT);
  const typing = ramp(frame, T.typing, 6, OUT) * (1 - ramp(frame, T.question - 2, 4, IN));
  const questionIn = ramp(frame, T.question, 12, PLANE);
  const silence = frame >= T.silence[0] && frame < T.silence[1] ? (frame - T.silence[0]) / (T.silence[1] - T.silence[0]) : frame >= T.silence[1] ? 1 : 0;
  const stampOut = 1 - ramp(frame, T.sheet, 12, IN);

  // --- the sheet in depth ---------------------------------------------------
  const sheetUp = ramp(frame, T.sheet, 18, PLANE);
  const sheetSink = ramp(frame, T.sink, T.gone - T.sink, PLANE);
  const sheetOpacity = 0.9 * sheetUp * (1 - sheetSink);
  const sheetBlur = 5 - 2 * sheetUp + 5 * sheetSink;
  const sheetDy = 36 * (1 - sheetUp) + 60 * sheetSink;
  const quad = sheetQuad(sheetDy);
  const sheetMatrix = homographyMatrix3d(BOX.w, BOX.h, quad);

  // --- the three words ------------------------------------------------------
  const rowY = PLAN_ROWS.fuel + 14 + SHEET_PX * 0.72; // the value line's optical centre in card space (bare-ish rows)
  const srcWord = (i: number) => {
    const startW = [s[0], s[2], s[4]][i];
    const wordW = [s[1] - s[0], s[3] - s[2], s[5] - s[4]][i];
    const cxCard = PLAN_PAD + startW + wordW / 2;
    const p = project(BOX.x + cxCard * S, BOX.y + rowY * S, ROT, sheetDy);
    return { x: p.x, y: p.y, size: SHEET_PX * S * p.s, w: wordW * S * p.s };
  };
  const ANSWER = { x: COL_X + 70, y: 592 };
  const PAD = 36;
  const lineCY = ANSWER.y + PAD + ANSWER_PX * 0.62;
  const dstWord = (i: number) => {
    const startW = [a[0], a[2], a[4]][i];
    const wordW = [a[1] - a[0], a[3] - a[2], a[5] - a[4]][i];
    return { x: ANSWER.x + PAD + startW + wordW / 2, y: lineCY, size: ANSWER_PX, w: wordW };
  };
  const travel = (i: number) => ramp(frame, T.lift + i * 3, T.land - T.lift - 6, PLANE);
  const anyLift = travel(0);
  const allLanded = travel(2) >= 1;
  const open = ramp(frame, T.land - 6, 10, PLANE); // the card wipes open from its mint edge
  const tissue = ramp(frame, T.land, 10, OUT);
  const provenance = ramp(frame, T.land + 18, 12, OUT);
  const line1 = ramp(frame, T.line1, 14, OUT);
  const line2 = ramp(frame, T.line2, 14, OUT);

  // the field: a lamp, left of centre, where the conversation is; it breathes once in the silence
  const breathe = 1 + 0.07 * Math.sin(silence * Math.PI);
  const field: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 900px 640px at 760px 430px, rgba(21,40,48,${0.95 * breathe}) 0%, rgba(11,24,31,0.92) 48%, rgba(4,12,16,1) 100%)`,
  };

  return (
    <Frame bg="#040c10">
      <div style={field} />

      {/* the sheet: half size, in true perspective, behind the thread */}
      {sheetOpacity > 0.004 && (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: BOX.w, height: BOX.h, transform: sheetMatrix, transformOrigin: "0 0", opacity: sheetOpacity, filter: `blur(${sheetBlur.toFixed(1)}px)` }}>
            {/* a lit surface: a faint near-edge catch and a falloff across the plane */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(241,237,229,0.14) 0%, rgba(241,237,229,0.07) 60%, rgba(241,237,229,0.04) 100%)", borderRadius: 2, boxShadow: "inset 1px 0 0 rgba(241,237,229,0.35)" }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: PLAN_W, height: PLAN_H, transform: `scale(${S})`, transformOrigin: "0 0" }}>
              <GrowthPlanCard x={0} y={0} dark bare approved labels={false} titleSize={64} reveal={{ approve: 0 }} fuelStyle={{ opacity: 1 - Math.min(1, anyLift * 3) }} style={{ left: PLAN_PAD, top: 60 }} />
              {/* the vacated slot: the label stays, a hairline marks where the values were */}
              <div style={{ position: "absolute", left: PLAN_PAD, top: 60 + PLAN_ROWS.fuel + 14, opacity: Math.min(1, anyLift * 3), fontFamily: FONT.sans, fontWeight: 300, fontSize: SHEET_PX, color: COLOR.onMarineSoft, whiteSpace: "nowrap" }}>
                Fuel:
                <span style={{ display: "inline-block", width: s[5] - s[0] - 8, height: 1.5, background: COLOR.mint, marginLeft: 8, verticalAlign: "middle", opacity: 0.7 }} />
              </div>
            </div>
          </div>
          {/* the one line on the sheet that matters stays legible */}
          <div style={{ position: "absolute", left: 0, top: 0, width: BOX.w, height: BOX.h, transform: sheetMatrix, transformOrigin: "0 0", opacity: Math.min(1, sheetOpacity * 1.6), filter: `blur(${Math.max(0.6, sheetBlur * 0.3).toFixed(1)}px)` }}>
            <div style={{ position: "absolute", left: PLAN_PAD * S, top: 22, fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: COLOR.onMarine, whiteSpace: "nowrap" }}>Growth plan · approved · {PLAN.approvedAt}</div>
          </div>
        </>
      )}

      {/* Joe's message, earlier */}
      <div style={{ position: "absolute", left: COL_X, top: 250, opacity: historyIn, transform: `translateY(${(1 - historyIn) * 10}px)` }}>
        <div style={{ background: "rgba(243,240,233,0.95)", color: COLOR.ink, borderRadius: 18, padding: "26px 34px", display: "inline-block", maxWidth: COL_W - 120, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)" }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{MESSAGE.text.body}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{MESSAGE.text.detail.replace(/ · /g, ", ").replace("First", "first")}.</div>
        </div>
      </div>

      {/* typing where the question will land; then the question, unboxed */}
      <div style={{ position: "absolute", right: 1920 - (COL_X + COL_W), top: 452, display: "flex", gap: 10, opacity: typing }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: COLOR.onMarineSoft, opacity: 0.35 + 0.65 * (Math.sin((frame - T.typing) * 0.55 + i) * 0.5 + 0.5) }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 1920 - (COL_X + COL_W), top: 428, opacity: questionIn, transform: `translateX(${(1 - questionIn) * 40}px)`, textAlign: "right" }}>
        <Voice size={58}>{CONVERSE.question}</Voice>
      </div>

      {/* the answer: born cream, wiping open from its mint edge as the words land; a different voice from Joe's */}
      <div style={{ position: "absolute", left: ANSWER.x, top: ANSWER.y, clipPath: `inset(0 ${(1 - open) * 100}% 0 0)`, opacity: open > 0 ? 1 : 0 }}>
        <div style={{ background: "#eef0ec", color: COLOR.ink, borderRadius: 18, padding: `${PAD}px ${PAD}px ${PAD - 6}px`, display: "inline-block", position: "relative", overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: COLOR.mint }} />
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
      </div>
      <div style={{ position: "absolute", left: ANSWER.x + 4, top: ANSWER.y + 160, opacity: provenance, fontFamily: FONT.sans, fontSize: 20, color: COLOR.onMarineFaint, letterSpacing: "-0.01em" }}>from Joe's approved offer details</div>

      {/* the words in flight, with their trails: one object from slot to sentence */}
      {[w1, w2, w3].map((word, i) => {
        const t = travel(i);
        if (t <= 0 || allLanded) return null;
        const src = srcWord(i);
        const dst = dstWord(i);
        const p = flight(src, dst, t);
        const size = src.size + (dst.size - src.size) * t;
        const blur = Math.max(0, (sheetBlur - 2) * (1 - Math.min(1, t * 2.2)));
        const text = t < 0.55 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        const onCard = open > 0.85 && t > 0.9;
        // the trail: from a little behind the word back along its flight
        const trail: string[] = [];
        for (let k = 0; k <= 8; k++) {
          const tt = Math.max(0, t - 0.16 + (0.16 * k) / 8);
          const q = flight(src, dst, tt);
          trail.push(`${k === 0 ? "M" : "L"} ${q.x} ${q.y}`);
        }
        return (
          <div key={word}>
            {t < 0.995 && (
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <path d={trail.join(" ")} fill="none" stroke={COLOR.mint} strokeWidth={2} strokeLinecap="round" opacity={0.85 * Math.min(1, t * 6)} />
              </svg>
            )}
            <div style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -55%)", fontFamily: FONT.sans, fontSize: size, fontWeight: t < 0.5 ? 300 : 400, letterSpacing: "-0.02em", color: onCard ? COLOR.ink : COLOR.onMarine, whiteSpace: "nowrap", opacity: 0.8 + 0.2 * t, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
              {text}
            </div>
          </div>
        );
      })}

      {/* the time, only while the question hangs; then the rule, plainly, stacked */}
      <div style={{ position: "absolute", left: COL_X, bottom: 110, opacity: questionIn * 0.55 * stampOut, fontFamily: FONT.sans, fontSize: 18, color: COLOR.onMarineFaint }}>
        Thursday, 6:52 PM
      </div>
      <div style={{ position: "absolute", left: COL_X, bottom: 138, opacity: line1, fontFamily: FONT.sans, fontSize: 22, color: COLOR.onMarineSoft, letterSpacing: "-0.01em" }}>Already in what Joe approved, so Uptick answered.</div>
      <div style={{ position: "absolute", left: COL_X, bottom: 108, opacity: line2, fontFamily: FONT.sans, fontSize: 22, color: COLOR.onMarineFaint, letterSpacing: "-0.01em" }}>Anything else goes to Joe.</div>
      <span style={{ display: "none" }}>
        <Mono>{PLAN.title}</Mono>
      </span>
    </Frame>
  );
};
