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

## The lens families

Sensor is 36 mm across, so these are millimetres as a photographer means them. Depth of field is always on — an f-stop is part of the lens, not an effect.

| family | lens | stop | height | what it is for |
| --- | --- | --- | --- | --- |
| `block` | 40 mm | f/5.6 | 1.62 m | the street, the lot, the building whole |
| `street` | 50 mm | f/4 | 1.58 m | a person crossing a real distance |
| `human` | 75 mm | f/2.8 | 1.42 m | the counter, the shoulder, the exchange |
| `device` | 95 mm | f/2.2 | 1.10 m | the phone, the cup, the thing in the hand — but see the rake, below: the redemption runs at 85 mm because 95 made a hand the second-largest object in frame |
| `page` | 26 mm | f/4 | 10.0 m | the one exception, below |

A shot may open the stop or lengthen the lens within a family (the coffee is 85 mm), but it may not sit between families.

`page` is the exception and it exists so that the exception is written down rather than hidden
in a shot. The film opens looking straight down at the sidewalk in front of Joe's, and the
editorial page is printed on exactly the ground that frame covers. The lens and the height
together decide that footprint, so the page decides the lens — it is a compositing requirement,
not a taste. Nothing else in the film may use it: the shot lifts out of it and lands at 30 mm
across the street, and every other camera belongs to one of the four.

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

## What the physical gate changed

Three rules came out of the three proof cuts, each of them measured on this film rather than
inherited. They are here because each one was broken by a shot that had *declared* the right
thing in its own docstring.

**A foreground is an object, not a surface.** `morning_walk` declared "the curb" and `rise`
declared "the lane's asphalt". Both are ground the camera looks *across*. They occlude nothing,
so every plane sits at one depth and the frame reads as a model viewer. And a wide lens cannot
rescue it: at 40 mm a foreground at six metres computes to under a pixel of circle of confusion,
so it cannot be softened into a shape — it has to already be one, and it has to be legible as
one. A parked car closed the frame and still failed, because at that crop it read as an
ambiguous dark pod; a lamp post reads at any crop.

**Light silhouettes a figure; material cannot.** `morning_door` works because its figure sits at
(37,30,19) against a (44,39,30) door. `morning_pump`'s sat at (112,104,89) against a
(176,162,147) pump. Halving the albedo moved it only to (92,83,71): these figures are lit chiefly
by sky ambient, so contrast has to come from what is behind and beside them. Where that is not
available, the answer is backlight or occlusion — never more tuning.

**The lens decides how much of a model you are asked to believe.** The redemption's 95 mm made a
procedural hand the second-largest object in frame. If a finger joint can be inspected, the lens
is too long. The fix was 85 mm with the handset raked 32° — *and* a change to what the hand does,
because the camera alone passed the proxy at 8.0 and still failed at 1280×720. A 640×360 proxy
upscaled three times hides exactly the defect the look gate exists to catch, which is why both
gates exist.

## The declaration is the deliverable

`camera.py` will not let a shot be built without a lens, a stop, a height, a subject, a
foreground, a background, a focal plane and a motivation. That check runs once, when the shot is
first written, and it cannot tell whether the declaration is still *true* a month later — it only
knows a string is present. Every one of those strings is exported into
`blender/exports/<shot>.json` and printed straight into `film/REPORT.md`'s plate table, so a
declaration that has gone stale is not a stale comment: it is a wrong sentence in the film's
report about the film.

It happened once. `morning_walk`'s foreground was a parked car; the car read as an ambiguous dark
pod at that crop and was replaced with a lamp post, with a full comment beside the geometry
explaining why — and the camera's `foreground=` string was left saying "a car parked along the
near curb". The scene, the comment and the declaration all disagreed, and the report printed the
declaration.

**So: when you change what is in front of the lens, change the declaration in the same edit.**
Not afterwards, and not "when the plate is re-rendered" — the export is written at the start of
every render, so a wrong string ships with the next frame.

