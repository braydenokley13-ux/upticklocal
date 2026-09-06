# Cue sheet · Uptick Growth

Every file is synthesized from noise and sinusoids by `film/audio/synth.py`
(numpy + stdlib only, fixed seeds, no recordings and no third-party audio).
Rendering is deterministic: two consecutive runs produce byte-identical files.

```
python3 film/audio/synth.py      # ~45 s single-threaded, writes 23 WAVs
```

Output: `public/film-rd/audio/` · 48 000 Hz · 16-bit PCM · stereo for beds and
pads, mono for one-shots. Levels below are **measured from the rendered files**,
not intended values.

Act plan used for placement:

| act | time | on screen |
| --- | --- | --- |
| I | 0–10.5 s | the page, then the street at dawn |
| II–IV | 10.5–27.5 s | typing, instruments, the plan |
| V–VI | 27.5–43 s | approve, the dusk block, the café |
| VII | 43–54 s | the question, silence, the provenance tick |
| VIII | 54–61 s | offer → pass → redeem |
| IX–X | 61–75 s | the return, five thresholds, the street brightening |
| XI | 75–81 s | the proof, the root chord |
| XII | 81–86 s | silence |

---

## All cues

| file | dur | ch | peak dBFS | rms dBFS | size | character | where it plays |
| --- | ---: | --- | ---: | ---: | ---: | --- | --- |
| `room-tone.wav` | 30.00 s | stereo | −36.0 | −46.5 | 5 625 kB | seamless loop; air floor under 380 Hz, air-handler hum 60/120/180 Hz at −40 dBFS, 0.06 Hz drift | **Act I, 0–3 s** under the page. Almost nothing. The word-by-word sentence plays over it in silence. Returns under **Act VII** after the 900 ms hole. |
| `street-dawn.wav` | 40.00 s | stereo | −28.8 | −51.9 | 7 500 kB | seamless loop; 70–2 200 Hz bed with 0.05/0.075/0.125 Hz swells; one car pass L→R at 12–16 s; birds at 6 s and 25 s; a door at 18 s | **Act I, 3–10.5 s.** Room tone widens into this over ~1.2 s as the page lifts off the concrete. The block holds on it. The 3 landing is silent. |
| `street-morning.wav` | 40.00 s | stereo | −25.2 | −44.9 | 7 500 kB | same street, brighter to 4.2 kHz; five car passes (3.5/12.6/20.4/29.2/35.6 s, alternating sides); bicycle bell at 9 s; 300–1 200 Hz voice murmur | **Acts IX–X, 61–75 s.** Crossfade from `street-dawn` as the morning advances; the bell and the murmur arrive with the thresholds. Falls away under the 21. |
| `cafe-interior.wav` | 30.00 s | stereo | −25.8 | −47.7 | 5 625 kB | grinder running from 0 s, spinning down and stopping at 3.0 s; cup clinks at 5/11/17/24 s; low conversation bed | **Act VI, ~35–43 s.** Cut to the café. Joe's content arriving on the screen gets nothing — the bed carries it. |
| `kitchen-evening.wav` | 20.00 s | stereo | −31.2 | −37.9 | 3 750 kB | fridge at 50 Hz + 4 harmonics, motor hiss, a TV two rooms away (280–950 Hz, speech-rate + scene-rate modulation) | **Act VII, 43–48 s.** The kitchen at 6:52 PM. Dips out entirely for the 900 ms silence after `send`. |
| `key.wav` | 45 ms | mono | −21.0 | −38.0 | 4 kB | soft plastic click, 1 120 Hz body | **Act II, ~11–14 s.** Typing cadence. |
| `key2.wav` | 45 ms | mono | −22.0 | −38.1 | 4 kB | same, 1 015 Hz, slightly duller | Typing cadence — alternate with `key`/`key3` so no two adjacent strokes match. |
| `key3.wav` | 45 ms | mono | −21.5 | −40.2 | 4 kB | same, 1 245 Hz, slightly brighter | Typing cadence. |
| `key-last.wav` | 55 ms | mono | −18.0 | −36.0 | 5 kB | cleaner and brighter, 1 480 Hz, longer ring | The **last** key of the sentence — the first mint. 3 dB up on the others; that difference is the whole point. |
| `tick.wav` | 30 ms | mono | −14.0 | −25.3 | 3 kB | 2 200 Hz sine burst, 8 ms decay, no noise layer at all | **Act VII, ~52 s** — the provenance tick, the row landing as the answer. The clearest small sound in the film. Also the scan confirmation if one is needed. |
| `tick-soft.wav` | 30 ms | mono | −22.0 | −33.3 | 3 kB | the same shape at 1 600 Hz, 8 dB down | **Acts II–IV.** The three ascending ticks as *Friday / mornings / slow* re-set, and any tick that must not compete with `tick.wav`. |
| `tap-wood.wav` | 120 ms | mono | −17.0 | −31.4 | 11 kB | 110 Hz wooden body (4 modes) + 4 ms noise transient | **Act V**, a window lighting; **Act VIII**, the mint point dropping through the door; **Act X**, every threshold crossing. Always at this level — the count steps on the tap, the tap never grows. |
| `press.wav` | 90 ms | mono | −16.0 | −31.4 | 8 kB | 180 Hz thock + 3 kHz contact click | **Act V, ~27.5 s.** Approve. One click, and nothing after it. |
| `notify.wav` | 200 ms | mono | −18.0 | −26.9 | 19 kB | 660 → 880 Hz sines, 90 ms each, 12 ms soft attack | An incoming message. Deliberately soft-edged so it cannot be mistaken for `tick`. |
| `send.wav` | 180 ms | mono | −20.0 | −34.7 | 17 kB | filtered-noise sweep, centroid 718 → 1 415 Hz | **Act VII, ~48 s.** "Does diesel count?" sends at ordinary volume. Then 900 ms of complete silence — cut the room tone too. |
| `scan.wav` | 80 ms | mono | −17.0 | −22.7 | 8 kB | clean sine chirp 1 200 → 2 400 Hz | **Act VI, ~41 s.** The scan. One short clean sound, nothing else. |
| `redeem.wav` | 1.00 s | mono | −15.0 | −30.2 | 94 kB | D4 + A4, odd (triangle-ish) partials, 20 ms attack, silent by 900 ms | **Act VIII, ~59 s.** The redemption. The clearest *note* in the film — nothing else in the mix at that moment. |
| `unfold.wav` | 300 ms | mono | −22.0 | −37.8 | 28 kB | shaped noise opening then closing, two crinkles at 85 and 175 ms | **Act VI, ~42 s.** The screen content lifting into the Offer. Quiet. |
| `nozzle.wav` | 220 ms | mono | −18.0 | −37.6 | 21 kB | metallic double transient at 0 and 52 ms, inharmonic modes, hard decay | **Act VIII, ~55 s.** The forecourt. |
| `grain.wav` | 600 ms | mono | −20.0 | −44.4 | 56 kB | 17 tiny grains thinning out, 1.5–4.2 kHz | **Act III.** Visit ticks landing. Nothing lands inside 07–10 — leave that gap silent, it is the point. Also for facts arriving on the paper slides. |
| `pad-mint.wav` | 12.00 s | stereo | −24.0 | −32.6 | 2 250 kB | seamless loop; A3, one tone, detuned partials, 0.25 Hz shimmer, ≤ 12 dB of breathing | **Act V, 28–34 s** as the signal enters the block (thin it out as the screens arm), and **Act VII, ~50 s** under the sheet rising, very soft. Mint is one tone — never layer two of these. |
| `chord-root.wav` | 8.00 s | stereo | −16.0 | −31.8 | 1 500 kB | D2 + A2 + D3 + F♯3 detuned saws under a 1.4 kHz low-pass, 400 ms attack, silent by 8 s | **Act IV** as the sheet lands (one soft resolve chord, nothing when Approve appears), and **Act XI, 75–81 s** holding under the 21 while the street falls away. Ends the film by running out, not by hitting. |
| `music-bed.wav` | 96.00 s | stereo | −14.0 | −31.7 | 18 000 kB | the ambient score, in D at 76 bpm — see below | Optional full-length underscore. `NOTES.md` specifies **no score in this run**, so this is the alternate pass: start it at 0 s and it lines up act-for-act. |
| | | | | | **53.3 MB** | | |

---

## `music-bed.wav` in detail

96 s, in D, one tempo throughout: **76 bpm = 0.789474 s per beat**. Measured by
spectral-flux autocorrelation of the rendered file: **76.01 bpm**, onsets
sitting on the beat grid with a 3.9 ms standard deviation. Master chain is a
tanh soft-clip at −13 dBFS followed by a −14 dBFS peak ceiling, so the file
never comes within 2 dB of the −12 dBFS limit.

| time | passage | peak | rms | what happens |
| ---: | --- | ---: | ---: | --- |
| 0–6 s | near-silence | −53.3 | −66.6 | faint air only |
| 6–10 s | sub swell | −24.6 | −33.5 | D1 (36.7 Hz) enters and recedes; felt, not heard |
| 10–14 s | pad enters | −18.4 | −28.8 | D major, wide detuned saws under a 620 Hz low-pass |
| 14–28 s | pad + pulse | −19.4 | −30.9 | quarter-note pulse at 76 bpm, eased in over two bars |
| 28–32 s | the lift | −19.4 | −31.8 | pad crossfades to A (voiced A–E–A–B) |
| 32–44 s | arpeggio | −17.2 | −29.5 | sine 1/8 notes, D–A–D–F♯–A–D over two octaves; a six-note figure against 4/4, so it drifts instead of marching |
| 44–56 s | **the dip** | −22.7 | −35.5 | pulse and arpeggio drop out; pad alone, back to D — the provenance passage |
| 56–66 s | the build | −16.7 | −31.0 | pulse returns, bass on beats 1 and 3 (D2–A1–B1–G1, four bars repeating), pad filter rising 480 → 3 000 Hz |
| 66–74 s | crescendo | **−14.0** | −27.1 | second arpeggio voice a fifth up (A–E–A–C♯–E–A) from 62 s; loudest point of the film |
| 74–80 s | the resolve | −16.8 | −33.1 | everything cuts; one warm D major chord decaying over 6 s |
| 80–96 s | silence | −51.1 | −68.2 | faint air, fading out |

The pulse's click deliberately occupies 650–1 900 Hz, above the pad's low-pass
corner — measured, it stands 14.6 dB proud of the pad between beats while
staying at −30 dBFS. That is how it can be quiet and still be felt.

---

## Notes on use

- **Loops.** `room-tone`, `street-dawn` and `pad-mint` are true loops: every
  periodic component completes a whole number of cycles in the file and the
  noise is filtered circularly, so the last sample joins the first. Measured
  wrap-around discontinuity is at or below the interior sample-to-sample step.
  `street-morning`, `cafe-interior` and `kitchen-evening` have events on a
  timeline and carry short head/tail fades — cut to them, don't loop them.
- **Silence is a cue.** Three places want an actual hole in the mix, not a
  quiet bed: the 3 landing on the pavement (Act I), the 900 ms after `send`
  (Act VII), and the last five seconds (Act XII). Mute the beds; do not
  crossfade them.
- **Never stack the mint.** `pad-mint`, `key-last`, `tick` and `redeem` are the
  mint family and each is a single clean tone. Two at once turns the idea into
  a chord and loses it.
- **Headroom.** Nothing here is mastered loud. The beds sit at −45 dBFS rms
  and the loudest one-shot peaks at −14 dBFS, which leaves the mix its
  dynamics; set the overall level at the final mix, not in these files.
- **No whooshes.** There is no transition sweetener in this set, by design.
  `send` is a text send, not a riser; the car passes are geometry (level and
  pan follow 1/distance), not fader moves.
