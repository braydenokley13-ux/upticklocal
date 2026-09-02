"use client";

import { useCallback, useRef } from "react";
import ScreenMatch from "@/components/home/ScreenMatch";
import { CTA, PROMISE, PROMISE_LINE, STORY } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/scroll";
import { useStageProgress } from "@/lib/useStageProgress";

const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));

/** Where the second beat is held, as a fraction of the pinned scroll. */
const BLOCK_AT = 0.3;

/**
 * The first act on a desktop: the company, then the block, then the
 * connection, then the screen. The section is 520vh tall and pins one
 * viewport; scroll drives the camera behind it and the opacity of the copy
 * over it. Progress goes straight to CSS custom properties — nothing here
 * touches React state on a scroll frame. Phones tell the same act in
 * MobileStory.
 */
export default function CinematicStage({ enabled }: { enabled: boolean }) {
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

  useStageProgress("story", sectionRef, { onProgress, enabled });

  /** "See how it works": one move to the second beat. */
  const toBlock = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const section = sectionRef.current;
    if (!section) return;
    event.preventDefault();
    const behavior: ScrollBehavior = prefersReducedMotion() ? "instant" : "smooth";
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + BLOCK_AT * (section.offsetHeight - window.innerHeight), behavior });
  }, []);

  return (
    <section ref={sectionRef} className="stage" data-theme="dark" aria-label="Uptick Local, on one block">
      <div ref={pinRef} className="stage__pin">
        <div className="stage__scrim" aria-hidden="true" />

        <div ref={heroRef} className="beat beat--hero">
          <p className="eyebrow">A local business growth system</p>
          <h1 className="hero__title">
            {PROMISE.lead} <em className="accent">{PROMISE.accent}</em>
          </h1>
          <p className="hero__line">{PROMISE_LINE}</p>
          <div className="hero__acts">
            <a href={CTA.how.href} className="btn btn--ghost btn--down" onClick={toBlock}>
              {CTA.how.label}
            </a>
            <a href={CTA.talk.href} className="btn btn--mint">
              {CTA.talk.label}
            </a>
          </div>
        </div>

        <div className="beat beat--model" id="block">
          <p className="mono-tag">{STORY.block.tag}</p>
          <h2 className="beat__title">{STORY.block.title}</h2>
          <p className="beat__body">{STORY.block.body}</p>
        </div>

        <div className="beat beat--signal">
          <p className="mono-tag">{STORY.connect.tag}</p>
          <h2 className="beat__title">{STORY.connect.title}</h2>
          <p className="beat__body">{STORY.connect.body}</p>
        </div>

        <div className="beat beat--screen">
          <p className="mono-tag">{STORY.screen.tag}</p>
          <h2 className="beat__title">{STORY.screen.title}</h2>
          <dl className="specs">
            {STORY.screen.specs.map(([dt, dd]) => (
              <div key={dt}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ScreenMatch />
        <p className="stage__cue" aria-hidden="true">
          Scroll
        </p>
      </div>
    </section>
  );
}
