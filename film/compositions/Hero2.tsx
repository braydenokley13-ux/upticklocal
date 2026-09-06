import { useCurrentFrame } from "remotion";
import { BUSINESS, ECONOMICS, GAP, INTENT, RELATIONSHIPS } from "../data/joes";
import { IN, OUT, PLANE, ramp, typed } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_LINES, PLAN_ROWS } from "../primitives/GrowthPlan";
import { Mono } from "../primitives/Type";
import { COLOR, FONT } from "../tokens";
import { useTextWidths } from "../typography/measure";

/**
 * HERO 2 · FRIDAY MORNINGS ARE SLOW → UNDERSTANDING → PLAN
 *
 * The sentence is the interface. Then the words become the instruments:
 * Friday's own baseline carries six Fridays; mornings sits on a linear day
 * line, exactly on 07:00–10:00; slow is what falls onto that line — three
 * amber visits inside the interval, a flood after it. The knowledge the
 * sentence needs is annotated onto the reading, then reorganises into one
 * plan set bare on the page. Nothing new appears.
 */
const LEFT = 96;
const RIGHT = 1824;
const WORD_PX = 96;
const WORD_FONT = `200 ${WORD_PX}px 'Geist Film'`;
const L1 = 320; // Friday's baseline
const L2 = 560; // the day line: mornings' baseline
const L3 = 800; // slow's baseline
const DAY0 = 6;
const DAY1 = 20;

const T = {
  caret: 12,
  type: 50,
  typed: 96,
  reset: 118,
  friday: 132,
  mornings: 190,
  slow: 248,
  context: 300,
  assemble: 344,
  plan: 372,
  end: 408,
};

// visits last Friday, in hours: three inside 07–10, the rest after 10:20
const VISITS = (() => {
  const v: number[] = [7.68, 8.92, 9.5];
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 46; i++) {
    const r = rand();
    const h = r < 0.42 ? 10.35 + rand() * 3.2 : r < 0.78 ? 15.3 + rand() * 3.4 : 13.6 + rand() * 1.8;
    v.push(h);
  }
  return v.sort((a, b) => a - b);
})();

const hx = (h: number) => LEFT + ((h - DAY0) / (DAY1 - DAY0)) * (RIGHT - LEFT);

export const Hero2 = () => {
  const frame = useCurrentFrame();
  const words = [...INTENT.words];
  const widths = useTextWidths([...words, " "], WORD_FONT);
  if (!widths) return <Frame />;
  const space = widths[4];
  const sentence = INTENT.sentence;

  // --- typed --------------------------------------------------------------
  const pauses: Record<number, number> = { 6: 6, 15: 5 };
  const chars = typed(frame, T.type, sentence.length, 1.7, pauses);
  const done = chars >= sentence.length;
  const caretOn = frame < T.type ? Math.floor((frame - T.caret) / 11) % 2 === 0 : frame < T.reset;
  const caretMint = done ? ramp(frame, T.typed, 5, OUT) : 0;
  const origins: number[] = [];
  let cx = LEFT;
  words.forEach((w, i) => {
    origins.push(cx);
    cx += widths[i] + space;
  });
  const typedX = LEFT + measureTyped(sentence, chars, words, widths, space);

  // --- re-set: the sentence sits on the day line; Friday rises, slow drops, are goes ----------
  const mF = ramp(frame, T.reset, 18, PLANE);
  const mS = ramp(frame, T.reset + 10, 18, PLANE);
  const mM = ramp(frame, T.reset + 10, 18, PLANE);
  const areOut = 1 - ramp(frame, T.reset + 4, 12, IN);
  const yF = L2 + (L1 - L2) * mF;
  const yS = L2 + (L3 - L2) * mS;
  // mornings slides so it begins at 07:00 on the line; its tracking opens until it ends at 10:00
  const morningsX0 = origins[1];
  const morningsX = morningsX0 + (hx(7) + 10 - morningsX0) * mM;
  const track = ramp(frame, T.mornings + 6, 22, PLANE);
  const morningsW = widths[1];
  const targetW = hx(10) - hx(7) - 20;
  const extra = Math.max(0, (targetW - morningsW) / (words[1].length - 1)) * track;
  // slow slides under the interval once the visits have landed
  const slowX = origins[3] + (hx(7) - origins[3]) * ramp(frame, T.slow + 30, 22, PLANE);

  // --- Friday: six Fridays on the word's own baseline ------------------------
  const fridayTrack = ramp(frame, T.friday, 26, PLANE);
  const fridayEnd = LEFT + widths[0] + 60;
  const weekW = (RIGHT - fridayEnd) / 6;

  // --- mornings: the day line, hours, the interval -----------------------------
  const dayDraw = ramp(frame, T.mornings, 26, PLANE);
  const uprights = ramp(frame, T.mornings + 22, 12, OUT);
  const intervalLabel = ramp(frame, T.mornings + 34, 10, OUT);

  // --- slow: visits fall onto the day line ------------------------------------
  const fallStart = T.slow;

  // --- context: annotations on the reading --------------------------------------
  const ann = (i: number) => ramp(frame, T.context + i * 7, 14, OUT);
  const readingOut = 1 - ramp(frame, T.assemble, 22, IN);
  const wordsOut = 1 - ramp(frame, T.assemble + 6, 22, IN);
  const annOut = 1 - ramp(frame, T.assemble + 2, 16, IN);

  // --- assemble: the plan, bare on the page ---------------------------------------
  const planX = LEFT;
  const planY = 150;
  const rowsIn = (k: number) => ramp(frame, T.assemble + 16 + k * 6, 16, OUT);
  const titleIn = ramp(frame, T.plan, 16, OUT);
  const approveIn = ramp(frame, T.plan + 12, 14, OUT);
  const rule = ramp(frame, T.plan - 6, 14, PLANE);
  const travel = ramp(frame, T.assemble + 4, 32, PLANE);
  const resolve = ramp(frame, T.assemble + 26, 12, PLANE);

  const annotations = [
    { i: 0, x: fridayEnd, y: L1 + 34, lead: `${RELATIONSHIPS.permissioned}`, text: "people said yes to hearing from Joe's" },
    { i: 1, x: hx(10) + 40, y: L2 - 118, lead: `${RELATIONSHIPS.signals.morningResponders}`, text: "tend to respond in the morning" },
    { i: 2, x: hx(13), y: L3 - 60, lead: ECONOMICS.coffeeCostLabel, text: "what a large coffee costs Joe" },
    { i: 3, x: hx(13), y: L3 + 40, lead: ECONOMICS.fuelRule, text: ECONOMICS.fuelRuleTag },
    { i: 4, x: fridayEnd, y: L1 - 100, lead: "Text, the pump, the counter", text: "and two nearby screens" },
  ];

  return (
    <Frame>
      {/* the persistent frame */}
      <div style={{ position: "absolute", left: LEFT, top: 84, opacity: ramp(frame, 0, 12, OUT) }}>
        <Mono color={COLOR.inkFaint}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
      </div>
      <div style={{ position: "absolute", right: LEFT, top: 84, opacity: ramp(frame, 0, 12, OUT), textAlign: "right" }}>
        <Mono color={COLOR.inkFaint}>{frame < T.plan ? INTENT.said : "Thursday · 6:46 PM"}</Mono>
      </div>
      <div style={{ position: "absolute", left: LEFT, bottom: 84, opacity: ramp(frame, 0, 12, OUT) }}>
        <Mono color={COLOR.inkFaint} size={14}>
          {frame < T.reset ? "Said in the owner's own words" : frame < T.assemble ? "Reading" : "One plan"}
        </Mono>
      </div>

      {/* the sentence, typed on the day line */}
      {frame < T.reset ? (
        <div style={{ position: "absolute", left: LEFT, top: L2 - WORD_PX * 0.86, ...wordStyle }}>{sentence.slice(0, chars)}</div>
      ) : (
        <>
          <Word text={words[0]} x={LEFT + (origins[0] - LEFT) * (1 - mF)} y={yF} opacity={wordsOut} />
          <Word text={words[1]} x={morningsX} y={L2} opacity={wordsOut} spacing={extra} />
          <Word text={words[2]} x={origins[2]} y={L2} opacity={areOut} />
          <Word text={words[3]} x={slowX} y={yS} opacity={wordsOut} />
        </>
      )}
      {caretOn && frame < T.reset && <div style={{ position: "absolute", left: typedX + 4, top: L2 - WORD_PX * 0.78, width: 3, height: WORD_PX * 0.86, background: caretMint > 0 ? COLOR.mintDeep : COLOR.ink }} />}

      {/* FRIDAY · six Fridays, on the word's baseline */}
      {frame >= T.friday && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: readingOut }}>
          <div style={{ position: "absolute", left: fridayEnd, top: L1, width: (RIGHT - fridayEnd) * fridayTrack, height: 1, background: COLOR.inkHair }} />
          {Array.from({ length: 6 }).map((_, w) => {
            const t = (w + 1) / 6;
            const on = Math.min(1, Math.max(0, (fridayTrack * 1.08 - t) * 8));
            const x = fridayEnd + weekW * (w + 1) - 12;
            return (
              <div key={w}>
                {Array.from({ length: 6 }).map((_, d) => (
                  <div key={d} style={{ position: "absolute", left: fridayEnd + weekW * w + (weekW / 7) * (d + 1), top: L1 - 10, width: 1, height: 10, background: COLOR.inkHair, opacity: Math.min(1, Math.max(0, (fridayTrack * 1.08 - (w + (d + 1) / 7) / 6) * 8)) }} />
                ))}
                <div style={{ position: "absolute", left: x, top: L1 - 34 * on, width: 3, height: 34 * on, background: COLOR.mintDeep }} />
                <div style={{ position: "absolute", left: x - 3, top: L1 - 34 * on - 12, width: 9, height: 9, borderRadius: 5, background: COLOR.mintDeep, opacity: on }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: RIGHT - 190, top: L1 + 16, opacity: ramp(frame, T.friday + 30, 10, OUT), textAlign: "right", width: 190 }}>
            <Mono color={COLOR.inkFaint} size={13}>
              every Friday · six weeks
            </Mono>
          </div>
        </div>
      )}

      {/* MORNINGS · the day line, and the interval the word sits on */}
      {frame >= T.mornings && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: readingOut }}>
          <div style={{ position: "absolute", left: LEFT, top: L2, width: (RIGHT - LEFT) * dayDraw, height: 1.5, background: "rgba(23,32,31,0.32)" }} />
          {[6, 8, 10, 12, 14, 16, 18, 20].map((h) => {
            const t = (h - DAY0) / (DAY1 - DAY0);
            const o = Math.min(1, Math.max(0, (dayDraw * 1.04 - t) * 10));
            return (
              <div key={h} style={{ position: "absolute", left: hx(h), top: L2, opacity: o }}>
                <div style={{ width: 1, height: 12, background: COLOR.inkFaint }} />
                <Mono color={COLOR.inkFaint} size={14} style={{ position: "absolute", left: -22, top: 22 }}>
                  {String(h).padStart(2, "0")}:00
                </Mono>
              </div>
            );
          })}
          {[7, 10].map((h) => (
            <div key={h} style={{ position: "absolute", left: hx(h) - 1.5, top: L2 - 34 * uprights, width: 3, height: 34 * uprights, background: COLOR.mintDeep }} />
          ))}
          <div style={{ position: "absolute", left: hx(7), top: L2 - 150, opacity: intervalLabel }}>
            <Mono color={COLOR.mintDeep} size={15}>
              07:00 – 10:00
            </Mono>
          </div>
        </div>
      )}

      {/* SLOW · visits fall onto the day line; three inside the interval */}
      {frame >= T.slow && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: readingOut }}>
          {VISITS.map((h, i) => {
            const start = fallStart + (i < 3 ? i * 10 : 36 + (i - 3) * 1.1);
            const f = ramp(frame, start, 12, IN);
            if (f <= 0) return null;
            const x = hx(h);
            const stack = VISITS.slice(0, i).filter((v) => Math.abs(hx(v) - x) < 6).length;
            const landY = L2 - 2 - stack * 22 - 22;
            const y = landY - (1 - f) * 240;
            const inGap = h >= 7 && h <= 10;
            return <div key={i} style={{ position: "absolute", left: x - 1.5, top: y, width: 3, height: 22, borderRadius: 1.5, background: COLOR.amber, opacity: 0.4 + 0.6 * f, boxShadow: inGap ? `0 0 14px rgba(226,162,79,0.55)` : undefined }} />;
          })}
          <div style={{ position: "absolute", left: hx(7), top: L3 + 30, opacity: ramp(frame, T.slow + 56, 12, OUT) }}>
            <Mono color={COLOR.amberDeep} size={14}>
              {GAP.visits} visits · last Friday · the gap
            </Mono>
          </div>
        </div>
      )}

      {/* CONTEXT · annotations on the reading */}
      {frame >= T.context && frame < T.plan && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: annOut }}>
          {annotations.map((a) => {
            const v = ann(a.i);
            const travels = a.i === 2 || a.i === 3;
            return (
              <div key={a.i} style={{ position: "absolute", left: a.x, top: a.y - (1 - v) * 10, opacity: v * (travels ? 1 - travel : 1), display: "flex", alignItems: "baseline", gap: 12, whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: 30, letterSpacing: "-0.02em", color: COLOR.ink }}>{a.lead}</span>
                <span style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: 22, color: COLOR.inkSoft }}>{a.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ASSEMBLE · one plan, bare on the page */}
      {frame >= T.assemble && (
        <>
          <div style={{ position: "absolute", left: planX, top: planY - 34, width: 56 * rule, height: 2, background: COLOR.mintDeep }} />
          <GrowthPlanCard x={planX} y={planY} bare reveal={{ title: titleIn, window: rowsIn(0) * travel, offer: rowsIn(1), fuel: rowsIn(2), audience: rowsIn(3), limit: rowsIn(4) * resolve, approve: approveIn }} />
          <Traveller t={travel} from={{ x: hx(7) + 12, y: L2 - 150, size: 15, mono: true, color: COLOR.mintDeep }} to={{ x: planX, y: planY + PLAN_ROWS.window + 24, size: 34, mono: false, color: COLOR.ink }} textFrom="07:00 – 10:00" textTo={PLAN_LINES.window} />
          <Traveller t={travel} from={{ x: annotations[2].x, y: annotations[2].y, size: 30, mono: false, color: COLOR.ink }} to={{ x: planX, y: planY + PLAN_ROWS.limit + 24, size: 34, mono: false, color: COLOR.ink }} textFrom={ECONOMICS.coffeeCostLabel} textTo={resolve < 0.5 ? `${ECONOMICS.coffeeCostLabel} × ${ECONOMICS.limit}` : PLAN_LINES.limit} fade={resolve} />
          <Traveller t={travel} from={{ x: annotations[3].x, y: annotations[3].y, size: 30, mono: false, color: COLOR.ink }} to={{ x: planX + 200, y: planY + PLAN_ROWS.approve + 24, size: 12, mono: true, color: COLOR.inkFaint }} textFrom={ECONOMICS.fuelRule} textTo={`${ECONOMICS.fuelRule} ${ECONOMICS.fuelRuleTag}`} fade={approveIn} />
        </>
      )}
    </Frame>
  );
};

const wordStyle: React.CSSProperties = { fontFamily: FONT.sans, fontWeight: 200, fontSize: WORD_PX, letterSpacing: "-0.02em", lineHeight: 1, color: COLOR.ink, whiteSpace: "pre" };

function Word({ text, x, y, opacity = 1, spacing = 0 }: { text: string; x: number; y: number; opacity?: number; spacing?: number }) {
  // y is the baseline; the box top sits 0.86 em above it for this face
  return (
    <div style={{ position: "absolute", left: x, top: y - WORD_PX * 0.86, ...wordStyle, opacity, letterSpacing: spacing > 0 ? `${spacing - 1.9}px` : "-0.02em" }}>
      {text}
    </div>
  );
}

type Anchor = { x: number; y: number; size: number; mono: boolean; color: string };

/** A fact that leaves its place and arrives in the plan, re-set on the way. */
function Traveller({ t, from, to, textFrom, textTo, fade = 1 }: { t: number; from: Anchor; to: Anchor; textFrom: string; textTo: string; fade?: number }) {
  if (t <= 0) return null;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const size = from.size + (to.size - from.size) * t;
  const mono = t > 0.5 ? to.mono : from.mono;
  const color = t > 0.5 ? to.color : from.color;
  const text = t > 0.5 ? textTo : textFrom;
  const arrived = t >= 0.999 ? 1 - fade : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: arrived, whiteSpace: "nowrap", fontFamily: mono ? FONT.mono : FONT.sans, fontSize: size, fontWeight: mono ? 500 : 300, letterSpacing: mono ? "0.16em" : "-0.02em", textTransform: mono ? "uppercase" : undefined, color, lineHeight: 1.15 }}>
      {text}
    </div>
  );
}

/** Width of the typed prefix, from per-word widths. */
function measureTyped(sentence: string, chars: number, words: string[], widths: number[], space: number) {
  let x = 0;
  let consumed = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (chars >= consumed + w.length) {
      x += widths[i];
      consumed += w.length;
      if (chars > consumed) {
        x += space;
        consumed += 1;
      }
    } else {
      const part = chars - consumed;
      x += (widths[i] * part) / w.length;
      return x;
    }
  }
  return x;
}

export const HERO2_TIMELINE = T;
