"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import ScreenMatch from "@/components/home/ScreenMatch";
import StillFrame from "@/components/home/StillFrame";
import { CTA, PROMISE } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/scroll";
import { useStageProgress } from "@/lib/useStageProgress";

const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));

/** Where the second beat is held, as a fraction of the pinned scroll. */
const BLOCK_AT = 0.3;

/**
 * The first act: the company, then the block, then the connection, then the
 * screen.
 *
 * On the live path the section is 520vh tall and pins one viewport; scroll
 * drives the camera behind it and the opacity of the copy over it. Progress
 * goes straight to CSS custom properties — nothing here touches React state
 * on a scroll frame. Everywhere else the same beats are told as stills with
 * the copy set underneath, composed for a vertical page.
 */
const COPY = {
  block: {
    tag: "01 · The block",
    title: "Your block is already a network.",
    body: "The café, the gym, the salon, the restaurant, the corner store. Each already has customers. Separate pockets of local attention, a few doors apart.",
  },
  connect: {
    tag: "02 · The connection",
    title: "Uptick connects them.",
    body: "A screen at each participating business, linked into one local network — so a business can reach the customers already next door.",
  },
  screen: {
    tag: "03 · The screen",
    title: "Useful on its own. Stronger together.",
    specs: [
      ["21″", "countertop display, plug in and play"],
      ["Yours", "your own specials and events run first"],
      ["Free", "provided to host stores, no paid plan"],
    ],
  },
};

const specs = (
  <dl className="specs">
    {COPY.screen.specs.map(([dt, dd]) => (
      <div key={dt}>
        <dt>{dt}</dt>
        <dd>{dd}</dd>
      </div>
    ))}
  </dl>
);

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

    // A faded hero must not keep its link in the tab order, but it stays in
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

  /** "See how it works": one move to the second beat, or to the second still. */
  const toBlock = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const section = sectionRef.current;
    if (!section) return;
    event.preventDefault();
    const behavior: ScrollBehavior = prefersReducedMotion() ? "instant" : "smooth";
    const pin = pinRef.current;
    const pinned = pin && getComputedStyle(pin).position === "sticky";
    const top = section.getBoundingClientRect().top + window.scrollY;
    if (pinned) {
      window.scrollTo({ top: top + BLOCK_AT * (section.offsetHeight - window.innerHeight), behavior });
    } else {
      const frame = section.querySelector<HTMLElement>("#block-still");
      window.scrollTo({ top: (frame?.getBoundingClientRect().top ?? 0) + window.scrollY - 24, behavior });
    }
  }, []);

  const hero = (
    <>
      <p className="eyebrow">Hyperlocal screen network</p>
      <h1 className="hero__title">{PROMISE}</h1>
      <div className="hero__acts">
        <a href={CTA.how.href} className="btn btn--ghost btn--down" onClick={toBlock}>
          {CTA.how.label}
        </a>
      </div>
    </>
  );

  return (
    <section ref={sectionRef} className="stage" data-theme="dark" aria-label="Uptick Local, on one block">
      {/* ---------------- live: the pinned cinematic ---------------- */}
      <div ref={pinRef} className="stage__pin">
        <div className="stage__scrim" aria-hidden="true" />

        <div ref={heroRef} className="beat beat--hero">
          {hero}
        </div>

        <div className="beat beat--model" id="block">
          <p className="mono-tag">{COPY.block.tag}</p>
          <h2 className="beat__title">{COPY.block.title}</h2>
          <p className="beat__body">{COPY.block.body}</p>
        </div>

        <div className="beat beat--signal">
          <p className="mono-tag">{COPY.connect.tag}</p>
          <h2 className="beat__title">{COPY.connect.title}</h2>
          <p className="beat__body">{COPY.connect.body}</p>
        </div>

        <div className="beat beat--screen">
          <p className="mono-tag">{COPY.screen.tag}</p>
          <h2 className="beat__title">{COPY.screen.title}</h2>
          {specs}
        </div>

        <ScreenMatch />
        <p className="stage__cue" aria-hidden="true">
          Scroll
        </p>
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

        <div className="frame" id="block-still">
          <StillFrame
            name="model"
            alt="The whole block from above the far corner: two rows of storefronts on a dark plinth, each lit from inside."
          />
          <p className="mono-tag">{COPY.block.tag}</p>
          <h2 className="frame__title">{COPY.block.title}</h2>
          <p className="frame__body">{COPY.block.body}</p>
        </div>

        <div className="frame">
          <StillFrame
            name="signal"
            alt="A soft ring of light spreads across the street from Your Business; the counter screens it reaches switch on."
          />
          <p className="mono-tag">{COPY.connect.tag}</p>
          <h2 className="frame__title">{COPY.connect.title}</h2>
          <p className="frame__body">{COPY.connect.body}</p>
        </div>

        <div className="frame">
          <StillFrame
            name="screen"
            alt="The Uptick screen on a host store's counter: a thin dark 21-inch display showing the store's own special."
          />
          <p className="mono-tag">{COPY.screen.tag}</p>
          <h2 className="frame__title">{COPY.screen.title}</h2>
          {specs}
        </div>
      </div>
    </section>
  );
}
