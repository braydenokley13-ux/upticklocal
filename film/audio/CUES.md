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

Act plan used for placement — the film's real timeline, **1646 frames at
24 fps = 68.58 s**:

| act | time | on screen |
| --- | --- | --- |
| I | 0–9.00 s | the page until 3.00 s; the lift off the concrete 3.00–7.08 s; the settle, and the line on the road at 8.33 |
| II–IV | 9.00–22.58 s | typing (first keystroke 9.67 s); *Friday* 12.42, *mornings* 13.83, *slow* 15.33; the 63 land 16.58; the annotations 17.50; the plan assembles 18.83 and is whole at 20.83; Approve appears 21.67 |
| V | 22.58–30.67 s | Approve pressed at 23.08 s; the block at dusk from 24.67; windows light 27.42–28.88 |
| VI | 30.67–40.33 s | the text 30.67–33.83; the café panel 33.83–35.67; the scan 35.67, the glass opens out 36.00; the same Offer full-frame from 37.17, saved 39.33 |
| VII | 40.33–48.33 s | the question 41.50; it sends at 41.92; **the 830 ms hole 42.00–42.83**; the sheet rises 42.83; the three words leave 43.67; the answer lands 45.08; "38 handled · 2 needed Joe" 46.83–47.50 |
| VIII | 48.33–55.08 s | the forecourt 48.33–49.21; the door 49.25–50.13; the counter 50.17–51.04; the pass 51.08–54.04 (**Redeem now** pressed 51.92, redeemed 52.08–52.75); the coffee crosses 54.08–55.04. **The redeem note at 52.08 s must be alone** |
| IX–XI | 55.08–63.67 s | the pump 55.08–56.04; the frontage 56.08–57.13; the door later 57.17–58.04; the lane 58.08–59.71; the morning washes the set away 58.92; the 21 lands 59.83; "came through the door." 60.67; "14 returned. 7 were new." 61.83 |
| XII | 63.67–68.58 s | Uptick Growth 65.08; the closing line 66.25; the footer 67.33 |

---

## All cues

| file | dur | ch | peak dBFS | rms dBFS | size | character | where it plays |
| --- | ---: | --- | ---: | ---: | ---: | --- | --- |
| `room-tone.wav` | 30.00 s | stereo | −36.0 | −46.5 | 5 625 kB | seamless loop; air floor under 380 Hz, air-handler hum 60/120/180 Hz at −40 dBFS, 0.06 Hz drift | **Act I, 0–3.8 s** under the page. Almost nothing. The word-by-word sentence plays over it in silence. Not used again — Act VII's room is the kitchen. |
| `street-dawn.wav` | 40.00 s | stereo | −28.8 | −51.9 | 7 500 kB | seamless loop; 70–2 200 Hz bed with 0.05/0.075/0.125 Hz swells; one car pass L→R at 12–16 s; birds at 6 s and 25 s; a door at 18 s | **Act I, 3.0–9.0 s.** Room tone widens into this over ~1.2 s as the page lifts off the concrete. The block holds on it. The 3 landing is silent. |
| `street-morning.wav` | 40.00 s | stereo | −25.2 | −44.9 | 7 500 kB | same street, brighter to 4.2 kHz; five car passes (3.5/12.6/20.4/29.2/35.6 s, alternating sides); bicycle bell at 9 s; 300–1 200 Hz voice murmur | **Acts VIII–XI, 48.3–60.0 s.** Laid at the forecourt cut and ducked to a sixth behind the glass while we are inside Joe's; ducked again under the redeem note. The bell and the murmur come up as the morning advances. Falls away under the 21. |
| `cafe-interior.wav` | 30.00 s | stereo | −25.8 | −47.7 | 5 625 kB | grinder running from 0 s, spinning down and stopping at 3.0 s; cup clinks at 5/11/17/24 s; low conversation bed | **Act VI, 33.8–39.0 s**, and again as the store's own room inside Joe's, **Act VIII, 50.2–55.1 s**, at 0.28. Joe's content arriving on the panel gets nothing — the bed carries it. |
| `kitchen-evening.wav` | 20.00 s | stereo | −31.2 | −37.9 | 3 750 kB | fridge at 50 Hz + 4 harmonics, motor hiss, a TV two rooms away (280–950 Hz, speech-rate + scene-rate modulation) | **Act VI, 30.7–33.8 s** (the text lands at home) and **Act VII, 40.3–48.3 s** (the question is typed there). Cut out entirely for the 830 ms silence after `send`, and back two frames before it ends. |
| `key.wav` | 45 ms | mono | −21.0 | −38.0 | 4 kB | soft plastic click, 1 120 Hz body | **Act II, 9.7–12.0 s.** Typing cadence at 1.45 frames a character. |
| `key2.wav` | 45 ms | mono | −22.0 | −38.1 | 4 kB | same, 1 015 Hz, slightly duller | Typing cadence — alternate with `key`/`key3` so no two adjacent strokes match. |
| `key3.wav` | 45 ms | mono | −21.5 | −40.2 | 4 kB | same, 1 245 Hz, slightly brighter | Typing cadence. |
| `key-last.wav` | 55 ms | mono | −18.0 | −36.0 | 5 kB | cleaner and brighter, 1 480 Hz, longer ring | The **last** key of the sentence — the first mint. 3 dB up on the others; that difference is the whole point. |
| `tick.wav` | 30 ms | mono | −14.0 | −25.3 | 3 kB | 2 200 Hz sine burst, 8 ms decay, no noise layer at all | **Act VII, 45.08 s** — the provenance tick, the row landing as the answer. The clearest small sound in the film. Also the scan confirmation if one is needed. |
| `tick-soft.wav` | 30 ms | mono | −22.0 | −33.3 | 3 kB | the same shape at 1 600 Hz, 8 dB down | **Acts II–IV.** The three ascending ticks as *Friday / mornings / slow* re-set, and any tick that must not compete with `tick.wav`. |
| `tap-wood.wav` | 120 ms | mono | −17.0 | −31.4 | 11 kB | 110 Hz wooden body (4 modes) + 4 ms noise transient | **Act V, 27.4–28.9 s**, a window lighting; **Act VIII, 49.5 s**, the door; **Act VIII, 55.4 s**, the cup meeting the counter (pitched up); **Acts IX–X, 55.4–57.4 s**, every person crossing. Always at this level — the count steps on the tap, the tap never grows. |
| `press.wav` | 90 ms | mono | −16.0 | −31.4 | 8 kB | 180 Hz thock + 3 kHz contact click | **Act V, 23.08 s.** Approve. One click, and nothing after it. Also **Act VI, 32.0 s** (the text opens) and **39.5 s** (Save), and **Act VIII, 51.92 s** — *Redeem now*, the one action a person takes in the whole redemption. |
| `notify.wav` | 200 ms | mono | −18.0 | −26.9 | 19 kB | 660 → 880 Hz sines, 90 ms each, 12 ms soft attack | An incoming message. Deliberately soft-edged so it cannot be mistaken for `tick`. |
| `send.wav` | 180 ms | mono | −20.0 | −34.7 | 17 kB | filtered-noise sweep, centroid 718 → 1 415 Hz | **Act VII, 41.92 s.** "Does diesel count?" sends at ordinary volume. Then 830 ms of complete silence — cut the room tone too. |
| `scan.wav` | 80 ms | mono | −17.0 | −22.7 | 8 kB | clean sine chirp 1 200 → 2 400 Hz | **Act VI, 35.67 s.** The stranger holds their phone to the panel. One short clean sound, nothing else. |
| `redeem.wav` | 1.00 s | mono | −15.0 | −30.2 | 94 kB | D4 + A4, odd (triangle-ish) partials, 20 ms attack, silent by 900 ms | **Act VIII, 52.08 s.** The redemption, four frames after the press. The clearest *note* in the film — nothing else in the mix at that moment. |
| `unfold.wav` | 300 ms | mono | −22.0 | −37.8 | 28 kB | shaped noise opening then closing, two crinkles at 85 and 175 ms | **Act VI, 36.0 s.** The glass opening out into the Offer. Quiet. Also **Act II–IV, 17.5 s**, the facts arriving on paper. |
| `nozzle.wav` | 220 ms | mono | −18.0 | −37.6 | 21 kB | metallic double transient at 0 and 52 ms, inharmonic modes, hard decay | **Act VIII, 48.58 s.** The pump beside the lane the customer walks. |
| `grain.wav` | 600 ms | mono | −20.0 | −44.4 | 56 kB | 17 tiny grains thinning out, 1.5–4.2 kHz | **Act III, 16.58 s.** The 63 landing above the line. Nothing lands inside 07–10 — leave that gap silent, it is the point. Also for facts arriving on the paper slides. |
| `pad-mint.wav` | 12.00 s | stereo | −24.0 | −32.6 | 2 250 kB | seamless loop; A3, one tone, detuned partials, 0.25 Hz shimmer, ≤ 12 dB of breathing | **Act V, 24.2–33.8 s** as the signal enters the block (thinning as the screens arm), and **Act VII, 42.8–48.1 s** under the sheet rising, very soft. Mint is one tone — never layer two of these. |
| `chord-root.wav` | 8.00 s | stereo | −16.0 | −31.8 | 1 500 kB | D2 + A2 + D3 + F♯3 detuned saws under a 1.4 kHz low-pass, 400 ms attack, silent by 8 s | **Act IV, 20.08 s** as the plan lands (one soft resolve chord, nothing when Approve appears). With `SCORE = false` it also plays at **Act XI, 59.6 s**, holding under the 21 while the street falls away; with the score in, the bed's own resolve does that. Ends the film by running out, not by hitting. |
| `music-bed.wav` | 69.50 s | stereo | −14.0 | −33.2 | 13 031 kB | the ambient score, in D at 76 bpm — see below | The underscore, written to this cut. Laid at frame 0 at `SCORE_GAIN`; it lines up act-for-act with 0.9 s of run-out past the last frame. `SCORE = false` in `cues.ts` plays the sound design alone with `chord-root` under the 21 instead. |
| | | | | | **48.2 MB** | | |

---

## `music-bed.wav` in detail

69.5 s, in D, one tempo throughout: **76 bpm = 0.789474 s per beat**. Cut to
the act map above, with 0.9 s of run-out past the last frame. Every pulse,
eighth and bass note is placed at an exact multiple of the beat, so the grid is
exact by construction rather than by correction. Master chain is a tanh
soft-clip at −13 dBFS followed by a −14 dBFS peak ceiling, so the file never
comes within 2 dB of the −12 dBFS limit. Levels below are **measured from the
rendered file**.

| time | passage | peak | rms | on screen |
| ---: | --- | ---: | ---: | --- |
| 0–3.0 s | near-silence | −54.1 | −67.3 | the page |
| 3.0–9.0 s | sub swell — D1 (36.7 Hz) enters and recedes; felt, not heard | −25.6 | −33.7 | the lift off the concrete, the settle |
| 9.0–12.6 s | the D pad enters — wide detuned saws under a 620 Hz low-pass | −20.8 | −33.9 | the typing |
| 12.6–22.6 s | pad + quarter-note pulse from bar 4, eased in over one bar | −20.6 | −32.2 | the instruments → the plan |
| 22.6–30.7 s | the lift to A, the dominant (voiced A–E–A–B) | −20.9 | −32.7 | Approve → the block at dusk |
| 30.7–40.3 s | the arpeggio over A — sine 1/8 notes, D–A–D–F♯–A–D over two octaves; a six-note figure against 4/4, so it drifts instead of marching | −19.6 | −31.8 | two ways in, the café, the same Offer |
| 40.3–51.9 s | **the dip** — pulse and arpeggio out, pad alone, back in D | −23.8 | −36.4 | the question, the 830 ms hole, the provenance tick, the forecourt, the counter |
| 51.9–53.3 s | the duck — the pad drops a further 6 dB | −28.8 | −42.4 | **the redemption note at 52.08 s stands alone**, 27 dB clear of the bed |
| 53.7–57.5 s | the build — pulse returns from bar 17, the bass phrase, a second arpeggio voice a fifth up (A–E–A–C♯–E–A) from 56.05 s, the pad's filter opening 480 → 3 000 Hz | −15.4 | −30.2 | the coffee crosses the counter, the morning starts |
| 57.5–59.0 s | the crescendo — **the loudest point in the film** | **−14.0** | −26.2 | the lane the first customer walked, from further back and higher |
| 59.0–65.0 s | the resolve — everything cuts in 40 ms; one warm D major chord decays | −17.8 | −33.9 | the morning washes the set away, the 21 lands, "came through the door.", "14 returned. 7 were new." |
| 65.0–69.5 s | silence but for a faint air, fading out | −50.6 | −67.2 | Uptick Growth, the closing line, the footer |

The pulse's click deliberately occupies 650–1 900 Hz, above the pad's low-pass
corner, so it stands proud of the pad between beats while staying at
−30 dBFS. That is how it can be quiet and still be felt.

The bass phrase in the build is **D2 – A1 – B1 – G1**, one note every two
beats on beats 68, 70, 72 and 74 (53.68 / 55.26 / 56.84 / 58.42 s), so its
last note is G and the cut at 59.0 s arrives on the D major resolve — a
plagal step into the 21, rather than a stop.

The cut at 59.0 s is a real cut: every pad, the pulse, both arpeggios and the
bass are gated together over 40 ms, so the resolve chord's 250 ms attack rises
into the space that leaves. It lands on the frame where the morning begins to
wash the set away, six frames before the 21 arrives on the page.

---

## Notes on use

- **Loops.** `room-tone`, `street-dawn` and `pad-mint` are true loops: every
  periodic component completes a whole number of cycles in the file and the
  noise is filtered circularly, so the last sample joins the first. Measured
  wrap-around discontinuity is at or below the interior sample-to-sample step.
  `street-morning`, `cafe-interior` and `kitchen-evening` have events on a
  timeline and carry short head/tail fades — cut to them, don't loop them.
- **Silence is a cue.** Three places want an actual hole in the mix, not a
  quiet bed: the 3 landing on the pavement (Act I), the 830 ms after `send`
  (Act VII, 42.0–42.83 s), and the closing line and footer (Act XII, from
  65.0 s). Mute the beds; do not crossfade them. The bed goes silent at 65.0 s
  and ducks 6 dB for the redemption note — the other cues need the same
  restraint at those two moments.
- **Never stack the mint.** `pad-mint`, `key-last`, `tick` and `redeem` are the
  mint family and each is a single clean tone. Two at once turns the idea into
  a chord and loses it.
- **Headroom.** Nothing here is mastered loud. The beds sit at −45 dBFS rms
  and the loudest one-shot peaks at −14 dBFS, which leaves the mix its
  dynamics; set the overall level at the final mix, not in these files.
- **No whooshes.** There is no transition sweetener in this set, by design.
  `send` is a text send, not a riser; the car passes are geometry (level and
  pan follow 1/distance), not fader moves.
