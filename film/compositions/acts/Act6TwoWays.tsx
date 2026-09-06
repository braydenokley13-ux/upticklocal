import { useCurrentFrame } from "remotion";
import trackCafe from "../../../blender/exports/cafe.json";
import trackScan from "../../../blender/exports/scan.json";
import { homographyMatrix3d, lerpQuad, rectQuad, type Quad } from "../../block/homography";
import { PLATES, Plate, quadAt, type TrackData } from "../../block/plate";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { PHONE_H, PHONE_W, PhoneOffer, PhoneText } from "../../primitives/PhoneScreen";
import { ScreenFaceContent } from "../../primitives/ScreenContent";
import { HEIGHT, WIDTH } from "../../tokens";

const TC = trackCafe as unknown as TrackData;
const TS = trackScan as unknown as TrackData;

/**
 * ACT VI · TWO WAYS IN
 *
 * The offer reaches two people who have nothing to do with each other, and
 * the film says so by rhyme rather than by caption.
 *
 *   WORLD 3   Thursday night. A text lands on a phone that is the whole
 *             frame. It opens. It is the offer.
 *   crossing  That screen goes to another screen: the rectangle travels and
 *             lands as the panel on the café's counter, and the café is
 *             around it before it gets there.
 *   WORLD 2   The café at 7:04. Joe's morning is on a physical panel, on a
 *             physical counter, with a person working behind it.
 *   WORLD 2   A stranger holds their phone to it. The glass turns square to
 *             us and the offer is on it.
 *   crossing  We scale into that glass — the same glass, tracked — and it
 *             opens back out into the relationship at full resolution.
 *   WORLD 3   The offer, saved.
 *
 * Nothing floats in the physical world here. Between the two crossings the
 * only Uptick surface on screen is a panel or a handset that Blender lit.
 */

const T = {
  textIn: 4,
  textPress: 32,
  textOpen: 40,
  toCafe: 62, // the rectangle leaves the relationship
  cafeAt: 76,
  scanAt: 102, // the café panel runs its whole plate, then we are at the counter
  glassAt: 128, // the DOM offer takes over the tracked glass
  toPhone: 136, // and opens out
  phoneAt: 156,
  save: 196,
  saved: 208,
  end: 232,
} as const;

export const ACT6_FRAMES = T.end;

const CAFE_LEN = Math.min(T.scanAt - T.cafeAt, TC.frames); // the plate is 26; the window holds its last frame
const SCAN_LEN = TS.frames; // 46

/** World 3: the handset is the frame. No device chrome — the screen is the object. */
const PH = { h: Math.round(HEIGHT * 0.94), get w() { return Math.round((this.h * PHONE_W) / PHONE_H); } };
const PHONE_RECT = rectQuad((WIDTH - PH.w) / 2, (HEIGHT - PH.h) / 2, PH.w, PH.h);

function quad(data: TrackData, prefix: string, f: number): Quad {
  const q = quadAt(data, prefix, f);
  return [
    [q[0].x, q[0].y],
    [q[1].x, q[1].y],
    [q[2].x, q[2].y],
    [q[3].x, q[3].y],
  ];
}

/** The ground the relationship happens on: warm, deep, and not a UI. */
function Field({ opacity, warm = 0 }: { opacity: number; warm?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        background: `radial-gradient(ellipse 1200px 900px at 50% ${46 + warm * 6}%, rgba(26,${38 + warm * 8},44,1) 0%, rgba(11,22,28,1) 52%, rgba(4,10,13,1) 100%)`,
      }}
    />
  );
}

export const Act6TwoWays = () => {
  const frame = useCurrentFrame();

  // ---------------------------------------------------------------- world 3 · the text
  const textIn = ramp(frame, T.textIn, 16, OUT);
  const press = ramp(frame, T.textPress, 5, OUT) * (1 - ramp(frame, T.textPress + 5, 5, IN));
  const open = ramp(frame, T.textOpen, 22, PLANE);

  // ---------------------------------------------------------------- crossing · to the panel
  const cross = ramp(frame, T.toCafe, 20, PLANE);
  const panelQuad = quad(TC, "screen_cafe", 0);
  const travelling = lerpQuad(PHONE_RECT, panelQuad, cross);
  const handOver = ramp(frame, T.cafeAt - 2, 8, PLANE); // the DOM lets the plate's own panel carry it

  // ---------------------------------------------------------------- world 2
  const cafeFrame = Math.max(0, Math.min(CAFE_LEN - 1, frame - T.cafeAt));
  const scanFrame = Math.max(0, Math.min(SCAN_LEN - 1, frame - T.scanAt));

  // ---------------------------------------------------------------- crossing · into the glass
  const takeGlass = ramp(frame, T.glassAt, 6, OUT);
  const outward = ramp(frame, T.toPhone, T.phoneAt - T.toPhone, PLANE);
  const glassQuad = quad(TS, "glass", scanFrame);
  const opening = lerpQuad(glassQuad, PHONE_RECT, outward);
  const plateOut = 1 - ramp(frame, T.toPhone + 4, 14, PLANE);

  // ---------------------------------------------------------------- world 3 · the offer, saved
  const savePress = ramp(frame, T.save, 5, OUT) * (1 - ramp(frame, T.save + 5, 5, IN));
  const saved = ramp(frame, T.saved, 8, PLANE);
  const rows = ramp(frame, T.phoneAt - 14, 26, OUT);

  const inWorld3Late = frame >= T.toPhone;
  const inWorld3Early = frame < T.cafeAt;

  return (
    <Frame bg="#040a0d">
      {/* the relationship, at both ends of the act */}
      {inWorld3Early && <Field opacity={1 - cross * 0.9} />}
      {inWorld3Late && <Field opacity={ramp(frame, T.toPhone, 12, PLANE)} warm={1} />}

      {/* the physical world, under everything */}
      {frame >= T.cafeAt - 16 && frame < T.scanAt && (
        <div style={{ position: "absolute", inset: 0, opacity: ramp(frame, T.cafeAt - 16, 14, PLANE) }}>
          <Plate src={PLATES.cafe} from={T.cafeAt} frames={CAFE_LEN} />
        </div>
      )}
      {frame >= T.scanAt && frame < T.toPhone + 18 && (
        <div style={{ position: "absolute", inset: 0, opacity: plateOut }}>
          <Plate src={PLATES.scan} from={T.scanAt} frames={SCAN_LEN} />
        </div>
      )}

      {/* 1 · the text, and the rectangle that carries it out of the relationship */}
      {frame < T.cafeAt + 10 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, transformOrigin: "0 0", transform: homographyMatrix3d(PHONE_W, PHONE_H, travelling), opacity: textIn * (1 - handOver), borderRadius: 0, overflow: "hidden", boxShadow: cross < 0.5 ? "0 60px 140px -50px rgba(0,0,0,0.85)" : "none" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - Math.min(1, open * 1.6) }}>
            <PhoneText reveal={textIn} press={press} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: Math.max(0, open * 1.6 - 0.6) }}>
            <PhoneOffer reveal={open} />
          </div>
        </div>
      )}
      {/* the same rectangle, arriving as the café's panel: the content changes with the surface */}
      {cross > 0.05 && frame < T.cafeAt + 10 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 900, transformOrigin: "0 0", transform: homographyMatrix3d(1600, 900, travelling), opacity: Math.max(0, cross * 1.8 - 0.8) * (1 - handOver), overflow: "hidden" }}>
          <ScreenFaceContent state="cafe-joes" />
        </div>
      )}

      {/* 2 · the crossing back: the glass we have been looking at becomes the frame */}
      {frame >= T.glassAt && (
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, transformOrigin: "0 0", transform: homographyMatrix3d(PHONE_W, PHONE_H, opening), opacity: takeGlass, overflow: "hidden" }}>
          <PhoneOffer reveal={outward > 0.6 ? rows : 1} savePress={savePress} saved={saved} />
        </div>
      )}

      <Grain opacity={frame >= T.cafeAt && frame < T.toPhone + 10 ? 0.05 : 0.035} />
    </Frame>
  );
};
