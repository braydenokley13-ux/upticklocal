# UPTICK GROWTH — ASTRA ACQUISITION FILM PRODUCTION WAR

## GPT-6 ASTRA

## MAXIMUM AVAILABLE REASONING

## AUTONOMOUS CLOUD PRODUCTION

You are taking over a mature commercial-film R&D system for **Uptick Growth** and carrying the next film all the way to finished production.

This is **NOT** a planning assignment.

Do not return:

* a storyboard and stop;
* a production plan and stop;
* recommendations for someone else to implement;
* a list of shots;
* a code review;
* a partial prototype;
* one impressive hero shot;
* a proxy with instructions for the founder to finish it.

You are responsible for:

# INSPECT

→ BUILD
→ RENDER
→ REVIEW
→ CRITIQUE
→ ITERATE
→ FINISH
→ DOCUMENT
→ PUSH TO GITHUB

The result should be a commercial that an independent gas-station owner could watch once and immediately understand:

> **Uptick finds nearby people who are not already at my station, gets them to come in, turns that visit into a relationship, and gives me a way to bring them back.**

That is the product this movie must sell.

---

# 0. REPOSITORY / CURRENT TRUTH

Repository:

`braydenokley13-ux/upticklocal`

Existing film branch:

`film/uptick-growth-rd`

Known current branch head when this handoff was prepared:

`09211a21b821ac03a50ce316253fa5bf17d33a43`

Do not blindly trust that SHA if GitHub has advanced. Verify current remote truth.

Clone in **cloud compute**:

```bash
git clone https://github.com/braydenokley13-ux/upticklocal.git
cd upticklocal

git fetch origin

git checkout -b astra/uptick-acquisition-film \
  origin/film/uptick-growth-rd
```

Then verify:

```bash
git status
git branch --show-current
git log -1 --oneline
git diff --stat origin/main...HEAD
```

All new work stays on:

`astra/uptick-acquisition-film`

Do **NOT** modify directly:

* `main`
* `film/uptick-growth-rd`

Push the new branch to GitHub early and push coherent production checkpoints throughout the run.

---

# 1. NON-NEGOTIABLE COMPUTE RULE

# RUN HEAVY TESTS AND RENDERS IN CLOUD COMPUTE, NOT ON THE USER'S LOCAL MACHINE.

This includes:

* repository production work where practical;
* Playwright;
* Remotion;
* ffmpeg;
* Blender;
* Cycles;
* GPU rendering;
* high-resolution image sequences;
* full-film exports;
* critic render batches;
* final contact sheets;
* large encode jobs.

The existing branch was built on a CPU-only machine and measured a real two-lane render system.

Current measured architecture includes approximately:

### Proxy lane

* Cycles
* 640×360
* 8 samples
* roughly 7 seconds/frame in sequence mode on the previous CPU machine

### Existing final physical-plate lane

* Cycles
* 1280×720
* 18 samples
* roughly 50 seconds/frame on the previous CPU machine

### Existing master

* 1920×1080
* 24 fps
* 1646 frames
* 68.58 seconds

Do not assume the old machine's limitations should constrain this run.

Actively detect available cloud GPU resources.

If GPU rendering is available, benchmark it and use it intelligently.

Use proxy renders aggressively.

Only run full-quality production renders after creative gates pass.

If cloud GPU is unavailable:

1. continue in proxy mode;
2. prepare a portable render-worker lane;
3. identify the most practical cloud GPU/render-worker route;
4. ask for authorization only if paid infrastructure is genuinely required.

Never ask the user to run long Blender or Remotion renders locally.

---

# 2. READ THE EXISTING FILM BEFORE CHANGING IT

This branch contains a major production effort.

Do not treat it like a blank repo.

At minimum inspect:

```text
film/REPORT.md
film/PLAN.md
film/CINEMATOGRAPHY.md
film/HANDOFF.md

film/review/CRITIC.md
film/review/PROOF.md
film/review/GATEB.md
film/review/FULLCUT.md
film/review/HUMAN.md
film/review/typography.md

film/render/PROFILE.md

film/data/joes.ts

film/compositions/
film/primitives/
film/audio/
film/block/

blender/scripts/

scripts/

public/film-rd/final/
```

Also inspect:

```text
film/compositions/Film.tsx
film/primitives/PhoneScreen.tsx
film/primitives/ScreenContent.tsx
film/audio/cues.ts
film/tokens.ts

scripts/film-master.sh
scripts/film-preflight.py
scripts/film-proxy.sh
scripts/film-plates.sh
scripts/film-proof.sh
```

Understand what is technically excellent before deciding what to replace.

---

# 3. WHAT THE OLD FILM ACTUALLY ACHIEVED

The existing film is not a failure.

It is a strong production foundation whose **commercial story has become stale**.

It already proved:

* Remotion film architecture;
* canonical Joe's / Main Street Blender world;
* physical screens;
* physically embedded phone UI;
* tracked screen geometry;
* offer → pass → redemption;
* threshold cinematography;
* physical/digital crossings;
* typography;
* deterministic fixture design;
* sound architecture;
* two render lanes;
* critic pipeline;
* proof cuts;
* contact sheets;
* poster generation;
* teaser generation;
* web/master exports;
* preflight validation;
* strong production discipline.

Its final critic score was approximately **8.99/10**, deliberately not rounded to 9.

Its strongest production insight is worth preserving:

# SOFTWARE MUST EXIST INSIDE THE WORLD.

In the physical world:

* UI belongs on an actual phone;
* an Uptick screen is a physical object;
* screen content is emitted by the surface;
* glass, lens blur, reflections, occlusion and motion blur affect it;
* nothing floats in front of buildings;
* nothing becomes a generic SaaS overlay.

Preserve that.

---

# 4. WHY THE OLD COMMERCIAL STORY MUST CHANGE

The old movie centered on:

> Friday mornings are slow
> → owner describes problem
> → Uptick interprets it
> → Growth Plan
> → existing customers + nearby screens
> → coffee offer
> → customer question
> → redemption
> → 21 through the door

That was valuable R&D.

It is no longer the commercial story we need.

Do not lightly re-edit that narrative.

Do not preserve it merely because 129+ commits went into it.

The new strategic center is:

# EXTERNAL CUSTOMER ACQUISITION.

The movie must answer:

> **How does Uptick get people who are somewhere else to become customers of my gas station?**

Then:

> **How does that first visit become someone I can reach again?**

Then:

> **Can Uptick bring that person back?**

That is the new film.

---

# 5. STRATEGIC TRUTH

The movie is about:

# UPTICK GROWTH

not:

# UPTICK DROP

The system is:

# OWNER GOAL

↓

# UPTICK OPERATES THE GROWTH PLAN

↓

# EXTERNAL LOCAL DISTRIBUTION

↓

# FIRST VISIT

↓

# PERMISSIONED RELATIONSHIP

↓

# LATER REASON TO RETURN

↓

# SECOND VISIT

↓

# PROOF

Drops are one mechanism inside the system.

Screens are one mechanism.

Partner businesses are one mechanism.

Local digital reach is one mechanism.

Do not make the viewer learn a suite of separate products.

The experience should feel like:

> **Uptick handles local customer acquisition for me.**

---

# 6. PRIMARY VIEWER

Primary:

# Independent gas-station / convenience-store owner.

Also polished enough for:

* multi-location operators;
* fuel distributors;
* fuel-industry executives;
* strategic partners;
* potential commercial partners.

The primary owner is:

* busy;
* skeptical;
* not excited by SaaS;
* not interested in learning ad-tech terminology;
* not interested in managing campaigns;
* interested in store traffic;
* interested in repeat visits;
* interested in whether marketing actually drove somebody through the door.

The film should not ask him to become a marketer.

---

# 7. THE 24-HOUR MEMORY TEST

Tomorrow, the owner should remember:

> **They find nearby drivers, bring them to my store, and help me bring them back.**

The deeper idea:

> **Uptick builds and operates the customer-acquisition network around my station.**

If he instead remembers:

* QR codes;
* screens;
* SMS;
* free coffee;
* a dashboard;
* an app;
* “Drops”;

the film failed.

---

# 8. THE DIY TEST

This is critical.

If Uptick looks like:

> QR code + SMS software

Joe can approximate it himself.

If Uptick looks like:

> put a sign at my own pump and send my customers texts

Joe can approximate it himself.

The differentiated part is:

# EXTERNAL LOCAL DISTRIBUTION THAT UPTICK CREATES AND OPERATES.

Examples:

* car washes;
* oil-change shops;
* tire shops;
* repair businesses;
* other driver-serving businesses;
* nearby Uptick screens;
* targeted local reach;
* future Uptick-owned local audience.

The external distribution should be visually obvious **before the customer scans anything**.

The QR code is merely a transfer mechanism.

It must never become the product.

---

# 9. WINNING CREATIVE DIRECTION

# THE NEXT STOP

One nearby driver's journey is the emotional spine.

Core movement:

# SOMEWHERE ELSE

→

# JOE'S

→

# PERMISSION

→

# JOE'S AGAIN

That is the commercial.

Target runtime:

# 64–68 seconds.

The old master was 68.58 seconds, so the existing production grammar is already close to the desired scale.

---

# 10. VOICEOVER

Use **very sparse narration or fragments only** if it materially improves comprehension.

The film must remain fully understandable muted.

Candidate VO fragments:

> “People nearby are already stopping somewhere.”

> “Uptick gives them a reason to make you the next stop.”

> “Then one visit becomes someone you can reach again.”

Do not automatically use all three.

During the proxy cut, compare:

### Version A

No voiceover.

### Version B

Sparse fragments.

Choose based on which version better sells the system without making the film feel like a startup explainer.

Never let narration compensate for unclear imagery.

---

# 11. STORYLINE

## ACT 1 — OWNER NEED

### Approx. 0:00–0:06

Joe's Fuel & Go.

Morning.

Cars pass.

Joe's is open and functioning normally.

The station does not need to look dead.

The owner communicates one goal:

> **I need more nearby drivers to choose us.**

Uptick responds with one simple action:

> **Build a local growth plan**

Joe approves.

Then owner software disappears.

Do not show:

* campaign builder;
* audience builder;
* partner manager;
* dashboard tour;
* AI chat assistant;
* settings;
* complicated controls.

Owner experience:

# SAY WHAT I WANT → APPROVE → UPTICK HANDLES IT.

---

# 12. ACT 2 — THE CUSTOMER IS SOMEWHERE ELSE

## Approx. 0:06–0:16

Location:

# MAIN STREET CAR WASH

This is the hero acquisition source.

The hero customer is already there.

They are:

* local;
* a driver;
* physically away from Joe's;
* already engaged in a natural driver-related activity.

Joe's must not dominate the establishing frame.

The scene must unmistakably read:

# THIS PERSON WAS ALREADY AT ANOTHER BUSINESS.

They encounter a physical Uptick placement near the car-wash exit.

Copy:

# YOUR NEXT STOP IS ON US.

### Free coffee at Joe's Fuel & Go

# 0.7 mi away

Small Uptick branding.

Joe's is the merchant.

Uptick is the system creating distribution.

The customer notices it.

Then scans.

The scan should receive far less emphasis than the external placement.

If a freeze-frame makes the film look like a QR commercial, redesign it.

---

# 13. ACT 3 — 0.7 MILES BECOMES PHYSICAL

## Approx. 0:16–0:25

The customer's phone opens the acquisition offer/pass.

The number:

# 0.7 mi

becomes one of the film's signature visual moments.

Explore a transformation where:

`0.7 mi away`

becomes:

# ACTUAL LOCAL GEOGRAPHY.

Possible grammar:

* the `0` resolves into curved street geometry;
* the decimal becomes a route marker;
* the `7` straightens or folds into a road segment;
* the typography gradually stops being typography and becomes Main Street itself.

Do not force those exact mechanics if a better system appears.

The crucial requirement is:

# THE ROUTE BECOMES PHYSICAL.

No floating map UI.

No generic Google-Maps animation.

No glowing hologram.

The route exists in the canonical Main Street world.

Then the customer's car enters that route.

The camera follows the local distance to Joe's.

This moment should prove:

> **Uptick is hyperlocal.**

---

# 14. ACT 4 — FIRST ARRIVAL

## Approx. 0:25–0:35

The route reaches Joe's.

Use the existing Joe's world where useful.

The route crosses the physical threshold.

At the moment the customer physically enters:

# THE ROUTE HAS COMPLETED ITS JOB.

Let it disappear.

Customer enters.

Use medium-distance human treatment.

Avoid:

* face-dependent acting;
* close procedural hands;
* synthetic full-body hero humans;
* mannequin presentation.

At the counter:

customer redeems the acquisition offer.

Coffee is handed off.

Redemption state should remain restrained.

Something like:

> **Redeemed at Joe's**

and:

> **Source: Main Street Car Wash**

The source attribution is strategically important.

It proves:

> someone who was elsewhere arrived here through Uptick.

Do not make this a dashboard.

---

# 15. ACT 5 — FIRST VISIT BECOMES PERMISSION

## Approx. 0:35–0:41

This is the hinge of the commercial.

After redemption:

> **Want Joe's Friday offer?**

> Get one useful offer each Friday.

Button:

# KEEP ME POSTED

The customer explicitly accepts.

Then:

# YOU'RE IN.

Do not imply automatic enrollment.

Do not silently add them to marketing.

Permission must be visually and logically explicit.

This is where:

# A VISIT

becomes:

# A RELATIONSHIP.

---

# 16. ACT 6 — TIME PASSES

## Approx. 0:41–0:49

Make the time change unmistakable.

Several days later.

Same customer.

Same phone.

Potential state:

# JOE'S FRIDAY DROP

### Breakfast sandwich + coffee

# $4.99

### Friday · 6–10 AM

The strategic decision here is deliberate:

# THE RETURN OFFER IS PAID.

The first visit can use a free coffee as acquisition cost.

The second visit should not imply that Uptick only generates repeat visits by endlessly giving things away.

One appearance of the word:

# DROP

is enough.

Do not teach the term.

Behavior first.

Taxonomy second.

---

# 17. ACT 7 — THE SECOND VISIT

## Approx. 0:49–0:56

This is arguably the most important beat in the entire film.

Use a visual rhyme or match cut with the first arrival.

Same Joe's doorway.

Different day.

Different light/time state.

Same customer returns.

The viewer should understand this **without narration**.

Show a normal paid transaction connected to the Friday offer.

Possible restrained state:

# RETURNED FRIDAY

No second free acquisition coffee.

This should make the owner think:

> **Oh. I didn't just buy one visit. I gained someone I can reach again.**

If that realization does not land, the film is not finished.

---

# 18. ACT 8 — THE NETWORK AROUND JOE'S

## Approx. 0:56–1:02

Only after the hero customer journey is complete, expand the world.

Pull upward / outward from Joe's.

Reveal additional acquisition sources.

Use:

### Main Street Car Wash

0.7 mi

### Quick Lube

1.2 mi

### Ridge Tire

1.5 mi

### Nearby Uptick Screen

0.9 mi

### Local Paid Reach

within local radius

The effect should be:

> This was not one lucky car wash.

It is a system Uptick can operate around Joe's.

Do not turn this into:

* a node graph;
* sci-fi network;
* glowing SaaS diagram;
* ArcGIS demo;
* floating labels everywhere.

The geography should remain grounded.

Screens are clearly:

# ONE ACQUISITION CHANNEL AMONG SEVERAL.

Not the protagonist.

---

# 19. ACT 9 — FINAL PROOF

## Approx. 1:02–1:07

The acquisition paths collapse or resolve into a clean proof state.

Do not use a dashboard.

Use typography and causality.

Suggested:

# EXAMPLE UPTICK GROWTH CAMPAIGN

# 18

first visits from Uptick

# 14

chose to stay connected

# 5

returned on Friday

Small:

> Illustrative campaign data.

Then resolve:

# UPTICK GROWTH

### We build the network around your station.

# Bring them in. Bring them back.

Pressure-test that final wording in the actual cut.

Do not keep a line merely because it is written here.

The idea matters more than the exact sentence.

---

# 20. ILLUSTRATIVE FIXTURE

Build a deterministic fixture.

All arithmetic must reconcile.

Use:

| Source               | Distance | Claims | First visits | Explicit opt-ins | Friday returns |
| -------------------- | -------: | -----: | -----------: | ---------------: | -------------: |
| Main Street Car Wash |   0.7 mi |      9 |            7 |                6 |              3 |
| Quick Lube           |   1.2 mi |      5 |            4 |                3 |              1 |
| Ridge Tire           |   1.5 mi |      4 |            3 |                2 |              1 |
| Nearby Uptick screen |   0.9 mi |      3 |            2 |                2 |              0 |
| Local paid reach     |  ≤1.8 mi |      3 |            2 |                1 |              0 |
| TOTAL                |          |     24 |           18 |               14 |              5 |

Hero customer:

```text
source:
Main Street Car Wash

first redemption:
Tuesday · 8:17 AM

permission:
Tuesday · 8:18 AM

return offer:
Thursday · 4:42 PM

return:
Friday · 7:36 AM
```

Do not call these:

> 18 brand-new customers

unless the actual instrumentation genuinely supports prior-customer deduplication.

---

# 21. TRUTH CONTRACT

Use observable states.

Safe:

### FIRST VISITS FROM UPTICK

when a source-specific acquisition token/pass is redeemed at Joe's.

### CHOSE TO STAY CONNECTED

only after explicit customer permission.

### RETURNED

only after a later qualifying visit/redemption by the same permissioned customer.

### SOURCE ATTRIBUTION

when the source is encoded before arrival.

Do not claim:

* new customer if newness cannot actually be verified;
* incremental revenue without POS/revenue attribution;
* causality stronger than instrumentation supports;
* customer identity knowledge that does not exist;
* AI functions that are not truly part of Growth;
* guaranteed outcomes.

Illustrative numbers are:

# DEMONSTRATION FIXTURE DATA.

Not promises.

---

# 22. REUSE AUDIT

Do not rebuild everything.

## KEEP / STRONGLY PRESERVE

* Remotion architecture;
* canonical Joe's/Main Street world;
* Blender environment system;
* camera declaration system;
* physical UI approach;
* tracked phone-screen pipeline;
* baked screens;
* homography/tracking;
* proxy/final lanes;
* critic architecture;
* film preflight;
* sound architecture;
* deterministic audio synthesis;
* typography foundation;
* Geist/Geist Mono/Newsreader system unless strong evidence justifies change;
* restrained mint usage;
* amber = people;
* poster/contact-sheet tooling;
* master/web export tooling;
* threshold grammar;
* physical screen primitives;
* phone primitives where reusable;
* coffee asset;
* existing redemption logic where useful.

## MODIFY

* film fixture;
* phone acquisition state;
* source provenance;
* permission state;
* return Drop;
* second-visit state;
* Joe's threshold coverage;
* sound cues;
* route/geography system;
* final proof;
* screen role;
* customer continuity;
* act timing;
* film timeline.

## RETIRE

* "Friday mornings are slow" as the movie's narrative spine;
* 3 → 21 story;
* existing-customer-first story;
* old final proof;
* old owner interpretation sequence if it slows acquisition comprehension;
* question/answer sequence unless it is strategically necessary;
* any dashboard-style proof;
* floating UI;
* excessive mint;
* debug labels;
* procedural hands as hero objects;
* generic SaaS cards;
* long passages explaining intelligence;
* anything beautiful that now explains the wrong product.

Do the real audit after reading the repo.

Do not mechanically follow this list if implementation evidence suggests a better reuse decision.

---

# 23. EXISTING FILM LESSONS THAT MUST SURVIVE

The old film learned several expensive lessons.

Do not learn them twice.

## RULE 1 — NO FLOATING SOFTWARE

In physical scenes, Uptick software exists only on:

* physical screens;
* phones;
* signage;
* real surfaces.

## RULE 2 — A PROCEDURAL HAND IS NOT A HERO OBJECT

The prior film proved that tuning procedural fingers does not solve close-hand credibility.

If a finger joint can be inspected:

# THE CAMERA IS TOO CLOSE.

Use:

* framing;
* rake;
* occlusion;
* medium distance;
* better human asset where justified.

## RULE 3 — LIGHT CAN CARRY HUMANS BETTER THAN GEOMETRY

Backlit threshold silhouettes worked better than exposed mannequin bodies.

Use lighting and occlusion strategically.

## RULE 4 — A FOREGROUND MUST ACTUALLY BE A FOREGROUND

Ground plane is not foreground.

Use legible objects with physical depth.

## RULE 5 — PROXY PASSES DO NOT PROVE FINAL HUMAN QUALITY

The previous hand reframe looked acceptable in low-resolution proxy and still failed at final inspection.

Any shot involving:

* human anatomy;
* detailed materials;
* phone grip;
* close product physicality

needs final-resolution Gate B inspection.

## RULE 6 — EVERY CAMERA MOVE MUST HAVE A REASON

The existing camera system requires:

* family;
* height;
* foreground;
* subject;
* background;
* focal plane;
* motivation;
* start stop;
* end stop.

Preserve that level of discipline.

---

# 24. NEW P0 ASSETS

Build what the story actually needs.

## P0 — MAIN STREET CAR WASH

Must instantly read as a car wash.

You do not need to build an enormous interior if the exit/exterior context carries the scene.

Needed:

* recognizable car-wash architecture;
* customer vehicle;
* exit/vacuum/detail context;
* physical Uptick placement;
* convincing local-business geography.

## P0 — ACQUISITION PLACEMENT

Copy:

> YOUR NEXT STOP IS ON US.

> Free coffee at Joe's Fuel & Go

> 0.7 mi away

Use exact typography/compositing.

## P0 — SOURCE-SPECIFIC CLAIM / PASS

Main Street Car Wash attribution survives into first redemption.

## P0 — 0.7 MI ROUTE

Potential signature shot.

## P0 — PERMISSION STATE

Explicit.

Simple.

## P0 — FRIDAY DROP

One appearance.

## P0 — SECOND VISIT

Visibly different day.

Same customer.

Paid offer.

## P0 — FINAL PROOF

Typography.

Not dashboard.

## P0 — CUSTOMER CONTINUITY SYSTEM

One hero customer recognizable enough for continuity without requiring a photoreal facial acting system.

---

# 25. P1 ASSETS

After Gate A:

* Quick Lube node;
* Ridge Tire node;
* nearby Uptick-screen node;
* local paid reach representation;
* multi-source pullback;
* network/proof transformation;
* revised poster;
* new teaser;
* revised sound motifs.

Do not spend premium production time on P1 before the six core moments work.

---

# 26. HUMAN PRODUCTION STRATEGY

Use a hybrid approach.

The old film intentionally used abstraction, but the new film has more customer continuity.

Do not simply scale the old mannequin system closer.

Potential hierarchy:

### OPTION A

Existing stylized Blender people, but only where distance/light makes them credible.

### OPTION B

Higher-quality rigged human asset.

### OPTION C

Selective generated/live-action-feeling footage for natural movement.

Use C only if:

* continuity survives;
* the same customer can remain coherent;
* exact UI can be composited afterward;
* hands are credible;
* vehicles are coherent;
* wardrobe remains stable;
* face does not morph;
* lighting matches the physical world;
* footage is genuinely stronger than Blender.

Reject generated footage with:

* changing fingers;
* morphing phone;
* changing vehicle;
* changing clothes;
* spatial discontinuity;
* inconsistent face;
* impossible reflections;
* fake signage.

Do not use generated video merely because Astra can.

---

# 27. SIX GATE-A PROTOTYPES

Before building the entire film, create these six systems.

## 1. EXTERNAL ACQUISITION

Main Street Car Wash + Joe's physical placement.

Must score:

# 9.5/10+

on acquisition clarity.

## 2. 0.7 MI → ROUTE

Must score:

# 9.5/10+

This should be one of the film's defining moments.

## 3. FIRST JOE'S ARRIVAL

Route → threshold → first visit.

## 4. EXPLICIT PERMISSION

Redemption → stay connected.

## 5. FIRST VISIT / SECOND VISIT MATCH

Must score:

# 9.5/10+

Muted viewer should immediately understand:

> same customer, later visit.

## 6. NETWORK → PROOF

Other external sources appear only after the customer story is understood.

---

# 28. GATE A

Render the six prototypes in proxy quality.

Create:

* representative stills;
* short motion tests;
* contact sheet;
* timestamped notes.

Score each system 1–10 for:

* external acquisition clarity;
* Growth-vs-channel clarity;
* visual hierarchy;
* physical/digital integration;
* customer continuity;
* DIY defensibility;
* cinematic quality;
* human credibility;
* typography/readability;
* premium feel.

Requirements:

# NO CATEGORY BELOW 8.5.

And:

### External acquisition

≥ 9.5

### Route

≥ 9.5

### Second-visit match

≥ 9.5

Do not proceed because something “basically works.”

Iterate.

---

# 29. BUILD THE FULL PROXY CUT

After Gate A:

assemble the whole 64–68 second film.

The proxy must include:

* all acts;
* all transitions;
* exact copy;
* full customer journey;
* full time change;
* both visits;
* final network reveal;
* final proof;
* full temporary/final-ish sound;
* optional sparse VO version;
* no missing placeholders.

Export:

* full proxy MP4;
* muted proxy MP4 if useful;
* contact sheet;
* one frame every ~2 seconds;
* act timing table;
* six signature-shot sequences.

---

# 30. GATE B — ATTACK THE COMMERCIAL

Review the complete film from first principles.

Ask:

1. Is Growth clearly the protagonist?
2. Does Uptick visibly acquire somebody externally?
3. Does the customer begin somewhere that is obviously not Joe's?
4. Does the car wash read instantly?
5. Does the offer feel like a reason to move, not the product itself?
6. Does the QR feel subordinate?
7. Does `0.7 mi` actually prove hyperlocality?
8. Does the route feel physically embedded?
9. Is the first visit unmistakable?
10. Is source attribution understandable without dashboard UI?
11. Is explicit permission clear?
12. Does the later offer clearly happen days later?
13. Is “Drop” used sparingly?
14. Is the return offer paid?
15. Is the second visit unmistakably a second visit?
16. Is it obviously the same customer?
17. Are screens merely one channel?
18. Does the multi-source reveal expand the business model instead of fragmenting it?
19. Does the ending prove value?
20. Are all claims defensible?
21. Does Joe appear hands-off enough?
22. Does the film work muted?
23. Does it work on a laptop?
24. Does it work on a wall?
25. Would a station owner explain Uptick correctly after one viewing?
26. Would the owner still remember the idea tomorrow?
27. Does any frame look like AI-generated commercial footage?
28. Does any frame look like Blender archviz?
29. Does any frame look like SaaS UI pasted over 3D?
30. Does any passage admire its own craft more than it explains Uptick?

Score:

* story;
* strategic clarity;
* external acquisition;
* first visit;
* relationship;
* return;
* truthfulness;
* simplicity;
* human credibility;
* physical world;
* cinematography;
* typography;
* motion;
* sound;
* physical/digital integration;
* premium feel;
* overall effectiveness.

Target:

# 9.0/10 MINIMUM FINAL FILM.

Signature moments:

# 9.5/10+

Do not round an 8.99 to 9.

The existing film specifically refused to do that.

Maintain that discipline.

---

# 31. CINEMATIC STANDARD

Target:

# A BESPOKE ~$30,000 BOUTIQUE COMMERCIAL / PRODUCT FILM.

Not:

* AI commercial;
* SaaS walkthrough;
* startup explainer;
* Blender short;
* archviz;
* motion-design reel;
* dashboard animation;
* product-tour video.

The film should feel:

* restrained;
* expensive;
* specific;
* physical;
* local;
* human;
* assured.

Do not confuse “premium” with:

* slow;
* dark;
* minimal for its own sake;
* tiny text;
* dramatic depth of field everywhere;
* ornamental transitions.

Every major creative decision should clarify the Growth system.

---

# 32. VISUAL GRAMMAR TO PRESERVE

The old film's three-world grammar is valuable.

Consider preserving/adapting:

## WORLD 1 — UPTICK THINKS

Editorial / typographic space.

Use sparingly.

## WORLD 2 — UPTICK ACTS

Physical Main Street world.

Software only on physical surfaces.

## WORLD 3 — THE RELATIONSHIP

Inside the customer's phone / permissioned relationship.

The new story should probably spend **more time in World 2** than the old film because external acquisition and repeat physical visits are now the protagonist.

Do not inherit the old act balance automatically.

---

# 33. TYPOGRAPHY

Existing system:

* Geist Sans;
* Geist Mono;
* Newsreader italic for customer voice.

The previous typography audit specifically tested alternatives and chose to keep Geist.

Do not casually rebrand the film.

Preserve typography unless the new film produces strong evidence that a change is necessary.

Avoid:

* tiny captions;
* excessive mono;
* UI-density;
* pill shapes;
* generic SaaS buttons.

Text should read at real presentation scale.

---

# 34. COLOR

Existing discipline:

* cream/editorial field;
* ink;
* marine/dark;
* mint for system events;
* amber for people.

Preserve the semantic discipline.

Mint should not become decoration.

Amber should not become generic accent color.

If the new story requires adjustments, document why.

---

# 35. SOUND

Reuse the existing sound architecture and deterministic synthesis system.

Existing film already has:

* street ambience;
* room tone;
* taps;
* scan;
* notify;
* press;
* redemption;
* score structure;
* synthetic cues;
* mastered output pipeline.

Re-score to the new story.

Potential sound logic:

### Joe's opening

natural street + store.

### Car wash

recognizable mechanical wash / vacuum / water texture.

### Acquisition

restrained attention cue.

### Scan

small.

### Route

motion rhythm that grows physically.

### Joe's threshold

location change.

### Redemption

clean event cue.

### Permission

quiet resolve.

### Time jump

environmental transition.

### Friday return

recall a motif from the first visit.

### Network

expand spatially.

### Proof

resolve, do not “victory sting.”

Avoid:

* whoosh-pack editing;
* generic inspirational startup score;
* over-mastering;
* cinematic boom clichés.

The film must still work muted.

---

# 36. FINAL-QUALITY PHYSICAL GATE

Proxy approval is not enough.

Before full-film final render, inspect representative final-resolution frames for all new physical assets.

Especially:

* car wash;
* acquisition placement;
* customer;
* vehicle;
* phone;
* Joe's first threshold;
* Joe's second threshold;
* paid transaction;
* network pullback.

Read them 1:1.

Reject if anything reads as:

* low-poly explainer;
* mannequin;
* toy vehicle;
* UI overlay;
* compositing error;
* archviz;
* cheap CG;
* AI-video artifact.

---

# 37. RENDER RESOLUTION

Existing honest master:

# 1920×1080.

Existing physical plates:

# 1280×720

upscaled beneath vector Remotion layers.

Do not falsely label an upscaled deliverable “4K quality.”

If producing a real 4K master:

* render Remotion at 3840×2160;
* raise physical plate resolution materially;
* use cloud GPU;
* inspect actual source detail;
* document actual plate/master dimensions.

If 1080p remains visually superior relative to compute budget:

ship an honest premium 1080p master.

Quality matters more than the filename.

---

# 38. VERIFY OUTPUTS — DO NOT TRUST FILENAMES

At final:

use ffprobe/appropriate tooling.

Record actual:

* width;
* height;
* FPS;
* duration;
* video codec;
* audio codec;
* bitrate where useful;
* audio channels;
* sample rate;
* frame count.

Do not infer resolution from:

`1080p`

or:

`4k`

in filenames.

---

# 39. TESTING

Run all relevant validation.

At minimum consider:

```bash
npm install
npm run build
npx tsc --noEmit
```

plus existing film validation.

Run:

* film preflight;
* fixture arithmetic checks;
* Remotion composition validation;
* baked-screen checks;
* missing asset checks;
* plate-length checks;
* cue existence checks;
* source-path validation;
* ffprobe;
* resolution checks;
* frame-count checks.

Run Playwright where relevant to film tooling or connected web surfaces.

All heavy work remains cloud-side.

---

# 40. PRESERVE / IMPROVE PREFLIGHT

The existing:

`scripts/film-preflight.py`

checks:

* missing physical plates;
* plate frame counts;
* missing audio cues.

Extend it if the new film creates additional failure modes.

Potential additions:

* required acquisition source textures;
* customer-state assets;
* route exports;
* fixture reconciliation;
* final proof arithmetic;
* baked screen freshness;
* required final deliverables;
* poster existence;
* codec/dimension validation.

Make expensive renders fail early, not late.

---

# 41. FULL PRODUCTION PHASES

Follow this order.

## PHASE 0 — REPOSITORY TRUTH

Inspect.

Document current head.

Create branch.

Push branch.

## PHASE 1 — REUSE AUDIT

Classify:

KEEP / MODIFY / RETIRE.

## PHASE 2 — FIXTURE REFOUNDATION

Replace stale commercial fixture with acquisition-first fixture.

Keep arithmetic deterministic.

## PHASE 3 — SIX GATE-A SYSTEMS

Build only the six most consequential moments.

## PHASE 4 — GATE A

Critique.

Iterate.

Do not advance until passed.

## PHASE 5 — NEW PHYSICAL ASSETS

Build car wash, route, return states, supporting nodes.

## PHASE 6 — FULL PROXY CUT

Complete story.

## PHASE 7 — GATE B

Attack the movie.

Iterate.

## PHASE 8 — FINAL PHYSICAL LOOK GATE

Read final-resolution plates at 1:1.

## PHASE 9 — SOUND

Finalize sound and optional sparse narration.

## PHASE 10 — FINAL RENDERS

Cloud compute.

## PHASE 11 — MASTER / WEB / TEASER / POSTER

Produce complete delivery set.

## PHASE 12 — FINAL CRITIC

Score finished master.

## PHASE 13 — DOCUMENTATION

Update reports and handoffs.

## PHASE 14 — PUSH EVERYTHING

Push final branch.

---

# 42. FINAL DELIVERABLES

Produce:

## MASTER FILM

Highest justified quality.

## WEB FILM

H.264 and/or WebM according to existing conventions.

## 15-SECOND TEASER

Not simply a random crop.

It should communicate:

somewhere else → Joe's → return.

## POSTER

Choose deliberately after comparing candidate final frames.

Do not automatically use frame 200 from the old film.

## CONTACT SHEET

Whole film.

## SIGNATURE-MOMENT SHEET

The 6–8 best moments.

## PROXY CUT

Archive useful review output.

## FIXTURE

Single source of truth.

## SCRIPT / TIMELINE

Current final acts and timings.

## REUSE AUDIT

What survived and why.

## ASSET INVENTORY

What was built.

## TRUTH AUDIT

What each commercial claim is based on.

## RENDER PROFILE

Actual benchmark data from this production environment.

## CRITIC REPORT

Final scores and evidence.

## FINAL PRODUCTION REPORT

Everything needed for another production handoff.

---

# 43. GITHUB DISCIPLINE

Commit in coherent stages.

Suggested checkpoints:

1. acquisition fixture + architecture
2. Gate-A prototypes
3. physical acquisition assets
4. full proxy cut
5. Gate-B revisions
6. final physical assets
7. sound
8. final master/deliverables
9. documentation

Push throughout.

Final branch:

`origin/astra/uptick-acquisition-film`

Never push directly to `main`.

Never rewrite:

`film/uptick-growth-rd`

Before finishing:

```bash
git status

git log --oneline --decorate -n 30

git diff --stat origin/film/uptick-growth-rd...HEAD
```

Push.

Verify remote branch.

---

# 44. DO NOT STOP EARLY

Do not stop after:

* inspection;
* strategy;
* mockups;
* Gate A;
* car wash build;
* first proxy;
* critic notes;
* “here is what remains.”

This assignment is production.

Continue through final delivery unless genuinely blocked.

Valid hard blockers:

1. paid infrastructure requiring explicit authorization;
2. inaccessible credentials;
3. unrecoverable external-tool failure with no reasonable alternate route;
4. a requested commercial claim that cannot be defended truthfully.

If blocked:

* complete every unblocked component first;
* push completed work;
* identify exact blocker;
* request the minimum user action required.

Do not dump implementation back onto the founder.

---

# 45. FINAL SELF-ATTACK

Before calling the film finished, ask:

> Could Joe build what I showed using a QR sticker and Twilio?

If yes:

# FAIL.

> Is external distribution obvious?

If no:

# FAIL.

> Do we see someone begin somewhere other than Joe's?

If no:

# FAIL.

> Does that person physically arrive?

If no:

# FAIL.

> Do they explicitly choose to stay connected?

If no:

# FAIL.

> Do we visibly see that same person return later?

If no:

# FAIL.

> Is the second visit meaningfully different from the free acquisition visit?

If no:

# FAIL.

> Are other sources visible without fragmenting the story?

If no:

# ITERATE.

> Does Joe feel like he had to become a marketing operator?

If yes:

# FAIL.

> Does the ending prove what actually happened rather than show a dashboard?

If no:

# FAIL.

> Does the movie still feel simple?

If no:

# FAIL.

---

# 46. FINAL QUALITY BAR

The old film proved that this repository can produce an elite film.

Do not accept a strategically better but visually worse sequel.

The new film must improve the commercial thesis **without regressing production craft**.

Minimum:

# 9/10.

Target:

# 9.5/10 SIGNATURE MOMENTS.

The commercial should feel expensive enough that a fuel-industry executive assumes a professional studio made it.

But more importantly:

a station owner should understand the business.

---

# 47. FINAL REPORT FORMAT

When production is complete, return:

# EXECUTIVE VERDICT

Did the final film reach the bar?

# FINAL FILM

Runtime, resolution, format, exact path.

# WHAT CHANGED

Narrative and production changes from the R&D film.

# STRATEGIC PROOF

Show precisely how the movie proves:

external acquisition
→ first visit
→ permission
→ return.

# SIGNATURE MOMENTS

Score and describe each.

# TRUTH AUDIT

Each final commercial claim and the product state supporting it.

# HUMAN / PHYSICAL QUALITY

What was done to avoid previous human and CG failures.

# TESTING

Commands and results.

# TECHNICAL VALIDATION

Actual dimensions, FPS, frame count, codecs, duration.

# DELIVERABLES

Exact paths.

# COMMITS

Important commits.

# BRANCH

Exact remote branch.

# REMAINING RISKS

Only genuine unresolved risks.

# FINAL CRITIC SCORE

Component scores + unrounded overall score.

---

# 48. THE ONE-SENTENCE TEST

The viewer should finish thinking:

> **They build the network around my station, bring me nearby customers, and give me a way to bring them back.**

But the film itself should be even simpler:

# Someone is nearby.

# Uptick reaches them somewhere else.

# They visit Joe's.

# They choose to stay connected.

# They come back.

# Joe sees what happened.

# THAT IS UPTICK GROWTH.

Begin now.

Inspect the existing branch deeply.

Preserve the production systems that earned their place.

Replace the stale commercial thesis.

Build the six Gate-A moments.

Then carry the production all the way through the final master and push the completed work to GitHub.
