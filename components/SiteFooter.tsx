import Link from "next/link";
import { CONTACT_EMAIL, NAV, SIGN_OFF, SUITE } from "@/lib/content";
import { PROGRAM } from "@/lib/program";

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
            <p className="site-footer__claim">A local membership and growth system: Uptick Local for members, Uptick Growth for merchants, and local distribution that connects the two.</p>
          </div>
          <nav className="site-footer__links" aria-label="Footer">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/partners">Screen network partners</Link>
            <Link href={PROGRAM.urls.membership}>Membership</Link>
            <Link href={PROGRAM.urls.sms}>SMS</Link>
            <Link href={PROGRAM.urls.privacy}>Privacy</Link>
            <Link href={PROGRAM.urls.terms}>Terms</Link>
          </nav>
          <div className="site-footer__contact">
            <p className="mono-tag mono-tag--muted">Talk to us</p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        <p className="site-footer__legal">
          © {new Date().getFullYear()} Uptick Local. {SUITE.partner.line}
        </p>
      </div>
    </footer>
  );
}
