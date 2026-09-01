"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import ScreenMatch from "@/components/home/ScreenMatch";
import StillFrame from "@/components/home/StillFrame";
import { CTA, OFFER_TEXT } from "@/lib/content";
import { useStageProgress } from "@/lib/useStageProgress";

const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const OFFER_WORDS = OFFER_TEXT.split(" ");
const offerLines = (
  <>
    {OFFER_WORDS.slice(0, 3).join(" ")}
    <br />
    {OFFER_WORDS.slice(3).join(" ")}
  </>
);

/**
 * The opening five beats.
 *
 * On the live path the section is 520vh tall and pins one viewport; scroll
 * drives the camera behind it and the opacity of the copy over it. Progress
 * goes straight to CSS custom properties — nothing here touches React state
 * on a scroll frame.
 *
 * Everywhere else the same beats are told as four stills with the copy set
 * underneath, composed for a vertical page.
 */
export default function CinematicStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((p: number | null) => {
    const pin = pinRef.current;
    if (!pin || p === null) return;
    const a1 = 1 - seg(p, 0.08, 0.15);
    const a2 = Math.min(seg(p, 0.23, 0.29), 1 - seg(p, 0.37, 0.43));
    const a3 = Math.min(seg(p, 0.46, 0.52), 1 - seg(p, 0.63, 0.68));
    const a4 = Math.min(seg(p, 0.77, 0.81), 1 - seg(p, 0.88, 0.92));
    const a5 = seg(p, 0.935, 0.985);
    pin.style.setProperty("--a1", a1.toFixed(3));
    pin.style.setProperty("--a2", a2.toFixed(3));
    pin.style.setProperty("--a3", a3.toFixed(3));
    pin.style.setProperty("--a4", a4.toFixed(3));
    pin.style.setProperty("--a5", a5.toFixed(3));
    pin.style.setProperty("--scrim", (1 - seg(p, 0.7, 0.8)).toFixed(3));

    // A faded hero must not keep its links in the tab order, but it stays in
    // the accessibility tree: it carries the page's only h1.
    const hero = heroRef.current;
    if (hero) {
      const spent = a1 < 0.04;
      if (hero.dataset.spent !== String(spent)) {
        hero.dataset.spent = String(spent);
        hero.querySelectorAll("a").forEach((link) => {
          link.tabIndex = spent ? -1 : 0;
        });
      }
    }
  }, []);

  useStageProgress("story", sectionRef, { onProgress });

  const hero = (
    <>
      <p className="eyebrow">Local screen &amp; promotion network</p>
      <h1 className="hero__title">
        Reach nearby customers.
        <br />
        Turn offers into visits.
        <br />
        Bring them back.
      </h1>
      <div className="hero__acts">
        <Link href={CTA.growth.href} className="btn btn--primary">
          {CTA.growth.label}
        </Link>
        <Link href={CTA.host.href} className="btn btn--ghost">
          {CTA.host.label}
        </Link>
      </div>
    </>
  );

  return (
    <section ref={sectionRef} className="stage" data-theme="dark" aria-label="How Uptick works, on one block">
      {/* ---------------- live: the pinned cinematic ---------------- */}
      <div ref={pinRef} className="stage__pin">
        <div className="stage__scrim" aria-hidden="true" />

        <div ref={heroRef} className="beat beat--hero">
          {hero}
        </div>
        <p className="stage__cue" aria-hidden="true">
          Scroll
        </p>

        <div className="beat beat--model">
          <p className="mono-tag">02 · The block</p>
          <h2 className="beat__title">Your block is already a network.</h2>
          <p className="beat__body">
            Cafés, gyms, salons, restaurants, convenience stores — each with its own everyday traffic, and a counter
            where a screen can sit.
          </p>
        </div>

        <div className="beat beat--signal">
          <p className="mono-tag">03 · The offer</p>
          <div className="offercard">
            <p className="offercard__tag">Example offer</p>
            <p className="offercard__line">{offerLines}</p>
          </div>
          <p className="beat__body">
            Uptick places it on screens at up to five participating non-competing local stores nearby.
          </p>
        </div>

        <div className="beat beat--screen">
          <p className="mono-tag">04 · The screen</p>
          <h2 className="beat__title">On the counter, at eye level.</h2>
          <dl className="specs">
            <div>
              <dt>21″</dt>
              <dd>countertop display, anti-glare glass</dd>
            </div>
            <div>
              <dt>Plug</dt>
              <dd>one power cable, no store setup</dd>
            </div>
            <div>
              <dt>Free</dt>
              <dd>provided to host stores, no paid plan</dd>
            </div>
          </dl>
        </div>

        <ScreenMatch />
      </div>

      {/* ---------------- stills: phones, portrait tablets, no WebGL ---------------- */}
      <div className="stage__frames">
        <div className="frame frame--hero">
          {hero}
          <StillFrame
            name="hero"
            priority
            alt="An architectural model of a neighbourhood block at blue hour. Your Business stands in the foreground, lit from inside; the other storefronts recede behind it."
          />
        </div>

        <div className="frame">
          <StillFrame
            name="model"
            alt="The whole block from above the far corner: two rows of storefronts on a dark plinth, five of them carrying counter screens."
          />
          <p className="mono-tag">02 · The block</p>
          <h2 className="frame__title">Your block is already a network.</h2>
          <p className="frame__body">
            Cafés, gyms, salons, restaurants, convenience stores — each with its own everyday traffic, and a counter
            where a screen can sit.
          </p>
        </div>

        <div className="frame">
          <StillFrame
            name="signal"
            alt="A thin warm ring spreads from Your Business across the street; the counter screens it reaches switch to the offer."
          />
          <p className="mono-tag">03 · The offer</p>
          <div className="offercard">
            <p className="offercard__tag">Example offer</p>
            <p className="offercard__line">{offerLines}</p>
          </div>
          <p className="frame__body">
            Uptick places it on screens at up to five participating non-competing local stores nearby.
          </p>
        </div>

        <div className="frame">
          <StillFrame
            name="screen"
            alt="The Uptick screen on a host store's counter: a thin dark 21-inch display showing the offer and a code to scan."
          />
          <p className="mono-tag">04 · The screen</p>
          <h2 className="frame__title">On the counter, at eye level.</h2>
          <dl className="specs">
            <div>
              <dt>21″</dt>
              <dd>countertop display, anti-glare glass</dd>
            </div>
            <div>
              <dt>Plug</dt>
              <dd>one power cable, no store setup</dd>
            </div>
            <div>
              <dt>Free</dt>
              <dd>provided to host stores, no paid plan</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
