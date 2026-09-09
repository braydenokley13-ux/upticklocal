# The Weekly Drop — final production report

**Status: DELIVERED.** 56.00 seconds, 1,344 frames, 1920×1080, 24 fps, stereo.
Master, web cut, WebM, 15-second teaser, poster, contact sheets and validation
are in `public/film-rd/final/` and `film/review/final/`.

This is the Weekly Drop revision of the film. Creative lock was reopened on
product feedback that changed what the commercial is selling, and the whole
middle of the movie was rebuilt around it. There is no handoff at the end of it.

---

## 1. What changed, and why

The delivered 52-second cut sold *a free coffee*. The product is *a recurring
local audience*. Those are different films, and no amount of caption editing
turns one into the other, so the story was rebuilt:

| Before | After |
|---|---|
| Uptick "reaches people somewhere else" — mechanism unshown | **Uptick runs screens** at named local businesses, and one of them is shown advertising Joe's |
| The customer arrives at Joe's for reasons never dramatised | He sees an offer that pays him to buy fuel he needs anyway |
| "Free coffee" was the whole offer | **Buy $25 of gas, get a free coffee** — the offer drives a fuel sale *and* walks him inside |
| Straight from driving to the doorway | Arrival, fuelling, a $25 receipt, *then* the door |
| Permission was an abstract opt-in | He joins **Joe's Uptick Weekly Drop** |
| The next offer simply appeared | A **text message** arrives, labelled, with the free part called out |
| "Joe's Friday offer", $4.99 breakfast + coffee | **Buy a breakfast sandwich, get a coffee free** — and Friday is gone from the film entirely |
| Return implied the offer applied itself | The Drop is **redeemed on screen**, a second time |
| 52 s | 56 s — the brief allowed 52–58, and clarity was worth four seconds |

## 2. What was available to work with

| | |
|---|---|
| Higgsfield MCP server | **Failed to connect again**, with the identical 404 `CLIENT_HTTP_NOT_IMPLEMENTED` as the previous session. No balance read, **no generation made, no credit spent** in either Opus 5 run. |
| Photography | The eleven Astra-era generations already in the repository, and nothing else. |
| Everything else | Preserved: the Remotion pipeline, colour-corrected master path, loudness normalisation, preflight, delivery validation, manifests. |

The consequence is stated plainly in `TRUTH_AUDIT.md` and scored honestly in
`CRITIC.md`: three moments this story wants are implied rather than covered.

## 3. The idea that made the revision possible

The brief needs a **physical Uptick screen at another local business**, and no
such photograph exists.

The car wash plate turned out to contain one anyway: a **blank teal sign panel
on a concrete plinth**, out of focus in the background, with correct
perspective, correct lighting and real ground contact. Its four corners were
measured off the plate by colour segmentation, and the Uptick screen is drawn in
Remotion and projected onto them with the repository's own `homographyMatrix3d`
— inset 13 px so a rim of the real panel survives as a bezel, and blurred to
match the plate's own defocus.

That also answered the brief's other requirement: the screen copy is exact,
because no image model ever touched it.

And it made the acquisition beat filmable. The film **racks focus** from the
soft panel to the sharp offer across `notice`, then cuts to his tyre rolling
out. His attention is the camera's attention. It is not a face, and the truth
audit says so.

## 4. The cut

56.00 s, twenty shots.

| # | Shot | In | Frames | What it does |
|---|---|---|---|---|
| 1 | `station` | 0:00.0 | 66 | Joe's. "Your next customers are already nearby." |
| 2 | `network` | 0:02.75 | 78 | Three named hosts with screen marks and distances |
| 3 | `wash` | 0:06.0 | 48 | The car wash. The screen is there, soft. |
| 4 | `notice` | 0:08.0 | 66 | **Rack focus onto the offer** |
| 5 | `offer` | 0:10.75 | 66 | The screen, legible. "He needs gas anyway." |
| 6 | `depart` | 0:13.5 | 55 | Wet tyre leaves the wash |
| 7 | `turn` | 0:15.8 | 66 | The estate takes a real corner |
| 8 | `arrive` | 0:18.5 | 48 | Under Joe's canopy |
| 9 | `fuel` | 0:20.5 | 60 | Nozzle cue and a $25.00 receipt |
| 10 | `first` | 0:23.0 | 102 | He walks in |
| 11 | `redeem1` | 0:27.3 | 84 | `VERIFIED $25.00` → `REDEEM` → `REDEEMED` |
| 12 | `coffee` | 0:30.8 | 54 | "The coffee is free." |
| 13 | `join` | 0:33.0 | 84 | `KEEP ME POSTED` → `YOU'RE IN.` |
| 14 | `drop` | 0:36.5 | 84 | The Drop arrives as a text |
| 15 | `return` | 0:40.0 | 34 | He comes back |
| 16 | `redeem2` | 0:41.5 | 66 | The Drop is redeemed |
| 17 | `counter` | 0:44.2 | 72 | "And she knew him." |
| 18 | `goods` | 0:47.2 | 54 | "Something is always free." |
| 19 | `proof` | 0:49.5 | 84 | The five steps, with their own timestamps |
| 20 | `close` | 0:53.0 | 73 | Find them nearby / Bring them in / Keep them coming back |

Fifteen seconds are true photographic motion. Ten photographs are moved inside
their own pixels — cropped in source space at native resolution, never magnified
past 1.45×, enforced by preflight. Every product surface is drawn: one screen,
one receipt, four phone states.

## 5. Exact copy

- **Screen:** `JOE'S FUEL & GO` / `BUY $25 OF GAS` / `GET A FREE COFFEE` /
  "Show your receipt inside." / "Get deals like this with" `UPTICK WEEKLY DROP` /
  `0.7 mi · Main St`
- **First redemption:** `FREE COFFEE` / "Qualifying $25 gas purchase" /
  `VERIFIED $25.00` / `REDEEM` → `REDEEMED` / "Hand it over. No charge."
- **Join:** "Want Joe's Weekly Drop?" / "A new offer each week. There's always
  something free." / `KEEP ME POSTED` → `YOU'RE IN.` / "Joe can reach him every
  week now."
- **The Drop (SMS, Wednesday 5:31 PM):** `UPTICK WEEKLY DROP` — "A new Joe's Drop
  just landed." / "Buy a breakfast sandwich." / "Coffee's free."
- **Second redemption:** `YOUR JOE'S DROP` / "Buy a breakfast sandwich" / "Get a
  coffee free" / `REDEEM` → `REDEEMED`
- **Close:** "Find them nearby. Bring them in. Keep them coming back." /
  `UPTICK GROWTH` / "Build your local audience, and give it a new reason every week."

## 6. Truth

Every business name, distance, offer, timestamp and price is read from
`film/data/weekly-drop.json` at render time. Preflight fails the build if any of
them drift, if either offer loses its free component, if a redemption is marked
done before it is pressed — or **if anything on screen says "Friday"**, which is
section 11 of the brief turned into a test.

The old fixture, `film/data/acquisition.json`, is untouched and still serves the
archived compositions.

No aggregate, percentage, currency total, forecast or ROI appears anywhere in
the film. The proof is the five events of the one journey the viewer just
watched.

## 7. Tests

- `scripts/final-preflight.py` — **263 checks, 0 failed.**
- `scripts/final-deliver.py validate` — every delivered file re-read with
  ffprobe: duration, resolution, frame rate, frame count, codecs, pixel format,
  colour range, colour space, integrated loudness, true peak and sha256.
- `scripts/final-deliver.py align` — re-measures delivered loudness and trims if
  the encoder or a short programme's gating missed.
- `npx tsc --noEmit` and `npm run build` — clean.

## 8. Deliverables

| | |
|---|---|
| Master | `public/film-rd/final/uptick-growth-final-master-1080p.mp4` |
| Web | `public/film-rd/final/uptick-growth-final-web-1080p.mp4` |
| WebM | `public/film-rd/final/uptick-growth-final-1080p.webm` |
| Teaser (15 s) | `public/film-rd/final/uptick-growth-final-teaser.mp4` |
| Poster | `public/film-rd/final/uptick-growth-final-poster.png` / `.jpg` |
| Contact sheets | `public/film-rd/final/contact/final-sheet1–4.png` |
| Timeline | `film/final-director/final-edit.json` |
| Product truth | `film/data/weekly-drop.json` |
| Composition | `film/compositions/director/FinalFilm.tsx` |
| Manifests | `SOURCE_MEDIA.json`, `HIGGSFIELD_MANIFEST.json`, `RENDER_MANIFEST.json` |
| Records | `TRUTH_AUDIT.md`, `CRITIC.md`, `film/review/final/REVIEW.md` |

## 9. What would take it past 9

Not defects — shots. Each needs a generation, and Higgsfield was unreachable for
both Opus 5 sessions:

1. **The customer at the wash, looking up at the screen.** The single most
   valuable clip this film does not have. It converts the one beat that is
   currently implied into the beat the whole story turns on.
2. **A pump.** Nozzle in the filler, hand on the trigger, the counter passing
   $25. It would make the fuel → free coffee → inside progression physical
   instead of asserted.
3. **A second host business with a screen.** One more Uptick placement, at the
   Quick Lube or Ridge Tire, turns "a screen" into "a network".

At the rates this project's own records show — roughly 5–9 credits for a
`kling3_0` motion clip and 2 for a `nano_banana_pro` still — all three, with
start frames, come to about **25–35 credits**.
