import heroDusk from "../../blender/exports/hero3a.json";
import { INTENT } from "../data/joes";
import { typed } from "../motion";

/**
 * THE SOUND EDIT · every cue in the film, on the film's own frame count.
 *
 * The material is in film/audio/CUES.md (synthesised by film/audio/synth.py,
 * played from public/film-rd/audio/*.ogg). The intent is in film/audio/NOTES.md:
 * silence is a material, no whooshes, one tempo, the mint family is never
 * stacked. What follows is the placement — each cue at a frame the picture
 * motivates, with the beds cut where the picture cuts.
 *
 * Frames are absolute film frames. Act starts (see Film.tsx):
 *   I 0 · II–IV 216 · V 542 · VI 736 · VII 968 · VIII 1160 · IX–XI 1322 · XII 1528 · end 1646
 */
export type Cue = {
  /** file name under public/film-rd/audio, without extension */
  file: string;
  /** first frame */
  at: number;
  /** frames; the whole file when omitted */
  frames?: number;
  /** 0..1 */
  gain: number;
  fadeIn?: number;
  fadeOut?: number;
  /** seconds into the file to start */
  startFrom?: number;
  loop?: boolean;
  playbackRate?: number;
  /** an extra 0..1 envelope on the cue's own frame, multiplied in */
  env?: (f: number) => number;
  note: string;
};

export const ACT = { I: 0, II: 216, V: 542, VI: 736, VII: 968, VIII: 1160, IX: 1322, XII: 1528, END: 1646 } as const;

/** The score under the whole film; false plays the sound design alone with the root chord at the 21. */
export const SCORE = true;
export const SCORE_GAIN = 0.55;

const lin = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a)));

/** Hero 2's keystrokes, from the same cadence the picture types with. */
function keystrokes(): Cue[] {
  const TYPE = 16; // Hero 2 T.type
  const RATE = 1.45; // Hero 2 TYPE_RATE
  const start = ACT.II + TYPE;
  const pauses: Record<number, number> = { 6: 6, 15: 5 };
  const n = INTENT.sentence.length;
  const out: Cue[] = [];
  let prev = 0;
  const keys = ["key", "key2", "key3"];
  for (let f = start; f < start + 120; f++) {
    const c = typed(f - ACT.II, TYPE, n, RATE, pauses);
    if (c > prev) {
      const last = c >= n;
      out.push({ file: last ? "key-last" : keys[c % 3], at: f, gain: last ? 1 : 0.7, note: last ? "the last key · the first mint" : `key ${c}` });
      prev = c;
    }
  }
  return out;
}

export function cues(): Cue[] {
  // Hero 4's own frames: the question, the hole, the sheet, the last word landing.
  const H4 = { question: 28, silence: 40, back: 58, sheet: 60, land: 114 };
  // Act VIII's cuts, from SHOTS8: approach 0, threshold 22, counter 44, device 66, coffee 138.
  const V8 = { threshold: 22, counter: 44, device: 66, press: 86, note: 90, coffee: 138 };
  const C: Cue[] = [
    // ---- the score --------------------------------------------------------
    // The bed is written to this cut (film/audio/synth.py::make_music_bed); it
    // already ducks 6 dB under the redemption, so nothing here has to.
    // The score is the only thing that plays continuously, so it is the only thing that can
    // fill the film's one deliberate silence. It does not: the hole at 42.00-42.83 s is cut
    // here, out over 4 frames and back over 8, so the 830 ms after "Does diesel count?" is
    // actually nothing. Measured before the gate, the quietest 20 ms in that window was
    // -37.1 dBFS - a pad humming through the moment the merchant is waiting to be answered.
    ...(SCORE
      ? [{
          file: "music-bed",
          at: 0,
          gain: SCORE_GAIN,
          env: (f: number) => 1 - lin(f, ACT.VII + H4.silence - 4, ACT.VII + H4.silence) * (1 - lin(f, ACT.VII + H4.silence + 20, ACT.VII + H4.silence + 28)),
          note: "the score · D, 76 bpm, cut to the acts; ducks itself under the redeem note; cut entirely for the 830 ms hole",
        } as Cue]
      : []),

    // ---- I · the gap ------------------------------------------------------
    { file: "room-tone", at: 0, frames: 92, gain: 0.9, fadeIn: 12, fadeOut: 24, loop: true, note: "the page: almost nothing" },
    { file: "street-dawn", at: 72, frames: ACT.II - 72, gain: 0.9, fadeIn: 26, loop: true, note: "the cream lifts off the concrete: the street at 7:12; cut with the picture" },

    // ---- II–IV · owner speaks · understands · one plan ---------------------
    { file: "room-tone", at: ACT.II, frames: ACT.V + 50 - ACT.II, gain: 0.55, fadeIn: 10, fadeOut: 24, loop: true, note: "the page, Thursday evening" },
    ...keystrokes(),
    { file: "tick-soft", at: ACT.II + 82, gain: 0.8, playbackRate: 0.9, note: "Friday re-sets" },
    { file: "tick-soft", at: ACT.II + 116, gain: 0.8, playbackRate: 1.0, note: "mornings re-sets" },
    { file: "tick-soft", at: ACT.II + 152, gain: 0.8, playbackRate: 1.12, note: "slow re-sets" },
    { file: "grain", at: ACT.II + 182, gain: 0.7, note: "the 63 land, left to right; nothing lands inside 07–10" },
    { file: "unfold", at: ACT.II + 204, gain: 0.3, note: "the facts arrive on paper" },
    { file: "chord-root", at: ACT.II + 266, gain: SCORE ? 0.35 : 0.6, note: "the plan lands: one soft resolve; nothing when Approve appears" },

    // ---- V · thought becomes action ---------------------------------------
    { file: "press", at: ACT.V + 12, gain: 0.8, note: "Approve. One click, nothing after it" },
    { file: "street-dawn", at: ACT.V + 44, frames: ACT.VI - (ACT.V + 44), gain: 0.5, fadeIn: 34, fadeOut: 6, loop: true, startFrom: 20, note: "the block at dusk" },
    { file: "pad-mint", at: ACT.V + 52, frames: ACT.VI + 76 - (ACT.V + 52), gain: 0.7, fadeIn: 24, fadeOut: 12, loop: true, env: (f) => 1 - 0.6 * lin(f, 108, 186), note: "the signal enters the block; thins as the screens arm; out at the café cut" },
    // read from the plate, not retyped: the windows that light are the shot's, and when the shot
    // was re-framed from five scattered ones to three in the same building this followed it
    ...((heroDusk as { meta: { homes: number[] } }).meta.homes ?? [66, 84, 101]).map(
      (h, i) => ({ file: "tap-wood", at: ACT.V + 50 + h, gain: 0.7, note: `window ${i + 1} lights` }) as Cue,
    ),

    // ---- VI · two ways in -------------------------------------------------
    { file: "kitchen-evening", at: ACT.VI, frames: 76, gain: 0.5, fadeIn: 12, fadeOut: 4, note: "Thursday 6:48 PM at home" },
    { file: "notify", at: ACT.VI + 6, gain: 0.7, note: "a text arrives" },
    { file: "press", at: ACT.VI + 32, gain: 0.45, note: "Open offer" },
    { file: "cafe-interior", at: ACT.VI + 76, frames: 124, gain: 1, fadeOut: 44, env: (f) => 1 - 0.55 * lin(f, 60, 76), note: "cut to the café; the grinder stops at 3 s; sits back as we go into the glass" },
    { file: "scan", at: ACT.VI + 120, gain: 0.8, note: "the stranger holds their phone to the panel: one short clean sound" },
    { file: "unfold", at: ACT.VI + 128, gain: 0.7, note: "the glass opens out into the Offer" },
    { file: "press", at: ACT.VI + 196, gain: 0.45, note: "Save" },

    // ---- VII · the relationship is useful ----------------------------------
    { file: "kitchen-evening", at: ACT.VII, frames: H4.silence, gain: 0.42, fadeIn: 10, fadeOut: 2, startFrom: 3, note: "Thursday evening, the question typed at home" },
    { file: "send", at: ACT.VII + H4.question + 10, gain: 0.8, note: "Does diesel count? sends at ordinary volume, then 830 ms of nothing" },
    { file: "kitchen-evening", at: ACT.VII + H4.back, frames: ACT.VIII - (ACT.VII + H4.back), gain: 0.32, fadeIn: 14, fadeOut: 20, startFrom: 9, note: "the room comes back under the answer" },
    { file: "pad-mint", at: ACT.VII + H4.sheet, frames: H4.land + 12 - H4.sheet, gain: 0.25, fadeIn: 20, fadeOut: 10, loop: true, note: "the sheet rises: very soft" },
    { file: "tick", at: ACT.VII + H4.land, gain: 0.9, note: "the row lands as the answer: the clearest small sound in the film" },

    // ---- VIII · the forecourt, the door, the counter, one press -------------
    {
      file: "street-morning",
      at: ACT.VIII,
      frames: ACT.IX + 118 - ACT.VIII,
      gain: 0.5,
      fadeIn: 20,
      fadeOut: 44,
      // outside; muffled from the threshold until we are back on the forecourt;
      // a further duck under the redemption note; then the morning brightens
      env: (f) =>
        (1 - 0.62 * lin(f, V8.threshold, V8.threshold + 8) * (1 - lin(f, 162, 176))) *
        (1 - 0.5 * lin(f, V8.note - 4, V8.note) * (1 - lin(f, V8.note + 26, V8.note + 46))) *
        (1 + 0.5 * lin(f, 176, 250)),
      note: "7:42 on the forecourt; behind the glass while we are inside; ducked under the redeem note; brightens through the morning; falls away under the 21",
    },
    { file: "nozzle", at: ACT.VIII + 6, gain: 0.55, note: "the forecourt: the pump beside the lane" },
    { file: "tap-wood", at: ACT.VIII + V8.threshold + 6, gain: 0.8, note: "the door: the customer crosses the threshold" },
    { file: "cafe-interior", at: ACT.VIII + V8.counter, frames: ACT.IX - (ACT.VIII + V8.counter), gain: 0.28, fadeIn: 8, fadeOut: 12, startFrom: 16, env: (f) => 1 - 0.65 * lin(f, 42, 46) * (1 - lin(f, 70, 96)), note: "inside Joe's: the store's own room, quiet; dips under the note" },
    { file: "press", at: ACT.VIII + V8.press, gain: 0.7, note: "Redeem now. One press, and the customer is the only one who touches anything" },
    { file: "redeem", at: ACT.VIII + V8.note, gain: 1, note: "the redemption: the clearest note in the film, alone" },
    { file: "tap-wood", at: ACT.VIII + V8.coffee + 8, gain: 0.32, playbackRate: 1.45, note: "the cup meets the counter" },

    // ---- IX–XI · the build · the proof ------------------------------------
    ...[8, 30, 40, 56].map((t, i) => ({ file: "tap-wood", at: ACT.IX + t, gain: 0.8, note: `the morning, person ${i + 1}: the count steps on the tap, never louder` }) as Cue),
    ...(SCORE ? [] : [{ file: "chord-root", at: ACT.IX + 108, gain: 0.8, note: "the 21 lands: the street falls away, a root chord holds and runs out" } as Cue]),

    // ---- XII · resolve: silence -------------------------------------------
  ];
  return C.sort((a, b) => a.at - b.at);
}
