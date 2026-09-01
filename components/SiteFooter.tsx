import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <Link href="/" className="wordmark" aria-label="Uptick Local — home">
            <span>uptick local</span>
          </Link>
          <p className="site-footer__claim">
            Uptick tracks signups, redemptions, and repeat offer activity.
          </p>
        </div>

        <div className="site-footer__links">
          <Link href="/growth">Promote your business</Link>
          <Link href="/host">Host a free screen</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/partners">Screen network partners</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
