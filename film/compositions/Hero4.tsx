import { useCurrentFrame } from "remotion";
import { homographyMatrix3d, type Quad } from "../block/homography";
import { CONVERSE, MESSAGE, OFFER, PLAN } from "../data/joes";
import { IN, OUT, PLANE, ramp } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_H, PLAN_PAD, PLAN_ROWS, PLAN_W } from "../primitives/GrowthPlan";
import { Mono, Voice } from "../primitives/Type";
import { COLOR, FONT } from "../tokens";
import { useTextWidths } from "../typography/measure";

/**
 * HERO 4 · DOES DIESEL COUNT? → PROVENANCE → ANSWER
 *
 * A thread with no chrome: two sheets of paper on a dark field, not
 * bubbles. A question in the customer's own voice. A held silence. Then
 * the approved plan surfaces in the depth to the upper right — turned a
 * little, soft, its header legible — and its fuel line lights: three words
 * peel off that line at its own size, cross the frame on a mint trail, and
 * land inside the sentence that answers, which has already opened for them
 * from its mint edge. The sheet sinks as the answer takes its place.
 */
const COL_X = 480;
const ANSWER_PX = 36;
const ANSWER_FONT = `400 ${ANSWER_PX}px 'Geist Film'`;
const SHEET_PX = 34;
const SHEET_FONT = `300 ${SHEET_PX}px 'Geist Film'`;

// the sheet in depth: upper right, turned a little about Y, clear of every line of type
const S = 0.62;
const CARD_TOP = 150;
const BOX = { x: 1210, y: 100, w: (PLAN_W + 2 * PLAN_PAD) * S, h: (PLAN_H + CARD_TOP) * S };
const ROT = -12;
const PERSPECTIVE = 1400;

// the beat grid at 76 bpm (18.95 frames a beat)
const T = {
  history: 0,
  question: 38,
  silence: [50, 76] as const,
  sheet: 76,
  light: 88,
  lift: 95,
  land: 133,
  sink: 137,
  gone: 168,
  line1: 172,
  line2: 188,
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

/** A cubic that leaves the sheet to the lower left, crosses the frame, and arrives level. */
function flight(from: { x: number; y: number }, to: { x: number; y: number }, t: number) {
  const c1 = { x: from.x - 120, y: from.y + 240 };
  const c2 = { x: to.x + 380, y: to.y - 40 };
  const u = 1 - t;
  return {
    x: u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
    y: u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y,
  };
}

export const Hero4 = ({ thread = "text", historyAt = 0 }: { thread?: "text" | "offer"; historyAt?: number }) => {
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
  const historyIn = ramp(frame, T.history + historyAt, 14, OUT);
  const questionIn = ramp(frame, T.question, 12, PLANE);
  const silence = frame >= T.silence[0] && frame < T.silence[1] ? (frame - T.silence[0]) / (T.silence[1] - T.silence[0]) : frame >= T.silence[1] ? 1 : 0;

  // --- the sheet in depth ---------------------------------------------------
  const sheetUp = ramp(frame, T.sheet, 18, PLANE);
  const sheetSink = ramp(frame, T.sink, T.gone - T.sink, PLANE);
  const sheetOpacity = 0.96 * sheetUp * (1 - sheetSink);
  const sheetBlur = 4 - 2.2 * sheetUp + 5 * sheetSink;
  const sheetDy = 36 * (1 - sheetUp) + 70 * sheetSink;
  const quad = sheetQuad(sheetDy);
  const sheetMatrix = homographyMatrix3d(BOX.w, BOX.h, quad);
  // the fuel line lights before the words leave it
  const lit = ramp(frame, T.light, 7, OUT);

  // --- the three words ------------------------------------------------------
  const rowY = CARD_TOP + PLAN_ROWS.fuel + 14 + SHEET_PX * 0.72; // the value line's optical centre in sheet space
  const srcWord = (i: number) => {
    const startW = [s[0], s[2], s[4]][i];
    const wordW = [s[1] - s[0], s[3] - s[2], s[5] - s[4]][i];
    const cxCard = PLAN_PAD + startW + wordW / 2;
    const p = project(BOX.x + cxCard * S, BOX.y + rowY * S, ROT, sheetDy);
    return { x: p.x, y: p.y, size: SHEET_PX * S, w: wordW * S * p.s };
  };
  const ANSWER = { x: 620, y: 600 };
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
  const open = ramp(frame, T.land - 16, 10, PLANE); // the answer opens from its mint edge before the words arrive
  const tissue = ramp(frame, T.land - 12, 10, OUT);
  const provenance = ramp(frame, T.land + 14, 12, OUT);
  const line1 = ramp(frame, T.line1, 14, OUT);
  const line2 = ramp(frame, T.line2, 14, OUT);

  // the field: a lamp where the conversation is. It breathes in the silence, drifts toward the plan when it
  // surfaces, and comes back to the answer when the words land: the light comes off the plan.
  const breathe = 0.86 + 0.14 * Math.sin(silence * Math.PI);
  const toSheet = sheetUp * (1 - sheetSink);
  const lampX = 760 + 24 * silence + 420 * toSheet;
  const lampY = 430 - 20 * silence - 120 * toSheet + 120 * sheetSink;
  const field: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 980px 680px at ${lampX.toFixed(0)}px ${lampY.toFixed(0)}px, rgba(21,40,48,${(0.98 * breathe).toFixed(3)}) 0%, rgba(11,24,31,0.92) 48%, rgba(4,12,16,1) 100%)`,
  };

  const paper: React.CSSProperties = { borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(23,32,31,0.08)" };

  return (
    <Frame bg="#040c10">
      <div style={field} />

      {/* the sheet: in true perspective, upper right, its header and its fuel line legible */}
      {sheetOpacity > 0.004 && (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: BOX.w, height: BOX.h, transform: sheetMatrix, transformOrigin: "0 0", opacity: sheetOpacity, filter: `blur(${sheetBlur.toFixed(1)}px)` }}>
            {/* a lit surface: a faint near-edge catch and a falloff across the plane */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(241,237,229,0.16) 0%, rgba(241,237,229,0.08) 60%, rgba(241,237,229,0.05) 100%)", borderRadius: 2, boxShadow: "inset 1px 0 0 rgba(241,237,229,0.35)" }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: PLAN_W, height: PLAN_H, transform: `scale(${S})`, transformOrigin: "0 0" }}>
              <GrowthPlanCard x={0} y={0} dark bare approved labels={false} titleSize={64} reveal={{ approve: 0 }} fuelStyle={{ opacity: (1 - Math.min(1, anyLift * 3)) * (0.7 + 0.3 * lit), filter: lit > 0 ? `drop-shadow(0 0 ${(6 * lit).toFixed(1)}px rgba(95,214,187,${(0.35 * lit).toFixed(2)}))` : undefined }} style={{ left: PLAN_PAD, top: CARD_TOP }} />
              {/* the fuel line lights, then the vacated slot keeps its label and a mint hairline where the values were */}
              {/* the row lights with one mint hairline, which stays where the words were */}
              <div style={{ position: "absolute", left: PLAN_PAD + s[0], top: CARD_TOP + PLAN_ROWS.fuel + 14 + SHEET_PX * 1.18, width: s[5] - s[0], height: 2, background: COLOR.mint, opacity: 0.75 * lit }} />
              <div style={{ position: "absolute", left: PLAN_PAD, top: CARD_TOP + PLAN_ROWS.fuel + 14, opacity: Math.min(1, anyLift * 3), fontFamily: FONT.sans, fontWeight: 300, fontSize: SHEET_PX, color: COLOR.onMarineSoft, whiteSpace: "nowrap" }}>Fuel:</div>
            </div>
          </div>
          {/* the header stays legible whatever the blur: this is an approved plan, at a time */}
          <div style={{ position: "absolute", left: 0, top: 0, width: BOX.w, height: BOX.h, transform: sheetMatrix, transformOrigin: "0 0", opacity: Math.min(1, sheetOpacity * 1.5), filter: `blur(${Math.max(0.4, sheetBlur * 0.25).toFixed(1)}px)` }}>
            <div style={{ position: "absolute", left: PLAN_PAD * S, top: 24, fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR.onMarine, whiteSpace: "nowrap" }}>Growth plan · approved · {PLAN.approvedAt}</div>
          </div>
        </>
      )}

      {/* Joe's message, earlier: a sheet of paper, not a bubble */}
      <div style={{ position: "absolute", left: COL_X, top: 236, opacity: historyIn, transform: `translateY(${(1 - historyIn) * 10}px)` }}>
        <div style={{ ...paper, background: "#edeae3", color: COLOR.ink, padding: "26px 34px", display: "inline-block", maxWidth: 640 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{thread === "offer" ? OFFER.headline : MESSAGE.text.body}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{thread === "offer" ? OFFER.line : MESSAGE.text.detail.replace(/ · /g, ", ").replace("First", "first") + "."}</div>
        </div>
      </div>

      {/* the question, unboxed, in the customer's voice; the field holds still around it */}
      <div style={{ position: "absolute", right: 1920 - 1180, top: 424, opacity: questionIn * (1 - 0.45 * ramp(frame, T.land, 10, OUT)), transform: `translateX(${(1 - questionIn) * 40}px)`, textAlign: "right" }}>
        <Voice size={58}>{CONVERSE.question}</Voice>
      </div>

      {/* the answer: cooler paper, opening from its mint edge before the words arrive; the provenance inside its lower edge */}
      <div style={{ position: "absolute", left: ANSWER.x, top: ANSWER.y, clipPath: `inset(0 ${(1 - open) * 100}% 0 0)`, opacity: open > 0 ? 1 : 0 }}>
        <div style={{ ...paper, background: "#eef3f2", color: COLOR.ink, padding: `${PAD}px ${PAD}px ${PAD - 8}px`, display: "inline-block", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: COLOR.mint }} />
          <div style={{ fontFamily: FONT.sans, fontSize: ANSWER_PX, fontWeight: 400, letterSpacing: 0, lineHeight: 1.3, whiteSpace: "pre" }}>
            <span style={{ opacity: tissue }}>{lead}</span>
            <span style={{ opacity: allLanded ? 1 : 0 }}>{w1}</span>
            <span style={{ opacity: tissue }}>, </span>
            <span style={{ opacity: allLanded ? 1 : 0 }}>{w2}</span>
            <span style={{ opacity: tissue }}>, and </span>
            <span style={{ opacity: allLanded ? 1 : 0 }}>{w3}</span>
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: ANSWER_PX, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3, opacity: tissue }}>{CONVERSE.answerParts.tail.trim()}</div>
          <div style={{ marginTop: 18, opacity: provenance, fontFamily: FONT.sans, fontSize: 24, color: COLOR.inkSoft, letterSpacing: "-0.01em" }}>from Joe's approved offer details</div>
        </div>
      </div>

      {/* the words in flight, with their trails: one object from the fuel line to the sentence */}
      {[w1, w2, w3].map((word, i) => {
        const t = travel(i);
        const since = frame - (T.lift + i * 3 + (T.land - T.lift - 6));
        if (t <= 0 || since > 8) return null;
        const src = srcWord(i);
        const dst = dstWord(i);
        const tt = Math.max(0, (t - 0.08) / 0.92); // the word holds on its row for the first frames while it takes its size
        const p = flight(src, dst, tt);
        // the word reaches the sentence's size in the first third of its flight: the payload is the type that lands
        const grow = Math.min(1, t / 0.35);
        const size = src.size + (dst.size - src.size) * grow;
        const blur = Math.max(0, (sheetBlur - 2) * (1 - Math.min(1, t * 2.2)));
        // the trail: a long arc behind the word, brightest at the head, fading over eight frames after landing
        const head = 0.45 * Math.min(1, tt * 6);
        const segs: { d: string; o: number }[] = [];
        const L = 0.3;
        const recede = since > 0 ? Math.min(1, since / 8) : 0; // after landing the arc leaves from its head
        for (let k = 0; k < 10; k++) {
          if ((k + 1) / 10 > 1 - recede) break;
          const t0 = Math.max(0, tt - L + (L * k) / 10);
          const t1 = Math.max(0, tt - L + (L * (k + 1)) / 10);
          const q0 = flight(src, dst, t0);
          const q1 = flight(src, dst, t1);
          segs.push({ d: `M ${q0.x} ${q0.y} L ${q1.x} ${q1.y}`, o: head * ((k + 1) / 10) });
        }
        return (
          <div key={word}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {segs.map((sg, k) => (
                <path key={k} d={sg.d} fill="none" stroke={COLOR.mint} strokeWidth={2} strokeLinecap="round" opacity={sg.o} />
              ))}
            </svg>
            {!allLanded && (
              <div style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-50%, -55%)", fontFamily: FONT.sans, fontSize: size, fontWeight: t < 0.35 ? 300 : 400, letterSpacing: 0, color: t > 0.92 ? COLOR.ink : COLOR.onMarine, whiteSpace: "nowrap", opacity: 0.85 + 0.15 * t, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
                {word}
              </div>
            )}
          </div>
        );
      })}

      {/* the rule, plainly, stacked under the answer */}
      <div style={{ position: "absolute", left: ANSWER.x, bottom: 150, opacity: line1 * 0.85, fontFamily: FONT.sans, fontSize: 28, color: COLOR.onMarine, letterSpacing: "-0.01em" }}>Already in what Joe approved, so Uptick answered.</div>
      <div style={{ position: "absolute", left: ANSWER.x, bottom: 108, opacity: line2 * 0.55, fontFamily: FONT.sans, fontSize: 24, color: COLOR.onMarine, letterSpacing: "-0.01em" }}>Anything else goes to Joe.</div>
      {/* the account, near the provenance and never after the result */}
      <div style={{ position: "absolute", left: ANSWER.x, bottom: 66, opacity: ramp(frame, T.line2 + 12, 14, OUT) * 0.8 }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          {CONVERSE.week.line}
        </Mono>
      </div>
      <span style={{ display: "none" }}>
        <Mono>{PLAN.title}</Mono>
      </span>
    </Frame>
  );
};

/** The film's Hero 4: the café stranger's question, read from the Offer thread. */
export const Hero4Offer = () => <Hero4 thread="offer" historyAt={-14} />;
