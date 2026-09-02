"use client";

import { useCallback, useEffect, useRef } from "react";
import Frame from "@/components/home/Frame";
import ScreenFace from "@/components/home/ScreenFace";
import frames from "@/lib/frames.json";
import { CTA, PHONE_STORY, PROMISE } from "@/lib/content";
import { homography, lerpMat, toMatrix3d, translation, type Mat3 } from "@/lib/homography";
import { prefersReducedMotion } from "@/lib/scroll";
import { useScrollProgress } from "@/lib/useScrollProgress";

const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * The first act, told for a phone: five frames in one column.
 *
 *   1  Your Business, close — the promise
 *   2  next door: every store already has customers
 *   3  the block from above; the same picture, then the signal crosses it
 *   4  the Uptick screen, as a product — then its content lifts off the
 *      glass, fills the phone, and the device is gone
 *
 * Everything scroll-linked writes to CSS custom properties or one transform;
 * nothing here touches React state on a scroll frame, and nothing animates
 * while the page is still.
 */
export default function MobileStory({ enabled }: { enabled: boolean }) {
  const revealRef = useRef<HTMLElement>(null);
  const sigRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const geometry = useRef<{ from: Mat3; to: Mat3 } | null>(null);

  /* --- 3: the block, then the connection ------------------------------ */
  const onReveal = useCallback((p: number | null) => {
    const el = revealRef.current;
    if (!el || p === null) return;
    const calm = prefersReducedMotion();
    const x = calm ? (p < 0.5 ? 0 : 1) : p;
    el.style.setProperty("--fade", seg(x, 0.34, 0.6).toFixed(3));
    el.style.setProperty("--c1", (1 - seg(x, 0.36, 0.48)).toFixed(3));
    el.style.setProperty("--c2", seg(x, 0.5, 0.62).toFixed(3));
  }, []);
  useScrollProgress(revealRef, onReveal, enabled);

  /* --- 4: the screen, physical to digital ---------------------------- */
  const measure = useCallback(() => {
    const pin = pinRef.current;
    const picture = pictureRef.current;
    const face = faceRef.current;
    const after = afterRef.current;
    if (!pin || !picture || !face || !after) return;
    const box = picture.getBoundingClientRect();
    const origin = pin.getBoundingClientRect();
    const quad = frames.screen.panel.map(([x, y]) => [box.left - origin.left + x * box.width, box.top - origin.top + y * box.height] as [number, number]);
    const w = face.offsetWidth;
    const h = face.offsetHeight;
    if (!w || !h) return;
    // The face and the copy under it come to rest as one centred group.
    const gap = 36;
    const bar = pin.clientHeight >= 700 ? 96 : 84;
    const y = Math.max(bar, Math.round((pin.clientHeight - (h + gap + after.offsetHeight)) / 2));
    after.style.top = `${y + h + gap}px`;
    geometry.current = {
      from: homography(w, h, quad),
      to: translation(0, y),
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const pin = pinRef.current;
    if (!pin) return;
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    return () => observer.disconnect();
  }, [enabled, measure]);

  const onSignature = useCallback(
    (p: number | null) => {
      const pin = pinRef.current;
      const face = faceRef.current;
      if (!pin || !face || p === null) return;
      if (!geometry.current) measure();
      const g = geometry.current;
      const calm = prefersReducedMotion();
      const x = calm ? (p < 0.45 ? 0 : 1) : p;
      // The content appears on the glass, the device fades, then the content
      // moves — in that order, so nothing ever seems to slide across the panel.
      const t = ease(seg(x, 0.42, 0.76));
      pin.style.setProperty("--copy", (1 - seg(x, 0.24, 0.36)).toFixed(3));
      pin.style.setProperty("--face", seg(x, 0.14, 0.3).toFixed(3));
      pin.style.setProperty("--pic", (1 - seg(x, 0.36, 0.52)).toFixed(3));
      pin.style.setProperty("--grow", (1 + 0.1 * t).toFixed(4));
      pin.style.setProperty("--glow", seg(x, 0.36, 0.6).toFixed(3));
      pin.style.setProperty("--after", seg(x, 0.78, 0.9).toFixed(3));
      if (g) face.style.transform = toMatrix3d(lerpMat(g.from, g.to, t));
    },
    [measure]
  );
  useScrollProgress(sigRef, onSignature, enabled);

  /** "See how it works": one move to the next frame. */
  const toNext = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("next-door");
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }, []);

  return (
    <div className="m-story">
      {/* ---- 1: the promise --------------------------------------------- */}
      <section className="m-hero" data-theme="dark" aria-label="Uptick Local">
        <div className="m-hero__copy">
          <p className="eyebrow">Hyperlocal screen network</p>
          <h1 className="m-hero__title">{PROMISE}</h1>
          <a href="#next-door" className="m-hero__cta" onClick={toNext}>
            {CTA.how.label}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="m-hero__picture" aria-hidden="true">
          <Frame name="hero" priority alt="" />
        </div>
        <span className="m-hero__cue" aria-hidden="true" />
      </section>

      {/* ---- 2: next door ------------------------------------------------ */}
      <section id="next-door" className="m-frame" data-theme="dark" aria-labelledby="m-pockets-h">
        <Frame
          name="pockets"
          className="m-frame__picture"
          alt="Across the street from Your Business at blue hour: the convenience store, the gym and the restaurant, each lit from inside, each with its own counter."
        />
        <div className="m-frame__copy">
          <p className="mono-tag">{PHONE_STORY.pockets.tag}</p>
          <h2 id="m-pockets-h" className="m-title">
            {PHONE_STORY.pockets.title}
          </h2>
          <p className="m-body">{PHONE_STORY.pockets.body}</p>
        </div>
      </section>

      {/* ---- 3: the block, then the connection --------------------------- */}
      <section ref={revealRef} className="m-reveal" data-theme="dark" aria-labelledby="m-block-h">
        <div className="m-reveal__pin">
          <div className="m-reveal__stack">
            <Frame name="block" className="m-reveal__picture" alt="The block from above the street: two rows of storefronts, each lit from inside." />
            <Frame
              name="connect"
              className="m-reveal__picture m-reveal__picture--on"
              alt="The same block, with a ring of light spreading across the street from Your Business; the counter screens it reaches switch on."
            />
          </div>
          <div className="m-reveal__scrim" aria-hidden="true" />
          <div className="m-reveal__copy m-reveal__copy--1">
            <p className="mono-tag">{PHONE_STORY.block.tag}</p>
            <h2 id="m-block-h" className="m-title">
              {PHONE_STORY.block.title}
            </h2>
            <p className="m-body">{PHONE_STORY.block.body}</p>
          </div>
          <div className="m-reveal__copy m-reveal__copy--2">
            <p className="mono-tag">{PHONE_STORY.connect.tag}</p>
            <h2 className="m-title">{PHONE_STORY.connect.title}</h2>
            <p className="m-body">{PHONE_STORY.connect.body}</p>
          </div>
        </div>
      </section>

      {/* ---- 4: the screen, physical to digital -------------------------- */}
      <section ref={sigRef} className="m-sig" data-theme="dark" aria-labelledby="m-screen-h">
        <div ref={pinRef} className="m-sig__pin">
          <div className="m-sig__glow" aria-hidden="true" />
          <div ref={pictureRef} className="m-sig__picture">
            <Frame name="screen" alt="The Uptick screen on the convenience store's counter: a thin dark 21-inch display on a low foot, showing the store's own special." />
          </div>
          <div ref={faceRef} className="m-sig__face" aria-hidden="true">
            <ScreenFace way="host" />
          </div>
          <div className="m-sig__scrim" aria-hidden="true" />
          <div className="m-sig__copy m-sig__copy--before">
            <p className="mono-tag">{PHONE_STORY.screen.tag}</p>
            <h2 id="m-screen-h" className="m-title">
              {PHONE_STORY.screen.title}
            </h2>
            <p className="m-body">{PHONE_STORY.screen.body}</p>
          </div>
          <div ref={afterRef} className="m-sig__copy m-sig__copy--after">
            <p className="mono-tag">Same screen · Same special</p>
            <h2 className="m-title">What runs on it is up to you.</h2>
            <p className="m-body">Your own specials, a neighbour&rsquo;s campaign, or an offer a customer can carry out the door.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
