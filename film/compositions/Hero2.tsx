import { useCurrentFrame } from "remotion";
import { BUSINESS, ECONOMICS, GAP, INTENT, RELATIONSHIPS } from "../data/joes";
import { IN, OUT, PLANE, ramp, typed } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_LINES, PLAN_ROWS } from "../primitives/GrowthPlan";
import { Mono } from "../primitives/Type";
import { COLOR, FONT } from "../tokens";
import { useTextWidths } from "../typography/measure";
import { PLAN_X, PLAN_Y, ROW_PX, TITLE_PX } from "./acts/PlanAtRest";

/**
 * HERO 2 · FRIDAY MORNINGS ARE SLOW → UNDERSTANDING → PLAN
 *
 * The sentence is the interface. Then the words become the instruments:
 * Friday's own baseline carries six Fridays; mornings sits on a linear day
 * line, exactly on 07:00–10:00; slow drops under that interval as last
 * Friday's three visits fall onto it. Above the line, the 63 people who
 * tend to answer in the morning arrive where they answer. The reading is
 * annotated, then reorganises into one plan set bare on the page: Friday
 * walks into the first row, the two mint uprights bracket 7–10 AM, $0.62
 * steps ×30 into the limit. Nothing new appears.
 */
const LEFT = 96;
const RIGHT = 1824;
const WORD_PX = 96;
const WORD_FONT = `200 ${WORD_PX}px 'Geist Film'`;
const ROW_FONT = `300 ${ROW_PX}px 'Geist Film'`;
const MONEY_PX = 30;
const MONEY_FONT = `300 ${MONEY_PX}px 'Geist Film'`;
/** Below the line, last Friday is ink: amber only ever means who could come. */
const VISIT = "rgb(40, 38, 34)";
const L1 = 380; // Friday's baseline: the weeks line
const L2 = 620; // the day line
const DAY0 = 6;
const DAY1 = 16;

// the beat grid at 76 bpm (18.95 frames a beat). The three acts overlap on
// purpose: the day line begins drawing while Friday's own label is still
// arriving, and the responders start above the line before the last visit has
// landed on it. They are different heights in the frame, so they read at once,
// and the reading assembles instead of being presented a beat at a time.
const T = {
  caret: 6,
  type: 16,
  reset: 76,
  friday: 82,
  mornings: 116,
  slow: 152,
  flood: 182,
  context: 204,
  assemble: 236,
  plan: 258,
  approve: 304,
  end: 326,
};
/** Frames per character while the sentence types. */
const TYPE_RATE = 1.45;

// last Friday's three visits, in hours
const MORNING = [7.68, 8.92, 9.5];
// the 63 who tend to answer in the morning, placed where they answer: a stratified sample of a morning-shaped density, none after 11:00
const RESPONDERS = (() => {
  const bands: [number, number, number][] = [
    [6.0, 7.0, 4],
    [7.0, 7.5, 8],
    [7.5, 9.0, 22],
    [9.0, 10.0, 12],
    [10.0, 11.0, 5],
  ];
  const total = bands.reduce((s, b) => s + (b[1] - b[0]) * b[2], 0);
  const n = RELATIONSHIPS.signals.morningResponders;
  const out: number[] = [];
  for (let k = 0; k < n; k++) {
    let u = ((k + 0.5) / n) * total;
    for (const [h0, h1, d] of bands) {
      const mass = (h1 - h0) * d;
      if (u <= mass) {
        const jitter = (((k * 7919) % 97) / 97 - 0.5) * 0.06;
        out.push(h0 + u / d + jitter);
        break;
      }
      u -= mass;
    }
  }
  return out.sort((a, b) => a - b);
})();

export const Hero2 = () => {
  const frame = useCurrentFrame();
  const words = [...INTENT.words];
  const widths = useTextWidths([...words, " "], WORD_FONT);
  // rowW[3] is the whole limit row: the money counter's right edge is its end
  const rowW = useTextWidths(["Friday", "Friday · ", "Friday · 7–10 AM", PLAN_LINES.limit], ROW_FONT);
  const moneyW = useTextWidths([ECONOMICS.coffeeCostLabel], MONEY_FONT);
  if (!widths || !rowW || !moneyW) return <Frame />;
  const space = widths[4];
  const sentence = INTENT.sentence;

  // both instruments share one origin: the weeks line and the day line begin where Friday ends
  const AX0 = LEFT + widths[0] + 60;
  const hx = (h: number) => AX0 + ((h - DAY0) / (DAY1 - DAY0)) * (RIGHT - AX0);

  // --- typed --------------------------------------------------------------
  const pauses: Record<number, number> = { 6: 6, 15: 5 };
  const chars = typed(frame, T.type, sentence.length, TYPE_RATE, pauses);
  const done = chars >= sentence.length;
  const doneAt = T.type + Math.round(sentence.length * TYPE_RATE) + 11;
  const caretOn = frame < T.type ? Math.floor((frame - T.caret) / 11) % 2 === 0 : frame < T.reset;
  const caretMint = done ? ramp(frame, doneAt, 5, OUT) : 0;
  const origins: number[] = [];
  let cx = LEFT;
  words.forEach((w, i) => {
    origins.push(cx);
    cx += widths[i] + space;
  });
  const typedX = LEFT + measureTyped(sentence, chars, words, widths, space);

  // --- re-set: "are" goes first, the others hold; then Friday rises and mornings slides ----------
  const areOut = 1 - ramp(frame, T.reset, 8, IN);
  const mF = ramp(frame, T.friday, 18, PLANE);
  const mM = ramp(frame, T.friday + 10, 18, PLANE);
  const yF = L2 + (L1 - L2) * mF;
  // mornings slides so it begins at 07:00 on the line, 56 px clear of it; its tracking opens until it ends at 10:00
  const morningsX0 = origins[1];
  const morningsX = morningsX0 + (hx(7) + 6 - morningsX0) * mM;
  const morningsY = L2 - 56 * mM;
  const track = ramp(frame, T.mornings + 6, 22, PLANE);
  const morningsW = widths[1];
  const targetW = hx(10) - hx(7) - 12;
  const extra = Math.max(0, (targetW - morningsW) / words[1].length) * track;
  // slow holds on the typing baseline until its own beat, then drops under the interval as the visits fall
  const slowMove = ramp(frame, T.slow, 22, PLANE);
  const slowHold = origins[3] + (hx(10) + 48 - origins[3]) * mM;
  const slowX = slowHold + ((hx(7) + hx(10)) / 2 - widths[3] / 2 - slowHold) * slowMove;
  const slowY = L2 + 190 * slowMove;

  // --- Friday: six Fridays on the word's own baseline ------------------------
  const fridayTrack = ramp(frame, T.friday + 8, 26, PLANE);
  const weekW = (RIGHT - AX0) / 6;

  // --- mornings: the day line, hours, the interval -----------------------------
  const dayDraw = ramp(frame, T.mornings, 26, PLANE);
  const uprights = ramp(frame, T.mornings + 22, 12, OUT);

  // --- slow: visits fall onto the day line; then the responders arrive above it ---
  const fallStart = T.slow + 4;
  const floodIn = (i: number) => ramp(frame, T.flood + (i / RESPONDERS.length) * 20, 8, IN);

  // --- context: annotations on the reading --------------------------------------
  const ann = (i: number) => ramp(frame, T.context + i * 7, 14, OUT);
  const readingOut = 1 - ramp(frame, T.assemble, 22, IN);
  const annOut = 1 - ramp(frame, T.assemble, 10, IN); // the annotations are clear before the money crosses their line

  // --- assemble: the plan, bare on the page; three things travel into it ------------
  const rowTop = (key: keyof typeof PLAN_ROWS) => PLAN_Y + PLAN_ROWS[key] + 14;
  // two of the four sentence words hand over: Friday walks into row 1, mornings
  // flies to the title's first-word slot and becomes the Morning of the title.
  const travel = ramp(frame, T.assemble + 4, 30, PLANE); // Friday + the two uprights, 240→270
  const resolve = ramp(frame, T.assemble + 34, 4, PLANE); // row 1 completes around the word, 270→274
  const morn = ramp(frame, T.assemble + 10, 24, PLANE); // mornings → Morning, 246→270
  const slowOut = 1 - ramp(frame, T.assemble + 12, 10, IN); // slow holds past the flood, 248→258
  const rowsIn = (k: number) => ramp(frame, T.plan + 14 + k * 6, 12, OUT); // offer 272, fuel 278, audience 284
  const approveIn = ramp(frame, T.approve, 12, OUT);
  const ruleIn = ramp(frame, T.approve + 4, 12, OUT); // Joe's rule is fully in by 320
  // the money: it leaves the reading with everything else, pins itself on the
  // limit row's baseline with its right edge at the row's end, and counts ×30 there
  const moneyTravel = ramp(frame, T.assemble + 4, 34, PLANE); // 240→274
  const count = ramp(frame, T.plan + 18, 22, PLANE); // 276→298
  const limitIn = ramp(frame, T.plan + 30, 12, OUT); // "First 30 · max reward exposure" fades in at 288
  const steps = Math.max(1, Math.min(ECONOMICS.limit, Math.ceil(count * ECONOMICS.limit)));
  const money = `$${(ECONOMICS.coffeeCost * steps).toFixed(2)}`;
  const moneyRight = 1920 - (PLAN_X + rowW[3]);
  const moneyRest = rowTop("limit") + 14 * (1 - limitIn);

  const annotations = [
    { i: 0, x: AX0, y: L1 + 28, lead: `${RELATIONSHIPS.permissioned}`, text: "relationships said yes to hearing from Joe's", color: COLOR.ink },
    { i: 1, x: hx(7), y: L1 + 64, lead: `${RELATIONSHIPS.signals.morningResponders}`, text: "tend to answer in the morning", color: COLOR.amberDeep },
    { i: 2, x: AX0, y: L2 + 256, lead: ECONOMICS.coffeeCostLabel, text: "what a large coffee costs Joe", color: COLOR.ink },
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

      {/* the sentence, typed on the day line */}
      {frame < T.reset ? (
        <div style={{ position: "absolute", left: LEFT, top: L2 - WORD_PX * 0.86, ...wordStyle }}>{sentence.slice(0, chars)}</div>
      ) : (
        <>
          <Word text={words[0]} x={LEFT + (origins[0] - LEFT) * (1 - mF)} y={yF} opacity={travel > 0 ? 0 : 1} />
          <Word text={words[1]} x={morningsX} y={morningsY} opacity={morn > 0 ? 0 : 1} spacing={extra} />
          <Word text={words[2]} x={origins[2]} y={L2} opacity={areOut} />
          <Word text={words[3]} x={slowX} y={slowY} opacity={slowOut} />
        </>
      )}
      {caretOn && frame < T.reset && <div style={{ position: "absolute", left: typedX + 4, top: L2 - WORD_PX * 0.78, width: 3, height: WORD_PX * 0.86, background: caretMint > 0 ? COLOR.mintDeep : COLOR.ink }} />}

      {/* FRIDAY · six Fridays, on the word's baseline */}
      {frame >= T.friday && (
        <div style={{ position: "absolute", inset: 0, opacity: readingOut }}>
          <div style={{ position: "absolute", left: AX0, top: L1, width: (RIGHT - AX0) * fridayTrack, height: 1, background: "rgba(23,32,31,0.22)" }} />
          {Array.from({ length: 6 }).map((_, w) => {
            const t = (w + 1) / 6;
            const on = Math.min(1, Math.max(0, (fridayTrack * 1.08 - t) * 8));
            const x = AX0 + weekW * (w + 1) - 12;
            return (
              <div key={w}>
                {Array.from({ length: 6 }).map((_, d) => (
                  <div key={d} style={{ position: "absolute", left: AX0 + weekW * w + (weekW / 7) * (d + 1), top: L1 - 10, width: 1, height: 10, background: COLOR.inkHair, opacity: Math.min(1, Math.max(0, (fridayTrack * 1.08 - (w + (d + 1) / 7) / 6) * 8)) }} />
                ))}
                <div style={{ position: "absolute", left: x, top: L1 - 34 * on, width: 3, height: 34 * on, background: COLOR.mintDeep }} />
              </div>
            );
          })}
          <div style={{ position: "absolute", right: 1920 - RIGHT, top: L1 + 16, opacity: ramp(frame, T.friday + 34, 10, OUT) }}>
            <Mono color={COLOR.inkSoft} size={16}>
              every Friday · six weeks
            </Mono>
          </div>
        </div>
      )}

      {/* MORNINGS · the day line, honest and linear: hours every two, half-hours between, the interval in mint */}
      {frame >= T.mornings && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: readingOut }}>
          <div style={{ position: "absolute", left: AX0, top: L2, width: (RIGHT - AX0) * dayDraw, height: 1, background: "rgba(23,32,31,0.22)" }} />
          {Array.from({ length: (DAY1 - DAY0) * 2 + 1 }).map((_, k) => {
            const h = DAY0 + k / 2;
            const t = (h - DAY0) / (DAY1 - DAY0);
            const o = Math.min(1, Math.max(0, (dayDraw * 1.12 - t) * 10));
            const major = k % 4 === 0;
            const minor = k % 2 === 1;
            return (
              <div key={k} style={{ position: "absolute", left: hx(h), top: L2, opacity: o }}>
                <div style={{ width: 1, height: minor ? 5 : major ? 12 : 8, background: minor ? COLOR.inkHair : COLOR.inkSoft, opacity: minor ? 0.8 : 0.7 }} />
                {major && (
                  <Mono color={COLOR.inkSoft} size={20} style={{ position: "absolute", left: -30, top: 22 }}>
                    {String(h).padStart(2, "0")}:00
                  </Mono>
                )}
              </div>
            );
          })}
          {[7, 10].map((h) => (
            <div key={h} style={{ position: "absolute", left: hx(h) - 1.5, top: L2 - 52 * uprights, width: 3, height: 52 * uprights, background: COLOR.mintDeep, opacity: 1 - travel }} />
          ))}
        </div>
      )}

      {/* SLOW · three visits fall onto the line inside the interval; then the 63 arrive above it, where they answer */}
      {frame >= T.slow && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: readingOut }}>
          {MORNING.map((h, i) => {
            const f = ramp(frame, fallStart + i * 9, 12, IN);
            if (f <= 0) return null;
            const x = hx(h);
            const y = L2 + 4 + (1 - f) * 90;
            return <div key={`m${i}`} style={{ position: "absolute", left: x - 1.5, top: y, width: 3, height: 28, background: VISIT, opacity: 0.5 + 0.5 * f }} />;
          })}
          {RESPONDERS.map((h, i) => {
            const f = floodIn(i);
            if (f <= 0) return null;
            const x = hx(h);
            const stack = RESPONDERS.slice(0, i).filter((v) => Math.abs(hx(v) - x) < 4).length;
            const hgt = 14;
            const landY = L2 - 2 - hgt - stack * (hgt + 2);
            const y = landY - (1 - f) * 110;
            return <div key={i} style={{ position: "absolute", left: x - 1, top: y, width: 2, height: hgt, background: COLOR.amber, opacity: 0.6 + 0.4 * f }} />;
          })}
          <div style={{ position: "absolute", left: hx(MORNING[0]) - 1.5, top: 676, opacity: ramp(frame, T.slow + 40, 12, OUT), display: "flex", alignItems: "baseline", gap: 10, whiteSpace: "nowrap", fontFamily: FONT.sans, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1 }}>
            <span style={{ fontSize: 28, color: COLOR.ink }}>{GAP.visits}</span>
            <span style={{ fontSize: 24, color: "rgba(23, 32, 31, 0.56)" }}>came last Friday</span>
          </div>
        </div>
      )}

      {/* CONTEXT · annotations on the reading: people in amber, money in ink */}
      {frame >= T.context && frame < T.plan && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: annOut }}>
          {annotations.map((a) => {
            const v = ann(a.i);
            const travels = a.i === 2;
            return (
              <div key={a.i} style={{ position: "absolute", left: a.x, top: a.y - (1 - v) * 10, opacity: v, display: "flex", alignItems: "baseline", gap: 12, whiteSpace: "nowrap" }}>
                {/* the coffee's cost is one object: it leaves here, it does not fade here */}
                <span style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: MONEY_PX, letterSpacing: "-0.02em", color: a.color, opacity: travels && moneyTravel > 0 ? 0 : 1 }}>{a.lead}</span>
                <span style={{ fontFamily: FONT.sans, fontWeight: 300, fontSize: 22, color: COLOR.inkSoft }}>{a.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ASSEMBLE · one plan, bare on the page, from what was already there */}
      {frame >= T.assemble && (
        <>
          <GrowthPlanCard x={PLAN_X} y={PLAN_Y} bare labels={false} rules={false} titleSize={TITLE_PX} rowSize={ROW_PX} approveStyle="plain" reveal={{ title: morn >= 1 ? 1 : 0, window: resolve >= 1 ? 1 : 0, offer: rowsIn(0), fuel: rowsIn(1), audience: rowsIn(2), limit: limitIn, approve: approveIn }} />
          {/* Friday walks from its baseline into the first row */}
          <Traveller t={travel} from={{ x: LEFT, y: L1 - WORD_PX * 0.935, size: WORD_PX, mono: false, color: COLOR.ink, weight: 200 }} to={{ x: PLAN_X, y: rowTop("window"), size: ROW_PX, mono: false, color: COLOR.ink, weight: 300 }} textFrom={words[0]} textTo={words[0]} fade={resolve >= 1 ? 1 : 0} />
          {/* mornings flies to the title's first-word slot and becomes its Morning */}
          <Traveller
            t={morn}
            from={{ x: morningsX, y: morningsY - WORD_PX * 0.86, size: WORD_PX, mono: false, color: COLOR.ink, weight: 200, track: extra > 0 ? extra - 1.9 : -0.02 * WORD_PX, lh: 1 }}
            to={{ x: PLAN_X, y: PLAN_Y - TITLE_PX, size: TITLE_PX, mono: false, color: COLOR.ink, weight: 200, track: -0.035 * TITLE_PX, lh: 1 }}
            textFrom={words[1]}
            textTo="Morning"
            at={0.55}
            fade={morn >= 1 ? 1 : 0}
          />
          {/* the two mint uprights leave the day line and bracket 7–10 AM in that row */}
          {[7, 10].map((h, k) => {
            const tx = PLAN_X + (k === 0 ? rowW[1] - 6 : rowW[2] + 6);
            const x = hx(h) - 1.5 + (tx - (hx(h) - 1.5)) * travel;
            const y = L2 - 52 + (rowTop("window") - 2 - (L2 - 52)) * travel;
            const hgt = 52 + (ROW_PX + 6 - 52) * travel;
            return <div key={h} style={{ position: "absolute", left: x, top: y, width: travel < 1 ? 3 : 2, height: hgt, background: COLOR.mintDeep, opacity: travel > 0 ? 1 : 0 }} />;
          })}
          {/* the coffee's cost leaves the reading, pins itself to the limit row's
              end, counts ×30 there, and is handed to the row when the row is whole */}
          {moneyTravel > 0 && limitIn < 1 && (
            <div
              style={{
                position: "absolute",
                right: 1920 - (annotations[2].x + moneyW[0]) + (moneyRight - (1920 - (annotations[2].x + moneyW[0]))) * moneyTravel,
                top: annotations[2].y + 3 + (moneyRest - (annotations[2].y + 3)) * moneyTravel,
                fontFamily: FONT.sans,
                fontWeight: 300,
                fontSize: MONEY_PX + (ROW_PX - MONEY_PX) * moneyTravel,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                color: COLOR.ink,
                whiteSpace: "nowrap",
              }}
            >
              {money}
            </div>
          )}
          {/* Joe's rule, on its own line beneath Approve, in his voice */}
          <div style={{ position: "absolute", left: PLAN_X, top: PLAN_Y + PLAN_ROWS.approve + 74, opacity: ruleIn, fontFamily: FONT.sans, fontWeight: 300, fontSize: 28, color: COLOR.amberDeep, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            {ECONOMICS.fuelRule.replace(".", "")} — {ECONOMICS.fuelRuleTag.replace(".", "")}
          </div>
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

type Anchor = { x: number; y: number; size: number; mono: boolean; color: string; weight?: number; /** tracking in px; defaults to the film's -0.02em */ track?: number; lh?: number };

/** A fact that leaves its place and arrives in the plan, re-set on the way. */
function Traveller({ t, from, to, textFrom, textTo, fade = 1, at = 0.5 }: { t: number; from: Anchor; to: Anchor; textFrom: string; textTo: string; fade?: number; at?: number }) {
  if (t <= 0) return null;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const size = from.size + (to.size - from.size) * t;
  const t0 = from.track ?? -0.02 * from.size;
  const t1 = to.track ?? -0.02 * to.size;
  const past = t > at;
  const mono = past ? to.mono : from.mono;
  const color = past ? to.color : from.color;
  const weight = past ? (to.weight ?? 300) : (from.weight ?? 300);
  const text = past ? textTo : textFrom;
  const lh = past ? (to.lh ?? 1.15) : (from.lh ?? 1.15);
  const arrived = t >= 0.999 ? 1 - fade : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: arrived, whiteSpace: "nowrap", fontFamily: mono ? FONT.mono : FONT.sans, fontSize: size, fontWeight: mono ? 500 : weight, letterSpacing: mono ? "0.16em" : `${(t0 + (t1 - t0) * t).toFixed(2)}px`, textTransform: mono ? "uppercase" : undefined, color, lineHeight: lh }}>
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
