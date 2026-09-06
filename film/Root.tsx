import { Composition, Still } from "remotion";
import { ScreenStill, type ScreenState } from "./primitives/ScreenContent";
import { SHOTS } from "./compositions";
import { TypeTest } from "./compositions/TypeTest";
import { FPS, HEIGHT, WIDTH } from "./tokens";
import { shotFrames } from "./shots";

export const Root = () => (
  <>
    {SHOTS.map((s) => (
      <Composition key={s.id} id={s.id} component={s.component} durationInFrames={shotFrames(s)} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
    {(["cafe-idle", "cafe-joes", "pharmacy-joes", "joes-own"] as ScreenState[]).map((state) => (
      <Still key={state} id={`Screen-${state}`} component={ScreenStill} width={1600} height={900} defaultProps={{ state }} />
    ))}
    {/* Typography A/B sheet — a still, not a shot. See film/review/typography.md. */}
    <Composition id="TypeTest" component={TypeTest} durationInFrames={1} fps={24} width={1920} height={1080} defaultProps={{ face: "geist" as const }} />
  </>
);
