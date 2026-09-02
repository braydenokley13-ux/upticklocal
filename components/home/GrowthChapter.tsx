import Link from "next/link";
import ClaimUI from "@/components/home/ClaimUI";
import DropMessage from "@/components/home/DropMessage";
import OfferPass from "@/components/home/OfferPass";
import ScreenFace from "@/components/home/ScreenFace";
import { CTA, GROWTH_EXAMPLE } from "@/lib/content";

const REPORT = [
  ["Signups", "numbers entered at the Anchor"],
  ["Claims", "passes opened"],
  ["Redemptions", "each one, with the time"],
  ["Drops sent", "and what each brought back"],
  ["Lists", "who chose your updates, who chose Uptick Drops"],
  ["By placement", "which counters the activity came from"],
];

/**
 * Growth, in one chapter. The diptych carries the product model: a durable
 * reason to care on the screen, a time-boxed reason to act on the phone.
 * The loop under it is the customer's side — claim, pass, redeem — and the
 * report is the business's. No fake numbers anywhere: the report lists what
 * is counted, not a result we have not observed.
 */
export default function GrowthChapter() {
  const g = GROWTH_EXAMPLE;
  return (
    <section id="growth" className="chapter chapter--growth" data-theme="light" aria-labelledby="growth-heading">
      <div className="chapter__inner">
        <header className="chapter__head">
          <p className="mono-tag mono-tag--ink">05 · Uptick Growth · Requires hosting</p>
          <h2 id="growth-heading" className="chapter__title">
            A reason to care all month. A reason to come in now.
          </h2>
          <p className="chapter__lead">
            A screen whose content changes monthly cannot keep shouting &ldquo;today only&rdquo;. So Growth splits the job in two: the
            Anchor lives on the screen and earns the sign-up; the Drop lands on the phone and earns the visit.
          </p>
        </header>

        <div className="diptych">
          <figure className="station station--anchor">
            <figcaption className="station__label">
              <span className="station__n">01</span>
              <span className="station__name">Monthly Anchor</span>
              <span className="station__where">On the screen · All month</span>
            </figcaption>
            <div className="unit">
              <div className="unit__panel" aria-hidden="true">
                <ScreenFace way="growth" />
              </div>
              <div className="unit__foot" aria-hidden="true" />
            </div>
            <p className="station__note">
              Persistent, at eye level, on your counter and on the Uptick screens nearby. One code to scan for this month&rsquo;s offer
              and any future Drops.
            </p>
          </figure>

          <figure className="station station--drop">
            <figcaption className="station__label">
              <span className="station__n">02</span>
              <span className="station__name">Uptick Drop</span>
              <span className="station__where">On their phone · Limited time</span>
            </figcaption>
            <div className="phone phone--drop">
              <DropMessage large />
            </div>
            <p className="station__note">
              A time-boxed reason to act: {g.windows.slice(0, 3).join(", ").toLowerCase()}. Sent only to the people who asked for
              them. Real mechanics, not manufactured urgency.
            </p>
          </figure>
        </div>
        <p className="example">{GROWTH_EXAMPLE.note}</p>

        <div className="loop">
          <figure className="station">
            <figcaption className="station__label">
              <span className="station__n">03</span>
              <span className="station__name">Claim</span>
              <span className="station__where">Ten seconds, on their phone</span>
            </figcaption>
            <div className="phone phone--claim">
              <ClaimUI compact />
            </div>
            <p className="station__note">The number delivers the pass. The two lists are separate, optional and off to start.</p>
          </figure>

          <figure className="station">
            <figcaption className="station__label">
              <span className="station__n">04</span>
              <span className="station__name">Visit &amp; redeem</span>
              <span className="station__where">At your counter</span>
            </figcaption>
            <div className="phone phone--pass">
              <OfferPass caption={false} />
            </div>
            <p className="station__note">Open the pass, show staff, tap redeem, confirm. No POS integration, no cashier code, no new software.</p>
          </figure>

          <figure className="station station--report">
            <figcaption className="station__label">
              <span className="station__n">05</span>
              <span className="station__name">Report</span>
              <span className="station__where">To you, in plain language</span>
            </figcaption>
            <dl className="report">
              {REPORT.map(([dt, dd]) => (
                <div key={dt}>
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
            <p className="station__note">Only what Uptick can actually observe. A play on a screen is a play, never a headcount.</p>
          </figure>
        </div>

        <div className="chapter__close">
          <p className="chapter__close-line">
            Uptick runs the screens, the claim flow, the texts, the tracking and the report. You choose the offer and provide the
            reward.
          </p>
          <div className="chapter__acts">
            <Link href={CTA.growth.href} className="btn btn--ink">
              {CTA.growth.label}
            </Link>
            <Link href="/growth" className="textlink">
              How Growth works, in full
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
