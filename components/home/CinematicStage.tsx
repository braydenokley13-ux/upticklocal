"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import BlockElevation from "@/components/home/BlockElevation";
import { CTA, OFFER_TEXT } from "@/lib/content";
import { useStageProgress } from "@/lib/useStageProgress";

const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));

const CHAPTERS = ["01 THE BLOCK", "02 THE NETWORK", "03 THE OFFER", "04 THE SCREEN"];

/**
 * Chapters 1–4. The section is 760vh tall and pins a single viewport; scroll
 * position drives the camera in the WebGL layer behind it and the opacity of
 * the four DOM chapters over it.
 *
 * Progress is written straight to CSS custom properties. Nothing here goes
 * through React state — a scroll-driven `setState` would re-render the whole
 * page sixty times a second for no benefit.
 */
export default function CinematicStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const onProgress = useCallback((p: number | null) => {
    const pin = pinRef.current;
    if (!pin || p === null) return;

    // Each chapter owns a window of the scroll and cross-fades with the next.
    const a1 = 1 - seg(p, 0.04, 0.11);
    const a2 = Math.min(seg(p, 0.17, 0.23), 1 - seg(p, 0.37, 0.43));
    const a3 = Math.min(seg(p, 0.45, 0.51), 1 - seg(p, 0.66, 0.72));
    const a4 = seg(p, 0.86, 0.93);
    const alphas = [a1, a2, a3, a4];

    pin.style.setProperty("--a1", a1.toFixed(3));
    pin.style.setProperty("--a2", a2.toFixed(3));
    pin.style.setProperty("--a3", a3.toFixed(3));
    pin.style.setProperty("--a4", a4.toFixed(3));
    pin.style.setProperty("--n1", (1 - seg(p, 0.14, 0.2)).toFixed(3));
    pin.style.setProperty("--n2", Math.min(seg(p, 0.14, 0.2), 1 - seg(p, 0.42, 0.48)).toFixed(3));
    pin.style.setProperty("--n3", Math.min(seg(p, 0.42, 0.48), 1 - seg(p, 0.8, 0.86)).toFixed(3));
    pin.style.setProperty("--n4", seg(p, 0.8, 0.86).toFixed(3));

    // A faded chapter must not keep its links in the tab order — but it stays
    // in the accessibility tree. Hiding it outright (or marking it inert)
    // would mean a screen reader that never scrolls simply loses whichever
    // chapters happen to be faded, including the page's only h1.
    chapterRefs.current.forEach((el, i) => {
      const spent = alphas[i] < 0.04;
      if (!el || el.dataset.spent === String(spent)) return;
      el.dataset.spent = String(spent);
      el.querySelectorAll("a").forEach((link) => {
        link.tabIndex = spent ? -1 : 0;
      });
    });
  }, []);

  useStageProgress("story", sectionRef, { onProgress });

  return (
    <section ref={sectionRef} className="stage">
      {/* ---------------- wide screens: the pinned cinematic ---------------- */}
      <div ref={pinRef} className="stage__pin">
        <div className="stage__scrim" aria-hidden="true" />

        <div
          className="stage__chapter stage__chapter--hero"
          ref={(el) => {
            chapterRefs.current[0] = el;
          }}
        >
          <p className="eyebrow eyebrow--mint">
            Uptick Local <span aria-hidden="true">·</span> Local screen &amp; promotion network
          </p>
          <h1 className="stage__title">
            Reach nearby customers.
            <br />
            Turn offers into visits.
            <br />
            <em>Bring them back.</em>
          </h1>
          <div className="stage__acts">
            <Link href={CTA.growth.href} className="btn btn--mint">
              {CTA.growth.label}
            </Link>
            <Link href={CTA.host.href} className="btn btn--outline">
              {CTA.host.label}
            </Link>
          </div>
          <p className="stage__cue" aria-hidden="true">
            SCROLL
          </p>
        </div>

        <div
          className="stage__chapter stage__chapter--network"
          ref={(el) => {
            chapterRefs.current[1] = el;
          }}
        >
          <p className="mono-tag">02 / The network</p>
          <h2 className="stage__sub">
            Your block is already <em>a network.</em>
          </h2>
          <p className="stage__body">
            Cafés, gyms, salons, restaurants, convenience stores — each with its own everyday
            traffic, and a counter where a screen can sit.
          </p>
        </div>

        <div
          className="stage__chapter stage__chapter--offer"
          ref={(el) => {
            chapterRefs.current[2] = el;
          }}
        >
          <div className="offercard">
            <p className="mono-tag mono-tag--amber">Example offer</p>
            <p className="offercard__line">{OFFER_TEXT}</p>
          </div>
          <p className="stage__body">
            Uptick places your offer on screens at up to five participating non-competing local
            stores. It travels; their screens carry it.
          </p>
        </div>

        <div
          className="stage__chapter stage__chapter--screen"
          ref={(el) => {
            chapterRefs.current[3] = el;
          }}
        >
          <p className="mono-tag">04 / The screen</p>
          <h2 className="stage__sub">
            Actual hardware, <em>on the counter.</em>
          </h2>
          <dl className="specs">
            <div>
              <dt>21&#8243;</dt>
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

        <ol className="stage__index" aria-hidden="true">
          {CHAPTERS.map((chapter, i) => (
            <li key={chapter} style={{ opacity: `calc(.28 + var(--n${i + 1}, 0) * .72)` }}>
              {chapter}
            </li>
          ))}
        </ol>
      </div>

      {/* ---------------- narrow screens: four drawn frames ---------------- */}
      <div className="stage__frames">
        <div className="frame frame--hero">
          <p className="eyebrow eyebrow--mint">
            Uptick Local <span aria-hidden="true">·</span> Local screen &amp; promotion network
          </p>
          <h1 className="frame__title">
            Reach nearby customers. Turn offers into visits. <em>Bring them back.</em>
          </h1>
          <BlockElevation frame={0} />
          <div className="frame__acts">
            <Link href={CTA.growth.href} className="btn btn--mint">
              {CTA.growth.label}
            </Link>
            <Link href={CTA.host.href} className="btn btn--outline">
              {CTA.host.label}
            </Link>
          </div>
        </div>

        <div className="frame">
          <p className="mono-tag">02 / The network</p>
          <h2 className="frame__sub">
            Your block is already <em>a network.</em>
          </h2>
          <p className="frame__body">
            Cafés, gyms, salons, restaurants, convenience stores — each with its own everyday
            traffic, and a counter where a screen can sit.
          </p>
          <BlockElevation frame={1} />
        </div>

        <div className="frame">
          <p className="mono-tag">03 / The offer</p>
          <div className="offercard">
            <p className="mono-tag mono-tag--amber">Example offer</p>
            <p className="offercard__line">{OFFER_TEXT}</p>
          </div>
          <BlockElevation frame={2} />
          <p className="frame__body">
            Uptick places your offer on screens at up to five participating non-competing local
            stores. It travels; their screens carry it.
          </p>
        </div>

        <div className="frame">
          <p className="mono-tag">04 / The screen</p>
          <h2 className="frame__sub">
            Actual hardware, <em>on the counter.</em>
          </h2>
          <BlockElevation frame={3} />
          <dl className="specs">
            <div>
              <dt>21&#8243;</dt>
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
