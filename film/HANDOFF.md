# Uptick Growth · film → website and app handoff

_Preparation only. Nothing here changes the site; it maps what the film proved onto where the site and the owner app would use it. The film's grammar is frozen; the web takes the grammar, not the frames._

## The grammar the film froze

| principle | in the film | on the web |
| --- | --- | --- |
| One number, one sentence, silence | Act I: `3` and "customers between 7 and 10 last Friday." on cream | `/growth` hero: the gap as a single figure and one line before any claim |
| The sentence is the interface | Act II: Joe types "Friday mornings are slow" at 96 px, no input chrome | `/growth/demo` and the owner app's plan composer: a bare text line, the plan assembles beneath it |
| Meaning becomes space | Acts III–IV: the weeks line, the honest 06:00–16:00 axis, 63 people above it, 3 below | `/growth/demo` reading step; the owner app's "what Uptick understood" view |
| Persist → transform, never cut-to-a-card | the plan becomes a line, the line lights the block; the Offer folds to a plane and unfolds to the Pass | page transitions between offer → pass → redeemed on the customer pass page |
| Mint marks the event, amber is people | mint: the last key, uprights, the delivered line, the tick, the redeemed dot; amber: figures, the 63, the door's residue | `--mint` only on state changes (redeemed, delivered, approved); `--amber` only for counts of people |
| No dashboards, no PIN, no scanner, no POS | Act VIII: staff see the pass; two taps; the state is unmistakable | the pass page and the merchant view show one object, not a panel |

## Primitives to port (from `film/primitives` and `film/data`)

| film primitive | what it is | where it goes | port notes |
| --- | --- | --- | --- |
| `OfferSlab` (`film/primitives/OfferSlab.tsx`) | the Offer: head, body, rows, permission, Yes, Save my pass · 560×720 | `/growth/demo` step 2 and the customer's text-link landing page | Reveal props become mount animations; `savePress` becomes the real button state. Keep the 40 px pad, the ink hairline rows, no radius above 2 px, no shadow above the film's. |
| `PassSlab` + `PASS_BLOCK` + `passClock` | the Pass with its one transforming ink block: Redeem now → Confirm → Redeemed with the live clock and the confirmation detail | the customer pass page (`/p/<id>` or the text link) | The block's rest/done geometry is the whole design: do not add a second element for the redeemed state. The clock is real time on the web; the dot pulses at 1 Hz. "Confirm — this can't be undone" is the only interstitial. |
| `GrowthPlanCard` + `PLAN_ROWS` (`film/primitives/GrowthPlan.tsx`) | the plan as one statement block: title, five rows, Approve in plain ink, the owner's rule in amber | owner app: plan review and approval; `/growth` "one growth plan" section | No row rules, Approve at the rows' weight. On the web the rows are editable in place; the title is not a heading element, it is the first row. |
| `ScreenFaceContent` (`film/primitives/ScreenContent.tsx`) | the café screen's states: idle, Joe's content, pharmacy, Joe's own | `/host` and `/growth` screen mockups; the real screen player | The QR mark and the "two doors down" line are the entire call to action. Nothing else on the screen. |
| `Touch` (`film/primitives/Touch.tsx`) | one hairline ring from the tap point | any demo that shows a tap | 56 px, opacity 0.8·(1−t), 14 frames; never a cursor. |
| `Type` (`Numeral`, `Line`, `Mono`, `Voice`, `Words`, `Rule`) | the type system: Geist Sans 200/300/400, Geist Mono 400/500 caps at 0.16em, Newsreader italic for the customer's voice | site-wide type tokens (`film/tokens.ts` → CSS custom properties) | Weight 200 only above 96 px. The customer's voice is the only serif anywhere. Mono is for the header's facts (place, time), not for labels. |
| `film/data/joes.ts` | the single fixture: Joe's Fuel & Go, the gap, the intent, the plan, the reach, the offer, the pass, the conversation, the result | `lib/content.ts` `GROWTH_EXAMPLE` | Reconcile the two: the film's numbers (3 → 21 · 14 returned · 7 new · 38 answered · 2 to Joe · 30 passes · $18.60 exposure) should be the site's example, one source. |
| `film/audio` (cues, synth) | the sound design: room tone, street, keys, ticks, the redeem note | the demo, optional, muted by default | The redeem note (`redeem.ogg`) is the only sound the pass page should ever make, on the confirm tap, if the user has sound on. |

## Page mapping

- **`/growth`** — hero: the teaser loop (`public/film-rd/final/uptick-growth-loop.mp4`, silent, 10 s, the 3 becoming the sidewalk) with the poster frame as the fallback image; the full film (`uptick-growth-1080p.mp4` / `.webm`, poster `uptick-growth-poster.jpg`) further down with sound opt-in. Sections in the film's order: the gap · owner speaks · one plan · two ways in · the relationship is useful · the pass · the proof. Each section's figure is the film's figure.
- **`/growth/demo`** — the interactive version of Acts II → VIII: type a sentence (or pick one), watch the plan assemble (`GrowthPlanCard` with the assemble animation), approve (one tap), see the Offer (`OfferSlab`), save the pass, redeem it (`PassSlab`, real clock). No account. The result page shows "21 came through the door." then "14 returned. 7 were new." — the film's restraint, no chart.
- **Owner app** — the plan composer (Act II grammar), the plan review (Act IV's block, editable), approval (Act V's press: the plan becomes a line under the header, not a modal), the week line ("This week · 38 answered from the plan · 2 went to Joe") on the home screen, and the count ("21 came through the door") as the only number on the home screen until tapped.
- **Merchant counter view** — none needed. The film's argument is that staff look at the customer's phone. If a counter view exists, it shows the day's count and nothing to tap.

## What not to port

- The Blender block, the plates, the homography compositing: the film's world stays in the film. The site uses stills from it (poster, contact sheet) and the loop.
- The critics' scores and the punch lists: process, not product.
- The cream/marine page alternation as a layout rule: the site has its own rhythm; only the colour meaning (mint = event, amber = people) carries.

## Files the site would reference

```
public/film-rd/final/uptick-growth-1080p.mp4      the film (web, with sound)
public/film-rd/final/uptick-growth-1080p.webm     the film (web, VP9/Opus)
public/film-rd/final/uptick-growth-poster.jpg     the poster frame
public/film-rd/final/uptick-growth-loop.mp4       the silent 10 s loop
public/film-rd/fonts/                             Geist Sans/Mono, Newsreader italic (OFL, licences beside them)
film/data/joes.ts                                 the fixture, one source
film/tokens.ts                                    colour and type tokens
```
