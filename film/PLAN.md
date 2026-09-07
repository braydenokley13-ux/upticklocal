# Uptick Growth · the brief

Branch `film/uptick-growth-rd`. Nothing here touches production routes.

_This is the argument the film has to make, and the fixture it has to make it with. It was written
before the film existed and it has not been rewritten to match the film — a brief that is edited
to agree with the thing it produced stops being able to hold it to account. What the film actually
became, and how it is built, is `film/REPORT.md`; the render pipeline is `film/render/PROFILE.md`;
the lens grammar is `film/CINEMATOGRAPHY.md`._

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

## What replaced the rest of this file

The sections that used to follow — the tool inventory, the directory sketch and a six-step order
of work — described a five-shot lab, and the film is twelve acts. They named primitives that were
never built (`OfferSlab`, `Thread`, `Provenance`, `BlockPlate`) and a Chromium path the render no
longer uses. Leaving them in place would put two contradictory descriptions of the same tree in
the same directory, so they are in the branch history instead, and the current answers are:

| question | where it is answered now |
| --- | --- |
| what the film is, act by act | `film/REPORT.md` |
| where every file lives | `film/REPORT.md` § The source, laid out |
| what the machine can do, and what each lane costs | `film/render/PROFILE.md` |
| what a camera must declare | `film/CINEMATOGRAPHY.md` |
| what the sound is made of, and how loud | `film/audio/CUES.md` · `film/audio/NOTES.md` |
| what the critics said | `film/review/` — `CRITIC.md`, `PROOF.md` (gate A), `GATEB.md` (the look), `FULLCUT.md` |
| what the site takes from it | `film/HANDOFF.md` |

The one thing above that has not moved is the fixture: `film/data/joes.ts` is still the single
source, and it still checks its own arithmetic — 14 returned plus 7 new must equal 21, and the
coffee's cost times the cap must equal the stated exposure, or the module refuses to load.
