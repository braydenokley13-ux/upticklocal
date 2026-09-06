import { interpolate, useCurrentFrame } from "remotion";
import { BUSINESS, ECONOMICS, GAP, INTENT, RELATIONSHIPS } from "../data/joes";
import { IN, OUT, PLANE, ramp, sec, typed } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_LINES, PLAN_PAD, PLAN_ROWS, PLAN_W } from "../primitives/GrowthPlan";
import { Mono } from "../primitives/Type";
import { COLOR, FONT } from "../tokens";
import { useTextWidths } from "../typography/measure";

/**
 * HERO 2 · FRIDAY MORNINGS ARE SLOW → UNDERSTANDING → PLAN
 *
 * The sentence is the interface. Then meaning becomes space: Friday becomes
 * a rhythm of weeks, mornings stretches into a physical interval, slow
 * becomes the absence inside it. Only the knowledge this sentence needs comes
 * forward, and it reorganises into one plan. Nothing new appears.
 */
const WORD_SIZE = 96;
const WORD_FONT = `300 ${WORD_SIZE}px 'Geist Film'`;
const LEFT = 96;
const SENTENCE_Y = 470;
const ROWS = { Friday: 300, mornings: 500, slow: 700 } as const;
const RULER_X0 = 600;
const RULER_X1 = 1800;
const WEEK_Y = 330;
const RULER_Y = 605;

// --- timeline (frames) ------------------------------------------------------
const T = {
  caretIn: 12,
  typeStart: 54,
  typeDone: 118,
  interpret: 140,
  context: 282,
  assemble: 332,
  planLand: 372,
  end: 408,
};

// visits last Friday, in hours: three inside 07–10, the rest after
const VISITS = (() => {
  const v: number[] = [7.68, 8.92, 9.5];
  let s = 11;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < 52; i++) {
    const r = rand();
    // two soft peaks: lunch and late afternoon; nothing before 10:20
    const h = r < 0.45 ? 10.4 + rand() * 3.4 : r < 0.8 ? 15.2 + rand() * 3.6 : 13.8 + rand() * 1.6;
    v.push(Math.round(h * 4) / 4);
  }
  return v.sort((a, b) => a - b);
})();

export const Hero2 = () => {
  const frame = useCurrentFrame();
  const words = [...INTENT.words];
  const widths = useTextWidths([...words, " "], WORD_FONT);
  if (!widths) return <Frame />;
  const space = widths[4];

  // --- the sentence, typed ---------------------------------------------
  const sentence = INTENT.sentence;
  const pauses: Record<number, number> = { 6: 7, 15: 6 }; // after "Friday", after "mornings"
  const chars = typed(frame, T.typeStart, sentence.length, 2, pauses);
  const done = chars >= sentence.length;
  const caretBlink = frame < T.typeStart ? Math.floor((frame - T.caretIn) / 12) % 2 === 0 : true;
  const caretVisible = frame >= T.caretIn && frame < T.interpret + 8 && caretBlink;
  const firstMint = done ? ramp(frame, T.typeDone, 6, OUT) : 0;

  // word origins in the sentence
  const origins: number[] = [];
  let cx = LEFT;
  words.forEach((w, i) => {
    origins.push(cx);
    cx += widths[i] + space;
  });
  const typedX = LEFT + measureTyped(sentence, chars, words, widths, space);

  // --- interpret: words re-set --------------------------------------------
  const move = (i: number) => ramp(frame, T.interpret + i * 17, 20, PLANE);
  const mFriday = move(0);
  const mMornings = move(1);
  const mSlow = move(2);
  const areFade = 1 - 0.88 * move(1);
  const pos = (i: number, m: number, rowY: number) => ({ x: origins[i] + (LEFT - origins[i]) * m, y: SENTENCE_Y + (rowY - SENTENCE_Y) * m });
  const pFriday = pos(0, mFriday, ROWS.Friday);
  const pMornings = pos(1, mMornings, ROWS.mornings);
  const pSlow = pos(3, mSlow, ROWS.slow);
  const pAre = pos(2, 0, SENTENCE_Y);

  // the week rhythm: six weeks of seven days, drawn left to right; Fridays mint
  const weekDraw = ramp(frame, T.interpret + 12, 50, PLANE);
  // the day ruler and its bracket
  const rulerDraw = ramp(frame, T.interpret + 30, 34, PLANE);
  const bracket = ramp(frame, T.interpret + 62, 16, OUT);
  const stretch = ramp(frame, T.interpret + 80, 34, PLANE);
  // visits fall onto the ruler in time order
  const fallStart = T.interpret + 60;

  // the ruler's mapping from hours to x, with the 07–10 interval stretched
  const hx = (h: number) => hourToX(h, stretch);

  // --- context: five lines rise from the rows ------------------------------
  const ctxIn = (i: number) => ramp(frame, T.context + i * 9, 18, OUT);
  const ctxOut = 1 - ramp(frame, T.assemble + 4, 22, IN);
  const interpretDim = 1 - 0.92 * ramp(frame, T.context - 6, 16, PLANE);
  const interpretOut = interpretDim * (1 - ramp(frame, T.assemble, 26, IN));
  const wordsOut = 1 - ramp(frame, T.assemble + 8, 26, IN);
  const count = (n: number, t: number) => Math.round(n * Math.min(1, t * 1.15));

  // --- assemble: the plan --------------------------------------------------
  const PLAN_SCALE = 1.12;
  const planX = 960 - PLAN_W / 2;
  const planY = 170;
  const sheetIn = ramp(frame, T.assemble + 10, 30, PLANE);
  const rowsIn = (k: number) => ramp(frame, T.assemble + 22 + k * 6, 18, OUT);
  const titleIn = ramp(frame, T.planLand, 16, OUT);
  const approveIn = ramp(frame, T.planLand + 10, 16, OUT);
  // travelling facts: bracket → window row · $0.62 × 30 → limit row · fuel rule → the sheet's rule
  const travel = ramp(frame, T.assemble + 6, 40, PLANE);
  const resolve = ramp(frame, T.assemble + 30, 14, PLANE); // × 30 → $18.60
  const headerOut = 1 - ramp(frame, T.assemble, 20, IN);

  const CTX_X = 1130;
  const CTX_Y = [292, 388, 484, 580, 676];
  const ctx = [
    { n: RELATIONSHIPS.permissioned, text: `people said yes to hearing from Joe's.` },
    { n: RELATIONSHIPS.signals.morningResponders, text: RELATIONSHIPS.lines.morningResponders },
    { n: null, lead: ECONOMICS.coffeeCostLabel, text: ECONOMICS.coffeeLine },
    { n: null, lead: ECONOMICS.fuelRule, text: ECONOMICS.fuelRuleTag },
    { n: null, lead: "Text · pump & counter", text: `· ${RELATIONSHIPS.permissioned > 0 ? "2 nearby screens." : ""}` },
  ];

  return (
    <Frame>
      {/* header */}
      <div style={{ position: "absolute", left: LEFT, top: 84, opacity: ramp(frame, 0, 12, OUT) * headerOut }}>
        <Mono color={COLOR.inkFaint}>
          {BUSINESS.name} · {BUSINESS.address}
        </Mono>
      </div>
      <div style={{ position: "absolute", right: LEFT, top: 84, opacity: ramp(frame, 0, 12, OUT) * headerOut, textAlign: "right" }}>
        <Mono color={COLOR.inkFaint}>{INTENT.said}</Mono>
      </div>

      {/* the prompt */}
      <div style={{ position: "absolute", left: LEFT, top: SENTENCE_Y - 70, opacity: ramp(frame, 6, 12, OUT) * (1 - ramp(frame, T.interpret - 6, 10, IN)) }}>
        <Mono color={COLOR.inkFaint} size={18}>
          {INTENT.prompt}
        </Mono>
      </div>

      {/* the typed sentence, as separate words so they can be re-set */}
      {frame < T.interpret ? (
        <div style={{ position: "absolute", left: LEFT, top: SENTENCE_Y, fontFamily: FONT.sans, fontWeight: 300, fontSize: WORD_SIZE, letterSpacing: "-0.02em", lineHeight: 1, color: COLOR.ink, whiteSpace: "pre" }}>
          {sentence.slice(0, chars)}
        </div>
      ) : (
        <>
          <Word text={words[0]} x={pFriday.x} y={pFriday.y} opacity={wordsOut} />
          <Word text={words[1]} x={pMornings.x} y={pMornings.y} opacity={wordsOut} />
          <Word text={words[2]} x={pAre.x} y={pAre.y} opacity={areFade * interpretOut} />
          <Word text={words[3]} x={pSlow.x} y={pSlow.y} opacity={wordsOut} />
        </>
      )}
      {/* caret: blinks, types, turns mint on the last character */}
      {caretVisible && (
        <div style={{ position: "absolute", left: (frame < T.interpret ? typedX : LEFT) + 6, top: SENTENCE_Y + 6, width: 4, height: WORD_SIZE - 12, background: firstMint > 0 ? COLOR.mintDeep : COLOR.ink, opacity: frame < T.interpret ? 1 : 1 - ramp(frame, T.interpret, 8, IN) }} />
      )}

      {/* INTERPRET · Friday → the rhythm of weeks */}
      {frame >= T.interpret && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: interpretOut }}>
          {Array.from({ length: 42 }).map((_, i) => {
            const t = i / 41;
            const drawn = Math.min(1, Math.max(0, (weekDraw * 1.06 - t) * 14));
            const isFriday = i % 7 === 4;
            const x = RULER_X0 + t * (RULER_X1 - RULER_X0);
            const h = isFriday ? 60 : 26;
            const pulse = isFriday ? Math.min(1, Math.max(0, (weekDraw * 1.06 - t) * 5)) : 0;
            return (
              <div key={i}>
                <div style={{ position: "absolute", left: x, top: WEEK_Y - h / 2, width: isFriday ? 3 : 1.5, height: h, background: isFriday ? COLOR.mintDeep : "rgba(23,32,31,0.28)", opacity: drawn, transform: `scaleY(${drawn})`, transformOrigin: "50% 100%" }} />
                {isFriday && <div style={{ position: "absolute", left: x - 5, top: WEEK_Y - h / 2 - 16, width: 12, height: 12, borderRadius: 6, background: COLOR.mintDeep, opacity: pulse * 0.9, transform: `scale(${0.6 + 0.4 * pulse})` }} />}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: RULER_X0, top: WEEK_Y + 44, opacity: ramp(frame, T.interpret + 50, 12, OUT) }}>
            <Mono color={COLOR.inkFaint} size={14}>
              Every week · six weeks shown
            </Mono>
          </div>

          {/* INTERPRET · mornings → the interval */}
          <div style={{ position: "absolute", left: RULER_X0, top: RULER_Y, width: (RULER_X1 - RULER_X0) * rulerDraw, height: 2, background: "rgba(23,32,31,0.3)" }} />
          {[6, 8, 10, 12, 14, 16, 18, 20].map((h) => {
            const x = hx(h);
            const t = (h - 6) / 14;
            const o = Math.min(1, Math.max(0, (rulerDraw * 1.05 - t) * 12));
            return (
              <div key={h} style={{ position: "absolute", left: x, top: RULER_Y - 8, opacity: o }}>
                <div style={{ width: 1.5, height: 16, background: COLOR.inkFaint }} />
                <Mono color={COLOR.inkFaint} size={15} style={{ position: "absolute", left: -22, top: -34 }}>
                  {String(h).padStart(2, "0")}:00
                </Mono>
              </div>
            );
          })}
          {/* the bracket that closes on 07–10 and then stretches */}
          <div style={{ position: "absolute", left: hx(7), top: RULER_Y - 96, width: hx(10) - hx(7), height: 94, opacity: bracket }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 3, height: 94 * bracket, background: COLOR.mintDeep }} />
            <div style={{ position: "absolute", right: 0, top: 0, width: 3, height: 94 * bracket, background: COLOR.mintDeep }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: `${100 * bracket}%`, height: 3, background: COLOR.mintDeep }} />
            <div style={{ position: "absolute", left: 3, right: 3, top: 3, bottom: 0, background: `rgba(95,214,187,${0.07 * stretch})` }} />
            <Mono color={COLOR.mintDeep} size={18} style={{ position: "absolute", left: 18, top: 18, opacity: stretch }}>
              07:00–10:00
            </Mono>
          </div>

          {/* INTERPRET · slow → visits fall, and the interval stays empty */}
          {VISITS.map((h, i) => {
            const start = fallStart + i * 1.2;
            const f = ramp(frame, start, 12, IN);
            if (f <= 0) return null;
            const slot = Math.round(h * 4);
            const stack = VISITS.slice(0, i).filter((v) => Math.round(v * 4) === slot).length;
            const x = hx(h);
            const landY = RULER_Y + 18 + stack * 30;
            const y = landY - (1 - f) * 260;
            const inGap = h >= 7 && h <= 10;
            return <div key={i} style={{ position: "absolute", left: x - 2, top: y, width: 4, height: 26, borderRadius: 2, background: COLOR.amber, opacity: 0.35 + 0.65 * f, boxShadow: inGap ? `0 0 12px rgba(226,162,79,0.5)` : undefined }} />;
          })}
          <div style={{ position: "absolute", left: hx(7) + (hx(10) - hx(7)) / 2, top: RULER_Y + 80, transform: "translateX(-50%)", opacity: ramp(frame, T.interpret + 122, 14, OUT) * stretch, textAlign: "center" }}>
            <Mono color={COLOR.amberDeep} size={16}>
              {GAP.visits} visits · the gap
            </Mono>
          </div>
          <div style={{ position: "absolute", left: hx(15), top: RULER_Y + 130, transform: "translateX(-50%)", opacity: ramp(frame, T.interpret + 132, 14, OUT) }}>
            <Mono color={COLOR.inkFaint} size={13}>
              the rest of the day is fine
            </Mono>
          </div>
        </div>
      )}

      {/* CONTEXT · what matters here */}
      {frame >= T.context && frame < T.planLand + 4 && (
        <div style={{ position: "absolute", inset: 0, opacity: ctxOut }}>
          {ctx.map((c, i) => {
            const a = ctxIn(i);
            const y = CTX_Y[i] + (1 - a) * 22;
            // the two facts that travel into the plan fade here as their doubles fly
            const travels = i === 2 || i === 3;
            return (
              <div key={i} style={{ position: "absolute", left: CTX_X, top: y, opacity: a * (travels ? 1 - travel : 1), display: "flex", alignItems: "baseline", gap: 14, whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: FONT.sans, fontWeight: 400, fontSize: 40, letterSpacing: "-0.02em", color: COLOR.ink, fontVariantNumeric: "tabular-nums" }}>{c.n !== null ? count(c.n, a) : c.lead}</span>
                <span style={{ fontFamily: FONT.sans, fontWeight: 400, fontSize: 24, color: COLOR.inkSoft }}>{c.text}</span>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: CTX_X, top: 236, opacity: ctxIn(0) }}>
            <Mono color={COLOR.inkFaint} size={14}>
              What matters here
            </Mono>
          </div>
        </div>
      )}

      {/* ASSEMBLE · one plan */}
      {frame >= T.assemble && (
        <>
          <GrowthPlanCard
            x={planX}
            scale={PLAN_SCALE}
            y={planY + (1 - sheetIn) * 40}
            reveal={{ sheet: sheetIn, title: titleIn, window: rowsIn(0) * travel, offer: rowsIn(1), fuel: rowsIn(2), audience: rowsIn(3), limit: rowsIn(4) * resolve, approve: approveIn }}
            hideFuel={false}
          />
          {/* the bracket becomes the window line */}
          <Traveller
            t={travel}
            from={{ x: hx(7), y: RULER_Y - 46, size: 16, mono: true, color: COLOR.mintDeep }}
            to={{ x: 960 + (-PLAN_W / 2 + PLAN_PAD) * PLAN_SCALE, y: planY + (PLAN_ROWS.window + 32) * PLAN_SCALE, size: 36 * PLAN_SCALE, mono: false, color: COLOR.ink }}
            textFrom="07:00–10:00"
            textTo={PLAN_LINES.window}
          />
          {/* $0.62 × 30 → $18.60 */}
          <Traveller
            t={travel}
            from={{ x: CTX_X, y: CTX_Y[2], size: 40, mono: false, color: COLOR.ink }}
            to={{ x: 960 + (-PLAN_W / 2 + PLAN_PAD) * PLAN_SCALE, y: planY + (PLAN_ROWS.limit + 30) * PLAN_SCALE, size: 30 * PLAN_SCALE, mono: false, color: COLOR.ink }}
            textFrom={ECONOMICS.coffeeCostLabel}
            textTo={resolve < 0.5 ? `${ECONOMICS.coffeeCostLabel} × ${ECONOMICS.limit}` : `${PLAN_LINES.limit}`}
            fade={resolve}
          />
          {/* the fuel rule travels to the sheet's foot */}
          <Traveller
            t={travel}
            from={{ x: CTX_X, y: CTX_Y[3], size: 40, mono: false, color: COLOR.ink }}
            to={{ x: 960 + (PLAN_W / 2 - PLAN_PAD - 330) * PLAN_SCALE, y: planY + (PLAN_ROWS.approve + 24) * PLAN_SCALE, size: 13 * PLAN_SCALE, mono: true, color: COLOR.inkFaint }}
            textFrom={ECONOMICS.fuelRule}
            textTo={`${ECONOMICS.fuelRule} ${ECONOMICS.fuelRuleTag}`}
            fade={approveIn}
          />
        </>
      )}
      <div style={{ position: "absolute", left: LEFT, bottom: 84, opacity: ramp(frame, T.planLand + 14, 14, OUT) }}>
        <Mono color={COLOR.inkFaint} size={14}>
          One plan · every channel Joe has · nothing he doesn't
        </Mono>
      </div>
      <div style={{ position: "absolute", right: LEFT, bottom: 84, opacity: ramp(frame, T.planLand + 14, 14, OUT) }}>
        <Mono color={COLOR.inkFaint} size={14}>
          Thursday · 6:46 PM
        </Mono>
      </div>
    </Frame>
  );
};

function Word({ text, x, y, opacity = 1 }: { text: string; x: number; y: number; opacity?: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: FONT.sans, fontWeight: 300, fontSize: WORD_SIZE, letterSpacing: "-0.02em", lineHeight: 1, color: COLOR.ink, opacity, whiteSpace: "pre" }}>
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
  // once it has arrived the sheet's own row takes over; the traveller fades
  const arrived = t >= 0.999 ? 1 - fade : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: arrived, whiteSpace: "nowrap", fontFamily: mono ? FONT.mono : FONT.sans, fontSize: size, fontWeight: mono ? 500 : 400, letterSpacing: mono ? "0.16em" : "-0.02em", textTransform: mono ? "uppercase" : undefined, color, lineHeight: 1.15 }}>
      {text}
    </div>
  );
}

/** Hours → x on the ruler, with the 07–10 interval stretched by `z` (0–1). */
function hourToX(h: number, z: number) {
  const W = RULER_X1 - RULER_X0;
  const a = 7;
  const b = 10;
  const gain = 1 + 1.6 * z; // the interval grows to 2.6× its width
  const inside = (b - a) * gain;
  const outside = 14 - (b - a);
  const total = inside + outside;
  const unit = W / total;
  let u: number;
  if (h <= a) u = (h - 6) * unit;
  else if (h >= b) u = ((a - 6) + inside + (h - b)) * unit;
  else u = ((a - 6) + (h - a) * gain) * unit;
  return RULER_X0 + u;
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
export const hero2Ease = interpolate;
