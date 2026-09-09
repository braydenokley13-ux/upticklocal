import { Composition, Still } from "remotion";
import { ScreenStill, type ScreenState } from "./primitives/ScreenContent";
import { SHOTS } from "./compositions";
import { DEVICE_OFFER_FRAMES, DEVICE_PASS_FRAMES, DEVICE_TEXT_FRAMES, DeviceOffer, DevicePass, DeviceText } from "./compositions/Device";
import { PHONE_H, PHONE_W } from "./primitives/PhoneScreen";
import { TypeTest } from "./compositions/TypeTest";
import { FPS, HEIGHT, WIDTH } from "./tokens";
import { shotFrames } from "./shots";
import { AcquisitionSurface, type AcquisitionSurface as AcquisitionSurfaceState } from './compositions/acquisition/Surfaces';
import {OpeningTest} from './compositions/acquisition/OpeningTest';
import {AcquisitionFilm,AcquisitionTeaser,ACQUISITION_FRAMES} from './compositions/acquisition/Film';
import {DirectorFilm,DirectorTeaser,DIRECTOR_FRAMES} from './compositions/director/Film';
import {DirectorPhotoFilm,DIRECTOR_PHOTO_FRAMES} from './compositions/director/PhotoFilm';

export const Root = () => (
  <>
    <Composition id="Director-Photo-Review" component={DirectorPhotoFilm} durationInFrames={DIRECTOR_PHOTO_FRAMES} fps={24} width={1920} height={1080} defaultProps={{sound:true}}/>
    <Composition id="Director-Film" component={DirectorFilm} durationInFrames={DIRECTOR_FRAMES} fps={24} width={1920} height={1080} defaultProps={{lane:'review',sound:true,opening:'network'}}/>
    <Composition id="Director-Teaser" component={DirectorTeaser} durationInFrames={360} fps={24} width={1920} height={1080} defaultProps={{lane:'review',sound:true,opening:'network'}}/>
    <Composition id="Acquisition-Film" component={AcquisitionFilm} durationInFrames={ACQUISITION_FRAMES} fps={24} width={1920} height={1080}
      defaultProps={{lane:'proxy',opening:'customer',sound:true}}/>
    <Composition id="Acquisition-Teaser" component={AcquisitionTeaser} durationInFrames={360} fps={24} width={1920} height={1080} defaultProps={{lane:'final'}}/>
    {(['owner','customer'] as const).map(order=><Composition key={`opening-${order}`} id={`Acquisition-Opening-${order}`} component={OpeningTest}
      durationInFrames={288} fps={24} width={640} height={360} defaultProps={{order}}/>)}
    {(['quick-lube','ridge-tire','uptick-screen'] as const).map(sourceId=><Composition key={sourceId} id={`Acquisition-Placement-${sourceId}`} component={AcquisitionSurface}
      durationInFrames={1} fps={24} width={1600} height={900} defaultProps={{state:'placement',sourceId}}/>)}
    {(['placement', 'pass', 'redeemed', 'permission', 'friday', 'paid'] as AcquisitionSurfaceState[]).map(state => (
      <Composition key={`acquisition-${state}`} id={`Acquisition-${state}`} component={AcquisitionSurface}
        durationInFrames={state === 'permission' ? 144 : 1} fps={FPS}
        width={state === 'placement' ? 1600 : PHONE_W} height={state === 'placement' ? 900 : PHONE_H}
        defaultProps={{state}} />
    ))}
    {SHOTS.map((s) => (
      <Composition key={s.id} id={s.id} component={s.component} durationInFrames={shotFrames(s)} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
    {/* What a physical panel in the world is emitting. Baked to PNG sequences by
        scripts/bake-screens.sh and loaded into Blender as the screen's texture:
        the product is inside the shot, never composited over it. */}
    {(
      [
        ["Device-Pass", DevicePass, DEVICE_PASS_FRAMES],
        ["Device-Offer", DeviceOffer, DEVICE_OFFER_FRAMES],
        ["Device-Text", DeviceText, DEVICE_TEXT_FRAMES],
      ] as const
    ).map(([id, component, frames]) => (
      <Composition key={id} id={id} component={component} durationInFrames={frames} fps={FPS} width={PHONE_W} height={PHONE_H} />
    ))}
    {(["cafe-idle", "cafe-joes", "pharmacy-joes", "joes-own"] as ScreenState[]).map((state) => (
      <Still key={state} id={`Screen-${state}`} component={ScreenStill} width={1600} height={900} defaultProps={{ state }} />
    ))}
    {/* Typography A/B sheet — a still, not a shot. See film/review/typography.md. */}
    <Composition id="TypeTest" component={TypeTest} durationInFrames={1} fps={24} width={1920} height={1080} defaultProps={{ face: "geist" as const }} />
  </>
);
