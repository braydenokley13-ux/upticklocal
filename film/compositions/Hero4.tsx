import { useCurrentFrame } from "remotion";
import { BUSINESS, CONVERSE, MESSAGE, PLAN } from "../data/joes";
import { IN, OUT, PLANE, ramp, sec } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_H, PLAN_PAD, PLAN_ROWS, PLAN_W } from "../primitives/GrowthPlan";
import { Mono, Voice } from "../primitives/Type";
import { COLOR, FONT } from "../tokens";
import { useTextWidths } from "../typography/measure";

/**
 * HERO 4 · DOES DIESEL COUNT? → PROVENANCE → ANSWER
 *
 * A normal thread. A question. 900 ms of nothing. Then the approved plan
 * rises into the depth behind the conversation and one of its rows — Fuel ·
 * Regular · Premium · Diesel — lifts off the sheet, travels forward, and its
 * words become the answer. The viewer sees where the answer came from.
 * No diagram, no score, no sparkle.
 */
const COL_X = 480;
const COL_W = 860;
const ANSWER_FONT = `400 34px 'Geist Film'`;

const T = {
  history: 0,
  typing: 18,
  question: 36,
  silence: [50, 72] as const, // 900 ms of nothing
  sheet: 72,
  lift: 88,
  arrive: 122,
  answer: 128,
  provenance: 140,
  sink: 132,
  principle: 186,
  end: 240,
};

export const Hero4 = () => {
  const frame = useCurrentFrame();
  const fuelPhrase = `${CONVERSE.answerParts.values[0]}, ${CONVERSE.answerParts.values[1]}, ${CONVERSE.answerParts.values[2]}`;
  const widths = useTextWidths([CONVERSE.answerParts.lead, fuelPhrase, PLAN.fuel.line], ANSWER_FONT);
  if (!widths) return <Frame bg={COLOR.marine} />;
  const [leadW] = widths;

  // --- the thread ---------------------------------------------------------
  const historyIn = ramp(frame, T.history, 14, OUT);
  const typing = ramp(frame, T.typing, 6, OUT) * (1 - ramp(frame, T.question - 2, 4, IN));
  const questionIn = ramp(frame, T.question, 12, PLANE);
  const inSilence = frame >= T.silence[0] && frame < T.silence[1];

  // --- the sheet rises into depth -------------------------------------------
  const sheetUp = ramp(frame, T.sheet, 16, PLANE);
  const sheetSink = ramp(frame, T.sink, 26, PLANE);
  const sheetOpacity = 0.42 * sheetUp * (1 - 0.8 * sheetSink);
  const sheetZ = -1000 + 250 * sheetUp - 300 * sheetSink;
  const sheetRot = -18;
  const planX = 1180;
  const planY = 150;

  // --- the row lifts, travels, arrives ---------------------------------------
  const lift = ramp(frame, T.lift, T.arrive - T.lift, PLANE);
  const answerY = 700;
  const answerX = COL_X + 36; // bubble padding
  // where the row must land: right after "Yes — " on the answer's first line
  const targetX = answerX + leadW;
  const targetY = answerY + 26;
  const sheetOriginX = planX + PLAN_PAD;
  const rowLeft = planX + PLAN_PAD;
  const rowTop = planY + PLAN_ROWS.fuel + 28; // the value line inside the row (label 13px + 10px gap)
  const tx = (targetX - rowLeft) * lift;
  const ty = (targetY - rowTop) * lift;
  const z = sheetZ * (1 - lift);
  const rot = sheetRot * (1 - lift);
  const rowScale = 1;
  const swap = ramp(frame, T.arrive - 4, 8, PLANE); // Regular · Premium · Diesel → regular, premium, and diesel
  const answerIn = ramp(frame, T.answer, 12, OUT);
  const tail = ramp(frame, T.answer + 8, 10, OUT);
  const provenance = ramp(frame, T.provenance, 10, OUT);
  const principle = ramp(frame, T.principle, 16, OUT);
  // the provenance hairline: from the row's place on the sheet to the answer
  const line = lift > 0.02 ? Math.min(1, lift * 1.4) : 0;
  const lineFade = 1 - ramp(frame, T.arrive + 6, 18, IN);

  return (
    <Frame bg={COLOR.marine}>
      {/* the world, far behind: a warm residue low in the frame */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 120%, rgba(226,162,79,0.10) 0%, rgba(226,162,79,0) 55%)` }} />

      {/* the sheet in depth */}
      <div style={{ position: "absolute", inset: 0, perspective: 1500, perspectiveOrigin: "50% 42%" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: PLAN_W, height: PLAN_H, transform: `translate3d(${planX}px, ${planY}px, ${sheetZ}px) rotateY(${sheetRot}deg)`, transformOrigin: `${PLAN_W / 2}px ${PLAN_H / 2}px`, opacity: sheetOpacity }}>
          <GrowthPlanCard x={0} y={0} dark reveal={{ approve: 0 }} fuelStyle={{ opacity: 1 - Math.min(1, lift * 3) }} />
          <div style={{ position: "absolute", left: PLAN_PAD, top: PLAN_ROWS.approve + 10 }}>
            <Mono color={COLOR.mint} size={13}>
              Approved · {PLAN.approvedAt}
            </Mono>
          </div>
        </div>

        {/* the lifted row: a ghost of the sheet carrying only the fuel line */}
        {lift > 0 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: PLAN_W, height: PLAN_H, transform: `translate3d(${planX + tx}px, ${planY + ty}px, ${z}px) rotateY(${rot}deg) scale(${rowScale})`, transformOrigin: `${PLAN_W / 2}px ${PLAN_H / 2}px` }}>
            <div style={{ position: "absolute", left: PLAN_PAD, top: PLAN_ROWS.fuel, whiteSpace: "nowrap" }}>
              <Mono color={COLOR.mint} size={13} style={{ marginBottom: 10, opacity: 1 - swap }}>
                Qualifies
              </Mono>
              <div style={{ position: "relative", height: 40 }}>
                <div style={{ position: "absolute", left: 0, top: 0, fontFamily: FONT.sans, fontWeight: 400, fontSize: 30 + 4 * lift, letterSpacing: "-0.02em", color: COLOR.onMarine, opacity: 1 - swap }}>
                  <span style={{ color: COLOR.mint }}>Fuel</span> · {PLAN.fuel.line}
                </div>
                <div style={{ position: "absolute", left: 0, top: 0, fontFamily: FONT.sans, fontWeight: 400, fontSize: 34, letterSpacing: "-0.02em", color: COLOR.ink, opacity: swap }}>
                  {fuelPhrase}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* the place the row left: a mint hairline stays on the sheet where the fact was */}
      {line > 0 && lineFade > 0 && (
        <div style={{ position: "absolute", left: sheetOriginX + 140, top: planY + PLAN_ROWS.fuel + 58, width: 260 * line, height: 1.5, background: COLOR.mint, opacity: 0.5 * lineFade }} />
      )}

      {/* thread header */}
      <div style={{ position: "absolute", left: 96, top: 84, opacity: historyIn }}>
        <Mono color={COLOR.onMarineFaint}>{BUSINESS.name} · Messages</Mono>
      </div>
      <div style={{ position: "absolute", right: 96, top: 84, opacity: historyIn }}>
        <Mono color={COLOR.onMarineFaint}>{CONVERSE.askedAt}</Mono>
      </div>

      {/* Joe's message, earlier */}
      <div style={{ position: "absolute", left: COL_X, top: 250, width: COL_W - 160, opacity: historyIn, transform: `translateY(${(1 - historyIn) * 10}px)` }}>
        <div style={{ background: "rgba(243,240,233,0.94)", color: COLOR.ink, borderRadius: "22px 22px 22px 6px", padding: "26px 34px", display: "inline-block" }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{MESSAGE.text.body}</div>
          <Mono color={COLOR.inkFaint} size={14} style={{ marginTop: 14 }}>
            {MESSAGE.text.detail}
          </Mono>
        </div>
      </div>

      {/* typing, then the question */}
      <div style={{ position: "absolute", left: COL_X + COL_W - 110, top: 470, display: "flex", gap: 10, opacity: typing }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: 5, background: COLOR.onMarineSoft, opacity: 0.4 + 0.6 * (Math.sin((frame - T.typing) * 0.6 + i) * 0.5 + 0.5) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: COL_X + 200, top: 440, width: COL_W - 200, opacity: questionIn, transform: `translateX(${(1 - questionIn) * 60}px)` }}>
        <div style={{ background: "rgba(241,237,229,0.09)", borderRadius: "22px 22px 6px 22px", padding: "24px 36px", marginLeft: "auto", display: "inline-block", float: "right" }}>
          <Voice size={52}>{CONVERSE.question}</Voice>
        </div>
      </div>

      {/* the answer */}
      <div style={{ position: "absolute", left: COL_X, top: answerY - 24, width: COL_W - 40, opacity: answerIn }}>
        <div style={{ background: "rgba(243,240,233,0.94)", borderRadius: "22px 22px 22px 6px", padding: "26px 36px 26px", minHeight: 120, display: "inline-block" }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3, color: COLOR.ink, whiteSpace: "nowrap" }}>
            <span style={{ opacity: answerIn }}>{CONVERSE.answerParts.lead}</span>
            {/* the fuel words are the lifted row, sitting exactly here; this copy takes over once it has landed */}
            <span style={{ opacity: lift >= 1 && frame >= T.arrive + 10 ? 1 : 0 }}>{fuelPhrase}</span>
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3, color: COLOR.ink, opacity: tail }}>{CONVERSE.answerParts.tail.trim()}</div>
        </div>
        <div style={{ marginTop: 14, marginLeft: 6, opacity: provenance, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 18, height: 1.5, background: COLOR.mint, display: "inline-block" }} />
          <Mono color={COLOR.mint} size={13}>
            {CONVERSE.provenance}
          </Mono>
        </div>
      </div>

      {/* silence, marked only by time */}
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: inSilence ? 0.6 : 0 }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          {CONVERSE.askedAt}
        </Mono>
      </div>
      {/* the rule, small, once the answer has been read */}
      <div style={{ position: "absolute", left: 96, bottom: 84, opacity: principle * 0.8 }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          Automatic when grounded · Human when uncertain
        </Mono>
      </div>
      <div style={{ position: "absolute", right: 96, bottom: 84, opacity: principle * 0.8, textAlign: "right" }}>
        <Mono color={COLOR.onMarineFaint} size={14}>
          {CONVERSE.escalation}
        </Mono>
      </div>
    </Frame>
  );
};

export const HERO4_SECONDS = T.end / 24;
export const hero4Sec = sec;
