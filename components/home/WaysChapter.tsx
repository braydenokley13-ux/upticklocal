"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import ScreenFace, { describeFace } from "@/components/home/ScreenFace";
import { WAYS, type WayId } from "@/lib/content";

/**
 * Act IV — three ways to use Uptick Local. One selector, not three cards:
 * the ways differ in what they require and what they return, and Growth is
 * the premium layer without Host or Advertise reading as lesser tiers.
 */
export default function WaysChapter() {
  const [active, setActive] = useState<WayId>("host");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = WAYS.findIndex((w) => w.id === active);
  const way = WAYS[index];

  const onKey = (event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + WAYS.length) % WAYS.length;
    setActive(WAYS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="ways" className="chapter chapter--ways" data-theme="light" aria-labelledby="ways-heading">
      <div className="chapter__inner">
        <header className="ways__head">
          <p className="mono-tag mono-tag--ink">04 · Three ways in</p>
          <h2 id="ways-heading" className="chapter__title">
            Three ways to use Uptick Local.
          </h2>
        </header>

        <div className="ways">
          <div className="ways__rail" role="tablist" aria-orientation="vertical" aria-label="Ways to use Uptick Local" onKeyDown={onKey}>
            {WAYS.map((w, i) => (
              <button
                key={w.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${w.id}`}
                aria-selected={w.id === active}
                aria-controls={`${baseId}-panel-${w.id}`}
                tabIndex={w.id === active ? 0 : -1}
                className="ways__tab"
                data-way={w.id}
                onClick={() => setActive(w.id)}
              >
                <span className="ways__n">0{i + 1}</span>
                <span className="ways__name">{w.name}</span>
                <span className="ways__line">{w.line}</span>
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-${way.id}`}
            aria-labelledby={`${baseId}-tab-${way.id}`}
            className="ways__panel"
            data-way={way.id}
          >
            <div className="ways__screen" aria-hidden="true">
              <ScreenFace way={way.id} />
            </div>
            <p className="u-visually-hidden">{describeFace(way.id)}</p>
            <div className="ways__copy">
              <p className="ways__req">
                <span className="ways__reqdot" aria-hidden="true" />
                {way.requirement}
              </p>
              <ul className="ways__points">
                {way.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link href={way.cta.href} className={`btn ${way.id === "growth" ? "btn--ink" : "btn--outline"}`}>
                {way.cta.label}
              </Link>
            </div>
          </div>
        </div>

        <p className="ways__foot">
          Host and Advertise are independent of each other. Growth is the premium layer, and it runs on a host screen.
        </p>
      </div>
    </section>
  );
}
