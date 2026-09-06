import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFilmFonts } from "./fonts";

/**
 * Measures text with the film fonts, once they are loaded. Returns null until
 * the measurement exists; the render is held until then, so a composition
 * that lays words out by measurement never captures a frame with guesses.
 */
export function useTextWidths(texts: string[], font: string): number[] | null {
  const [widths, setWidths] = useState<number[] | null>(null);
  const key = texts.join("") + "|" + font;
  useEffect(() => {
    let alive = true;
    const handle = delayRender("measure text");
    loadFilmFonts().then(() => {
      if (!alive) return;
      const c = document.createElement("canvas");
      const g = c.getContext("2d");
      if (!g) {
        continueRender(handle);
        return;
      }
      g.font = font;
      setWidths(texts.map((t) => g.measureText(t).width));
      continueRender(handle);
    });
    return () => {
      alive = false;
      continueRender(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return widths;
}
