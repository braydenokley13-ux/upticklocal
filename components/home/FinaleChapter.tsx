"use client";

import { useRef } from "react";
import Doors from "@/components/home/Doors";
import { FINALE } from "@/lib/content";
import { useStageProgress } from "@/lib/useStageProgress";

/**
 * The close on a desktop — back to the block at blue hour, every counter
 * screen lit, in the live model. By now the visitor knows what each object
 * is, so "the local map" is a description rather than a metaphor. Four
 * doors, and nothing after them. Phones close with MobileFinale.
 */
export default function FinaleChapter({ enabled }: { enabled: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  useStageProgress("finale", sectionRef, { enabled });

  return (
    <section ref={sectionRef} className="finale" data-theme="dark" aria-labelledby="finale-heading">
      <div className="finale__pin">
        <div className="finale__scrim" aria-hidden="true" />
        <div className="finale__copy">
          <p className="mono-tag">{FINALE.tag}</p>
          <h2 id="finale-heading" className="finale__title">
            {FINALE.title}
          </h2>
          <Doors />
        </div>
      </div>
    </section>
  );
}
