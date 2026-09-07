# The human system · what the redemption asked for, and what it got

_Written after proof cut 2 was rejected at 6.5. The complaint was not that the film's people are
abstract — the film is a designed miniature world and abstraction is its language. The complaint
is that one shot put a procedural hand at 95 mm and asked it to survive anatomical inspection._

## The three things that failed, and where

| | reads as | why |
| --- | --- | --- |
| the hand at 95 mm | a claw-machine prize | four separate lofted tubes; Cycles renders their intersections as hard V-grooves where skin would fold |
| the figure at medium distance | a chess piece | a capsule with a head-lump, large enough to inspect, too small to light |
| the figure in a wide | fine | small enough to abstract |
| the figure at the threshold | **a person** | a silhouette in a blown doorway: light does the work, geometry does none |

The film already contained its own answer. It is in the threshold shot.

## What was tried on the hand, and abandoned

Three tuning passes, each of which moved the frame and none of which fixed it: the nail material
(`coat 0.6, spec 0.5` on a pale cap — a highlight, not the "sheen" its own comment claimed), the
finger profile (a tenth of radius modulation reads as a tube; a fifth reads as jointed) and the
skin value (`#9d8272` rendered **brighter than the white screen it holds**).

Then the measurement that ended it: the fingers cannot be drawn in tighter, because at
`-hw - 0.011` the finger surface already clears the handset's edge by **0.4 mm**. The lateral
bulge in frame *is* the finger's own radius. This is not a tuning problem, and tuning was stopped.

## The asset search

Authorised and time-boxed. Findings:

- **No bundled assets.** The `bpy` pip wheel ships no `.blend` asset libraries, and the repo has
  no imported geometry of any kind. Anything would have to come over the network.
- **Blender Studio Human Base Meshes v1.4.1 — CC0.** Verified against blender.org's own listing
  (`49 MB – CC0`), by Blender Studio. Downloaded and inspected: 407 objects including
  `stylized_hand`, `Hand - Stylized`, and per-limb primitives. The topology is clean quads, the
  proportions are real, and the register is exactly right — stylized, not photoreal, not a game
  character. **It is the correct asset.**
- **But it has no armature.** The bundle contains no rig of any kind. The hands are open, flat
  base meshes. Posing one to grip a phone and tap it means building and weighting a hand rig —
  which is the "hours building a new character system" the brief rules out, for a shot the
  cinematography could fix instead.

It is kept on the shelf, costed: *if the reframe had not worked, this is what to rig.*

## What actually fixed it: the camera

The mistake was hierarchy, not modelling. At 95 mm from 0.715 m with the handset square to the
lens, the hand was the second-largest object in the frame. The brief's rule — *if I can inspect a
finger joint, we are probably too close* — is the diagnosis.

**85 mm from 0.80 m, with the handset raked 32° off the lens.** The rake is the whole trick: it
collapses four fingers into one overlapping dark mass at the phone's edge instead of presenting a
rank of four broadside. Swept on the proxy lane at 118 / 132 / 148 / 162 / 176 — below 148 the
grip swings back toward the lens and reads worse; above it the fingers separate again.

Three genuinely different solutions were cut against each other first, not three camera offsets:

| | design | verdict |
| --- | --- | --- |
| **A** edge-of-frame gesture | 75 mm, 1.02 m, staff eyeline | hierarchy fixed, but the wider lens saw past the phone to the blown forecourt and the screen went illegible |
| **B** over the shoulder | 65 mm, 1.34 m, higher | the least demonstrative and the most cinematic frame, but the product cannot be read at all |
| **C** the threshold's grammar, close | 85 mm, 0.86 m, raked hard | **winner** — the grip goes edge-on, the back bar stays warm and dark behind, the headline and button still read |

## The UI followed the camera

A handset that is a fifth of the frame cannot carry a receipt. The live state was four type sizes
of which three computed to under ten screen pixels. It is now four things in the order they
matter — **it happened, when, where, what** — with the running seconds promoted to the
second-largest element on the card, because the seconds are the proof that the state is live and
not a screenshot. The pass id and ordinal are gone; they were illegible and they were the dense
receipt the brief warns against.

The phone was not enlarged and the type was not cheated. The framing changed and the content
simplified to suit it.
