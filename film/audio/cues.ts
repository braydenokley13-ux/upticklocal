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
 *   I 0 · II–IV 252 · V 660 · VI 860 · VII 1242 · VIII 1458 · IX–XI 1746 · XII 2016 · end 2148
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

export const ACT = { I: 0, II: 252, V: 660, VI: 860, VII: 1242, VIII: 1458, IX: 1746, XII: 2016, END: 2148 } as const;

/** The score under the whole film; false plays the sound design alone with the root chord at the 21. */
export const SCORE = true;
export const SCORE_GAIN = 0.55;

const lin = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a)));

/** Hero 2's keystrokes, from the same cadence the picture types with. */
function keystrokes(): Cue[] {
  const start = ACT.II + 30; // Hero 2 T.type
  const pauses: Record<number, number> = { 6: 6, 15: 5 };
  const n = INTENT.sentence.length;
  const out: Cue[] = [];
  let prev = 0;
  const keys = ["key", "key2", "key3"];
  for (let f = start; f < start + 200; f++) {
    const c = typed(f - ACT.II, 30, n, 1.7, pauses);
    if (c > prev) {
      const last = c >= n;
      out.push({ file: last ? "key-last" : keys[c % 3], at: f, gain: last ? 1 : 0.7, note: last ? "the last key · the first mint" : `key ${c}` });
      prev = c;
    }
  }
  return out;
}

export function cues(): Cue[] {
  const H4_LAND = 130; // Hero 4: the last word lands
  const C: Cue[] = [
    // ---- the score --------------------------------------------------------
    ...(SCORE ? [{ file: "music-bed", at: 0, gain: SCORE_GAIN, env: (f) => 1 - 0.8 * lin(f, ACT.VIII + 180, ACT.VIII + 188) * (1 - lin(f, ACT.VIII + 214, ACT.VIII + 250)), note: "the score · D, 76 bpm, timed to the acts; held under the redeem note" } as Cue] : []),

    // ---- I · the gap ------------------------------------------------------
    { file: "room-tone", at: 0, frames: 124, gain: 0.9, fadeIn: 12, fadeOut: 28, loop: true, note: "the page: almost nothing" },
    { file: "street-dawn", at: 96, frames: ACT.II - 96, gain: 0.9, fadeIn: 30, loop: true, note: "the cream lifts off the concrete: the street at 7:12; cut with the picture" },

    // ---- II–IV · owner speaks · understands · one plan ---------------------
    { file: "room-tone", at: ACT.II, frames: ACT.V + 56 - ACT.II, gain: 0.55, fadeIn: 10, fadeOut: 24, loop: true, note: "the page, Thursday evening" },
    ...keystrokes(),
    { file: "tick-soft", at: ACT.II + 114, gain: 0.8, playbackRate: 0.9, note: "Friday re-sets" },
    { file: "tick-soft", at: ACT.II + 160, gain: 0.8, playbackRate: 1.0, note: "mornings re-sets" },
    { file: "tick-soft", at: ACT.II + 210, gain: 0.8, playbackRate: 1.12, note: "slow re-sets" },
    { file: "grain", at: ACT.II + 246, gain: 0.7, note: "the 63 land, left to right; nothing lands inside 07–10" },
    { file: "unfold", at: ACT.II + 262, gain: 0.3, note: "the facts arrive on paper" },
    { file: "chord-root", at: ACT.II + 330, gain: SCORE ? 0.35 : 0.6, note: "the plan lands: one soft resolve; nothing when Approve appears" },

    // ---- V · thought becomes action ---------------------------------------
    { file: "press", at: ACT.V + 12, gain: 0.8, note: "Approve. One click, nothing after it" },
    { file: "street-dawn", at: ACT.V + 50, frames: ACT.VI - (ACT.V + 50), gain: 0.5, fadeIn: 36, fadeOut: 6, loop: true, startFrom: 20, note: "the block at dusk" },
    { file: "pad-mint", at: ACT.V + 58, frames: ACT.VI + 110 - (ACT.V + 58), gain: 0.7, fadeIn: 24, fadeOut: 12, loop: true, env: (f) => 1 - 0.6 * lin(f, 110, 190), note: "the signal enters the block; thins as the screens arm; out at the café cut" },
    ...[66, 74, 82, 91, 101].map((h, i) => ({ file: "tap-wood", at: ACT.V + 56 + h, gain: 0.7, note: `window ${i + 1} lights` }) as Cue),

    // ---- VI · two ways in -------------------------------------------------
    { file: "kitchen-evening", at: ACT.VI, frames: 110, gain: 0.5, fadeIn: 12, fadeOut: 4, note: "Thursday 6:48 PM at home" },
    { file: "notify", at: ACT.VI + 10, gain: 0.7, note: "a text arrives" },
    { file: "press", at: ACT.VI + 60, gain: 0.45, note: "Open offer" },
    { file: "cafe-interior", at: ACT.VI + 110, frames: ACT.VI + 382 - (ACT.VI + 110), gain: 1, fadeOut: 40, env: (f) => 1 - 0.6 * lin(f, 160, 176), note: "cut to the café; the grinder stops at 3 s; sits back under the same Offer" },
    { file: "scan", at: ACT.VI + 232, gain: 0.8, note: "the scan happens off-picture, in the stranger's own hand: one short clean sound, and the screen's content lifts eight frames later" },
    { file: "unfold", at: ACT.VI + 240, gain: 0.7, note: "the screen content lifts into the Offer" },
    { file: "press", at: ACT.VI + 278 + 62, gain: 0.45, note: "Yes" },
    { file: "unfold", at: ACT.VI + 278 + 84, gain: 0.5, note: "the Offer folds to a plane" },

    // ---- VII · the relationship is useful ----------------------------------
    { file: "cafe-interior", at: ACT.VII, frames: 50, gain: 0.4, fadeIn: 8, fadeOut: 2, startFrom: 8, note: "still at the café, 7:09" },
    { file: "send", at: ACT.VII + 48, gain: 0.8, note: "Does diesel count? sends at ordinary volume, then 900 ms of nothing" },
    { file: "cafe-interior", at: ACT.VII + 74, frames: ACT.VIII + 58 - (ACT.VII + 74), gain: 0.35, fadeIn: 14, fadeOut: 12, startFrom: 11, note: "the room comes back" },
    { file: "pad-mint", at: ACT.VII + 76, frames: H4_LAND + 12 - 76, gain: 0.25, fadeIn: 20, fadeOut: 10, loop: true, note: "the sheet rises: very soft" },
    { file: "tick", at: ACT.VII + H4_LAND, gain: 0.9, note: "the row lands as the answer: the clearest small sound in the film" },

    // ---- VIII · offer → pass → the pocket, the door → redeem now at the counter ----
    { file: "unfold", at: ACT.VIII, gain: 0.6, note: "the plane unfolds to the slab" },
    { file: "press", at: ACT.VIII + 26, gain: 0.5, note: "Save my pass" },
    {
      file: "street-morning",
      at: ACT.VIII + 58,
      frames: ACT.IX + 140 + 40 - (ACT.VIII + 58),
      gain: 0.5,
      fadeIn: 24,
      fadeOut: 40,
      env: (f) => (1 - 0.55 * lin(f, 44, 52) * (1 - lin(f, 226, 232))) * (1 - 0.7 * lin(f, 124, 130) * (1 - lin(f, 154, 194))) * (1 + 0.6 * lin(f, 250, 340)),
      note: "7:42, the forecourt; behind the glass while we are at the counter; dips under the redeem note; brightens through the thresholds; falls away under the 21",
    },
    { file: "nozzle", at: ACT.VIII + 64, gain: 0.55, note: "the forecourt: the car at the pump" },
    { file: "tap-wood", at: ACT.VIII + 88, gain: 0.8, note: "threshold 1: the first person through the door; the count is set to 1" },
    { file: "cafe-interior", at: ACT.VIII + 102, frames: ACT.IX - (ACT.VIII + 102), gain: 0.3, fadeIn: 6, fadeOut: 8, startFrom: 16, env: (f) => 1 - 0.6 * lin(f, 80, 86) * (1 - lin(f, 110, 150)), note: "inside Joe's: the store's room, quiet; the coffee machine somewhere; dips under the note" },
    { file: "press", at: ACT.VIII + 128, gain: 0.7, note: "Redeem now" },
    { file: "press", at: ACT.VIII + 156, gain: 0.7, note: "Redeem (confirm)" },
    { file: "redeem", at: ACT.VIII + 188, gain: 1, note: "the redemption: the clearest note in the film, alone" },

    // ---- IX–XI · the build · the proof ------------------------------------
    ...[20, 54, 84, 110].map((t, i) => ({ file: "tap-wood", at: ACT.IX + t, gain: 0.8, note: `threshold ${i + 2}: the count steps on the tap, never louder` }) as Cue),
    ...(SCORE ? [] : [{ file: "chord-root", at: ACT.IX + 140, gain: 0.8, note: "the 21 lands: the street falls away, a root chord holds and runs out" } as Cue]),

    // ---- XII · resolve: silence -------------------------------------------
  ];
  return C.sort((a, b) => a.at - b.at);
}
