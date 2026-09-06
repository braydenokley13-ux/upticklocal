import { Audio, Sequence, staticFile } from "remotion";
import { type Cue, cues } from "../audio/cues";

/** Seconds per file, for cues that play whole (film/audio/CUES.md). */
const SECONDS: Record<string, number> = {
  "room-tone": 30,
  "street-dawn": 40,
  "street-morning": 40,
  "cafe-interior": 30,
  "kitchen-evening": 20,
  key: 0.045,
  key2: 0.045,
  key3: 0.045,
  "key-last": 0.055,
  tick: 0.03,
  "tick-soft": 0.03,
  "tap-wood": 0.12,
  press: 0.09,
  notify: 0.2,
  send: 0.18,
  scan: 0.08,
  redeem: 1,
  unfold: 0.3,
  nozzle: 0.22,
  grain: 0.6,
  "pad-mint": 12,
  "chord-root": 8,
  "music-bed": 69.5,
};

const FPS = 24;

function frames(c: Cue): number {
  if (c.frames) return c.frames;
  const s = SECONDS[c.file] ?? 1;
  return Math.max(2, Math.ceil(((s - (c.startFrom ?? 0)) * FPS) / (c.playbackRate ?? 1)));
}

/** The whole sound edit, as Audio sequences on the film's timeline. Render with sound; the Teaser is rendered muted. */
export const Sound = () => (
  <>
    {cues().map((c, i) => {
      const n = frames(c);
      const fi = c.fadeIn ?? 0;
      const fo = c.fadeOut ?? 0;
      return (
        <Sequence key={`${c.file}-${c.at}-${i}`} from={c.at} durationInFrames={n} layout="none" name={`♪ ${c.file} · ${c.note}`}>
          <Audio
            src={staticFile(`film-rd/audio/${c.file}.ogg`)}
            loop={c.loop}
            startFrom={c.startFrom ? Math.round(c.startFrom * FPS) : undefined}
            playbackRate={c.playbackRate}
            volume={(f) => {
              const a = fi > 0 ? Math.min(1, f / fi) : 1;
              const b = fo > 0 ? Math.min(1, (n - 1 - f) / fo) : 1;
              const e = c.env ? c.env(f) : 1;
              return Math.max(0, Math.min(1, c.gain * a * b * e));
            }}
          />
        </Sequence>
      );
    })}
  </>
);
