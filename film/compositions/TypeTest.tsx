import type { CSSProperties } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";

/**
 * TypeTest — the typography A/B sheet. Not part of the film: it borrows the
 * film's paper and ink and sets the same four sizes the film actually uses
 * (a 640 px numeral, a 96 px sentence, a 40 px plan, a 24 px mono caption)
 * in one candidate face, so the faces can be compared frame against frame.
 *
 * Deliberately self-contained — its own colours, its own font loading, its
 * own family names — so nothing under test can leak into a shot.
 */

export type TestFace = "geist" | "bricolage-grotesque" | "hanken-grotesk";

const PAPER = "#f3f0e9";
const INK = "#17201f";
const INK_FAINT = "rgba(23, 32, 31, 0.42)";
const INK_HAIR = "rgba(23, 32, 31, 0.16)";

const WEIGHTS = [200, 300, 400, 500] as const;

/** Geist sits with the film's other faces; the candidates sit under test/. */
function faceFile(face: TestFace, weight: number): string {
  return face === "geist"
    ? `film-rd/fonts/geist-sans-latin-${weight}-normal.woff2`
    : `film-rd/fonts/test/${face}/${face}-latin-${weight}-normal.woff2`;
}

const LABEL: Record<TestFace, string> = {
  geist: "GEIST",
  "bricolage-grotesque": "BRICOLAGE GROTESQUE",
  "hanken-grotesk": "HANKEN GROTESK",
};

/**
 * Whichever face is under test is registered as 'Test Film', and the caption's
 * mono (always Geist Mono, the control) as 'Test Mono Film', so the layout
 * below never knows which candidate it is drawing. One still per process, so
 * a single module-level handle is enough.
 */
let held: number | null = null;
let loading: Promise<unknown> | null = null;

function ensureFaceLoaded(face: TestFace) {
  if (typeof document === "undefined" || loading) return;
  held = delayRender(`type test: ${face}`);
  const faces = [
    ...WEIGHTS.map(
      (w) => new FontFace("Test Film", `url(${staticFile(faceFile(face, w))})`, { weight: String(w), display: "block" })
    ),
    new FontFace("Test Mono Film", `url(${staticFile("film-rd/fonts/geist-mono-latin-500-normal.woff2")})`, {
      weight: "500",
      display: "block",
    }),
  ];
  loading = Promise.all(faces.map(async (f) => document.fonts.add(await f.load())))
    .catch(() => undefined)
    .finally(() => {
      if (held !== null) continueRender(held);
    });
}

const SANS = "'Test Film', system-ui, sans-serif";
const MONO = "'Test Mono Film', ui-monospace, monospace";

const mono = (size: number, color: string): CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color,
  lineHeight: 1,
  whiteSpace: "pre",
});

const PLAN_ROWS = [
  "Friday · 7–10 AM · tomorrow",
  "$25+ fill-up · coffee on us",
  "Fuel: Regular, premium or diesel",
  "Existing customers + nearby reach",
  "First 30 · max reward exposure $18.60",
];

export function TypeTest({ face }: { face: TestFace }) {
  ensureFaceLoaded(face);

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, color: INK }}>
      {/* which candidate this sheet is */}
      <div style={{ position: "absolute", right: 96, top: 56, ...mono(20, INK_FAINT) }}>{LABEL[face]}</div>

      {/* 640 px, weight 200 — the film's display numeral */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 16,
          fontFamily: SANS,
          fontWeight: 200,
          fontSize: 640,
          lineHeight: 0.78,
          letterSpacing: "-0.06em",
          fontVariantNumeric: "lining-nums tabular-nums",
        }}
      >
        3
      </div>

      {/* 40 px beside the numeral */}
      <div
        style={{
          position: "absolute",
          left: 500,
          top: 336,
          width: 440,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 40,
          lineHeight: 1.3,
          letterSpacing: "-0.018em",
        }}
      >
        customers between 7 and 10 last Friday.
      </div>

      <div style={{ position: "absolute", left: 96, top: 556, width: 844, height: 1.5, background: INK_HAIR }} />

      {/* the plan */}
      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 60,
          width: 820,
          fontFamily: SANS,
          fontWeight: 300,
          fontSize: 88,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
        }}
      >
        Morning Coffee Drop
      </div>
      <div style={{ position: "absolute", left: 1040, top: 208, width: 820 }}>
        {PLAN_ROWS.map((row) => (
          <div
            key={row}
            style={{
              fontFamily: SANS,
              fontWeight: 300,
              fontSize: 40,
              lineHeight: 1.35,
              letterSpacing: "-0.018em",
              marginBottom: 22,
            }}
          >
            {row}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 1040, top: 606, width: 820, height: 1.5, background: INK_HAIR }} />
      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 636,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 44,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        Approve
      </div>

      {/* 96 px, weight 200 — the typed sentence, one line so the rhythm shows */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 730,
          fontFamily: SANS,
          fontWeight: 200,
          fontSize: 96,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
        }}
      >
        Friday mornings are slow
      </div>

      {/* 24 px mono caption — Geist Mono in every sheet, the control */}
      <div style={{ position: "absolute", left: 96, top: 916, ...mono(24, INK_FAINT) }}>{"3  JOE'S · 07:00–10:00"}</div>
    </AbsoluteFill>
  );
}
