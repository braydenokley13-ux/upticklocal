import { useCurrentFrame } from "remotion";
import tracks from "../../blender/exports/hero5.json";
import { PLATES, Plate, trackAt, type TrackData } from "../block/plate";
import { BLOCK, BUSINESS, PASS, RESULT } from "../data/joes";
import { IN, OUT, PLANE, ramp, sec, typeset } from "../motion";
import { Frame } from "../primitives/Frame";
import { PassSlab, SLAB_H, SLAB_W } from "../primitives/OfferSlab";
import { Line, Mono, Numeral, Words } from "../primitives/Type";
import { COLOR, HEIGHT, WIDTH } from "../tokens";

const T = tracks as unknown as TrackData;

/**
 * HERO 5 · REDEEMED → PHYSICAL RETURN → 21
 *
 * 0–2.5 s   The Pass at Joe's counter. One mint sweep. Redeemed.
 * 2.5 s     The redeemed event compresses to a mint point, drops through
 *           Joe's door and becomes a person inside: amber.
 * 2.5–10 s  Friday morning under the canopy. People arrive from the street,
 *           the pumps and the café side; each crosses the threshold; the count
 *           steps 1 · 4 · 9 · 14 · 21 as the clock runs 07:42 → 09:50.
 * 10–14 s   The world's light becomes the page. 21 came through the door.
 */
const PLATE_START = 30;
const PLATE_FRAMES = T.frames; // 216
const THRESHOLDS = ((T.meta.thresholds as number[]) ?? [30, 66, 100, 130, 156]).map((f) => f + PLATE_START);
const RESULT_START = PLATE_START + 190; // 220
const END = 336;

const CLOCK_FROM = 7 * 60 + 42;
const CLOCK_TO = 9 * 60 + 50;

function clockAt(frame: number) {
  const t = Math.max(0, Math.min(1, (frame - THRESHOLDS[0]) / (THRESHOLDS[THRESHOLDS.length - 1] - THRESHOLDS[0])));
  const m = Math.round(CLOCK_FROM + (CLOCK_TO - CLOCK_FROM) * t);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export const Hero5 = () => {
  const frame = useCurrentFrame();
  const pf = Math.max(0, Math.min(PLATE_FRAMES - 1, frame - PLATE_START));
  const door = trackAt(T, "door_joes", pf);

  // ---------------------------------------------------------------- redemption
  const passIn = ramp(frame, 0, 12, OUT);
  const sweep = ramp(frame, 18, 14, PLANE);
  const redeemed = ramp(frame, 30, 4, OUT);
  const worldIn = ramp(frame, PLATE_START, 22, PLANE); // the forecourt appears behind the pass
  const compress = ramp(frame, 46, 14, IN); // the slab compresses to a point
  const dropT = ramp(frame, 58, 12, PLANE); // the point drops through the door
  const passX = 960 - SLAB_W / 2;
  const passY = 540 - SLAB_H / 2;
  const pointX = 960 + (door.x - 960) * dropT;
  const pointY = 540 + (door.y - 540) * dropT;
  const pointAmber = ramp(frame, 68, 6, OUT); // mint turns amber on the threshold
  const worldClear = ramp(frame, 62, 22, PLANE);

  // ---------------------------------------------------------------- return · build
  const stepIndex = THRESHOLDS.filter((f) => frame >= f).length; // 0..5
  const count = stepIndex === 0 ? 0 : RESULT.steps[stepIndex - 1];
  const lastStep = stepIndex > 0 ? THRESHOLDS[stepIndex - 1] : -100;
  const stepPop = 1 - ramp(frame, lastStep, 8, OUT); // a brief settle on each step
  const flash = stepIndex > 0 ? Math.max(0, 1 - (frame - lastStep) / 12) : 0;
  const countIn = ramp(frame, THRESHOLDS[0], 10, OUT);
  const headerIn = ramp(frame, PLATE_START + 28, 12, OUT);
  const split = ramp(frame, THRESHOLDS[4] + 14, 16, OUT);

  // ---------------------------------------------------------------- result · the page returns
  const toPage = ramp(frame, RESULT_START, 40, PLANE);
  const residue = 1 - ramp(frame, RESULT_START + 34, 40, IN); // warm light lingers on the page
  const grow = ramp(frame, RESULT_START - 6, 44, PLANE);
  // the opening 3's position (Hero 1 lays the number out around the tracked sidewalk point)
  const bigX = 0.39 * WIDTH;
  const bigY = 0.42 * HEIGHT;
  const countX = 96 + (bigX - 96) * grow;
  const countY = 300 + (bigY - 300) * grow;
  const countSize = 380 + (840 - 380) * grow;
  const wordsAt = typeset(frame, RESULT_START + 46, RESULT.line.split(" ").length, 3);
  const secondLine = ramp(frame, RESULT_START + 74, 16, OUT);
  const headerPage = ramp(frame, RESULT_START + 30, 16, OUT);
  const doorGlowX = door.x;
  const doorGlowY = door.y;

  return (
    <Frame bg={COLOR.marine}>
      {/* the world */}
      <div style={{ position: "absolute", inset: 0, opacity: worldIn * (1 - toPage), filter: worldClear < 1 ? `blur(${10 * (1 - worldClear)}px)` : undefined }}>
        <Plate src={PLATES.hero5} from={PLATE_START} frames={PLATE_FRAMES} />
        <div style={{ position: "absolute", inset: 0, background: COLOR.marine, opacity: 0.55 * (1 - worldClear) }} />
      </div>

      {/* the pass, at the counter */}
      {frame < 62 && (
        <div style={{ position: "absolute", left: passX, top: passY, opacity: passIn * (1 - compress), transform: `scale(${1 - 0.9 * compress}) `, transformOrigin: "50% 50%" }}>
          <PassSlab redeemed={redeemed} sweep={sweep} />
        </div>
      )}
      {frame < 40 && (
        <div style={{ position: "absolute", left: 96, top: 84, opacity: passIn * (1 - compress) }}>
          <Mono color={COLOR.onMarineSoft}>
            {BUSINESS.name} · counter · {PASS.redeemedAt}
          </Mono>
        </div>
      )}
      {frame < 40 && (
        <div style={{ position: "absolute", right: 96, top: 84, opacity: redeemed * (1 - compress), textAlign: "right" }}>
          <Mono color={COLOR.mint}>Redeemed · {PASS.ordinal}</Mono>
        </div>
      )}
      {/* the point: mint, then amber on the threshold */}
      {compress > 0.6 && frame < 78 && (
        <div style={{ position: "absolute", left: pointX - 7, top: pointY - 7, width: 14, height: 14, borderRadius: 7, background: pointAmber > 0.5 ? COLOR.amber : COLOR.mint, boxShadow: `0 0 ${24 + 20 * dropT}px 6px ${pointAmber > 0.5 ? "rgba(226,162,79,0.5)" : "rgba(95,214,187,0.5)"}`, opacity: 1 - ramp(frame, 72, 6, IN) }} />
      )}

      {/* header · the street and the clock */}
      {frame >= PLATE_START + 20 && frame < RESULT_START + 30 && (
        <>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: headerIn * (1 - toPage) }}>
            <Mono color={COLOR.onMarineSoft}>
              {BLOCK.street} · Friday · {clockAt(frame)}
            </Mono>
          </div>
          <div style={{ position: "absolute", right: 96, top: 84, opacity: headerIn * (1 - toPage), display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOR.mint, display: "inline-block" }} />
            <Mono color={COLOR.onMarineSoft}>Morning Coffee Drop · live</Mono>
          </div>
        </>
      )}

      {/* the count, in the frame-01 position */}
      {stepIndex > 0 && (
        <div style={{ position: "absolute", left: countX, top: countY, transform: grow > 0 ? "translate(-50%, -50%)" : `translateY(${stepPop * 6}px)`, opacity: countIn }}>
          <Numeral value={count} size={countSize} color={grow > 0.5 ? COLOR.ink : COLOR.onMarine} weight={300} />
        </div>
      )}
      {stepIndex > 0 && grow === 0 && (
        <div style={{ position: "absolute", left: 100, top: 300 + 400 * 0.82 + 10, opacity: countIn }}>
          <Line size={30} color={COLOR.onMarineSoft}>
            through the door so far.
          </Line>
        </div>
      )}
      {/* +1 at the door */}
      {flash > 0 && grow === 0 && (
        <div style={{ position: "absolute", left: door.x + 14, top: door.y - 70 - (1 - flash) * 20, opacity: flash }}>
          <Mono color={COLOR.mint} size={22}>
            +1
          </Mono>
        </div>
      )}
      {flash > 0 && grow === 0 && <div style={{ position: "absolute", left: door.x - 3, top: door.y - 3, width: 6, height: 6, borderRadius: 3, background: COLOR.mint, opacity: flash, boxShadow: `0 0 18px 4px rgba(95,214,187,${0.5 * flash})` }} />}
      {/* the two paths, kept honest once 21 has landed */}
      {split > 0 && grow < 0.5 && (
        <div style={{ position: "absolute", left: 100, top: 300 + 400 * 0.82 + 10, opacity: split * (1 - grow * 2), display: "flex", gap: 40 }}>
          <Mono color={COLOR.onMarineSoft} size={16}>
            {RESULT.returned} returned
          </Mono>
          <Mono color={COLOR.onMarineSoft} size={16}>
            {RESULT.newCustomers} new · from the screens
          </Mono>
        </div>
      )}

      {/* the page returns, with residue */}
      <div style={{ position: "absolute", inset: 0, background: COLOR.canvas, opacity: toPage, pointerEvents: "none" }} />
      {toPage > 0 && residue > 0 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: toPage * residue, background: `radial-gradient(ellipse 520px 360px at ${doorGlowX}px ${doorGlowY}px, rgba(226,162,79,0.34) 0%, rgba(226,162,79,0.12) 40%, rgba(226,162,79,0) 72%)` }} />
      )}
      {frame >= RESULT_START && (
        <>
          <div style={{ position: "absolute", left: 96, top: 84, opacity: headerPage }}>
            <Mono color={COLOR.inkFaint}>
              {BUSINESS.name} · {BUSINESS.address}
            </Mono>
            <Mono color={COLOR.inkFaint} style={{ marginTop: 14 }}>
              {RESULT.when} · {RESULT.window}
            </Mono>
          </div>
          <div style={{ position: "absolute", left: bigX - 20, top: bigY + 0.4 * 840 + 20, width: 900, opacity: grow }}>
            <Line size={40} color={COLOR.inkSoft}>
              <Words text={RESULT.line} visible={wordsAt} />
            </Line>
            <Line size={40} color={COLOR.inkSoft} style={{ marginTop: 18, opacity: secondLine }}>
              {RESULT.returned} {RESULT.returnedLine} {RESULT.newCustomers} {RESULT.newLine}
            </Line>
          </div>
          <div style={{ position: "absolute", left: 96, bottom: 84, opacity: headerPage * 0.8 }}>
            <Mono color={COLOR.inkFaint} size={16}>
              Illustrative · example business
            </Mono>
          </div>
        </>
      )}
    </Frame>
  );
};

export const HERO5_FRAMES = END;
export const hero5Sec = sec;
