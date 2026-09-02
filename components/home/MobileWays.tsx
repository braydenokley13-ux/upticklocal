"use client";

import Link from "next/link";
import { useId, useState } from "react";
import ScreenFace, { describeFace } from "@/components/home/ScreenFace";
import { WAYS, type WayId } from "@/lib/content";

/**
 * Three ways in, for a thumb. One screen object stays put; three stacked
 * modes sit under it in reach, and the open one shows what it needs and what
 * it returns. No horizontal rail, nothing to hunt for.
 */
export default function MobileWays() {
  const [active, setActive] = useState<WayId>("host");
  const baseId = useId();

  return (
    <section id="ways-m" className="m-ways" data-theme="dark" aria-labelledby="m-ways-h">
      <div className="m-ways__head">
        <p className="mono-tag">05 · Three ways in</p>
        <h2 id="m-ways-h" className="m-title">
          Three ways to use Uptick Local.
        </h2>
      </div>

      <div className="m-ways__screen" data-way={active}>
        <div className="m-ways__panel" aria-hidden="true">
          <ScreenFace way={active} />
        </div>
        <p className="u-visually-hidden" aria-live="polite">
          {describeFace(active)}
        </p>
      </div>

      <div className="m-ways__list">
        {WAYS.map((w, i) => {
          const open = w.id === active;
          const headId = `${baseId}-${w.id}-h`;
          const bodyId = `${baseId}-${w.id}-b`;
          return (
            <div key={w.id} className="m-way" data-way={w.id} data-open={open}>
              <button type="button" id={headId} className="m-way__head" aria-expanded={open} aria-controls={bodyId} onClick={() => setActive(w.id)}>
                <span className="m-way__n">0{i + 1}</span>
                <span className="m-way__name">
                  {w.name}
                  {w.id === "growth" ? <span className="m-way__premium">Premium</span> : null}
                </span>
                <span className="m-way__req">{w.short}</span>
              </button>
              <div id={bodyId} className="m-way__body" role="region" aria-labelledby={headId} hidden={!open}>
                <p className="m-way__line">{w.line}</p>
                <ul className="m-way__points">
                  {w.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link href={w.cta.href} className={`btn btn--wide ${w.id === "growth" ? "btn--mint" : "btn--ghost"}`}>
                  {w.cta.label}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="m-ways__foot">Host and Advertise are complete on their own. Growth is the premium layer, and it runs on a host screen.</p>
    </section>
  );
}
