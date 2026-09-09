# Truth audit — The Weekly Drop

Audited against the delivered 56-second master, frame by frame. This audit does
not certify deployed Uptick functionality against external product records; it
certifies that nothing the film puts on screen exceeds what the repository
holds, and that the film's depictions are labelled for what they are.

`scripts/final-preflight.py` enforces the mechanical half of this table on every
render. Every business name, distance, offer, timestamp and price is read from
`film/data/weekly-drop.json` at render time, and the build fails if any of them
drift — including a check that **nothing on screen anywhere says "Friday"**,
because the product is a Weekly Drop and not a Friday promotion.

| Claim or depicted event | Basis | Treatment |
|---|---|---|
| Uptick runs screens at local businesses and uses them to build a merchant's audience | The user's product thesis | The film's central proposition, stated at 0:03 and paid off at 0:53. Real-world product availability, install base and partner agreements are not independently verified here. |
| Main Street Car Wash · 0.7 mi, Quick Lube · 1.2 mi, Ridge Tire · 1.5 mi, each carrying a screen | `weekly-drop.json`, `network[]` | Fictional illustrative host businesses. Names, distances and the fact that each carries one screen are fixture-backed and preflight-checked. **Only the car wash is ever pictured**; the other two are named, not shown. No partner endorsement, signed agreement or exclusivity is implied. |
| **The Uptick screen at the car wash** | A Remotion-drawn screen projected by homography onto a real **blank** sign panel that exists in the generated plate | **This is the single most important disclosure in this audit.** It is not a photograph of an installed Uptick screen. The panel is genuinely in the photograph, blank; the content is drawn and mapped onto its measured corners. The film therefore depicts what a placement *would* look like, and does not document one that exists. |
| `BUY $25 OF GAS / GET A FREE COFFEE / Show your receipt inside.` | `weekly-drop.json`, `screen` | The illustrative acquisition offer. Preflight requires the qualifying amount on the screen, on the receipt and in the redemption to be the same number. |
| The fuel purchase | Canopy photograph + nozzle sound + a Remotion-drawn receipt | **No fuel pump is ever shown** — the plate has a canopy and no pumps, and none was fabricated. Fuelling is conveyed by arrival under the canopy, sound, and the receipt. The receipt is drawn, not photographed: pump 3, 8.62 gal unleaded, $25.00, card ending 4417, Tuesday 8:09 AM. All illustrative. |
| The customer notices the offer | A rack focus onto the screen, between his car arriving and his tyre leaving | **The film never shows his face reading it.** No such footage exists and none was generated. The decision is carried by editing and focus, and by the copy "He needs gas anyway." This is depiction by implication and is called out here rather than implied to be coverage. |
| First redemption, free coffee | `firstRedemption`, `priceCents: 0`, Tuesday 8:17 AM | Shown as receipt-verified and explicitly redeemed — the phone reads `VERIFIED $25.00` then `REDEEM` → `REDEEMED`. Preflight requires press to precede done. No margin, redemption-rate or incremental-sales claim. |
| Joining the Weekly Drop | `join`, Tuesday 8:19 AM | Explicit opt-in: the offer is shown, the button is pressed, and only then does it read `YOU'RE IN.` Purchase is never portrayed as permission. |
| "A new offer each week. There's always something free." | The user's stated product positioning | A **forward-looking promise about the user's own product**, not a measured outcome. It is theirs to make; this film neither substantiates nor quantifies it. Preflight does check that both offers the film actually shows contain something free. |
| The Drop arrives by text | `drop`, Wednesday 5:31 PM, `channel: "text message"` | Shown as an SMS thread, labelled `TEXT MESSAGE`, with the sender `UPTICK WEEKLY DROP`. Deliberately **Wednesday**, to demonstrate that a Drop is weekly rather than a Friday fixture. No claim about deliverability, opt-out handling, carrier terms or messaging law. |
| `Buy a breakfast sandwich / Get a coffee free` | `returnRedemption`, Thursday 7:41 AM | The recurring offer. Paid item plus a free item — never a second pure giveaway, and never a discount code. Redeemed on screen, so the film does not imply the offer applies itself. |
| The same person returns | One customer through every shot: navy overshirt, dark trousers, short dark hair, one navy estate | Continuity is carried by the material, not asserted. His face is withheld through both doorway entries and revealed only at the counter. |
| The cashier recognises him | One generated photograph | Depicted behaviour in an illustrative scenario, not a testimonial. No cashier, customer or business in this film is a real person or place. |
| The five-step journey panel | The five events of the one journey just watched | Every timestamp is preflight-checked against the fixture event it names. **No aggregate, percentage, currency total, forecast, ROI or guarantee appears anywhere in the film.** |
| Every picture in the film | AI-generated concept photography | Not live-action footage, not a photograph of a real business, not a real customer, not a documented installation. Per-file provenance in `HIGGSFIELD_MANIFEST.json` and `SOURCE_MEDIA.json`. |

## The three things the film shows by implication

Stated here because each is a place where a viewer could reasonably assume more
coverage exists than does:

1. **The Uptick screen is a composite**, drawn onto a real blank panel.
2. **The fuel purchase has no pump on screen** — canopy, sound and receipt only.
3. **The customer is never seen noticing the offer**; a rack focus stands in.

All three are consequences of the Higgsfield service being unreachable for this
production run. None of them is disguised in the cut.

## The persistent qualification

**"Illustrative customer journey. Outcomes are not guaranteed."** is on screen
for all 1,344 frames of the master and all 360 of the teaser, bottom right,
21 px on a 1920-wide frame, with a shadow so it survives the bright shots. It is
a qualification, not a cure: nothing above depends on it to be true.

## Assets and rights

- Pictures: AI-generated (Higgsfield; two doorway inputs from OpenAI image
  generation). One file, `coffee-start-v1.png`, has a **missing generation
  record** — it arrived in commit `e4e0165` with no job id, model or charge.
  That gap is recorded rather than reconstructed.
- All product surfaces — screen, receipt, four phone states — are repository
  authored in `film/compositions/director/FinalFilm.tsx`.
- Sound: original procedural synthesis, `film/audio/synth.py`.
- Fonts: Geist, Geist Mono and Newsreader under the SIL OFL, licences kept
  beside the faces in `public/film-rd/fonts`.
- The Rocketbox character and walk (Microsoft, MIT) and the procedural Blender
  sets remain in the repository with `LICENSE.md` and `SOURCE.json` intact. None
  of it appears in this film.
- The previous cut's fixture, `film/data/acquisition.json`, is untouched and
  still serves the archived compositions. The Weekly Drop film reads only
  `weekly-drop.json`.
