import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFilmFonts } from "./fonts";

/**
 * Measures text with the film fonts, once they are loaded. Returns null until
 * the measurement exists; the render is held until then, so a composition
 * that lays words out by measurement never captures a frame with guesses.
 *
 * `font` is a CSS font shorthand ("300 40px 'Geist Film'"); `letterSpacing`
 * is the row's tracking, as CSS ("-0.02em"). The measurement is taken from
 * the DOM with the same style the type is set in, so tracking, kerning and
 * the loaded face all count: a canvas measure ignores the tracking and put
 * the plan's second upright 50 px past "7–10 AM".
 */
export function useTextWidths(texts: string[], font: string, letterSpacing = "-0.02em"): number[] | null {
  const [widths, setWidths] = useState<number[] | null>(null);
  const key = texts.join(" ") + "|" + font + "|" + letterSpacing;
  useEffect(() => {
    let alive = true;
    const handle = delayRender("measure text");
    loadFilmFonts().then(() => {
      if (!alive) return;
      const host = document.createElement("div");
      host.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;white-space:pre;";
      host.style.font = font;
      host.style.letterSpacing = letterSpacing;
      document.body.appendChild(host);
      const out = texts.map((t) => {
        const span = document.createElement("span");
        span.textContent = t;
        host.appendChild(span);
        const w = span.getBoundingClientRect().width;
        host.removeChild(span);
        return w;
      });
      document.body.removeChild(host);
      setWidths(out);
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
