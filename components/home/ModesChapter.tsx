"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import BlockPlan from "@/components/home/BlockPlan";
import ScreenFace, { describeFace } from "@/components/home/ScreenFace";
import { WAYS, type WayId } from "@/lib/content";

/**
 * One network, three ways to use it. The same block is drawn once, as a
 * plan, and the mode decides what lights up — so Host, Advertise and Growth
 * read as three uses of one piece of infrastructure rather than three
 * products on three cards. Under the plan, what the screen itself shows.
 */
export default function ModesChapter() {
  const [active, setActive] = useState<WayId>("host");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = WAYS.findIndex((w) => w.id === active);
  const way = WAYS[index];

  const onKey = (event: React.KeyboardEvent) => {
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % WAYS.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + WAYS.length) % WAYS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = WAYS.length - 1;
    else return;
    event.preventDefault();
    setActive(WAYS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="ways" className="chapter chapter--modes" data-theme="light" aria-labelledby="modes-heading">
      <div className="chapter__inner">
        <header className="chapter__head">
          <p className="mono-tag mono-tag--ink">04 · One network</p>
          <h2 id="modes-heading" className="chapter__title">
            One network. Three ways to use it.
          </h2>
          <p className="chapter__lead">
            The screens are the infrastructure. Put one on your own counter, reach the ones around you, or run offers across them that
            come back as visits you can count.
          </p>
        </header>

        <div className="modes">
          <div className="modes__rail" role="tablist" aria-orientation="vertical" aria-label="Ways to use the network" onKeyDown={onKey}>
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
                className="mode"
                data-way={w.id}
                onClick={() => setActive(w.id)}
              >
                <span className="mode__n">0{i + 1}</span>
                <span className="mode__name">{w.name}</span>
                <span className="mode__req">{w.requirement}</span>
                <span className="mode__line">{w.line}</span>
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`${baseId}-panel-${way.id}`} aria-labelledby={`${baseId}-tab-${way.id}`} className="modes__panel" data-way={way.id}>
            <p className="modes__intro">
              <span>{way.requirement}</span>
              {way.line}
            </p>
            <figure className="board">
              <BlockPlan mode={way.id} />
              <figcaption className="board__caption">
                <span className="board__key" aria-hidden="true" />
                {way.diagram}
              </figcaption>
            </figure>

            <div className="modes__detail">
              <div className="modes__screen" aria-hidden="true">
                <ScreenFace way={way.id} />
              </div>
              <p className="u-visually-hidden">{describeFace(way.id)}</p>
              <div className="modes__copy">
                <p className="mono-tag mono-tag--ink">What the screen shows</p>
                <ul className="modes__points">
                  {way.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link href={way.cta.href} className={`btn ${way.id === "growth" ? "btn--ink" : "btn--line"}`}>
                  {way.cta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="modes__foot">Host and Advertise are complete on their own. Growth runs on a host screen, and Uptick Suite works with any of them.</p>
      </div>
    </section>
  );
}
