import { useCurrentFrame } from "remotion";
import tracksB from "../../../blender/exports/hero3b.json";
import { homographyMatrix3d, lerpQuad, rectQuad, type Quad } from "../../block/homography";
import { PLATES, Plate, quadAt, trackAt, type TrackData } from "../../block/plate";
import { MESSAGE, OFFER, RELATIONSHIPS } from "../../data/joes";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { OfferSlab, SLAB_H, SLAB_W } from "../../primitives/OfferSlab";
import { ScreenFaceContent } from "../../primitives/ScreenContent";
import { Touch } from "../../primitives/Touch";
import { Mono } from "../../primitives/Type";
import { COLOR, FONT, HEIGHT, WIDTH } from "../../tokens";

const TB = tracksB as unknown as TrackData;

/**
 * ACT VI · TWO WAYS IN
 *
 * 1  0–4.6 s   Thursday 6:48 PM. A text arrives for someone who said yes.
 *              They open it; the message becomes the Offer.
 * 2  4.6–11.6 s Friday 7:04 AM. The café, two doors down. Joe's offer
 *              arrives on the counter screen; a stranger notices, scans;
 *              the screen's content lifts off the glass and becomes the
 *              Offer.
 * 3  11.6–15.5 s The two arrive at the same object. The text's Offer
 *              slides in and is the same slab. Rows, permission, yes.
 *              The Offer then folds to the head of a thread: the stranger
 *              has a question.
 */
const P1_END = 110;
const P2_START = P1_END;
const P2_FRAMES = TB.frames; // 168
const P3_START = P2_START + P2_FRAMES; // 278
export const ACT6_FRAMES = P3_START + 104; // 382
const ARRIVE = (TB.meta.arrive as number) ?? 78;
const NOTICE = (TB.meta.notice as number) ?? 104;
const SCAN = (TB.meta.scan as number) ?? 122;

/** Where the Offer folds to at the end: the head of the thread in Act VII. */
export const THREAD_PLANE = { x: 480, y: 236, w: 640 };

const CENTRE = { x: 960 - SLAB_W / 2, y: 540 - SLAB_H / 2 };

export const Act6TwoWays = () => {
  const frame = useCurrentFrame();
  const pb = Math.max(0, Math.min(P2_FRAMES - 1, frame - P2_START));

  // ---------------------------------------------------------------- 1 · the text
  const notify = ramp(frame, 10, 12, OUT);
  const touch = ramp(frame, 60, 12, OUT);
  const open = ramp(frame, 66, 30, PLANE); // the message becomes the Offer
  const p1Out = 1 - ramp(frame, P1_END - 4, 4, IN);
  const msg = { x: THREAD_PLANE.x, y: 300, w: THREAD_PLANE.w, h: 222 };
  const box = {
    x: msg.x + (CENTRE.x - msg.x) * open,
    y: msg.y + (CENTRE.y - msg.y) * open,
    w: msg.w + (SLAB_W - msg.w) * open,
    h: msg.h + (SLAB_H - msg.h) * open,
  };
  const lampA = 0.9 + 0.1 * Math.sin(frame * 0.05);

  // ---------------------------------------------------------------- 2 · the café
  const cIn = ramp(frame, P2_START, 6, OUT);
  const quad = quadAt(TB, "screen_cafe", pb);
  const screenQuad: Quad = [
    [quad[0].x, quad[0].y],
    [quad[1].x, quad[1].y],
    [quad[2].x, quad[2].y],
    [quad[3].x, quad[3].y],
  ];
  const person = trackAt(TB, "person_cafe", pb);
  const arriveFlash = frame >= P2_START + ARRIVE ? Math.max(0, 1 - (frame - (P2_START + ARRIVE)) / 10) : 0;
  const scanLine = ramp(frame, P2_START + SCAN, 5, OUT) * (1 - ramp(frame, P2_START + SCAN + 9, 6, IN));
  const lift = ramp(frame, P2_START + SCAN + 8, 32, PLANE);
  const toSlab = ramp(frame, P2_START + SCAN + 24, 22, PLANE);
  const slabRect = rectQuad(CENTRE.x, CENTRE.y, SLAB_W, SLAB_H);
  const midW = 900;
  const midRect = rectQuad(960 - midW / 2, 540 - (midW * 9) / 16 / 2, midW, (midW * 9) / 16);
  const q1 = lerpQuad(screenQuad, midRect, lift);
  const q2 = lerpQuad(q1, slabRect, toSlab);
  const faceMatrix = homographyMatrix3d(1600, 900, q2);
  const slabMatrix = homographyMatrix3d(SLAB_W, SLAB_H, q2);
  const worldDim = 1 - 0.8 * lift;
  const worldBlur = 14 * lift;
  const wash = ramp(frame, P3_START - 16, 14, PLANE); // the plate ends under a field, not on a cut

  // ---------------------------------------------------------------- 3 · one offer
  const converge = ramp(frame, P3_START + 8, 30, PLANE);
  const ghostX = -SLAB_W * 0.6 + (CENTRE.x + SLAB_W / 2 - -SLAB_W * 0.6) * converge;
  const ghostS = 0.5 + 0.5 * converge;
  const ghostO = converge < 0.85 ? 1 : 1 - (converge - 0.85) / 0.15;
  const captions = ramp(frame, P3_START + 12, 14, OUT);
  const same = ramp(frame, P3_START + 44, 14, OUT);
  const rows = ramp(frame, P3_START + 4, 14, OUT);
  const permission = ramp(frame, P3_START + 52, 12, OUT);
  const yes = ramp(frame, P3_START + 66, 8, OUT);
  const yesTouch = ramp(frame, P3_START + 62, 12, OUT);
  const fold = ramp(frame, P3_START + 84, 20, PLANE); // the Offer folds to the head of the thread
  const foldBox = {
    x: CENTRE.x + (THREAD_PLANE.x - CENTRE.x) * fold,
    y: CENTRE.y + (THREAD_PLANE.y - CENTRE.y) * fold,
    w: SLAB_W + (THREAD_PLANE.w - SLAB_W) * fold,
    h: SLAB_H + (150 - SLAB_H) * fold,
  };
  const p3 = frame >= P3_START;
  const lampB = 0.86 + 0.14 * Math.sin((frame - P3_START) * 0.06);

  const field = (a: number, cx = 760, cy = 430): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 980px 680px at ${cx}px ${cy}px, rgba(21,40,48,${(0.98 * a).toFixed(3)}) 0%, rgba(11,24,31,0.92) 48%, rgba(4,12,16,1) 100%)`,
  });
  const paper: React.CSSProperties = { borderRadius: 2, boxShadow: "inset 0 0 0 1px rgba(23,32,31,0.08)" };

  return (
    <Frame bg="#040c10">
      {/* 1 · the text, Thursday evening */}
      {frame < P1_END && (
        <div style={{ position: "absolute", inset: 0, opacity: p1Out }}>
          <div style={field(lampA)} />
          <div style={{ position: "absolute", left: 96, top: 84, opacity: ramp(frame, 0, 10, OUT) }}>
            <Mono color={COLOR.onMarineSoft}>Thursday · {MESSAGE.text.when.replace("Thu ", "")}</Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: ramp(frame, 0, 10, OUT), textAlign: "right" }}>
            <Mono color={COLOR.onMarineSoft}>One of {RELATIONSHIPS.permissioned} · said yes to hearing from Joe's</Mono>
          </div>
          {/* the message: a sheet of paper that becomes the Offer */}
          <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, opacity: notify, transform: `translateY(${(1 - notify) * 14}px)`, ...paper, background: open < 0.5 ? "#edeae3" : "#f6f3ec", borderRadius: 2 + 20 * open, overflow: "hidden", boxShadow: `0 ${40 * open}px ${90 * open}px -40px rgba(0,0,0,0.6)` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: msg.w, padding: "26px 34px", color: COLOR.ink, opacity: 1 - Math.min(1, open * 2) }}>
              <Mono color={COLOR.inkFaint} size={13}>
                {MESSAGE.text.from}
              </Mono>
              <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3, marginTop: 16 }}>{MESSAGE.text.body}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{MESSAGE.text.detail.replace(/ · /g, ", ").replace("First", "first")}.</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 500, letterSpacing: "-0.01em", marginTop: 18, display: "inline-block", borderBottom: `1.5px solid ${COLOR.ink}`, paddingBottom: 2 }}>{MESSAGE.text.link}</div>
            </div>
            <div style={{ position: "absolute", left: 0, top: 0, opacity: Math.max(0, (open - 0.5) * 2), transform: `scale(${box.w / SLAB_W})`, transformOrigin: "0 0" }}>
              <OfferSlab reveal={{ head: 1, body: 1, rows: 1, permission: 1, yes: 0, save: 1 }} style={{ boxShadow: "none" }} />
            </div>
          </div>
          <Touch x={msg.x + 34 + 60} y={msg.y + 26 + 16 + 44 + 31 + 18 + 12 + 30} t={touch} dark />
          <div style={{ position: "absolute", left: 96, bottom: 84, opacity: ramp(frame, 96, 12, OUT) }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              {MESSAGE.text.who} · by text
            </Mono>
          </div>
        </div>
      )}

      {/* 2 · the café, Friday morning */}
      {frame >= P2_START && frame < P3_START + 6 && (
        <>
          <div style={{ position: "absolute", inset: 0, filter: worldBlur > 0.2 ? `blur(${worldBlur}px)` : undefined, opacity: cIn * (1 - wash) }}>
            <Plate src={PLATES.hero3b} from={P2_START} frames={P2_FRAMES} />
            <div style={{ position: "absolute", inset: 0, background: COLOR.marine, opacity: 1 - worldDim }} />
          </div>
          {frame < P3_START && <Grain opacity={0.06 * (1 - lift)} />}
          <div style={{ position: "absolute", left: 96, top: 84, opacity: cIn * (1 - lift) }}>
            <Mono color={COLOR.onMarineSoft}>Café · 122 Main St · {String(TB.meta.clock ?? "Friday · 7:04 AM")}</Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: cIn * (1 - lift), textAlign: "right" }}>
            <Mono color={COLOR.onMarineSoft}>Uptick screen · {MESSAGE.screen.where} from Joe's</Mono>
          </div>
          {arriveFlash > 0 && (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transform: homographyMatrix3d(1600, 900, screenQuad), transformOrigin: "0 0", background: COLOR.mint, opacity: 0.35 * arriveFlash, mixBlendMode: "screen" }} />
          )}
          {scanLine > 0 && (
            <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
              <line x1={person.x} y1={person.y} x2={person.x + (quad[2].x - person.x) * scanLine} y2={person.y + (quad[2].y - person.y) * scanLine} stroke={COLOR.mint} strokeWidth={1.5} opacity={0.9} />
            </svg>
          )}
          {lift > 0 && frame < P3_START && <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transform: homographyMatrix3d(1600, 900, screenQuad), transformOrigin: "0 0", background: "#0b1c22", opacity: Math.min(1, lift * 2) * (1 - wash) }} />}
          <div style={{ position: "absolute", left: 96, bottom: 84, opacity: ramp(frame, P2_START + NOTICE, 12, OUT) * (1 - lift) }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              New relationship · someone who has never been to Joe's
            </Mono>
          </div>
        </>
      )}
      {/* the field under the converged offer */}
      {frame >= P3_START - 16 && <div style={{ ...field(lampB), opacity: wash }} />}

      {/* the content: on the glass, off it, the Offer */}
      {lift > 0 && frame <= P3_START + 84 && (
        <>
          {toSlab < 1 && (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transform: faceMatrix, transformOrigin: "0 0", opacity: 1 - toSlab, overflow: "hidden", borderRadius: 6 }}>
              <ScreenFaceContent state="cafe-joes" />
            </div>
          )}
          <div style={{ position: "absolute", left: 0, top: 0, width: SLAB_W, height: SLAB_H, transform: slabMatrix, transformOrigin: "0 0", opacity: toSlab }}>
            <OfferSlab reveal={{ head: 1, body: rows, rows, permission, yes, save: permission }} style={{ boxShadow: `0 ${40 * toSlab}px ${90 * toSlab}px -40px rgba(0,0,0,0.6)` }} />
          </div>
        </>
      )}
      {/* 3 · the text's Offer arrives at the same object */}
      {p3 && converge > 0 && converge < 1 && (
        <div style={{ position: "absolute", left: ghostX, top: 540, transform: `translate(-50%, -50%) scale(${ghostS})`, opacity: ghostO, width: SLAB_W, height: SLAB_H }}>
          <OfferSlab reveal={{ head: 1, body: 1, rows: 1, permission: 1, yes: 0, save: 1 }} />
        </div>
      )}
      {p3 && (
        <>
          <Touch x={CENTRE.x + SLAB_W - 40 - 60} y={CENTRE.y + 40 + 55 + 16 + 32 + 30 + 3 * 60 + 30 + 12} t={yesTouch} dark />
          <div style={{ position: "absolute", left: 96, bottom: 84, opacity: captions * (1 - fold) }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              From the text · Thursday {MESSAGE.text.when.replace("Thu ", "")}
            </Mono>
          </div>
          <div style={{ position: "absolute", right: 96, bottom: 84, opacity: captions * (1 - fold), textAlign: "right" }}>
            <Mono color={COLOR.onMarineFaint} size={14}>
              From the screen · {MESSAGE.screen.when}
            </Mono>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, textAlign: "center", opacity: same * (1 - fold) }}>
            <Mono color={COLOR.onMarine} size={16}>
              The same offer · {OFFER.fine}
            </Mono>
          </div>
        </>
      )}
      {/* the Offer folds to the head of the thread: the stranger has a question */}
      {fold > 0 && (
        <div style={{ position: "absolute", left: foldBox.x, top: foldBox.y, width: foldBox.w, height: foldBox.h, overflow: "hidden", ...paper, background: fold < 0.5 ? "#f6f3ec" : "#edeae3", borderRadius: 22 - 20 * fold, boxShadow: `0 ${40 * (1 - fold)}px ${90 * (1 - fold)}px -40px rgba(0,0,0,0.6)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - Math.min(1, fold * 2), transform: `scale(${foldBox.w / SLAB_W})`, transformOrigin: "0 0" }}>
            <OfferSlab reveal={{ head: 1, body: 1, rows: 1, permission: 1, yes: 1, save: 1 }} style={{ boxShadow: "none" }} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: THREAD_PLANE.w, padding: "26px 34px", color: COLOR.ink, opacity: Math.max(0, (fold - 0.5) * 2) }}>
            <div style={{ fontFamily: FONT.sans, fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{OFFER.headline}</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: COLOR.inkSoft, marginTop: 8 }}>{OFFER.line}</div>
          </div>
        </div>
      )}
    </Frame>
  );
};
