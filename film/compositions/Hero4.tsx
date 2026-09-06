import { useCurrentFrame } from "remotion";
import { homographyMatrix3d, type Quad } from "../block/homography";
import { CONVERSE, MESSAGE, OFFER, PLAN } from "../data/joes";
import { clamp01, mix, OUT, PLANE, ramp } from "../motion";
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
 * peel off that line at the row's own size and turn, drop clear of the
 * sheet, un-skew on one shared track, and land inside the sentence that
 * answers, which is already typeset and waiting for them. The sheet sinks
 * as the answer takes its place.
 *
 * The departure is the proof beat, so it is built to be legible frame by
 * frame: each word's copy is born exactly on top of its own row glyph (same
 * weight, same tracking, same perspective) and the glyph goes to 0 under it,
 * so the row is never double-exposed; the word then leaves straight down
 * before it travels, and only un-skews once it is clear of the plate.
 */
const COL_X = 480;
const ANSWER_PX = 36;
const ANSWER_LEAD = 1.3;
const ANSWER_FONT = `400 ${ANSWER_PX}px 'Geist Film'`;
const SHEET_PX = 34;
const SHEET_LEAD = 1.15;
/** The fuel row carries the payload, so it is set at the answer's weight: the type that leaves is the type that lands. */
const SHEET_FONT = `400 ${SHEET_PX}px 'Geist Film'`;
const SHEET_TRACK = -0.02; // em, the sheet's rows
const ROW_LS = `${SHEET_TRACK}em`;

// the sheet in depth: upper right, turned a little about Y, clear of every line of type
const S = 0.62;
const CARD_TOP = 150;
const BOX = { x: 1210, y: 80, w: (PLAN_W + 2 * PLAN_PAD) * S, h: (PLAN_H + CARD_TOP) * S };
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

/**
 * The departure, word by word. Each word's copy is handed the row over three
 * frames, drops clear of the plate, un-skews over eight, and lands in its
 * slot. The sentence is complete at 130; T.land stays the beat the answer is
 * settled on.
 */
const SPAWN = [96, 100, 104] as const;
const LANDF = [122, 126, 130] as const;
const HAND = 3;
const DROP = 4;
const UNSKEW = 8;
const TRAIL_MAX = 220;
const TRAIL_OUT = 6;

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

/** The same, addressed in the card's own coordinates. */
function projectCard(cx: number, cy: number, dy = 0) {
  return project(BOX.x + cx * S, BOX.y + cy * S, ROT, dy);
}

/** The local 2×2 of that map at a card point: one card pixel across, one down, in screen pixels. */
function cardJacobian(cx: number, cy: number, dy = 0) {
  const p = projectCard(cx, cy, dy);
  const px = projectCard(cx + 1, cy, dy);
  const py = projectCard(cx, cy + 1, dy);
  return { p, a: px.x - p.x, b: px.y - p.y, c: py.x - p.x, d: py.y - p.y };
}

function sheetQuad(dy: number): Quad {
  const c = (x: number, y: number) => {
    const p = project(x, y, ROT, dy);
    return [p.x, p.y] as [number, number];
  };
  return [c(BOX.x, BOX.y), c(BOX.x + BOX.w, BOX.y), c(BOX.x + BOX.w, BOX.y + BOX.h), c(BOX.x, BOX.y + BOX.h)];
}

// where the row sits on the card, and where the sheet's last row ends: the words leave 40 px below it
const ROW_TOP = CARD_TOP + PLAN_ROWS.fuel + 14;
const ROW_CY = ROW_TOP + (SHEET_PX * SHEET_LEAD) / 2;
const RULE_Y = CARD_TOP + PLAN_ROWS.fuel + 74;
const MINT_Y = ROW_TOP + SHEET_PX * SHEET_LEAD + 4;
const SHEET_FLOOR = projectCard(PLAN_PAD + PLAN_W / 2, CARD_TOP + PLAN_ROWS.limit + 14 + SHEET_PX * SHEET_LEAD).y;
/** One track for all three words: a shallow arc, clear of the sheet, from the row across to the sentence. */
const TRACK_Y = SHEET_FLOOR + 40;
const TRACK_BOW = 22;

export const Hero4 = ({ thread = "text", historyAt = 0 }: { thread?: "text" | "offer"; historyAt?: number }) => {
  const frame = useCurrentFrame();
  const v = CONVERSE.answerParts.values;
  const w1 = v[0];
  const w2 = v[1];
  const w3 = v[2].replace("and ", "");
  const lead = CONVERSE.answerParts.lead;
  // the sheet's row, set locally in lower case: the fixture's capitals belong to the plan, not to this shot
  const fv = PLAN.fuel.values.map((x) => x.toLowerCase());
  const rowParts = [`${PLAN.fuel.label}: `, fv[0], ", ", fv[1], " or ", fv[2]];
  const cum = rowParts.map((_, i) => rowParts.slice(0, i + 1).join(""));
  const a = useTextWidths([lead, `${lead}${w1}`, `${lead}${w1}, `, `${lead}${w1}, ${w2}`, `${lead}${w1}, ${w2}, and `, `${lead}${w1}, ${w2}, and ${w3}`], ANSWER_FONT, "0");
  const s = useTextWidths(cum, SHEET_FONT, ROW_LS);
  if (!a || !s) return <Frame bg="#040c10" />;

  const words = [w1, w2, w3];

  // --- the thread ---------------------------------------------------------
  const historyIn = ramp(frame, T.history + historyAt, 14, OUT);
  // the offer plane yields as the sheet arrives: the evidence outranks the history
  const historyYield = 1 - 0.45 * ramp(frame, T.sheet, 18, PLANE);
  const questionIn = ramp(frame, T.question, 12, PLANE);
  const silence = frame >= T.silence[0] && frame < T.silence[1] ? (frame - T.silence[0]) / (T.silence[1] - T.silence[0]) : frame >= T.silence[1] ? 1 : 0;

  // --- the sheet in depth ---------------------------------------------------
  const sheetUp = ramp(frame, T.sheet, 18, PLANE);
  const sheetSink = ramp(frame, T.sink, T.gone - T.sink, PLANE);
  const sheetOpacity = 0.96 * sheetUp * (1 - sheetSink);
  // the body is held sharp enough to read while the words leave; the depth is carried by the veil below, not by mud
  const sheetBlur = 3.4 - 2.9 * sheetUp + 5 * sheetSink;
  const headBlur = Math.max(0.35, sheetBlur * 0.3);
  const sheetDy = 36 * (1 - sheetUp) + 70 * sheetSink;
  const quad = sheetQuad(sheetDy);
  const sheetMatrix = homographyMatrix3d(BOX.w, BOX.h, quad);
  // the fuel row itself lights — the row, not the rule
  const lit = ramp(frame, T.light, 7, OUT);

  // --- the three words ------------------------------------------------------
  const srcWord = (i: number) => {
    const startW = s[2 * i];
    const wordW = s[2 * i + 1] - startW;
    const cx = PLAN_PAD + startW + wordW / 2;
    return { ...cardJacobian(cx, ROW_CY, sheetDy), w: wordW };
  };
  const ANSWER = { x: 620, y: 628 };
  const PAD = 36;
  const lineCY = ANSWER.y + PAD + (ANSWER_PX * ANSWER_LEAD) / 2;
  const dstWord = (i: number) => {
    const startW = a[2 * i];
    const wordW = a[2 * i + 1] - startW;
    return { x: ANSWER.x + PAD + startW + wordW / 2, y: lineCY, w: wordW };
  };

  const trackX0 = srcWord(2).p.x;
  const trackX1 = dstWord(0).x;
  const track = (x: number) => TRACK_Y - TRACK_BOW * Math.sin(Math.PI * clamp01((trackX0 - x) / (trackX0 - trackX1)));

  /** Handover, then a straight exit, then the shared track, then the slot. */
  const hand = (i: number, f: number) => ramp(f, SPAWN[i], HAND, PLANE);
  const wordAt = (i: number, f: number) => {
    const src = srcWord(i);
    const dst = dstWord(i);
    const drop = ramp(f, SPAWN[i] + HAND, DROP, PLANE);
    // the run overlaps the last two frames of the exit, so the corner rounds instead of stopping
    const runFrom = SPAWN[i] + HAND + DROP - 2;
    const run = ramp(f, runFrom, LANDF[i] - runFrom, PLANE);
    const settle = ramp(f, LANDF[i] - 5, 5, PLANE); // the hook into the slot: short, so the word never straddles the plane's edge
    const x = src.p.x + (dst.x - src.p.x) * run;
    const ty = track(x);
    return { x, y: src.p.y + (ty - src.p.y) * drop + (dst.y - ty) * settle, drop, run, settle };
  };
  const landed = (i: number) => frame >= LANDF[i];

  const plate = ramp(frame, 116, 6, OUT); // the plane opens at full width and fades: it never wipes over the words
  const provenance = ramp(frame, LANDF[2] + 1, 12, OUT);
  const week = ramp(frame, 158, 14, OUT);
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
  const plane: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: BOX.w, height: BOX.h, transform: sheetMatrix, transformOrigin: "0 0" };
  const cardSpace: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: PLAN_W, height: PLAN_H, transform: `scale(${S})`, transformOrigin: "0 0" };

  return (
    <Frame bg="#040c10">
      <div style={field} />

      {/* the sheet: in true perspective, upper right, its header and its fuel line legible */}
      {sheetOpacity > 0.004 && (
        <>
          <div style={{ ...plane, opacity: sheetOpacity, filter: `blur(${sheetBlur.toFixed(1)}px)` }}>
            {/* a lit surface: a faint near-edge catch and a falloff across the plane */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(241,237,229,0.16) 0%, rgba(241,237,229,0.08) 60%, rgba(241,237,229,0.05) 100%)", borderRadius: 2, boxShadow: "inset 1px 0 0 rgba(241,237,229,0.35)" }} />
            <div style={cardSpace}>
              <GrowthPlanCard x={0} y={0} dark bare approved labels={false} titleSize={64} hideFuel reveal={{ approve: 0 }} style={{ left: PLAN_PAD, top: CARD_TOP }} />
              {/* the vacated row keeps its rule with the others */}
              <div style={{ position: "absolute", left: PLAN_PAD, width: PLAN_W, top: RULE_Y, height: 1, background: "rgba(241,237,229,0.22)" }} />
            </div>
            {/* depth: the plate falls away below the row the answer comes from */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,12,16,0) 46%, rgba(4,12,16,0.38) 100%)" }} />
          </div>
          {/* the header and the fuel row stay sharp: this is an approved plan, at a time, and this is the row it is answered from */}
          <div style={{ ...plane, opacity: Math.min(1, sheetOpacity * 1.5), filter: `blur(${headBlur.toFixed(2)}px)` }}>
            <div style={{ position: "absolute", left: PLAN_PAD * S, top: 24, fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR.onMarine, whiteSpace: "nowrap" }}>Growth plan · approved · {PLAN.approvedAt}</div>
            <div style={cardSpace}>
              {/* the row lights: its own words go to full white with a mint glow, and each is handed to its copy in place */}
              <div style={{ position: "absolute", left: PLAN_PAD, top: ROW_TOP, fontFamily: FONT.sans, fontWeight: 400, fontSize: SHEET_PX, letterSpacing: ROW_LS, lineHeight: SHEET_LEAD, whiteSpace: "pre", color: `rgba(241,237,229,${(0.72 + 0.28 * lit).toFixed(3)})`, textShadow: lit > 0 ? `0 0 ${(6 * lit).toFixed(1)}px rgba(95,214,187,${(0.55 * lit).toFixed(2)})` : undefined }}>
                <span>{rowParts[0]}</span>
                <span style={{ opacity: 1 - hand(0, frame) }}>{rowParts[1] + rowParts[2]}</span>
                <span style={{ opacity: 1 - hand(1, frame) }}>{rowParts[3] + rowParts[4]}</span>
                <span style={{ opacity: 1 - hand(2, frame) }}>{rowParts[5]}</span>
              </div>
              {/* the mint rule where the words were, and it stays */}
              <div style={{ position: "absolute", left: PLAN_PAD + s[0], top: MINT_Y, width: s[5] - s[0], height: 2, background: COLOR.mint, opacity: 0.75 * lit }} />
            </div>
          </div>
        </>
      )}

      {/* Joe's message, earlier: a sheet of paper, not a bubble; it yields to the evidence */}
      <div style={{ position: "absolute", left: COL_X, top: 236, opacity: historyIn * historyYield, transform: `translateY(${(1 - historyIn) * 10}px)` }}>
        <div style={{ ...paper, background: "#edeae3", color: COLOR.ink, padding: "26px 34px", display: "inline-block", maxWidth: 640 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{thread === "offer" ? OFFER.headline : MESSAGE.text.body}</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{thread === "offer" ? OFFER.line : MESSAGE.text.detail.replace(/ · /g, ", ").replace("First", "first") + "."}</div>
        </div>
      </div>

      {/* the question, unboxed, in the customer's voice; the field holds still around it */}
      <div style={{ position: "absolute", right: 1920 - 1180, top: 424, opacity: questionIn * (1 - 0.45 * ramp(frame, T.land, 10, OUT)), transform: `translateX(${(1 - questionIn) * 40}px)`, textAlign: "right" }}>
        <Voice size={58}>{CONVERSE.question}</Voice>
      </div>

      {/* the answer: cooler paper, typeset whole at full width and faded up before the words arrive */}
      <div style={{ position: "absolute", left: ANSWER.x, top: ANSWER.y, opacity: plate }}>
        <div style={{ ...paper, background: "#eef3f2", color: COLOR.ink, padding: `${PAD}px ${PAD}px ${PAD - 10}px`, display: "inline-block", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: COLOR.mint }} />
          <div style={{ width: a[5] }}>
            <div style={{ fontFamily: FONT.sans, fontSize: ANSWER_PX, fontWeight: 400, letterSpacing: 0, lineHeight: ANSWER_LEAD, whiteSpace: "pre" }}>
              <span>{lead}</span>
              <span style={{ opacity: landed(0) ? 1 : 0 }}>{w1}</span>
              <span>, </span>
              <span style={{ opacity: landed(1) ? 1 : 0 }}>{w2}</span>
              <span>, and </span>
              <span style={{ opacity: landed(2) ? 1 : 0 }}>{w3}</span>
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: ANSWER_PX, fontWeight: 400, letterSpacing: 0, lineHeight: ANSWER_LEAD }}>{CONVERSE.answerParts.tail.trim()}</div>
            {/* the lower rail: where the answer came from, and what the week looks like */}
            <div style={{ marginTop: 20 }}>
              <div style={{ opacity: provenance, fontFamily: FONT.sans, fontSize: 24, color: COLOR.inkSoft, letterSpacing: "-0.01em" }}>from Joe&rsquo;s approved offer details</div>
              <div style={{ marginTop: 8, textAlign: "right", opacity: week, fontFamily: FONT.sans, fontSize: 22, color: COLOR.inkFaint, letterSpacing: "-0.01em" }}>{CONVERSE.week.line}</div>
            </div>
          </div>
        </div>
      </div>

      {/* the words in flight, with their trails: one object from the fuel line to the sentence */}
      {words.map((word, i) => {
        const h = hand(i, frame);
        if (h <= 0 || landed(i)) return null;
        const src = srcWord(i);
        const dst = dstWord(i);
        const now = wordAt(i, frame);
        const skew = ramp(frame, SPAWN[i] + HAND + DROP, UNSKEW, PLANE);
        // born on the row's own glyph: the row's weight, the row's tracking, the row's perspective
        const nat0 = dst.w + SHEET_TRACK * ANSWER_PX * word.length;
        const sx = src.w / nat0;
        const sy = SHEET_PX / ANSWER_PX;
        const m = [mix(src.a * sx, 1, skew), mix(src.b * sx, 0, skew), mix(src.c * sy, 0, skew), mix(src.d * sy, 1, skew)];
        const blur = headBlur * (1 - now.drop);
        const onPaper = now.y > ANSWER.y + 8; // ink the moment it is over the plane, whatever the beat
        return (
          <div
            key={word}
            style={{
              position: "absolute",
              left: now.x,
              top: now.y,
              transform: `translate(-50%, -50%) matrix(${m.map((n) => n.toFixed(4)).join(",")},0,0)`,
              fontFamily: FONT.sans,
              fontWeight: 400,
              fontSize: ANSWER_PX,
              lineHeight: SHEET_LEAD,
              letterSpacing: `${(SHEET_TRACK * (1 - skew)).toFixed(4)}em`,
              color: onPaper ? COLOR.ink : COLOR.onMarine,
              whiteSpace: "nowrap",
              opacity: h,
              filter: blur > 0.12 ? `blur(${blur.toFixed(2)}px)` : undefined,
            }}
          >
            {word}
          </div>
        );
      })}

      {/* the trails: a capped arc behind each word's head, retracting into it once it has landed */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {words.map((word, i) => {
          const cap = TRAIL_MAX * (1 - clamp01((frame - LANDF[i]) / TRAIL_OUT));
          // the wake belongs to the run, not to the exit: a trail up the plate would read as a leader line
          const from = SPAWN[i] + HAND + DROP;
          const steps = Math.min(48, Math.floor((frame - from) / 0.4));
          if (steps < 2 || cap <= 4) return null;
          const pts = [wordAt(i, frame)];
          let len = 0;
          for (let k = 1; k <= steps && len < cap; k++) {
            const q = wordAt(i, frame - k * 0.4);
            const prev = pts[pts.length - 1];
            len += Math.hypot(q.x - prev.x, q.y - prev.y);
            pts.push(q);
          }
          if (pts.length < 2) return null;
          return (
            <g key={word}>
              {pts.slice(0, -1).map((p, k) => (
                <path key={k} d={`M ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${pts[k + 1].x.toFixed(1)} ${pts[k + 1].y.toFixed(1)}`} fill="none" stroke={COLOR.mint} strokeWidth={2 - 1.4 * (k / (pts.length - 1))} strokeLinecap="round" opacity={0.45 * (1 - k / (pts.length - 1))} />
              ))}
            </g>
          );
        })}
      </svg>

      {/* the rule, plainly, stacked under the answer */}
      <div style={{ position: "absolute", left: ANSWER.x, bottom: 132, opacity: line1 * 0.85, fontFamily: FONT.sans, fontSize: 28, color: COLOR.onMarine, letterSpacing: "-0.01em" }}>Already in what Joe approved, so Uptick answered.</div>
      <div style={{ position: "absolute", left: ANSWER.x, bottom: 90, opacity: line2 * 0.55, fontFamily: FONT.sans, fontSize: 24, color: COLOR.onMarine, letterSpacing: "-0.01em" }}>Anything else goes to Joe.</div>
      <span style={{ display: "none" }}>
        <Mono>{PLAN.title}</Mono>
      </span>
    </Frame>
  );
};

/** The film's Hero 4: the café stranger's question, read from the Offer thread. */
export const Hero4Offer = () => <Hero4 thread="offer" historyAt={-14} />;
