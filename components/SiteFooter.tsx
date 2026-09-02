import Link from "next/link";
import { CONTACT_EMAIL, NAV, SIGN_OFF } from "@/lib/content";

/**
 * The sign-off is the company's own line, set large, then the map of the
 * site and the one address that answers. Nothing to sell here that the
 * page above has not already sold.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer" data-theme="dark">
      <div className="site-footer__inner">
        <p className="site-footer__signoff" aria-label={`${SIGN_OFF.lead} ${SIGN_OFF.accent}`}>
          {SIGN_OFF.lead} <em className="accent">{SIGN_OFF.accent}</em>
        </p>
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link href="/" className="wordmark" aria-label="Uptick Local — home">
              <span className="wordmark__dot" aria-hidden="true" />
              <span>uptick local</span>
            </Link>
            <p className="site-footer__claim">A local business growth system. Screens, offers and content for the businesses on your block.</p>
          </div>
          <nav className="site-footer__links" aria-label="Footer">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/partners">Screen network partners</Link>
          </nav>
          <div className="site-footer__contact">
            <p className="mono-tag mono-tag--muted">Talk to us</p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <p className="site-footer__note">Ian White replies directly.</p>
          </div>
        </div>
        <p className="site-footer__legal">© {new Date().getFullYear()} Uptick Local. Uptick Suite content is produced with JBCI.</p>
      </div>
    </footer>
  );
}
