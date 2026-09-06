# Uptick Growth · the lens

_One camera grammar for the whole film. Enforced in code by `blender/scripts/camera.py`: a shot cannot be built without declaring every field in the table below._

## Three worlds, and the crossings between them

The film has exactly three places it can be, and the crossings are authored, never dissolved.

| world | what it is | what may appear |
| --- | --- | --- |
| **1 · Uptick thinks** | the warm page: editorial, typographic, still | a number, a sentence, an interpretation, the plan, the final proof. No product shell. |
| **2 · Uptick acts** | Main Street, Joe's, the café | physical things only. Software appears **only** on a physical panel — a phone's screen, the Uptick screen on a counter, a sign. Nothing hovers in front of a building or a person. |
| **3 · the relationship** | inside the phone, full frame | the text, the offer, the permission, the question, the provenance. May be abstract, because we are inside the relationship rather than looking at it. |

Crossings:

| crossing | how |
| --- | --- |
| 1 → 2 | the printed `3` on the page is standing on Joe's forecourt when the page lifts off it |
| 2 → 3 | the camera closes on a physical panel until the panel **is** the frame |
| 3 → 2 | the frame opens back out and the experience is in a hand, tracked, at Joe's |
| 2 → 1 | one physical residue survives: the doorway's lit threshold straightens into the rule beneath the 21 |

No crossing is a cross-dissolve. Each is a move, a match, or a scale change we can point at.

## The four lens families

Sensor is 36 mm across, so these are millimetres as a photographer means them. Depth of field is always on — an f-stop is part of the lens, not an effect.

| family | lens | stop | height | what it is for |
| --- | --- | --- | --- | --- |
| `block` | 40 mm | f/5.6 | 1.62 m | the street, the lot, the building whole |
| `street` | 50 mm | f/4 | 1.58 m | a person crossing a real distance |
| `human` | 75 mm | f/2.8 | 1.42 m | the counter, the shoulder, the exchange |
| `device` | 95 mm | f/2.2 | 1.10 m | the phone, the cup, the thing in the hand |

A shot may open the stop or lengthen the lens within a family (the coffee is 85 mm), but it may not sit between families.

## Every shot declares

`family · height · foreground · subject · background · focal plane · motivation · start stop · end stop`

Motivation is a sentence a viewer could say back. "Locked" is a motivation and it is the default. Movement is the exception, and a move begins and ends at rest — `camera.ease_camera` will not produce a constant drift.

**Forbidden:** default Blender camera moves, orbits, flythroughs, handheld shake as a substitute for intent, and any move whose only justification is that the scene is three-dimensional.

## The human system

| distance | what is shown |
| --- | --- |
| wide | a sculptural figure: shoulder yoke, tapered torso, legs, a yaw that says where it is going, a grounded shadow, a gait. An architectural maquette. |
| medium | crop. A shoulder and an arm; the head out of frame or half out. |
| close | never a whole abstract body. A shoulder, a forearm, a hand, a phone. The gesture carries it. No face is needed anywhere in this film. |

## The product, in the physical world

The rule that produces the look: **the UI is not composited over Blender.** Remotion renders the phone's screen at the handset's own aspect; `scripts/bake-screens.sh` writes it to a PNG sequence; the sequence is the emission texture of a panel inside the shot. It is therefore lit by the room, reflected in the chamfer, blurred by the lens, motion-blurred by the shutter and covered by the thumb that presses it — because it is really there.

The same holds for the Uptick screen on the café counter: a panel with thickness, a bezel and a foot, emitting Joe's content.

## Materials and light

| surface | roughness | note |
| --- | --- | --- |
| machined aluminium | 0.22 | the handset, the screen's shell |
| painted metal | 0.34–0.42 | counters, brewer body, light housings |
| laminate top | 0.28 | counter tops |
| ceramic | 0.16 | cups on the back bar |
| paper | 0.62 | the takeaway cup |
| board sleeve | 0.78 | the cup's sleeve |
| skin | 0.62, low specular | hands |
| rubber / matte | 0.86 | the counter mat |

Nothing in the block is a colour; everything is a material at a value. Light states are `dawn`, `morning`, `dusk`, `night` in `block.STATES`, plus warm practicals over each counter — the light the close shots are actually lit by.

## Metadata

Two modes, and the difference is absolute.

- **Review mode** may carry timestamps, shot names, source labels, technical notes.
- **Film mode** carries almost none of it. No engineering commentary in frame — not "no PIN", not "no scanner", not "recorded". The absence of complexity is demonstrated by the interaction, never announced.

## Two rules the block taught us

**Keyframe the lens, always.** A `Cam` with a moving eye and a fixed `lens=` is a
lie: Blender interpolates the transform but the focal length stays wherever the
last shot left it in the camera datablock. Every key that moves the camera also
carries `lens=` and `focus=`. `shot_scan` lost a whole pass to this — the
focus pull was still travelling on the frame the edit used, so the panel read
as mush.

**Joe's door is at (−1.72, 20.30).** The lot's own origin drifted twice during
the build and every interior shot that looks at the door — `threshold`,
`counter`, `coffee` — is framed off that number. There is an aisle cut through
the three shelf runs on the door's axis, because a store with shelving
opposite its entrance gives a camera at the back of the room no floor and no
legs to look at.

## Verifying a frame before you render it

`blender/scripts/render.py <shot> --still N --res 800x450 --samples 24` is the
loop. Twenty-four seconds a frame is cheap enough to iterate on and honest
enough to judge composition, occlusion and depth of field. Judge the framing
there; judge the light and the materials only at 1280×720.

Projecting a mesh's bounding box to NDC is a hint, not an answer: an object
straddling the camera plane clips against the near plane and reports garbage
extents. When the projection is ambiguous, query the world-space box instead
and reason about it analytically — and remember `bpy.context.view_layer.update()`
after `B.build()`, or `matrix_world` is stale and every box comes back local.
