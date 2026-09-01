"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { CAMPAIGN, OFFER_TEXT, SPECIAL, WAYS, type WayId } from "@/lib/content";

/** What the screen shows for each way in: the loop is the product. */
function ScreenFace({ way }: { way: WayId }) {
  if (way === "host") {
    return (
      <div className="face face--host">
        <p className="face__tag">{SPECIAL.tag}</p>
        <p className="face__big">{SPECIAL.line1}</p>
        <p className="face__sub">{SPECIAL.line2}</p>
        <p className="face__where">Convenience · 118 Main St</p>
      </div>
    );
  }
  if (way === "advertise") {
    return (
      <div className="face face--advertise">
        <p className="face__tag">Nearby · {CAMPAIGN.who}</p>
        <p className="face__big">{CAMPAIGN.line1}</p>
        <p className="face__sub">{CAMPAIGN.line2}</p>
        <p className="face__where">Showing at 4 locations on this block</p>
      </div>
    );
  }
  const words = OFFER_TEXT.split(" ");
  return (
    <div className="face face--growth">
      <p className="face__tag">Example offer · Your Business</p>
      <p className="face__big">
        {words.slice(0, 3).join(" ")}
        <br />
        {words.slice(3).join(" ")}
      </p>
      <p className="face__sub">Scan to claim. Redeem on your phone.</p>
      <span className="face__code" aria-hidden="true" />
    </div>
  );
}

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
