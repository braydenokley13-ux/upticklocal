import type { Metadata } from "next";
import Link from "next/link";
import MembershipCta from "@/components/MembershipCta";
import { PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Uptick Local Membership",
  description:
    "Uptick Local is a free pilot membership for admitted adults. A published weekly release provides one featured, no-purchase benefit backed by approved local supply.",
};

const HOW_IT_WORKS = [
  [
    "Be admitted",
    "The bounded pilot is for adults age 18 or older. It targets 150 admitted members and has a hard cap of 200.",
  ],
  [
    "Get one featured benefit",
    "For each published weekly release, an eligible member receives one benefit backed by approved supply. No purchase or member payment is required.",
  ],
  [
    "Go redeem it",
    "The named participating location fulfills the benefit under its displayed timing, capacity and redemption instructions.",
  ],
  [
    "Use web or optional SMS",
    "A private web experience provides access. Uptick Local membership texts are optional and message frequency varies.",
  ],
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
              Uptick is a free local pilot membership for admitted adults. Each
              published weekly release provides one featured, no-purchase
              benefit backed by approved local supply.
            </p>
            <div className="page__acts">
              <MembershipCta />
              <Link href={PROGRAM.urls.sms} className="btn btn--outline">
                How messages work
              </Link>
            </div>
            <p className="program-hero__note">
              The pilot targets {PROGRAM.pilotTargetMembers} admitted members
              and will not exceed {PROGRAM.pilotMemberCap}. No fixed membership
              fee or purchase is required.
            </p>
          </div>

          <div
            className="program-hero__signal"
            aria-label="Uptick Drop overview"
          >
            <div className="program-signal">
              <p className="mono-tag mono-tag--muted">The member benefit</p>
              <p className="program-signal__title">
                One featured item or perk, backed by approved supply and
                available without a purchase.
              </p>
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

      <section
        className="program-band program-band--paper"
        data-theme="light"
        aria-labelledby="membership-why"
      >
        <div className="program-shell">
          <p className="mono-tag mono-tag--ink">Why Uptick exists</p>
          <div className="program-section-head">
            <h2 id="membership-why">Make local feel worth returning to.</h2>
            <p>
              Local businesses already have reasons for people to stop in.
              Uptick makes one of those reasons easier to discover and easier to
              come back to, without turning the neighborhood into a deal feed.
            </p>
          </div>
          <div className="program-copy-grid">
            <p>
              The consumer relationship is between{" "}
              <strong>Uptick Local and the Uptick Member.</strong> Uptick
              manages admission, access and any messages a member chooses to
              receive. A named participating location fulfills the benefit when
              a member redeems it.
            </p>
            <p>
              Participating suppliers can join organically without buying a
              Growth program or paying a Growth fee. A Growth buyer may also be
              different from the location that fulfills the member benefit.
            </p>
          </div>
        </div>
      </section>

      <section
        className="program-band program-band--light"
        data-theme="light"
        aria-labelledby="membership-how"
      >
        <div className="program-shell">
          <div className="program-section-head">
            <p className="mono-tag mono-tag--ink">How it works</p>
            <h2 id="membership-how">
              Be admitted. Get one backed benefit. Go redeem it.
            </h2>
            <p>
              There is no paid tier and no purchase requirement. Only a
              published release creates a current benefit.
            </p>
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

      <section
        className="program-band program-band--deep"
        data-theme="dark"
        aria-labelledby="membership-launch"
      >
        <div className="program-shell">
          <p className="mono-tag">Where it is launching</p>
          <div className="program-section-head program-section-head--dark">
            <h2 id="membership-launch">
              A bounded pilot with verified supply.
            </h2>
            <p>
              The pilot is limited to admitted adults age{" "}
              {PROGRAM.minimumMemberAge} or older. It targets{" "}
              {PROGRAM.pilotTargetMembers} members and has a hard cap of{" "}
              {PROGRAM.pilotMemberCap}. Uptick checks inventory and location
              readiness before a weekly release is published.
            </p>
          </div>
          <div className="program-copy-grid program-copy-grid--dark">
            <div>
              <p className="mono-tag mono-tag--muted">The location</p>
              <p>
                Fulfills the specific benefit and follows its displayed terms,
                capacity, timing and recovery instructions.
              </p>
            </div>
            <div>
              <p className="mono-tag mono-tag--muted">The relationship</p>
              <p>
                Uptick manages membership. Joining Uptick does not automatically
                enroll a member in a participating merchant&rsquo;s independent
                marketing program.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="program-band program-band--paper"
        data-theme="light"
        aria-labelledby="membership-messages"
      >
        <div className="program-shell">
          <p className="mono-tag mono-tag--ink">Messaging expectations</p>
          <div className="program-section-head">
            <h2 id="membership-messages">
              Use the web. Choose texts only if you want them.
            </h2>
            <p>
              Membership and an issued benefit do not depend on SMS. Members who
              opt in may receive an Uptick notice for a published weekly
              release, plus service, support or transaction-related messages
              when needed. Message frequency varies.
            </p>
          </div>
          <ul className="program-list">
            <li>{SMS_PROGRAM.rates}</li>
            <li>
              {SMS_PROGRAM.optOut} Reply HELP for help or contact{" "}
              {PROGRAM.supportEmail}.
            </li>
            <li>{SMS_PROGRAM.restart}</li>
            <li>
              A participating location does not receive Uptick SMS consent or
              member history.
            </li>
          </ul>
          <Link href={PROGRAM.urls.sms} className="program-text-link">
            Read the Uptick Local messaging program
          </Link>
        </div>
      </section>

      <section
        className="program-cta-band"
        data-theme="dark"
        aria-labelledby="membership-cta"
      >
        <div className="program-shell program-cta-band__inner">
          <div>
            <p className="mono-tag">Membership access</p>
            <h2 id="membership-cta">
              Want to hear when Uptick opens near you?
            </h2>
            <p>
              Pilot enrollment is not open while the operating legal identity,
              notice address and launch process remain unfinished. You can ask
              the Uptick team about future pilot access.
            </p>
          </div>
          <MembershipCta className="btn btn--mint" />
        </div>
      </section>
    </div>
  );
}
