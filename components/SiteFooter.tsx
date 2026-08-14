import Link from "next/link";
import { NETWORK_LIST } from "@/lib/networks";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <Link href="/" className="wordmark" aria-label="Uptick Local — home">
            <span className="wordmark__bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="wordmark__name">Uptick Local</span>
          </Link>
          <p className="site-footer__blurb">
            Free screens for local businesses. Local audiences for advertisers.
          </p>
        </div>

        <div className="footcol">
          <span className="footcol__head">SITE</span>
          <Link href="/locations">For Locations</Link>
          <Link href="/advertisers">For Advertisers</Link>
          <Link href="/networks">Our Networks</Link>
          <Link href="/#how-it-works">How It Works</Link>
        </div>

        <div className="footcol">
          <span className="footcol__head">NETWORKS</span>
          {NETWORK_LIST.map((net) => (
            <Link
              key={net.slug}
              href={`/networks/${net.slug}`}
              data-net="true"
              style={{ ["--net" as string]: net.color }}
            >
              {net.name}
            </Link>
          ))}
        </div>

        <div className="footcol">
          <span className="footcol__head">COMPANY</span>
          <Link href="/partners">Screen Network Partners</Link>
          <a href="mailto:iwhite@upticklocal.com">iwhite@upticklocal.com</a>
        </div>
      </div>

      <div className="site-footer__base">
        <span>&copy; 2026 UPTICK LOCAL</span>
        <span>SCREENS IN THE REAL WORLD</span>
      </div>
    </footer>
  );
}
