import type { Metadata } from "next";
import Link from "next/link";
import {
  ACQUISITION_PARTNERS as ACQ,
  DISTRIBUTION_PARTNERS as DIST,
} from "@/lib/audience";
import { PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Two ways to work with Uptick Local. If you already operate screens, Uptick buys placements on inventory it does not own — we are a buyer, not a competing network. If you serve a local population, you can point people at a free local membership without sharing any list.",
};

/**
 * Two relationships that English files under one word, kept apart on
 * purpose.
 *
 * A screen operator arriving here has one question first — "are you a rival
 * network?" — so the answer leads, before anything else is explained.
 */

const mailto = (subject: string) =>
  `mailto:${PROGRAM.supportEmail}?subject=${encodeURIComponent(
    `Uptick Local — ${subject}`,
  )}`;

export default function PartnersPage() {
  return (
    <div className="ed">
      <header className="ed-band ed-band--paper ed-hero" data-theme="light">
        <div className="ed-shell ed-hero__inner">
          <p className="ed-eyebrow">Partners</p>
          <h1 className="ed-display ed-display--xl">
            Two ways to work <em>with Uptick.</em>
          </h1>
          <p className="ed-lead ed-hero__lead">
            They are different enough to be worth separating. Pick the one that
            describes you.
          </p>
          <div className="ed-acts">
            <a href="#screens" className="ed-btn ed-btn--go">
              I operate screens
            </a>
            <a href="#introductions" className="ed-btn ed-btn--quiet">
              I serve a local population
            </a>
          </div>
        </div>
      </header>

      {/* ------------------------------------------- distribution partners */}
      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        id="screens"
        aria-labelledby="screens-h"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">{DIST.eyebrow}</p>
            <h2 id="screens-h" className="ed-display ed-display--lg">
              {DIST.title.lead} <em>{DIST.title.accent}</em>
            </h2>
            <p className="ed-lead">{DIST.lead}</p>
          </div>

          {/* The first question a screen operator has, answered first. */}
          <div className="ed-plainly">
            <h3>{DIST.notCompetition.title}</h3>
            <p>{DIST.notCompetition.body}</p>
          </div>

          <div className="ed-why">
            <h3 className="ed-display ed-display--md">{DIST.why.title}</h3>
            <p className="ed-lead">{DIST.why.body}</p>
          </div>

          <div className="ed-grid ed-grid--2 ed-keeps">
            {DIST.keep.map(([name, line]) => (
              <div key={name} className="ed-card">
                <h3>{name}</h3>
                <p>{line}</p>
              </div>
            ))}
          </div>

          <div className="ed-fits">
            <h3 className="ed-fits__title">{DIST.fits.title}</h3>
            <ul className="ed-fits__list plainlist">
              {DIST.fits.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="ed-fits__note">{DIST.fits.note}</p>
          </div>

          <div className="ed-ask">
            <div>
              <h3 className="ed-display ed-display--md">
                {DIST.cta.label}
              </h3>
              <p className="ed-lead">
                There is no form here and no portal to sign into. An email with
                these four things is enough to start:
              </p>
              <ul className="ed-ticks plainlist">
                {DIST.cta.include.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <a href={mailto(DIST.cta.subject)} className="ed-btn ed-btn--go">
              {DIST.cta.label}
            </a>
          </div>

          <p className="ed-gate" style={{ textAlign: "left" }}>
            {DIST.honesty}
          </p>
        </div>
      </section>

      {/* -------------------------------------------- acquisition partners */}
      <section
        className="ed-band ed-band--paper"
        data-theme="light"
        id="introductions"
        aria-labelledby="intro-h"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">{ACQ.eyebrow}</p>
            <h2 id="intro-h" className="ed-display ed-display--lg">
              {ACQ.title.lead} <em>{ACQ.title.accent}</em>
            </h2>
            <p className="ed-lead">{ACQ.lead}</p>
          </div>

          <div className="ed-grid ed-grid--2">
            {ACQ.points.map(([name, line]) => (
              <div key={name} className="ed-card">
                <h3>{name}</h3>
                <p>{line}</p>
              </div>
            ))}
          </div>

          <div className="ed-ask">
            <div>
              <h3 className="ed-display ed-display--md">{ACQ.cta.label}</h3>
              <p className="ed-lead">
                Same as above — an email, with these four things:
              </p>
              <ul className="ed-ticks plainlist">
                {ACQ.cta.include.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <a href={mailto(ACQ.cta.subject)} className="ed-btn ed-btn--go">
              {ACQ.cta.label}
            </a>
          </div>

          <p className="ed-gate" style={{ textAlign: "left" }}>
            Pilot enrollment is not open yet, so an introduction today is a
            conversation rather than a launch date. Read the{" "}
            <Link href={PROGRAM.urls.privacy}>Privacy Policy</Link> and the{" "}
            <Link href={PROGRAM.urls.sms}>SMS program</Link> for exactly what
            Uptick does with a member&rsquo;s phone number.
          </p>
        </div>
      </section>
    </div>
  );
}
