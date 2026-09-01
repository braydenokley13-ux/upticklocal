import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer className="site-footer" data-theme="dark">
      <div className="site-footer__grid">
        <div>
          <Link href="/" className="wordmark" aria-label="Uptick Local — home">
            <span className="wordmark__dot" aria-hidden="true" />
            <span>uptick local</span>
          </Link>
          <p className="site-footer__claim">Increase your local.</p>
        </div>
        <div className="site-footer__links">
          <Link href="/host">Host a free screen</Link>
          <Link href="/advertise">Advertise locally</Link>
          <Link href="/growth">Uptick Growth</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/partners">Screen network partners</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
