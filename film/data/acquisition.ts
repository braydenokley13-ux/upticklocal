import fixture from "./acquisition.json";

/** Acquisition-only fixture; the archived R&D compositions still use joes.ts. */
export const ACQUISITION = fixture;
export const ACQUISITION_TOTALS = fixture.sources.reduce(
  (sum, source) => ({
    claims: sum.claims + source.claims,
    firstVisits: sum.firstVisits + source.firstVisits,
    optIns: sum.optIns + source.optIns,
    returns: sum.returns + source.returns,
  }),
  { claims: 0, firstVisits: 0, optIns: 0, returns: 0 },
);
export const ACQUISITION_FRAMES = fixture.acts[fixture.acts.length - 1].end;
