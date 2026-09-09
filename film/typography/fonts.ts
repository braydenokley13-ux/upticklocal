import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Geist, Geist Mono and Newsreader italic, loaded from the OFL files under
 * public/film-rd/fonts. Registered under film-specific family names so the
 * film never silently inherits a page font. `await` is never needed by
 * callers: the render is held with delayRender until the faces resolve.
 */
const FACES: [family: string, file: string, weight: number, style: "normal" | "italic"][] = [
  ["Geist Film", "geist-sans-latin-200-normal.woff2", 200, "normal"],
  ["Geist Film", "geist-sans-latin-300-normal.woff2", 300, "normal"],
  ["Geist Film", "geist-sans-latin-400-normal.woff2", 400, "normal"],
  ["Geist Film", "geist-sans-latin-500-normal.woff2", 500, "normal"],
  ["Geist Mono Film", "geist-mono-latin-400-normal.woff2", 400, "normal"],
  ["Geist Mono Film", "geist-mono-latin-500-normal.woff2", 500, "normal"],
  ["Newsreader Film", "newsreader-latin-300-italic.woff2", 300, "italic"],
  ["Newsreader Film", "newsreader-latin-400-italic.woff2", 400, "italic"],
];

let loading: Promise<void> | null = null;

export function loadFilmFonts(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (loading) return loading;
  loading = Promise.all(
    FACES.map(async ([family, file, weight, style]) => {
      const face = new FontFace(family, `url(${staticFile(`film-rd/fonts/${file}`)})`, { weight: String(weight), style, display: "block" });
      const loaded = await face.load();
      document.fonts.add(loaded);
    })
  ).then(() => undefined);
  return loading;
}

/** Call once at the top of a composition. */
export function useFilmFonts() {
  if (typeof document === "undefined") return;
  // One handle per module instance is enough: continueRender is idempotent per handle.
  ensureHeld();
}

let handle: number | null = null;
function ensureHeld() {
  if (handle !== null) return;
  handle = delayRender("film fonts");
  loadFilmFonts()
    .catch(() => undefined)
    .finally(() => {
      if (handle !== null) continueRender(handle);
    });
}
