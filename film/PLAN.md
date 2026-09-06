# Uptick Growth · Film R&D Lab · implementation plan

Branch `film/uptick-growth-rd`. Nothing here touches production routes.

## What we are proving (read before touching code)

**What Uptick Growth is.** One connected system for a local business owner.
The owner says what they want to improve, in their own words. Uptick reads the
sentence against what it already knows about the business (relationships,
behaviour, economics, the owner's rules, which channels actually exist) and
assembles ONE Growth Plan. The owner approves it once. The plan runs through
the channels the business genuinely has: its own permissioned customer
relationships (text), its own location (the code at the pump and the counter)
and nearby Uptick screens where they exist. Customers claim, ask questions,
redeem at the counter. The owner sees what happened at their own door.

**Why screens matter.** A nearby screen is the only channel that reaches
someone who has *never* been to Joe's. It sits at a real counter, in a real
neighbour's business, in front of real anonymous local attention. It is the
acquisition path: it turns a stranger two doors down into a permissioned
relationship. In the fixture it is where the 7 new customers come from.

**Why screens are not required.** The plan branches only where a channel
exists. "Not in this area yet — the plan runs without it" is a first-class
state, not a degraded one. Direct relationships + own location already make a
complete plan (the 14 who returned).

**Why this is not Groupon.** No marketplace, no strangers hunting discounts,
no margin race. The offer is the owner's own, time-bound reason to visit;
fuel is never discounted (Joe's rule); the reward exposure is capped
($18.60); the relationship stays with the business; the result is counted at
the door, not sold as vouchers.

**Why AI is inside, not the product.** Intelligence reads the sentence,
assembles the plan, and answers grounded questions. It never appears as a
chatbot, a sparkle, a confidence score or a retrieval diagram. "Automatic when
grounded, human when uncertain" is a product rule, not a feature.

**Five parts.** Reach → Connect → Activate → Converse → Prove. Intelligence
runs through all five.

**Visual split.** Direction 1 = how Uptick thinks: warm off-white page,
extreme negative space, hairlines not boxes, type doing emotional work.
Direction 2 = where Uptick acts: the physical Block, lit, with people.
Focused-dark = the customer's phone, with the world softly behind it.

**Motion grammar (from the deck, kept).** Persist → transform, never cut.
One plane bezier `cubic-bezier(.7,0,.2,1)`. 76 bpm tempo. Words are re-set,
never replaced. Nothing new appears in ASSEMBLE; context reorganises.
Mint in exactly eight moments (interpret, approve, distribute, scan, ground,
redeem, return, final dot). Amber is always a person. Numbers are typeset,
then step; never spin. One hard cut in the whole film (the end).

**Why the styleframes are previs.** They encode logic (what persists, what
transforms, what it means) in vector rectangles and mono labels. They have no
light, no material, no depth, no silence. The Block is a plan drawing. The
plan is a data sheet. We keep the logic and rebuild the picture.

## Fixture corrections (single source: `film/data/joes.ts`)

- 21 came through the door · 14 returned · 7 were new. Never "21 came back +
  7 never been".
- 104 permissioned relationships; 63 tend to respond in the morning and 41
  have not visited recently are *signals* on that set, they overlap. The plan
  targets the 104 with those signals, first 30 rewards.
- Nearby-screen acquisition happens Friday morning inside the 7–10 window.
  Distribution happens Thursday 6:48 PM (text tonight; screens armed for the
  window). Light carries the time jump.

## Tools actually available

- Blender: `bpy` 5.0.1 (pip wheel, Python 3.11) → Cycles CPU + OIDN denoise.
  Blender 4.0.2 apt binary also present (no denoiser, no EEVEE: no GPU/EGL).
  We use `bpy` 5.0.1 for all renders. 4 cores, 15 GB. Cycles CPU only.
- Remotion 4.0.521 (+ Player for the lab). Chromium from Playwright at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Fonts: OFL packages `@fontsource/geist-sans`, `geist-mono`, `newsreader`,
  copied into `public/film-rd/fonts` with their licences.
- ffmpeg: Playwright's `/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux` +
  Remotion's bundled one.

## Architecture

```
film/                      Remotion project (relative imports only)
  index.ts                 registerRoot
  Root.tsx                 five compositions, 1920×1080, 24 fps
  data/joes.ts             THE fixture
  motion/                  bezier, tempo, springs, timeline helpers
  typography/fonts.ts      @font-face loading with delayRender
  primitives/              Numeral, Sentence, GrowthPlan, OfferSlab, Thread,
                           Pass, Provenance, Result, BlockPlate, Tracked…
  block/                   plate manifest + tracking JSON (from Blender)
  compositions/Hero1…5     the five gates
  audio/NOTES.md           sound-intent per shot
blender/
  scripts/block.py         builds the Block (materials, lighting states)
  scripts/shots.py         cameras, people paths, per-shot render + tracking export
  scripts/render.py        CLI: still / sequence
  exports/*.json           2D tracks (Joe's door, curb line, screen quad, thresholds)
app/film-rd/               the lab (Player, shot selector, scrub, frame, renders)
public/film-rd/
  plates/*.mp4             Blender plates (committed, small)
  renders/*.mp4 + stills   Remotion outputs
  fonts/                   OFL woff2
```

Pipeline for a Block shot: Blender renders the plate + exports per-frame 2D
tracks → Remotion composites Direction 1 / phone layers over the plate using
the tracks (the `3` lands on Joe's tracked lot; the screen quad drives a
homography so the DOM Offer sits on the physical screen and lifts off it).

## Order of work

1. Fixture. 2. Block look-dev in Blender (stills until it is good).
3. Remotion skeleton + fonts + lab page (build must pass).
4. Hero 2 and Hero 4 (pure Direction 1 / focused dark) while plates render.
5. Hero 1, Hero 3, Hero 5 over plates. 6. Render, critique, iterate, report.
