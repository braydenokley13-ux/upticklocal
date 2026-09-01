"use client";

import { useEffect, useState } from "react";

/**
 * Always `false` on the server and on the first client render, then settles to
 * the real answer after mount. Callers use it to decide whether to mount
 * expensive things (the WebGL layer), never to swap layout — layout switches
 * belong in CSS media queries, where they cannot cause a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
