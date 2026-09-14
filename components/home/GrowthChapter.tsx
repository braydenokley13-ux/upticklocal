import Link from "next/link";
import ClaimUI from "@/components/home/ClaimUI";
import DropMessage from "@/components/home/DropMessage";
import OfferPass from "@/components/home/OfferPass";
import ScreenFace from "@/components/home/ScreenFace";
import { CTA, GROWTH_EXAMPLE } from "@/lib/content";

const REPORT = [
  ["Program", "the approved four-week scope and placements"],
  ["Issued", "benefits backed by approved supply"],
  ["Claims", "issued benefits opened"],
  ["Redemptions", "completed fulfillment, with the time"],
  ["Recovery", "fulfillment problems and what followed"],
  ["Credits", "approved program adjustments"],
];

/**
 * Growth, in one chapter. The diptych shows an optional screen placement and
 * a featured member benefit. The loop under it shows access and fulfillment;
 * the report is the business's. No fake numbers appear: the report lists what
 * is counted, not a result we have not observed.
 */
export default function GrowthChapter() {
  const g = GROWTH_EXAMPLE;
  return (
    <section
      id="growth"
      className="chapter chapter--growth"
      data-theme="light"
      aria-labelledby="growth-heading"
    >
      <div className="chapter__inner">
        <header className="chapter__head">
          <p className="mono-tag mono-tag--ink">
            05 · Uptick Growth · Four-week managed program
          </p>
          <h2 id="growth-heading" className="chapter__title">
            Program. Fulfillment. Results.
          </h2>
          <p className="chapter__lead">
            Uptick and the merchant agree on one four-week program: the scope,
            negotiated fee, spend ceiling, planned weekly placements, approved
            fulfillment and the results Uptick can observe. Screens are
            optional.
          </p>
        </header>

        <div className="diptych">
          <figure className="station station--anchor">
            <figcaption className="station__label">
              <span className="station__n">01</span>
              <span className="station__name">Optional screen placement</span>
              <span className="station__where">One approved placement</span>
            </figcaption>
            <div className="unit">
              <div className="unit__panel" aria-hidden="true">
                <ScreenFace way="growth" />
              </div>
              <div className="unit__foot" aria-hidden="true" />
            </div>
            <p className="station__note">
              A screen can carry an approved placement when it fits the program.
              A merchant does not need to host a screen to use Growth.
            </p>
          </figure>

          <figure className="station station--drop">
            <figcaption className="station__label">
              <span className="station__n">02</span>
              <span className="station__name">Featured member benefit</span>
              <span className="station__where">Web access · SMS optional</span>
            </figcaption>
            <div className="phone phone--drop">
              <DropMessage large />
            </div>
            <p className="station__note">
              One no-purchase benefit for an admitted adult member, backed by
              approved supply. Any window or limit is shown clearly—
              {g.windows.slice(0, 3).join(" · ")}.
            </p>
          </figure>
        </div>
        <p className="example">{GROWTH_EXAMPLE.note}</p>

        <div className="loop">
          <figure className="station">
            <figcaption className="station__label">
              <span className="station__n">03</span>
              <span className="station__name">Access</span>
              <span className="station__where">
                Private member web experience
              </span>
            </figcaption>
            <div className="phone phone--claim">
              <ClaimUI compact />
            </div>
            <p className="station__note">
              Web access does not require SMS. Uptick membership texts are a
              separate, optional choice.
            </p>
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
            <p className="station__note">
              Open the pass, show staff, tap redeem, confirm. No POS
              integration, no cashier code, no new software.
            </p>
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
            <p className="station__note">
              Only what Uptick can actually observe. A play on a screen is a
              play, never a headcount.
            </p>
          </figure>
        </div>

        <div className="chapter__close">
          <p className="chapter__close-line">
            Uptick manages the approved program, placement plan, fulfillment
            checks and observed results. The merchant approves the scope,
            benefit, negotiated fee and ceiling.
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
