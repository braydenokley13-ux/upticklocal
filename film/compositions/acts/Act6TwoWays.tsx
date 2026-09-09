import { useCurrentFrame } from "remotion";
import trackCafe from "../../../blender/exports/cafe.json";
import trackScan from "../../../blender/exports/scan.json";
import { homographyMatrix3d, lerpQuad, rectQuad, type Quad } from "../../block/homography";
import { PLATES, Plate, quadAt, type TrackData } from "../../block/plate";
import { IN, OUT, PLANE, ramp } from "../../motion";
import { Frame } from "../../primitives/Frame";
import { Grain } from "../../primitives/Grain";
import { PHONE_H, PHONE_W, PhoneOffer, PhoneText } from "../../primitives/PhoneScreen";
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
 *   crossing  That screen goes to another screen. The rectangle travels, and
 *             finishes its travel on the frame the film cuts to the café — so
 *             it lands on the panel's own quad at the instant the room arrives
 *             around it, and what it says changes at the cut, where a change of
 *             content belongs. From that frame the panel is the plate's: lit by
 *             the room, standing on a foot, with a phone rising in front of it.
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
  phoneAt: 176,
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
  // The rectangle finishes its travel on the frame the film cuts to the cafe, so it lands on
  // the panel's own quad at the same instant the room arrives around it. The content changes
  // there — at the cut, where a change of content belongs — and from that frame the panel is
  // the plate's own, lit by the room. Nothing dissolves, and nothing is laid over the panel.
  const cross = ramp(frame, T.toCafe, T.cafeAt - T.toCafe, PLANE); // 62 → 76
  const panelQuad = quad(TC, "screen_cafe", 0);
  const travelling = lerpQuad(PHONE_RECT, panelQuad, cross);

  // ---------------------------------------------------------------- world 2
  const cafeFrame = Math.max(0, Math.min(CAFE_LEN - 1, frame - T.cafeAt));
  const scanFrame = Math.max(0, Math.min(SCAN_LEN - 1, frame - T.scanAt));

  // ---------------------------------------------------------------- crossing · into the glass
  const takeGlass = ramp(frame, T.glassAt, 6, OUT);
  const outward = ramp(frame, T.toPhone, T.phoneAt - T.toPhone, PLANE);
  const glassQuad = quad(TS, "glass", scanFrame);
  const opening = lerpQuad(glassQuad, PHONE_RECT, outward);
  // The scan plate is 46 frames and ends at T.scanAt + SCAN_LEN; the café has to be gone by
  // then or it does not leave, it vanishes. It goes out over the first half of the opening-
  // out, while the handset still fills most of the frame and its going is barely felt.
  const SCAN_END = T.scanAt + SCAN_LEN;
  const plateOut = 1 - ramp(frame, T.toPhone, SCAN_END - T.toPhone, PLANE);

  // ---------------------------------------------------------------- world 3 · the offer, saved
  const savePress = ramp(frame, T.save, 5, OUT) * (1 - ramp(frame, T.save + 5, 5, IN));
  const saved = ramp(frame, T.saved, 8, PLANE);

  const inWorld3Late = frame >= T.toPhone;
  const inWorld3Early = frame < T.cafeAt;

  return (
    <Frame bg="#040a0d">
      {/* the relationship, at both ends of the act */}
      {inWorld3Early && <Field opacity={1 - cross * 0.45} />}
      {inWorld3Late && <Field opacity={ramp(frame, T.toPhone, SCAN_END - T.toPhone + 2, PLANE)} warm={1} />}

      {/* the physical world, under everything */}
      {frame >= T.cafeAt && frame < T.scanAt && <Plate src={PLATES.cafe} from={T.cafeAt} frames={CAFE_LEN} />}
      {frame >= T.scanAt && frame < SCAN_END && (
        <div style={{ position: "absolute", inset: 0, opacity: plateOut }}>
          <Plate src={PLATES.scan} from={T.scanAt} frames={SCAN_LEN} />
        </div>
      )}

      {/* 1 · the text, and the rectangle that carries it out of the relationship */}
      {frame < T.cafeAt && (
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, transformOrigin: "0 0", transform: homographyMatrix3d(PHONE_W, PHONE_H, travelling), opacity: textIn, borderRadius: 0, overflow: "hidden", background: "#080d0c", boxShadow: cross < 0.5 ? "0 60px 140px -50px rgba(0,0,0,0.85)" : "none" }}>
          <div style={{ position: "absolute", inset: 0, opacity: (1 - Math.min(1, open * 1.6)) * (1 - 0.35 * cross) }}>
            <PhoneText reveal={textIn} press={press} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: Math.max(0, open * 1.6 - 0.6) * (1 - 0.35 * cross) }}>
            <PhoneOffer reveal={open} />
          </div>
        </div>
      )}

      {/* 2 · the crossing back: the glass we have been looking at becomes the frame */}
      {frame >= T.glassAt && (
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, transformOrigin: "0 0", transform: homographyMatrix3d(PHONE_W, PHONE_H, opening), opacity: takeGlass, overflow: "hidden" }}>
          <PhoneOffer reveal={1} savePress={savePress} saved={saved} />
        </div>
      )}

      <Grain opacity={frame >= T.cafeAt && frame < T.toPhone + 10 ? 0.05 : 0.035} />
    </Frame>
  );
};
