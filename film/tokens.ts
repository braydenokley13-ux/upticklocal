/**
 * The film's palette and type scale. Descends from the site's tokens
 * (app/globals.css) but is its own small set: a film has fewer colours than a
 * website, and every one of them has a job.
 */
export const FPS = 24;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const COLOR = {
  /** Direction 1: the warm page. */
  canvas: "#f3f0e9",
  canvasDeep: "#e9e4d9",
  ink: "#17201f",
  inkSoft: "rgba(23, 32, 31, 0.62)",
  inkFaint: "rgba(23, 32, 31, 0.42)",
  inkHair: "rgba(23, 32, 31, 0.16)",
  /** Direction 2 and focused dark: the world at night and the phone. */
  marine: "#0a1820",
  marineDeep: "#06111a",
  onMarine: "#f1ede5",
  onMarineSoft: "rgba(241, 237, 229, 0.66)",
  onMarineFaint: "rgba(241, 237, 229, 0.42)",
  onMarineHair: "rgba(241, 237, 229, 0.16)",
  /** The system speaking. Rationed. */
  mint: "#5fd6bb",
  mintDeep: "#0f6f5c",
  /** A person. Always. */
  amber: "#e2a24f",
  amberDeep: "#a8681f",
} as const;

export const FONT = {
  sans: "'Geist Film', 'Geist', system-ui, sans-serif",
  mono: "'Geist Mono Film', 'Geist Mono', ui-monospace, monospace",
  serif: "'Newsreader Film', 'Newsreader', Georgia, serif",
} as const;

/** Mono annotation: the same voice everywhere. */
export const monoStyle = (color: string = COLOR.inkFaint, size = 22): React.CSSProperties => ({
  fontFamily: FONT.mono,
  fontSize: size,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color,
  lineHeight: 1,
  whiteSpace: "nowrap",
});
