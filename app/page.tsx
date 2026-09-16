import Link from "next/link";
import NetworkRing from "@/components/ed/NetworkRing";
import {
  AUDIENCES,
  HERO,
  MEMBER_QUOTE,
  MEMBER_STEPS,
  MERCHANT_PITCH,
  NETWORK,
  TRUST,
} from "@/lib/audience";
import { PROGRAM } from "@/lib/program";

/**
 * The public front door, told in the order a stranger needs it:
 *
 *   1. what this is            — a free local membership
 *   2. who it is for           — member, merchant, partner
 *   3. the member's week       — four steps, no jargon
 *   4. the merchant's case     — a four-week test, plainly costed in effort
 *   5. the loop                — how the four parties actually connect
 *   6. trust                   — what we do with a phone number
 *
 * Screens, dashboards and operator tooling are deliberately absent. They
 * are how Uptick runs, not what Uptick is, and a member does not care.
 */
export default function HomePage() {
  return (
    <div className="ed">
      {/* ---------------------------------------------------------------- 1 */}
      <header className="ed-band ed-band--paper ed-hero" data-theme="light">
        <div className="ed-shell ed-hero__inner">
          <p className="ed-eyebrow">{HERO.eyebrow}</p>
          <h1 className="ed-display ed-display--xl">
            {HERO.title.lead}
            <br />
            <em>{HERO.title.accent}</em>
          </h1>
          <p className="ed-lead ed-hero__lead">{HERO.lead}</p>
          <div className="ed-acts">
            <Link href={HERO.primary.href} className="ed-btn ed-btn--go">
              {HERO.primary.label}
            </Link>
            <Link href={HERO.secondary.href} className="ed-btn ed-btn--quiet">
              {HERO.secondary.label}
            </Link>
          </div>
          <ul className="ed-promises plainlist">
            {HERO.promises.map(([name, line]) => (
              <li key={name} className="ed-promise">
                <p className="ed-promise__name">{name}</p>
                <p className="ed-promise__line">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ---------------------------------------------------------------- 2 */}
      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="home-who"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">Three ways in</p>
            <h2 id="home-who" className="ed-display ed-display--lg">
              One membership, seen from <em>three sides.</em>
            </h2>
          </div>
          <div className="ed-grid ed-grid--3">
            {AUDIENCES.map((a) => (
              <article key={a.id} className="ed-card">
                <p className="ed-eyebrow ed-eyebrow--muted">{a.eyebrow}</p>
                <h3>{a.title}</h3>
                <p>{a.line}</p>
                <ul className="ed-ticks plainlist">
                  {a.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link href={a.cta.href} className="ed-textlink">
                  {a.cta.label} &rarr;
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 3 */}
      <section
        className="ed-band ed-band--paper"
        data-theme="light"
        aria-labelledby="home-member"
      >
        <div className="ed-shell">
          <div className="ed-head ed-head--centred">
            <p className="ed-eyebrow">For members</p>
            <h2 id="home-member" className="ed-display ed-display--lg">
              How Uptick works <em>for members.</em>
            </h2>
            <p className="ed-lead">
              A little good from nearby stores, each published week.
            </p>
          </div>
          <ol className="ed-steps plainlist">
            {MEMBER_STEPS.map((step) => (
              <li key={step.n} className="ed-step">
                <span className="ed-step__dot" aria-hidden="true">
                  {step.n}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="ed-quoteblock">
            <blockquote className="ed-quote">
              &ldquo;{MEMBER_QUOTE.line}&rdquo;
            </blockquote>
            <p className="ed-quote__by">{MEMBER_QUOTE.by}</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 4 */}
      <section
        className="ed-band ed-band--deep"
        data-theme="dark"
        aria-labelledby="home-merchant"
      >
        <div className="ed-shell">
          <div className="ed-head ed-head--centred">
            <p className="ed-eyebrow">{MERCHANT_PITCH.eyebrow}</p>
            <h2 id="home-merchant" className="ed-display ed-display--lg">
              {MERCHANT_PITCH.title}
            </h2>
            <p className="ed-lead">{MERCHANT_PITCH.lead}</p>
            <div className="ed-acts ed-acts--centred">
              <Link
                href={MERCHANT_PITCH.cta.href}
                className="ed-btn ed-btn--go"
              >
                {MERCHANT_PITCH.cta.label}
              </Link>
            </div>
          </div>
          <div className="ed-grid ed-grid--4 ed-pillars">
            {MERCHANT_PITCH.pillars.map(([name, line]) => (
              <div key={name} className="ed-pillar">
                <p className="ed-pillar__name">{name}</p>
                <p className="ed-pillar__line">{line}</p>
              </div>
            ))}
          </div>
          <p className="ed-honesty">{MERCHANT_PITCH.honesty}</p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 5 */}
      <section
        className="ed-band ed-band--paper"
        data-theme="light"
        aria-labelledby="home-network"
      >
        <div className="ed-shell">
          <div className="ed-head ed-head--centred">
            <p className="ed-eyebrow">{NETWORK.eyebrow}</p>
            <h2 id="home-network" className="ed-display ed-display--lg">
              {NETWORK.title.lead} <em>{NETWORK.title.accent}</em>
            </h2>
            <p className="ed-lead">{NETWORK.lead}</p>
          </div>
          <NetworkRing />
          <div className="ed-chainwrap">
            <h3 className="ed-chain__title">{NETWORK.chain.title}</h3>
            <ol className="ed-chain plainlist">
              {NETWORK.chain.steps.map(([what, note], i) => (
                <li key={what} className="ed-chain__step">
                  <p className="ed-chain__n">0{i + 1}</p>
                  <p className="ed-chain__what">{what}</p>
                  <p className="ed-chain__note">{note}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 6 */}
      <section
        className="ed-band ed-band--warm"
        data-theme="light"
        aria-labelledby="home-trust"
      >
        <div className="ed-shell">
          <div className="ed-head">
            <p className="ed-eyebrow">{TRUST.eyebrow}</p>
            <h2 id="home-trust" className="ed-display ed-display--lg">
              {TRUST.title.lead} <em>{TRUST.title.accent}</em>
            </h2>
            <p className="ed-lead">{TRUST.lead}</p>
          </div>
          <div className="ed-grid ed-grid--3">
            {TRUST.pillars.map(([name, line]) => (
              <div key={name} className="ed-card">
                <h3>{name}</h3>
                <p>{line}</p>
              </div>
            ))}
          </div>
          <div className="ed-doclinks">
            {TRUST.docs.map((doc) => (
              <Link key={doc.id} href={doc.href} className="ed-doclink">
                <span className="ed-doclink__name">{doc.name}</span>
                <span className="ed-doclink__line">{doc.line}</span>
              </Link>
            ))}
          </div>
          <p className="ed-signoff ed-signoff--home">
            {TRUST.signoff.lead}{" "}
            <em className="accent">{TRUST.signoff.accent}</em>
          </p>
          <p className="ed-gate">
            Pilot enrollment is not open yet. Uptick will publish its operating
            legal identity, notice address and final enrollment terms before
            admitting members. Questions:{" "}
            <a href={`mailto:${PROGRAM.supportEmail}`}>
              {PROGRAM.supportEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
