# The Next Stop — production checkpoint

## Actual status — 2026-09-08

Not a completed film. Gate A has not been rendered or passed. No new film,
poster, teaser, benchmark, creative score, or final-quality result is claimed.
The files in `public/film-rd/final/` remain the original R&D film.

Remote R&D head verified through `git ls-remote`:
`09211a21b821ac03a50ce316253fa5bf17d33a43`.
The new branch is `astra/uptick-acquisition-film`; neither main nor the R&D
branch was changed. The new branch was pushed before source edits.

## Cloud access blocker

This session executes shell commands on the user's Mac. No cloud shell tool is
available. GitHub works using the existing login, but Codespaces enumeration
returns HTTP 403 and specifically requires the `codespace` OAuth scope.
The repository runners API returns zero self-hosted runners. This does not
establish whether the account has GitHub-hosted Actions minutes or other cloud
machines; it only establishes that no self-hosted worker was discoverable here.
No paid machine was provisioned. No Blender, Remotion, ffmpeg, Playwright,
image batch, npm build, or full TypeScript build was run locally.

Minimum missing input: an accessible cloud worker (SSH host or Codespace),
or authorization and a spending cap for a new worker. A GPU benchmark cannot
be reported before that worker is available.

## Source checkpoint

`film/data/acquisition.json` is the new acquisition campaign source of truth.
`film/data/acquisition.ts` derives totals for future Remotion compositions.
`scripts/acquisition-fixture-check.mjs` checks source counts, funnel inequalities,
source identity, explicit permission, event order, paid return, Friday window,
and contiguous 1608-frame / 67-second timing.

These data are not yet wired into a replacement composition. Keeping the old
fixture intact prevents archived baked phone textures and plates from silently
disagreeing with the R&D edit while the new physical scenes are pending.

The hero's week-minute convention starts Monday at midnight. All events belong
to one illustrative customer and source-specific pass; no real customer identity
or real product instrumentation has been verified.

## Reuse audit from inspected source

| Keep | Modify for the new cut | Retire from the new cut |
| --- | --- | --- |
| Remotion sequence architecture | New 67-second acquisition timeline | Slow-Friday opening and history interpretation |
| Main Street and Joe's environment | Car-wash geography and source placement | Existing-customer-first distribution story |
| Camera declarations and threshold coordinates | Same-customer Tuesday/Friday threshold pair | Diesel question and automated-answer claims |
| Physical screen baking, tracks, homography | Acquisition, permission, and paid-return phone states | 21 / 14 / 7 proof and new-customer claim |
| Geist, Newsreader, semantic amber/mint | Typography-to-physical-route crossing | Original closing and original teaser |
| Deterministic audio and export pipeline | Re-time cues and score to new events | Old absolute cue timings |

The renderer source has a further portability issue: `render.py` has no device
argument despite the historical profile mentioning device auto-discovery. Do
not assume installing a GPU makes this renderer use it. Verify and explicitly
configure Cycles on the chosen worker before benchmarking.

## References and truth

The supplied owner image is a visual reference for warmth, doorway framing,
and the owner's exact goal. The storyboard image is a broader reference, not
the final script. Its testimonial and higher-sales claims are not adopted.
The explicit text brief controls the new film's acquisition-first story and
illustrative proof.

The 18 first visits mean source-specific acquisition-pass redemptions; 14 means
explicit opt-ins; 5 means subsequent qualifying Friday redemptions by those
permissioned customers. These remain demonstration data, not measured results,
incremental revenue, verified brand-new customers, or guaranteed outcomes.

## Worker entry point and next gate

On the selected cloud Linux machine, run
`python3 scripts/acquisition-worker-check.py` in the intended Blender Python
environment. It reports executable availability and actual Cycles backend
devices without rendering or installing anything. A Linux check prevents
accidental execution on this Mac, but is not itself proof a host is cloud-owned.
This is a capability probe, not a completed worker deployment.

After access is available: finish the source inspection; configure and benchmark
Cycles; build and render the six Gate-A prototypes; inspect stills and motion;
iterate before assembling the full proxy. Do not relabel legacy review scores as
new Gate-A evidence. The current five-second proof-and-resolve allocation must
be tested for reading time in the proxy before it is accepted.
