# Typography A/B — is Geist too "software default" at 640 px?

Sheet: `film/review/typography/sheet.png` (three 1920×1080 stills at 1/3, labelled)
Full-size stills: `film/review/typography/{geist,bricolage-grotesque,hanken-grotesk}.png`
Composition: `TypeTest` (`film/compositions/TypeTest.tsx`), props `{ face }`, one frame, 1920×1080.

```
nice -n 10 env FILM_CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  npx remotion still TypeTest --props '{"face":"geist"}' film/review/typography/geist.png
```

Each sheet sets the four sizes the film actually uses: a 640 px weight-200 numeral, a 96 px
weight-200 typed sentence, an 88 px plan title with five 40 px weight-300 rows, and a 24 px mono
caption. **The mono is Geist Mono in all three panels** — it is the control, so the caption column
tests the *pairing*, not the mono.

## The candidates and why these two

Both are OFL and on npm under `@fontsource`, both carry real 200/300/400/500 latin statics — which
knocked out most of the shortlist immediately. Instrument Sans (400–700) and Schibsted Grotesk
(400–900) have no light weights at all, so they cannot set a 640 px weight-200 numeral; Figtree
starts at 300; Inter Tight is the same neutral skeleton as Geist, so it cannot answer the question
being asked. That left a display grotesque with genuine idiosyncrasy (**Bricolage Grotesque**) and a
warmer humanist text grotesk (**Hanken Grotesk**) — one candidate per hypothesis: "more drawn" and
"warmer".

| Face | Package | Licence |
|---|---|---|
| Geist (current) | in-repo, `public/film-rd/fonts` | SIL OFL 1.1 — © 2023 Vercel / basement.studio (`LICENSE-geist.txt`) |
| Bricolage Grotesque | `@fontsource/bricolage-grotesque` | SIL OFL 1.1 — © 2022 The Bricolage Grotesque Project Authors (Atelier Triay) |
| Hanken Grotesk | `@fontsource/hanken-grotesk` | SIL OFL 1.1 — © 2021 The Hanken Grotesk Project Authors |

Weights 200/300/400/500 (latin) plus each family's `LICENSE` are copied to
`public/film-rd/fonts/test/<family>/`. All three are OFL 1.1: free to embed in a rendered film,
no attribution required in the film itself, and no reserved font name in play as long as we do not
rename and redistribute the font files.

## 640 px, weight 200 — the numeral

**Geist.** A round two-bowl 3. Vertical stress, moderate modulation: the bowls thicken at their
outer left and right and thin at the top and bottom of each curve. Both terminals are cut flat on
the horizontal, and there is a small flat spur where the two bowls meet on the left. It is
well-drawn and it holds the page — but it is the Inter/Helvetica-Now skeleton, and at this size the
flat horizontal cuts are the only thing to look at.

**Bricolage Grotesque.** A flat-top 3: a straight horizontal bar, a squared vertical drop at its
right end, a straight diagonal into the junction, then a round lower bowl with an angled terminal.
Nearly monoline in the straights, modulated in the bowl, and the widest aperture of the three. This
is the only numeral in the test that looks *drawn* rather than defaulted — it reads like a printed
statistic or a timetable figure, not a metric in a dashboard. It is also the most opinionated thing
in the test, and the one most likely to date.

**Hanken Grotesk.** Rounder and more circular than Geist, with the highest contrast of the three:
the waist where the bowls meet goes very fine and both terminals are cut on a steep angle. Softer
and warmer, but at weight 200 and 640 px it is the most fragile — the hairlines at the top and
bottom of each bowl thin out enough to worry about in projection. Different temperature from Geist;
not more character.

## 96 px, weight 200 — "Friday mornings are slow"

**Geist** is very even and slightly narrow, apertures fairly closed, the rhythm machine-regular.
Tidy and anonymous: this size, not the 640 px numeral, is where the "software default" charge
actually lands.

**Bricolage** is visibly darker at the same nominal weight, with a larger x-height, tighter fit and
flat-sided round letters. The line has texture and a real cadence; "mornings" reads as a set word
rather than a rendered string. It also runs about 5–8% wider than Geist, which will matter to any
existing `nowrap` line.

**Hanken** is the lightest and roundest — geometric bowls, open apertures, generous word spacing.
Airy and calm, and the closest of the three to feeling like paper. It is also the faintest; on cream
at weight 200 it starts to dissolve.

## 88 px title + 40 px rows, weight 300 — the plan

**Geist** is the most even: consistent colour row to row, well-spaced mid-dots, clean `$18.60`. This
is exactly what the face was designed for and it shows.

**Bricolage** is the darkest and tightest; its 300 lands around Geist's 400. The mid-dot separators
crowd their neighbours (`$25+ fill-up · coffee on us`), and the rows read a shade busier — legible
and handsome, but it is a display face doing text work. Its 88 px title very nearly fills the
column.

**Hanken** is the calmest and most open, with the most breathing room around the separators, but its
300 lands nearer Geist's 250 — the rows read faint against the cream.

Concrete finding for any swap: **the weight scales are not interchangeable.** Bricolage needs one
step lighter than the film's current values, Hanken one step heavier.

## 24 px mono caption

Identical in all three panels (Geist Mono 500, tracked 0.16 em, uppercase), so the only question is
fit. It is clearest beside **Geist**, which is unsurprising — Geist Mono is Geist's own monospaced
sibling and shares its skeleton, so the caption reads as the same voice at a smaller size. Beside
Hanken it is fine, a neutral annotation next to a warm text face. Beside Bricolage it is slightly
foreign: the mono's geometric bowls sit oddly against Bricolage's flat-sided letters. At 24 px,
uppercase and tracked, this is a small cost — but it is a cost.

## Does Geist read as "software default" at cinematic scale?

Partly, and it is worth being precise about where. At 640 px it does **not**: the light weight and
the cream paper carry it, and the numeral reads as a printed page figure. At 96 px and 40 px it
**does** — those are the sizes at which Geist is closest to Inter, and a viewer who spends all day
in software will recognise the interface idiom even if they cannot name it. The charge is real but
mild, and it is loudest in the middle of the type scale, not at the top of it.

## Recommendation — keep Geist

Geist is the product's own face and holds the sizes the film spends most of its 85 seconds in (the
40 px plan and the 24 px caption, where it also shares a skeleton with Geist Mono) better than
either candidate: Hanken is a lateral move that trades neutrality for fragility, and Bricolage buys
one genuinely memorable numeral at the price of a heavier, busier plan, a slightly foreign mono, a
5–8% width shift through every existing layout, and a face that is fashionable enough right now to
date the film faster than Geist will.

Note for the lead, not a second recommendation: if the numeral moments (Hero1's 3, Hero5's 21) are
judged to need more character, Bricolage Grotesque is the one to revisit, as a display-only
exception at weight 200 with the rest of the film left in Geist. That is a real decision about
mixing two grotesks and belongs to you, not to this test.

## What this test did not check

Newsreader italic is not set on these sheets, so the serif pairing was judged from the existing
film frames and from the faces themselves, not rendered side by side. If a swap is ever seriously
considered, add a Newsreader italic line to `TypeTest.tsx` and re-render the three stills first —
it is a five-minute change and it is the one open question.
