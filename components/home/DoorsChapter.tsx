import Link from "next/link";
import { CTA } from "@/lib/content";

/**
 * Chapter 9 — two ways in. Growth carries the weight; hosting is the quieter
 * door beside it. They are different ways to take part, not tiers of one plan.
 */
export default function DoorsChapter() {
  return (
    <section id="doors" className="doors" aria-labelledby="doors-heading">
      <h2 id="doors-heading" className="u-visually-hidden">
        Two ways into the Uptick network
      </h2>

      <div className="door door--growth" data-theme="dark">
        <div>
          <p className="mono-tag">Uptick Growth</p>
          <h3 className="door__title">Promote your business.</h3>
          <ul className="door__list">
            <li>Your offer on screens at up to five participating non-competing local stores.</li>
            <li>Customers claim by text, visit, and redeem on their phone.</li>
            <li>Follow-up offers for customers who opt in.</li>
          </ul>
        </div>
        <div className="door__act">
          <Link href={CTA.growth.href} className="btn btn--primary">
            {CTA.growth.label}
          </Link>
          <p className="door__note">Nothing to install. Growth never requires hosting a screen.</p>
        </div>
      </div>

      <div className="door door--host" data-theme="light">
        <div>
          <p className="mono-tag mono-tag--ink">Host a screen</p>
          <h3 className="door__title">Host a free screen.</h3>
          <ul className="door__list">
            <li>A free 21″ countertop screen, plug and play.</li>
            <li>Show your own specials on it.</li>
            <li>Share in advertising revenue when paid offers run.</li>
          </ul>
        </div>
        <div className="door__act">
          <Link href={CTA.host.href} className="btn btn--ink">
            {CTA.host.label}
          </Link>
          <p className="door__note">No paid plan. Hosting never requires Growth.</p>
        </div>
      </div>
    </section>
  );
}
