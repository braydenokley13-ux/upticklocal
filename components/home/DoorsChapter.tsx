import Link from "next/link";
import { CTA } from "@/lib/content";

/**
 * Chapter 9 — two doors into one network.
 *
 * Deliberately a hard split down the middle: a host reading the left panel
 * should never come away thinking they have to buy the right one.
 */
export default function DoorsChapter() {
  return (
    <section id="doors" className="doors" aria-labelledby="doors-heading">
      <h2 id="doors-heading" className="u-visually-hidden">
        Two ways into the Uptick network
      </h2>

      <div className="door door--host">
        <div>
          <p className="mono-tag mono-tag--ink">Door one &middot; Host stores</p>
          <h3 className="door__title">
            Host a <em>free screen.</em>
          </h3>
          <ul className="plainlist plainlist--ink">
            <li>A free 21&#8243; countertop screen, plug and play.</li>
            <li>Show your own specials and promotions.</li>
            <li>Share in advertising revenue when paid ads run.</li>
            <li className="door__emph">No paid plan required.</li>
          </ul>
        </div>
        <div>
          <Link href={CTA.host.href} className="btn btn--ink">
            {CTA.host.label}
          </Link>
          <p className="door__note">
            Especially suited to gas stations and convenience stores. Hosting never requires Growth.
          </p>
        </div>
      </div>

      <div className="door door--growth">
        <div>
          <p className="mono-tag">Door two &middot; Uptick Growth</p>
          <h3 className="door__title door__title--light">
            Promote <em>your business.</em>
          </h3>
          <ul className="plainlist">
            <li>Your offer on screens at up to five participating non-competing local stores.</li>
            <li>Customers claim, visit, and redeem on their phone.</li>
            <li>Follow-up offers by text for customers who opt in.</li>
            <li className="door__emph door__emph--mint">30-day Growth pilot.</li>
          </ul>
        </div>
        <div>
          <Link href={CTA.growth.href} className="btn btn--mint">
            {CTA.growth.label}
          </Link>
          <p className="door__note door__note--light">
            Two doors into one network. They are not one package.
          </p>
        </div>
      </div>
    </section>
  );
}
