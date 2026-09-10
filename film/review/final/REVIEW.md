> **Current revision: indoor-TV correction of baseline `6902d04`.** The new
> acquisition scene shows the same customer noticing Joe's promotion on an
> ordinary wall-mounted TV inside Main Street Car Wash. The 56-second timing,
> route, Joe's scenes, offers and Weekly Drop story are preserved. See
> [the focused correction review](INDOOR_TV_REVIEW.md) for current evidence and validation.
>
> The record below is the **historical pre-correction review**. Its outdoor-panel
> description, missing customer reaction and prior score describe `6902d04`,
> not the corrected delivery. New source provenance is in `HIGGSFIELD_MANIFEST.json`.

# Final review record — The Weekly Drop

What was looked at before the cut was locked, and what looking at it changed.
The contact sheets in `public/film-rd/final/contact/` are the review record for
the delivered master; the poster candidates beside this file are the record for
the poster choice.

## Why the film was reopened

The delivered 52-second cut was technically finished and strategically wrong: it
sold a free coffee where the product is a recurring local audience. Product
feedback changed the centre of the story to the **Uptick Weekly Drop**, and the
middle of the movie was rebuilt rather than recaptioned. See `FINAL_REPORT.md`
§1 for the before/after.

## The problem that had to be solved first

The revision requires a **physical Uptick screen at another local business**, and
Higgsfield was unreachable for the whole session — the same 404 as the previous
run — so no such photograph could be generated.

Re-examining the car wash plate at full resolution found one anyway: a **blank
teal sign panel on a concrete plinth**, defocused in the background, with real
perspective, real lighting and real ground contact. Its corners were measured by
colour segmentation (`x 2376–2657, y 246–806` in a 2752×1536 plate) and verified
by drawing the quad back onto the image. The Uptick screen is drawn in Remotion
at 600×1154 — the panel's own aspect — and projected onto those corners with
`film/block/homography.ts`.

That solved three problems at once: the screen exists, its copy is typeset
rather than generated, and the film can **rack focus** onto it, which is how the
acquisition beat gets played without a shot of the customer's face.

## How the film was reviewed

1. The plate at 1:1, to find and measure the panel.
2. The composited screen at two states — matched-blur and racked-sharp — before
   any of the rest was cut.
3. A half-resolution proof of the complete 56-second cut, watched with sound,
   muted and at laptop size.
4. The delivered 1920×1080 master, frame-stepped at every cut, plus a
   section-by-section audio measurement.

## What the proof cut changed

| Found | Change |
|---|---|
| "Screens at the local businesses your customers already use." wrapped to three lines with "businesses" orphaned. | Rewritten to "Screens where your / drivers already stop." — two clean lines, and it names the behaviour rather than the hardware. |
| The network beat read as though screens were the product. | Eyebrow changed to "HOW UPTICK FINDS THEM", so the screen is the mechanism and the audience is the product. |
| `arrive` was a third helping of the opening establisher. | Re-cropped onto the canopy — where he is actually going, and where the fuel beat happens. |
| The Drop's phone sat empty for most of a second before the first bubble landed. | Buzz pulled to frame 5, bubbles to 14 / 24 / 34. |
| The full-frame offer card showed the **real blank panel** behind it, so the screen appeared twice in one frame. | The plate now crops off the panel entirely. |
| The offer card had a dead middle. | Filled with the line that sets up the next beat: "Show your receipt inside." |
| The network plate was dimmed so far the neighbourhood stopped reading. | 0.44 → 0.36, with both scrims still carrying the type. |

## What the delivered master confirmed

- **Colour:** yuv420p, limited range, BT.709 on every moving deliverable.
- **Loudness:** master −16.07 LUFS / −1.35 dBTP; web and WebM within 0.01;
  teaser −16.05. The alignment pass found nothing to correct this time, which is
  what it should do once the mix is right.
- **Balance:** section means span −16.4 to −22.6 dB — a 6.2 dB spread across
  eight sections, with the proof/close swell as the loudest and the fuel beat as
  the quietest.
- **Frames:** 1,344 at 24 fps, 56.10 s of container including the audio tail.

## Poster

Six candidates, one per act:

| Candidate | Frame | Verdict |
|---|---|---|
| a-station | 36 | Warm and clean, and it was the previous film's poster — but it sells a storefront, not a system. |
| **b-screen** | 245 | **Chosen.** The customer's wet car in the foreground and, across the forecourt, a screen at somebody else's business advertising Joe's with a real offer. It states the entire product without a caption, and it is the one frame that could not be mistaken for a generic retail commercial. |
| c-offer | 300 | The offer legibly, but the card is cropped by the frame edge and the ground behind it is mush. |
| d-first | 610 | The back of a head. |
| e-drop | 930 | A strong product frame, but four-fifths black. |
| f-counter | 1105 | The warmest frame in the film, and the closest call — rejected because alone it says nothing about Uptick. |

The choice is recorded as `POSTER` in `scripts/final-deliver.py` so it can be
re-argued against the same six rather than taken on trust.

## Tests

- `scripts/final-preflight.py` — 263 checks, 0 failed. Includes the new product
  rules: press must precede done on all three redemptions, both offers must keep
  something free, the qualifying amount must agree across screen, receipt and
  redemption, the composited quad must lie inside its plate — and **nothing on
  screen may say "Friday"**.
- `scripts/final-deliver.py validate` — 38 checks, 0 failed.
- `npx tsc --noEmit` and `npm run build` — clean.
