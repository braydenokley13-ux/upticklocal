import Link from "next/link";
import { SUITE } from "@/lib/content";

/**
 * Uptick Suite: the half of the job that happens after someone notices you.
 * One conversation with the owner becomes every surface a customer checks —
 * shown as one source fanning into six, because that is the product: one
 * business, one voice, more high-quality touchpoints. Not six cards.
 */
export default function SuiteChapter() {
  return (
    <section id="suite" className="chapter chapter--suite" data-theme="light" aria-labelledby="suite-heading">
      <div className="chapter__inner">
        <header className="chapter__head chapter__head--suite">
          <p className="mono-tag mono-tag--ink">06 · {SUITE.tag}</p>
          <h2 id="suite-heading" className="chapter__title">
            {SUITE.title.lead} <em className="accent">{SUITE.title.accent}</em> {SUITE.title.tail}
          </h2>
          <p className="chapter__lead">{SUITE.lead}</p>
        </header>

        <div className="cascade">
          <div className="cascade__source">
            <p className="mono-tag mono-tag--ink">{SUITE.source.label}</p>
            <p className="cascade__business">{SUITE.source.business}</p>
            <p className="cascade__topic">&ldquo;{SUITE.source.topic}&rdquo;</p>
            <p className="cascade__so">becomes</p>
          </div>

          <svg className="cascade__fan" viewBox="0 0 80 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {SUITE.surfaces.map((s, i) => {
              const y = 50 + i * 100;
              return <path key={s.id} d={`M0,300 C40,300 40,${y} 80,${y}`} />;
            })}
          </svg>

          <ol className="cascade__list">
            {SUITE.surfaces.map((s) => (
              <li key={s.id} className="surface" data-id={s.id}>
                <span className="surface__channel">{s.channel}</span>
                <span className="surface__title">{s.title}</span>
                <span className="surface__body">{s.body}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="suite__foot">
          <p className="suite__cred">
            <strong>{SUITE.credibility.line}</strong> {SUITE.credibility.who}
          </p>
          <p className="suite__site">{SUITE.website}</p>
          <div className="chapter__acts">
            <Link href={SUITE.cta.href} className="btn btn--ink">
              {SUITE.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
