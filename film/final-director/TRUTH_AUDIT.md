# Truth audit — From Nearby to Yours (locked photographic cut)

Audited against the delivered 52-second master, frame by frame, not against an
earlier treatment. This audit does not certify deployed Uptick functionality or
any advertising claim against external product records; it certifies that
nothing the film puts on screen exceeds what the repository actually holds.

`scripts/final-preflight.py` enforces the mechanical half of this table on every
render: business names, distances, event timestamps, the return price and the
free/paid asymmetry are read from `film/data/acquisition.json` at render time and
the build fails if any of them drift. The judgement half is below.

| Claim or depicted event | Basis | Treatment in the locked cut |
|---|---|---|
| Uptick builds and operates a local customer network | The user's product thesis | Stated twice and only twice — "Uptick operates a network around your station" at 0:03 and "We build the network around your station" at 0:49. No claim that Joe recruits or manages the partner businesses. Real-world product availability is not independently verified here. |
| Main Street Car Wash · 0.7 mi, Quick Lube · 1.2 mi, Ridge Tire · 1.5 mi, named on screen | `film/data/acquisition.json`, `sources[]` | **New claim surface in this cut.** The three names and all three distances are read from the fixture and preflight-checked. They are fictional illustrative businesses; the film does not show a real installation at any of them, and only the car wash is ever pictured. No partner endorsement, signed agreement or exclusivity is implied. |
| The car wash the customer is standing in | One generated photograph, framed three ways | It is the film's only view of any network business. Naming three while picturing one is a deliberate editorial choice, not a claim that all three were photographed. |
| 0.7 mi from the car wash to Joe's | Fixture, source `car-wash` | Illustrative local distance, spoken once as "Seven tenths of a mile." Two road shots compress the trip; this is edited distance, not a real-time drive, a measured travel time, or a navigable map. |
| First coffee at Joe's, free | Hero's first redemption, Tuesday 8:17 AM, `priceCents: 0` | Illustrative acquisition incentive. No margin, redemption rate, or incremental-sales claim. |
| Explicit permission | Separate hero event, Tuesday 8:18 AM, `KEEP ME POSTED` → `YOU'RE IN.` | The offer is shown, then pressed, then accepted, in that order, on screen. Purchase is never portrayed as permission. The line "Joe can reach him again" appears only after acceptance. |
| Friday offer reaches that person | Hero event, Thursday 4:42 PM | Same illustrative customer and handset. No assertion of inferred consent, unlimited messaging, or any channel guarantee. |
| Breakfast sandwich + coffee, $4.99, Friday 6–10 AM | Fixture `returnOffer`; hero paid at 7:36 AM | A modest **paid** return, never a second giveaway — the asymmetry is the point of the ending and preflight fails if the fixture ever makes the first visit paid or the return free. The price is an example, not a real Joe's menu or a merchant-profit calculation. |
| The same person returns | One customer through every shot: navy overshirt, dark trousers, short dark hair, one navy estate | Continuity is carried by the material itself, not asserted. His face is withheld through both doorway entries and revealed only at the Friday counter, so no earlier frame can contradict it. |
| The cashier recognises him | One generated photograph | A small shared smile, read over the copy "And she knew him." This is depicted behaviour in an illustrative scenario, not a testimonial, and no cashier, customer or business in this film is a real person or place. |
| Proof panel: reached → first visit → stayed connected → came back | The four events of the one journey the viewer has just watched | All four timestamps are the hero's own fixture events and are preflight-checked against it. **No aggregate appears anywhere in the film.** The historical five-source totals (18 first visits, 14 opt-ins, 5 returns) remain in the fixture and are deliberately absent from the picture: three depicted sources do not sum to five-source totals. |
| "One customer is one path through the network." | Editorial | Explicitly singular. It generalises the *shape* of the journey, not its results. |
| Higher revenue, ROI, conversion rates, guaranteed results, exclusivity | No supporting records supplied | **Not claimed.** No percentage, forecast, currency total or guarantee appears in the film. |
| Every picture in the film | AI-generated concept photography | Not live-action footage, not a photograph of a real business, not a real customer, and not a photographed installation of the product. Recorded per file in `HIGGSFIELD_MANIFEST.json` and `SOURCE_MEDIA.json`. |

## The persistent qualification

**"Illustrative customer journey. Outcomes are not guaranteed."** is on screen for
all 1,248 frames of the master and all 360 of the teaser, bottom right, 21 px on
a 1920-wide frame, with a shadow so it survives the bright shots. It was checked
at delivery size and at laptop size. It is a qualification, not a cure: nothing
above depends on it to be true.

## What changed from the previous audit

- The film no longer shows any aggregate KPI card. The proof is the journey.
- Three business names and three distances are now spoken on screen, which is a
  new claim surface; it is fixture-backed and machine-checked.
- The customer's face and a cashier now appear, in one frame each. Both are
  generated, both are labelled as such here, and neither is presented as a
  testimonial.
- No Blender output survives into the film, so the CG-specific rows of the
  previous audit no longer apply to the delivered picture.

## Assets and rights

- Pictures: AI-generated (Higgsfield; two doorway inputs from OpenAI image
  generation). Per-file provenance, model, credit charge where recorded, and
  checksum in `HIGGSFIELD_MANIFEST.json`. One file, `coffee-start-v1.png`, has a
  **missing generation record** — it arrived in commit `e4e0165` with no job id,
  model or charge. That gap is recorded rather than reconstructed.
- Sound: original procedural synthesis, `film/audio/synth.py`. No stock
  recording, no third-party music.
- Fonts: Geist, Geist Mono and Newsreader under the SIL OFL, licence files kept
  beside the faces in `public/film-rd/fonts`.
- The Rocketbox character and walk (Microsoft, MIT) and the procedural Blender
  sets remain in the repository with `LICENSE.md` and `SOURCE.json` intact. None
  of it appears in this film.
- The user's supplied storyboards remain their visual reference. They were not
  sliced into footage or passed off as generated production photography.
