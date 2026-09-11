import type { Metadata } from "next";
import Link from "next/link";
import MembershipCta from "@/components/MembershipCta";
import { PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Uptick Local Membership",
  description:
    "Uptick Local is a free consumer membership for local perks. Join once, receive an eligible Uptick, and redeem it at participating locations when it is available in your market.",
};

const HOW_IT_WORKS = [
  ["Join once", "Uptick Local membership is free. No paid membership is currently required."],
  ["Get your Uptick", "Members may receive a featured Uptick, with other eligible local options added as the product evolves."],
  ["Go redeem it", "The participating location fulfills the specific Uptick. Its exact terms, timing and availability are the ones shown with that benefit."],
  ["Come back next week", "The product is built around a recurring local rhythm, with availability depending on participating markets and locations."],
] as const;

export default function MembershipPage() {
  return (
    <div className="page program-page program-page--membership">
      <header className="program-hero" data-theme="dark">
        <div className="program-shell program-hero__grid">
          <div className="program-hero__copy">
            <p className="mono-tag">{PROGRAM.brandName} · Membership</p>
            <h1 className="program-hero__title">
              Something good is <em className="accent">free nearby.</em>
            </h1>
            <p className="program-hero__lead">
              Uptick is a free local consumer membership. Join once, get your Uptick, go redeem it, and come back next week.
            </p>
            <div className="page__acts">
              <MembershipCta />
              <Link href={PROGRAM.urls.sms} className="btn btn--outline">
                How messages work
              </Link>
            </div>
            <p className="program-hero__note">
              Availability depends on participating markets and locations. No paid membership is currently required.
            </p>
          </div>

          <div className="program-hero__signal" aria-label="Uptick Drop overview">
            <div className="program-signal">
              <p className="mono-tag mono-tag--muted">The member benefit</p>
              <p className="program-signal__title">An Uptick Drop is a genuinely free item or perk made available through a participating local location.</p>
              <dl className="program-facts program-facts--dark">
                <div>
                  <dt>Member</dt>
                  <dd>Uptick Local</dd>
                </div>
                <div>
                  <dt>Fulfills</dt>
                  <dd>Participating location</dd>
                </div>
                <div>
                  <dt>Relationship</dt>
                  <dd>Managed by Uptick</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      <section className="program-band program-band--paper" data-theme="light" aria-labelledby="membership-why">
        <div className="program-shell">
          <p className="mono-tag mono-tag--ink">Why Uptick exists</p>
          <div className="program-section-head">
            <h2 id="membership-why">Make local feel worth returning to.</h2>
            <p>
              Local businesses already have reasons for people to stop in. Uptick makes one of those reasons easier to discover and
              easier to come back to, without turning the neighborhood into a deal feed.
            </p>
          </div>
          <div className="program-copy-grid">
            <p>
              The consumer relationship is simple: <strong>Uptick Local and the Uptick Member.</strong> Uptick manages the membership
              relationship and the messages a member chooses to receive. Participating locations fulfill the benefit when a member
              redeems it.
            </p>
            <p>
              The first merchant focus is gas stations and convenience stores: places already part of a weekly routine. The network
              may evolve, but the public promise stays plain—something useful, free, and local when it is actually available.
            </p>
          </div>
        </div>
      </section>

      <section className="program-band program-band--light" data-theme="light" aria-labelledby="membership-how">
        <div className="program-shell">
          <div className="program-section-head">
            <p className="mono-tag mono-tag--ink">How it works</p>
            <h2 id="membership-how">Join once. Get your Uptick. Go redeem it.</h2>
            <p>There is no paid tier to understand and no promise that every location has an Uptick at every moment.</p>
          </div>
          <ol className="program-steps">
            {HOW_IT_WORKS.map(([title, body], index) => (
              <li key={title}>
                <span className="program-step__number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="program-band program-band--deep" data-theme="dark" aria-labelledby="membership-launch">
        <div className="program-shell">
          <p className="mono-tag">Where it is launching</p>
          <div className="program-section-head program-section-head--dark">
            <h2 id="membership-launch">Starting with the places already in the weekly routine.</h2>
            <p>
              Uptick&rsquo;s initial merchant focus is participating gas stations and convenience stores. We are not publishing a live
              directory, map, member count or availability claim here. Access depends on the market and locations participating at the
              time.
            </p>
          </div>
          <div className="program-copy-grid program-copy-grid--dark">
            <div>
              <p className="mono-tag mono-tag--muted">The location</p>
              <p>Fulfills the specific Uptick benefit and follows the offer&rsquo;s displayed terms, capacity and timing.</p>
            </div>
            <div>
              <p className="mono-tag mono-tag--muted">The relationship</p>
              <p>Uptick manages membership. Joining Uptick does not automatically enroll a member in a participating merchant&rsquo;s independent marketing program.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="program-band program-band--paper" data-theme="light" aria-labelledby="membership-messages">
        <div className="program-shell">
          <p className="mono-tag mono-tag--ink">Messaging expectations</p>
          <div className="program-section-head">
            <h2 id="membership-messages">A clear message about something worth showing up for.</h2>
            <p>
              SMS is an important delivery channel for Uptick Local. Members who choose messaging may receive approximately one
              featured Uptick per week. Membership, service, support or transaction-related messages may add to that frequency.
            </p>
          </div>
          <ul className="program-list">
            <li>{SMS_PROGRAM.rates}</li>
            <li>{SMS_PROGRAM.optOut} Reply HELP for help or contact {PROGRAM.supportEmail}.</li>
            <li>Merchant-specific marketing is a separate choice. A participating location does not inherit Uptick membership consent.</li>
          </ul>
          <Link href={PROGRAM.urls.sms} className="program-text-link">
            Read the Uptick Local messaging program
          </Link>
        </div>
      </section>

      <section className="program-cta-band" data-theme="dark" aria-labelledby="membership-cta">
        <div className="program-shell program-cta-band__inner">
          <div>
            <p className="mono-tag">Membership access</p>
            <h2 id="membership-cta">Want to hear when Uptick opens near you?</h2>
            <p>
              If access is not live in your market yet, we will say so. Use the current membership path when it is configured, or ask
              the Uptick team about pilot access.
            </p>
          </div>
          <MembershipCta className="btn btn--mint" />
        </div>
      </section>
    </div>
  );
}
