import { useCurrentFrame } from "remotion";
import tracksA from "../../../blender/exports/hero3a.json";
import { PLATES, Plate, trackAt, type TrackData } from "../../block/plate";
import { BLOCK, PLAN, REACH } from "../../data/joes";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { Touch } from "../../primitives/Touch";
import { Mono } from "../../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../../tokens";
import { APPROVE_AT, PlanAtRest } from "./PlanAtRest";
import { Meta } from "../../review/Meta";

const TA = tracksA as unknown as TrackData;

/**
 * ACT V · THOUGHT BECOMES ACTION
 *
 * 0–2.1 s   The plan, as Hero 2 left it. One tap on Approve. The rows are
 *           absorbed into the word; the word becomes one mint line.
 * 2.1–8.1 s The line drops into the block at dusk and is delivered only
 *           where Joe already has a way in: the homes of people who said
 *           yes (a text, tonight), his own pumps and counter, the two
 *           Uptick screens on the block. No diagram: the block itself
 *           lights, and a ledger keeps the account.
 */
export const A_END = 50;
const B_START = A_END;
const B_FRAMES = TA.frames; // 144
export const ACT5_FRAMES = B_START + B_FRAMES;
const HOMES = (TA.meta.homes as number[]) ?? [66, 74, 82, 91, 101];

/**
 * A light inside the plate, not a dot on top of it: a soft bloom in screen blend, so it
 * adds to the render the way a window coming on adds to a street. `core` is where the
 * falloff starts, as a percentage of the radius.
 */
const Glow = ({ x, y, r, rgb, t, core = 16 }: { x: number; y: number; r: number; rgb: string; t: number; core?: number }) =>
  t <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        mixBlendMode: "screen",
        pointerEvents: "none",
        background: `radial-gradient(circle, rgba(${rgb},${0.95 * t}) 0%, rgba(${rgb},${0.55 * t}) ${core}%, rgba(${rgb},0) 68%)`,
      }}
    />
  );
const ARM = (TA.meta.arm as Record<string, number>) ?? { pharmacy: 112, cafe: 118 };

export const Act5Approve = () => {
  const frame = useCurrentFrame();
  const pa = Math.max(0, Math.min(B_FRAMES - 1, frame - B_START));

  // ---------------------------------------------------------------- A · the press
  const press = frame >= 12 && frame < 15 ? 1 : 0;
  const touch = ramp(frame, 12, 12, OUT);
  const fill = ramp(frame, 15, 4, OUT);
  // the rows are absorbed, bottom to top, into the word; the title last
  const absorb = (k: number) => 1 - ramp(frame, 22 + k * 3, 10, IN);
  const wordOut = 1 - ramp(frame, 40, 8, IN);
  const lineIn = ramp(frame, 40, 10, PLANE);
  const darken = ramp(frame, 44, 24, PLANE);

  // ---------------------------------------------------------------- B · delivered
  const bIn = ramp(frame, B_START - 6, 26, PLANE);
  const lot = trackAt(TA, "joes_lot", pa);
  const pumpL = trackAt(TA, "pump_10", pa);
  const doorJ = trackAt(TA, "door_joes", pa);
  const drop = ramp(frame, B_START + 2, 24, PLANE);
  // once landed, the line takes Joe's frontage, pump island to door, and stays: the plan is live at a place
  const span = ramp(frame, B_START + 26, 26, PLANE);
  const frontW = Math.max(60, Math.abs(doorJ.x - pumpL.x) + 40);
  const lineX = APPROVE_AT.x + 75 + (lot.x - APPROVE_AT.x - 75) * drop;
  const lineY = APPROVE_AT.y + 14 + (lot.y - APPROVE_AT.y - 14) * drop;
  const delivered = ramp(frame, B_START + 40, 30, PLANE); // the point thins as the signal is delivered
  // Two lines, in the order the block answers: Joe's own frontage, then the homes.
  // The two Uptick screens come on at the end without a caption — Act VI names them.
  const ledger = [
    { at: B_START + 30, line: REACH.location.line },
    { at: B_START + HOMES[0], line: REACH.direct.line },
  ];
  const headerIn = ramp(frame, B_START + 18, 12, OUT);

  return (
    <Frame bg={COLOR.marine}>
      {frame >= B_START - 6 && <Plate src={PLATES.hero3a} from={B_START} frames={B_FRAMES} opacity={bIn} />}
      {frame >= B_START && <Grain opacity={0.06 * bIn} />}

      {/* the page: the plan, the press, the absorption */}
      {frame < B_START + 24 && (
        <div style={{ position: "absolute", inset: 0, width: WIDTH, height: HEIGHT, background: COLOR.canvas, opacity: 1 - Math.max(darken, ramp(frame, B_START, 22, PLANE)) }}>
          <PlanAtRest
            press={press}
            fill={fill}
            reveal={{ limit: absorb(0), audience: absorb(1), fuel: absorb(2), offer: absorb(3), window: absorb(4), title: absorb(5), approve: wordOut }}
            uprights={absorb(4)}
            rule={absorb(0)}
            header={1 - darken}
            headerRight={frame >= 16 ? `Approved · ${PLAN.approvedAt}` : "Thursday · 6:46 PM"}
          />
          <Touch x={APPROVE_AT.x} y={APPROVE_AT.y} t={touch} />
        </div>
      )}
      {/* the line: the whole plan inside one object, then a signal entering the world.
          Once it lands it stops being an object and becomes light lying on Joe's forecourt —
          a wide, shallow bloom under a hairline, not a bar hanging in the street. */}
      {frame >= 40 && (
        <>
          {span > 0 && (
            <div
              style={{
                position: "absolute",
                left: lineX - (frontW / 2 + 90),
                top: lineY - 46,
                width: frontW + 180,
                height: 92,
                mixBlendMode: "screen",
                transform: `scaleX(${0.35 + 0.65 * span})`,
                background: `radial-gradient(ellipse at center, rgba(94,214,178,${0.38 * span}) 0%, rgba(94,214,178,${0.15 * span}) 34%, rgba(94,214,178,0) 70%)`,
              }}
            />
          )}
          <div style={{ position: "absolute", left: lineX, top: lineY, width: 150 * lineIn * (1 - drop) + 10 + (frontW - 10) * span, height: 3 + 2 * drop - 2.2 * span, background: COLOR.mint, transform: "translate(-50%, -50%)", borderRadius: 2, opacity: 1 - 0.55 * delivered * span, boxShadow: `0 0 ${14 + 10 * drop - 12 * span}px ${2 + 2 * drop - 3 * span}px rgba(94,214,178,${0.5 - 0.35 * span})` }} />
        </>
      )}

      {/* B · the block at dusk: the world lights where Joe already has a way in */}
      {frame >= B_START && (
        <>
          {/* the homes of the 104 who said yes: windows coming on, one after another, and staying on.
              A window that answered does not un-answer, so nothing here blinks. */}
          {HOMES.map((f, i) => {
            const p = trackAt(TA, `home_${i}`, pa);
            return <Glow key={i} x={p.x} y={p.y} r={32} rgb="232,172,92" core={9} t={0.85 * ramp(frame, B_START + f, 16, OUT)} />;
          })}
          {/* the two Uptick screens two doors either side, waking for tomorrow morning.
              No caption: Act VI walks up to one of them. */}
          <Glow x={trackAt(TA, "plaque_pharmacy", pa).x} y={trackAt(TA, "plaque_pharmacy", pa).y} r={30} rgb="238,236,226" core={9} t={0.55 * ramp(frame, B_START + ARM.pharmacy, 12, OUT)} />
          <Glow x={trackAt(TA, "plaque_cafe", pa).x} y={trackAt(TA, "plaque_cafe", pa).y} r={30} rgb="238,236,226" core={9} t={0.55 * ramp(frame, B_START + ARM.cafe, 12, OUT)} />
          <Meta>
            <div style={{ position: "absolute", left: 96, top: 84, opacity: headerIn }}>
              <Mono color={COLOR.onMarineSoft}>
                {BLOCK.street} · {String(TA.meta.clock ?? "Thursday · 6:48 PM")}
              </Mono>
            </div>
          </Meta>
          {/* the film's own voice over the street, in Act I's grammar: bottom left, no labels,
              one line a viewer reads in a second while watching the thing it describes */}
          <div style={{ position: "absolute", left: 96, bottom: 96 }}>
            {ledger.map((l, i) => {
              const a = ramp(frame, l.at, 16, OUT);
              return (
                <div key={l.line} style={{ marginTop: i === 0 ? 0 : 18, opacity: a, transform: `translateY(${(1 - a) * 10}px)`, fontSize: 34, color: COLOR.onMarine, letterSpacing: "-0.015em" }}>
                  {l.line}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Frame>
  );
};
