/**
 * Which plate lane the edit reads.
 *
 * This is a source file and not an environment variable, deliberately. Remotion caches its
 * webpack bundle, and `process.env.REMOTION_*` is inlined at bundle time — so whichever
 * invocation built the bundle first silently decided the lane for every later invocation that
 * reused it. `scripts/bake-screens.sh` runs Remotion with no lane set, and a full-cut render
 * after it inherited "final" while being asked for "proxy", then failed on a plate that had not
 * been rendered yet. A silent wrong-lane render is worse than a failed one: the proxy lane
 * exists to be trusted.
 *
 * As source, the lane changes the bundle's own hash, so the two lanes can never share a cache.
 * Committed as "final"; `scripts/film-lane.sh proxy` flips it and restores it.
 */
export const PLATE_LANE: "final" | "proxy" = "final";
