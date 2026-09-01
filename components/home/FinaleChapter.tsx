"use client";

import Link from "next/link";
import { useRef } from "react";
import BlockElevation from "@/components/home/BlockElevation";
import { CTA } from "@/lib/content";
import { useStageProgress } from "@/lib/useStageProgress";

/**
 * Chapter 10 — back to the neighbourhood.
 *
 * The camera drifts laterally across the finished block, every screen live.
 * By now the visitor has watched the system work, so "the local map" is a
 * description rather than a metaphor. Nothing follows it.
 */
export default function FinaleChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  useStageProgress("finale", sectionRef);

  return (
    <section ref={sectionRef} className="finale" aria-labelledby="finale-heading">
      <div className="finale__pin">
        <div className="finale__scrim" aria-hidden="true" />
        <div className="finale__frames">
          <BlockElevation frame={1} />
        </div>
        <div className="finale__copy">
          <p className="mono-tag mono-tag--muted">
            Your business <span aria-hidden="true">·</span> Five nearby screens{" "}
            <span aria-hidden="true">·</span> One local network
          </p>
          <h2 id="finale-heading" className="finale__title">
            Put your business <em>on the local map.</em>
          </h2>
          <div className="finale__acts">
            <Link href={CTA.growth.href} className="btn btn--mint">
              {CTA.growth.label}
            </Link>
            <Link href={CTA.host.href} className="btn btn--outline">
              {CTA.host.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
