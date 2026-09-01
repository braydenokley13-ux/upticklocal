import Link from "next/link";
import { CTA } from "@/lib/content";

export default function NotFound() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">404 &middot; Off the network</p>
        <h1 className="page__title">
          This screen isn&rsquo;t <em>running anything.</em>
        </h1>
        <p className="page__lead">
          The page you were after doesn&rsquo;t exist. There are two doors into Uptick — take
          either one.
        </p>
        <div className="page__acts">
          <Link href={CTA.growth.href} className="btn btn--mint">
            {CTA.growth.label}
          </Link>
          <Link href={CTA.host.href} className="btn btn--outline">
            {CTA.host.label}
          </Link>
        </div>
      </header>
    </div>
  );
}
