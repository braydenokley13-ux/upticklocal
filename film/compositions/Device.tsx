import { useCurrentFrame } from "remotion";
import { PhoneOffer, PhonePass, PhoneText } from "../primitives/PhoneScreen";
import { IN, OUT, PLANE, ramp } from "../motion";

/**
 * WHAT THE PHONE IS SHOWING · baked, not composited.
 *
 * These render at the handset's own aspect and are written to PNG sequences
 * under blender/screens/. Blender loads the sequence as the emission texture
 * of the phone's screen, so the UI is inside the shot: lit by it, reflected in
 * it, blurred by the lens, and covered by the thumb that presses it.
 *
 * The frame numbers here are the plate's frame numbers. They are the contract
 * between the two renderers; changing one means re-baking and re-rendering.
 */

/** The pass at Joe's counter. One action: Redeem now. */
export const DEVICE_PASS_FRAMES = 96;
export const PASS_T = { press: 26, release: 31, redeem: 30, tick: 46, end: 96 } as const;

export const DevicePass = () => {
  const f = useCurrentFrame();
  const press = ramp(f, PASS_T.press, 4, OUT) * (1 - ramp(f, PASS_T.release, 4, IN));
  const redeemed = ramp(f, PASS_T.redeem, 16, PLANE);
  const tick = ramp(f, PASS_T.tick, 10, OUT);
  const clockFrames = Math.max(0, f - PASS_T.tick);
  return <PhonePass press={press} redeemed={redeemed} tick={tick} clockFrames={clockFrames} />;
};

/** The offer arriving on the customer's own phone, after the code on the café counter. */
export const DEVICE_OFFER_FRAMES = 72;
export const DeviceOffer = () => {
  const f = useCurrentFrame();
  const reveal = ramp(f, 4, 30, PLANE);
  const savePress = ramp(f, 52, 4, OUT) * (1 - ramp(f, 57, 4, IN));
  const saved = ramp(f, 58, 6, OUT);
  return <PhoneOffer reveal={reveal} savePress={savePress} saved={saved} />;
};

/** Thursday evening: the text lands on a phone on a kitchen counter. */
export const DEVICE_TEXT_FRAMES = 60;
export const DeviceText = () => {
  const f = useCurrentFrame();
  const reveal = ramp(f, 6, 20, PLANE);
  const press = ramp(f, 44, 4, OUT) * (1 - ramp(f, 49, 4, IN));
  return <PhoneText reveal={reveal} press={press} />;
};
