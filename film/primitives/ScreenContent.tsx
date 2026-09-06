import { AbsoluteFill } from "remotion";
import { BUSINESS, MESSAGE } from "../data/joes";
import { COLOR, FONT } from "../tokens";
import { useFilmFonts } from "../typography/fonts";

/**
 * What an Uptick counter unit shows, at the panel's own 16:9. Two states:
 * the host's own content (the café's, first) and Joe's offer arriving on it.
 * Rendered to PNG for the Blender screen texture, and drawn live in the
 * composition so the physical panel and the DOM object are the same picture.
 */
export type ScreenState = "cafe-idle" | "cafe-joes" | "pharmacy-joes" | "joes-own";

const QR = [
  "1111111.1.11.1111111",
  "1.....1.11.1.1.....1",
  "1.111.1..1...1.111.1",
  "1.111.1.1.11.1.111.1",
  "1.111.1..11..1.111.1",
  "1.....1.1..1.1.....1",
  "1111111.1.1.11111111",
  "........11.1........",
  "1.1.11111..1.1.11.11",
  ".11...1.1.11..1..1..",
  "1..1111.1...11.1.11.",
  ".1.1..1.111.1.1..1.1",
  "11.1.11...1.1111.1..",
  "........1.1..1...11.",
  "1111111..111.1.1.1.1",
  "1.....1.1..11..11.11",
  "1.111.1.11.1.1111.1.",
  "1.111.1..1..11.1..11",
  "1.111.1.1.111.1.1.1.",
  "1.....1..11.1..11..1",
  "1111111.1.1.111.1111",
];

export function QrMark({ size, ink = COLOR.onMarine }: { size: number; ink?: string }) {
  const n = QR.length;
  const cell = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {QR.map((row, y) =>
        row.split("").map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.3} height={cell + 0.3} fill={ink} /> : null))
      )}
    </svg>
  );
}

/** Lays out 1600×900; scale it into any panel. */
export function ScreenFaceContent({ state, arrive = 1 }: { state: ScreenState; arrive?: number }) {
  useFilmFonts();
  const base: React.CSSProperties = {
    width: 1600,
    height: 900,
    position: "relative",
    overflow: "hidden",
    fontFamily: FONT.sans,
    color: COLOR.onMarine,
    background: "linear-gradient(135deg, #0f2a2d 0%, #071518 70%, #05100f 100%)",
  };
  const tag: React.CSSProperties = { fontFamily: FONT.mono, fontSize: 30, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500 };
  if (state === "cafe-idle") {
    return (
      <div style={{ ...base, background: "linear-gradient(135deg, #2a2118 0%, #14100c 70%, #0d0a07 100%)" }}>
        <div style={{ position: "absolute", left: 104, top: 120, ...tag, color: COLOR.amber }}>Café · Today</div>
        <div style={{ position: "absolute", left: 100, top: 300, fontSize: 132, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
          Cardamom bun
          <br />
          <span style={{ color: "rgba(241,237,229,0.72)", fontWeight: 400 }}>with any coffee, $4</span>
        </div>
        <div style={{ position: "absolute", left: 104, bottom: 100, display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 500 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: COLOR.mint, display: "inline-block" }} />
          uptick local
        </div>
      </div>
    );
  }
  if (state === "joes-own") {
    return (
      <div style={base}>
        <div style={{ position: "absolute", left: 104, top: 120, ...tag, color: COLOR.amber }}>Joe's · Friday 7–10</div>
        <div style={{ position: "absolute", left: 100, top: 290, fontSize: 140, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.0 }}>
          Coffee's on us.
          <br />
          <span style={{ color: "rgba(241,237,229,0.72)", fontWeight: 400 }}>$25+ fill-up · first 30</span>
        </div>
        <div style={{ position: "absolute", right: 104, bottom: 96 }}>
          <QrMark size={230} />
        </div>
        <div style={{ position: "absolute", left: 104, bottom: 100, display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 500 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: COLOR.mint, display: "inline-block" }} />
          uptick local
        </div>
      </div>
    );
  }
  // Joe's offer on a neighbour's screen
  const o = 1 - Math.min(1, Math.max(0, arrive));
  return (
    <div style={base}>
      <div style={{ position: "absolute", left: 104, top: 120, ...tag, color: COLOR.amber, opacity: 1 - o }}>
        {BUSINESS.name} · {MESSAGE.screen.where}
      </div>
      <div style={{ position: "absolute", left: 100, top: 270, fontSize: 132, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.02, transform: `translateY(${o * 40}px)`, opacity: 1 - o }}>
        {MESSAGE.screen.body}
        <br />
        <span style={{ color: "rgba(241,237,229,0.72)", fontWeight: 400, fontSize: 84 }}>{MESSAGE.screen.detail}</span>
      </div>
      <div style={{ position: "absolute", right: 104, bottom: 96, opacity: 1 - o, display: "flex", alignItems: "flex-end", gap: 40 }}>
        <div style={{ ...tag, color: COLOR.mint, paddingBottom: 14 }}>{MESSAGE.screen.cta}</div>
        <QrMark size={230} />
      </div>
      <div style={{ position: "absolute", left: 104, bottom: 100, display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 500 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: COLOR.mint, display: "inline-block" }} />
        uptick local
      </div>
    </div>
  );
}

export const ScreenStill = ({ state }: { state: ScreenState }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <ScreenFaceContent state={state} />
  </AbsoluteFill>
);
