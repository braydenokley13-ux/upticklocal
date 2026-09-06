import { useCurrentFrame } from "remotion";
import tracksA from "../../blender/exports/hero3a.json";
import tracksB from "../../blender/exports/hero3b.json";
import { homographyMatrix3d, lerpQuad, rectQuad, type Quad } from "../block/homography";
import { PLATES, Plate, quadAt, trackAt, type TrackData } from "../block/plate";
import { BLOCK, MESSAGE, PLAN, REACH } from "../data/joes";
import { IN, OUT, PLANE, ramp, sec } from "../motion";
import { Frame } from "../primitives/Frame";
import { GrowthPlanCard, PLAN_ROWS, PLAN_W } from "../primitives/GrowthPlan";
import { OfferSlab, SLAB_H, SLAB_W } from "../primitives/OfferSlab";
import { ScreenFaceContent } from "../primitives/ScreenContent";
import { Mono } from "../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../tokens";

const TA = tracksA as unknown as TrackData;
const TB = tracksB as unknown as TrackData;

/**
 * HERO 3 · APPROVE → BLOCK → CAFÉ SCREEN → NEW RELATIONSHIP
 *
 * A  0–2.2 s   The press. Thought becomes action: the plan collapses into
 *              one mint line.
 * B  2.2–8.2 s The line enters the dusk block and branches only where a
 *              channel exists: homes (text), Joe's own pumps, two screens.
 * C  8.2–15.2 s Friday 7:04. The café. Joe's content arrives on the counter
 *              screen; a person notices; the physical screen becomes the
 *              digital Offer.
 */
const A_END = 52;
const B_START = A_END;
const B_FRAMES = TA.frames; // 144
const C_START = B_START + B_FRAMES; // 196
const C_FRAMES = TB.frames; // 168
const END = C_START + C_FRAMES + 8;
const HOMES = (TA.meta.homes as number[]) ?? [66, 74, 82, 91, 101];
const ARM = (TA.meta.arm as Record<string, number>) ?? { pharmacy: 112, cafe: 118 };
const ARRIVE = (TB.meta.arrive as number) ?? 78;
const NOTICE = (TB.meta.notice as number) ?? 104;
const SCAN = (TB.meta.scan as number) ?? 122;

export const Hero3 = () => {
  const frame = useCurrentFrame();
  const pa = Math.max(0, Math.min(B_FRAMES - 1, frame - B_START));
  const pb = Math.max(0, Math.min(C_FRAMES - 1, frame - C_START));

  // ---------------------------------------------------------------- A · approve
  const PLAN_SCALE = 1.12;
  const planX = 960 - PLAN_W / 2;
  const planY = 170;
  const press = frame >= 10 && frame < 13 ? 1 : 0;
  const fill = ramp(frame, 13, 5, OUT);
  const collapse = ramp(frame, 22, 16, IN); // rows fold into the block
  const push = ramp(frame, 20, 24, PLANE); // camera push onto the block
  const thin = ramp(frame, 40, 12, PLANE); // the block becomes a line
  const darken = ramp(frame, 44, 20, PLANE);
  const approveCenter = { x: 960 + (-PLAN_W / 2 + 56 + 60) * PLAN_SCALE, y: planY + (PLAN_ROWS.approve + 30) * PLAN_SCALE };
  const pushScale = 1 + 2.4 * push;

  // ---------------------------------------------------------------- B · distribute
  const bIn = ramp(frame, B_START, 26, PLANE);
  const joes = trackAt(TA, "joes_walk", pa);
  const lot = trackAt(TA, "joes_lot", pa);
  const drop = ramp(frame, B_START + 4, 22, PLANE); // the line drops into Joe's lot
  const lineX = 960 + (lot.x - 960) * drop;
  const lineY = 540 + (lot.y - 540) * drop;
  const lineW = 4 + 2 * (1 - drop);
  const branches: { to: string; at: number; label?: string }[] = [
    { to: "pump_01", at: B_START + 30 },
    { to: "pump_10", at: B_START + 34 },
    ...HOMES.map((f, i) => ({ to: `home_${i}`, at: B_START + f - 8 })),
    { to: "plaque_pharmacy", at: B_START + ARM.pharmacy - 10 },
    { to: "plaque_cafe", at: B_START + ARM.cafe - 10 },
  ];
  const ledger = [
    { at: B_START + 40, title: REACH.direct.label, line: `${REACH.direct.detail} · ${REACH.direct.how}` },
    { at: B_START + 60, title: REACH.location.label, line: REACH.location.detail },
    { at: B_START + ARM.cafe, title: REACH.screens.label, line: `${REACH.screens.detail} · ${REACH.screens.how}` },
  ];
  const bOut = 1 - ramp(frame, C_START - 6, 8, IN);

  // ---------------------------------------------------------------- C · the café
  const cIn = ramp(frame, C_START - 4, 8, OUT);
  const quad = quadAt(TB, "screen_cafe", pb);
  const screenQuad: Quad = [
    [quad[0].x, quad[0].y],
    [quad[1].x, quad[1].y],
    [quad[2].x, quad[2].y],
    [quad[3].x, quad[3].y],
  ];
  const person = trackAt(TB, "person_cafe", pb);
  const arriveFlash = frame >= C_START + ARRIVE ? Math.max(0, 1 - (frame - (C_START + ARRIVE)) / 10) : 0;
  const scanLine = ramp(frame, C_START + SCAN, 5, OUT) * (1 - ramp(frame, C_START + SCAN + 9, 6, IN));
  const lift = ramp(frame, C_START + SCAN + 8, 34, PLANE); // the content lifts off the surface
  const toSlab = ramp(frame, C_START + SCAN + 26, 22, PLANE); // and becomes the Offer
  const slabRect = rectQuad(960 - SLAB_W / 2, 540 - SLAB_H / 2, SLAB_W, SLAB_H);
  // the screen face (16:9) lifts to a flat 16:9 rectangle in the frame's centre, then that rectangle
  // grows into the slab's proportions while the content crossfades
  const midW = 900;
  const midRect = rectQuad(960 - midW / 2, 540 - (midW * 9) / 16 / 2, midW, (midW * 9) / 16);
  const q1 = lerpQuad(screenQuad, midRect, lift);
  const q2 = lerpQuad(q1, slabRect, toSlab);
  const faceMatrix = homographyMatrix3d(1600, 900, q2);
  const slabMatrix = homographyMatrix3d(SLAB_W, SLAB_H, q2);
  const worldDim = 1 - 0.72 * lift;
  const worldBlur = 14 * lift;
  const rows = ramp(frame, C_START + SCAN + 50, 14, OUT);
  const permission = ramp(frame, C_START + SCAN + 62, 12, OUT);
  const yes = ramp(frame, C_START + SCAN + 78, 8, OUT);
  const save = ramp(frame, C_START + SCAN + 70, 12, OUT);
  const savePress = frame >= C_START + SCAN + 88 && frame < C_START + SCAN + 91 ? 1 : 0;
  const twoWays = ramp(frame, C_START + SCAN + 96, 14, OUT);

  return (
    <Frame bg={COLOR.marine}>
      {/* ------------------------------------------------------------ plates */}
      {frame < C_START && <Plate src={PLATES.hero3a} from={B_START} frames={B_FRAMES} opacity={bIn} />}
      {frame >= C_START - 4 && (
        <div style={{ position: "absolute", inset: 0, filter: worldBlur > 0.2 ? `blur(${worldBlur}px)` : undefined, opacity: cIn }}>
          <Plate src={PLATES.hero3b} from={C_START} frames={C_FRAMES} />
          <div style={{ position: "absolute", inset: 0, background: COLOR.marine, opacity: 1 - worldDim }} />
        </div>
      )}

      {/* ------------------------------------------------------------ A · the page and the press */}
      {frame < B_START + 30 && (
        <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: 1 - Math.max(darken, ramp(frame, B_START, 26, PLANE)) }}>
          <div style={{ position: "absolute", inset: 0, transform: `translate(${(960 - approveCenter.x) * push}px, ${(540 - approveCenter.y) * push}px) scale(${pushScale})`, transformOrigin: `${approveCenter.x}px ${approveCenter.y}px` }}>
            <GrowthPlanCard x={planX} y={planY} scale={PLAN_SCALE} press={press} fill={fill} reveal={{ title: 1 - collapse, window: 1 - collapse, offer: 1 - collapse, fuel: 1 - collapse, audience: 1 - collapse, limit: 1 - collapse, sheet: 1 - collapse, approve: 1 - thin }} />
            {/* rows stack as hairlines on the block's upper edge */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ position: "absolute", left: approveCenter.x - 60 * PLAN_SCALE, width: 120 * PLAN_SCALE, top: approveCenter.y - 34 - i * 4, height: 1, background: COLOR.inkHair, opacity: collapse * (1 - thin) }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: 1 - push }}>
            <Mono color={COLOR.inkFaint}>Growth plan · approved · {PLAN.approvedAt}</Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: 1 - push }}>
            <Mono color={COLOR.inkFaint}>One action · the owner's second and last</Mono>
          </div>
        </div>
      )}
      {/* the mint line: the whole plan inside one object, then a signal entering the world */}
      {frame >= 40 && frame < B_START + 40 && (
        <div style={{ position: "absolute", left: lineX, top: lineY, width: 220 * (1 - drop) + 12, height: lineW, background: COLOR.mint, transform: "translate(-50%, -50%)", boxShadow: `0 0 ${18 + 30 * drop}px ${2 + 4 * drop}px rgba(95,214,187,${0.35 + 0.25 * drop})`, opacity: thin * (1 - ramp(frame, B_START + 30, 10, IN)) }} />
      )}

      {/* ------------------------------------------------------------ B · the signal branches */}
      {frame >= B_START && frame < C_START && (
        <div style={{ position: "absolute", inset: 0, opacity: bOut }}>
          <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
            {branches.map((b) => {
              const t = ramp(frame, b.at, 14, PLANE);
              if (t <= 0) return null;
              const to = trackAt(TA, b.to, pa);
              const ex = lot.x + (to.x - lot.x) * t;
              const ey = lot.y + (to.y - lot.y) * t;
              const home = b.to.startsWith("home");
              return (
                <g key={b.to}>
                  <line x1={lot.x} y1={lot.y} x2={ex} y2={ey} stroke={COLOR.mint} strokeWidth={1.5} strokeDasharray={home ? "3 7" : undefined} opacity={0.75} />
                  {t >= 1 && <circle cx={to.x} cy={to.y} r={home ? 4 : 5} fill={home ? COLOR.amber : COLOR.mint} opacity={0.95} />}
                </g>
              );
            })}
            <circle cx={lot.x} cy={lot.y} r={5 + 3 * Math.sin(frame * 0.3)} fill={COLOR.mint} opacity={0.9 * drop} />
          </svg>
          {/* header */}
          <div style={{ position: "absolute", left: 96, top: 84, opacity: ramp(frame, B_START + 20, 12, OUT) }}>
            <Mono color={COLOR.onMarineSoft}>
              {BLOCK.street} · {String(TA.meta.clock ?? "Thursday · 6:48 PM")}
            </Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: ramp(frame, B_START + 20, 12, OUT), display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOR.mint, display: "inline-block" }} />
            <Mono color={COLOR.onMarineSoft}>{PLAN.title} · active</Mono>
          </div>
          {/* the reach ledger: each line arrives as its branch completes */}
          <div style={{ position: "absolute", left: 96, bottom: 84 }}>
            {ledger.map((l, i) => {
              const a = ramp(frame, l.at, 14, OUT);
              return (
                <div key={l.title} style={{ marginTop: i === 0 ? 0 : 22, opacity: a, transform: `translateY(${(1 - a) * 8}px)` }}>
                  <Mono color={COLOR.onMarineFaint} size={13}>
                    {l.title}
                  </Mono>
                  <div style={{ fontSize: 24, color: COLOR.onMarine, marginTop: 6, letterSpacing: "-0.01em" }}>{l.line}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", right: 96, bottom: 92, opacity: ramp(frame, B_START + ARM.cafe + 8, 14, OUT), textAlign: "right" }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              One plan · every channel Joe has · nothing he doesn't
            </Mono>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ C · the café */}
      {frame >= C_START && (
        <>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: cIn * (1 - lift) }}>
            <Mono color={COLOR.onMarineSoft}>Café · 122 Main St · {String(TB.meta.clock ?? "Friday · 7:04 AM")}</Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: cIn * (1 - lift), textAlign: "right" }}>
            <Mono color={COLOR.onMarineSoft}>Uptick screen · nearby reach</Mono>
          </div>
          {/* the moment Joe's content lands on the neighbour's screen */}
          {arriveFlash > 0 && (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transform: homographyMatrix3d(1600, 900, screenQuad), transformOrigin: "0 0", background: COLOR.mint, opacity: 0.35 * arriveFlash, mixBlendMode: "screen" }} />
          )}
          {/* the scan: one thin mint line from the person to the code */}
          {scanLine > 0 && (
            <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
              <line x1={person.x} y1={person.y} x2={person.x + (quad[2].x - person.x) * scanLine} y2={person.y + (quad[2].y - person.y) * scanLine} stroke={COLOR.mint} strokeWidth={1.5} opacity={0.9} />
            </svg>
          )}
          {/* the screen goes quiet as its content leaves */}
          {lift > 0 && <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transform: homographyMatrix3d(1600, 900, screenQuad), transformOrigin: "0 0", background: "#0b1c22", opacity: Math.min(1, lift * 2) }} />}
          {/* the content itself: on the surface, then off it, then the Offer */}
          {lift > 0 && (
            <>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transform: faceMatrix, transformOrigin: "0 0", opacity: 1 - toSlab, overflow: "hidden", borderRadius: 6 }}>
                <ScreenFaceContent state="cafe-joes" />
              </div>
              <div style={{ position: "absolute", left: 0, top: 0, width: SLAB_W, height: SLAB_H, transform: slabMatrix, transformOrigin: "0 0", opacity: toSlab }}>
                <OfferSlab reveal={{ head: 1, body: rows, rows, permission, yes, save }} savePress={savePress} style={{ boxShadow: `0 ${40 * toSlab}px ${90 * toSlab}px -40px rgba(0,0,0,0.6)` }} />
              </div>
            </>
          )}
          {/* what this is */}
          <div style={{ position: "absolute", left: 96, bottom: 84, opacity: ramp(frame, C_START + NOTICE, 12, OUT) * (1 - lift) }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              New relationship · someone who has never been to Joe's
            </Mono>
          </div>
          <div style={{ position: "absolute", left: 96, bottom: 84, opacity: twoWays }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              {MESSAGE.screen.where} · scanned at the café · now a relationship Joe may keep
            </Mono>
          </div>
          <div style={{ position: "absolute", right: 96, bottom: 84, opacity: twoWays, textAlign: "right" }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              No app · No account
            </Mono>
          </div>
        </>
      )}
    </Frame>
  );
};

export const HERO3_FRAMES = END;
export const hero3Sec = sec;
