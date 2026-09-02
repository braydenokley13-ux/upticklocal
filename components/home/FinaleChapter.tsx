"use client";

import Link from "next/link";
import { useRef } from "react";
import { CTA } from "@/lib/content";
import { useStageProgress } from "@/lib/useStageProgress";

/**
 * Chapter 10 on a desktop — back to the block at blue hour, every counter
 * screen lit, in the live model. By now the visitor knows what each object
 * is, so "the local map" is a description rather than a metaphor. Nothing
 * follows it. Phones close with MobileFinale.
 */
export default function FinaleChapter({ enabled }: { enabled: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  useStageProgress("finale", sectionRef, { enabled });

  return (
    <section ref={sectionRef} className="finale" data-theme="dark" aria-labelledby="finale-heading">
      <div className="finale__pin">
        <div className="finale__scrim" aria-hidden="true" />
        <div className="finale__copy">
          <p className="mono-tag">Your business · The businesses around it · One local network</p>
          <h2 id="finale-heading" className="finale__title">
            Put your business on the local map.
          </h2>
          <div className="finale__acts">
            <Link href={CTA.host.href} className="btn btn--ghost">
              {CTA.host.label}
            </Link>
            <Link href={CTA.advertise.href} className="btn btn--ghost">
              {CTA.advertise.label}
            </Link>
            <Link href={CTA.growth.href} className="btn btn--primary">
              {CTA.growth.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
