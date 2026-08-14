import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-dark" style={{ padding: "clamp(80px, 18vh, 200px) var(--gutter)" }}>
      <div className="field-lines" aria-hidden="true" />
      <div className="partners__copy u-rise">
        <div className="kicker">404 &mdash; OFF THE NETWORK</div>
        <h1 className="partners__title">This screen isn&#8217;t running anything.</h1>
        <p className="partners__lead">
          The page you were after doesn&#8217;t exist. Pick a door instead.
        </p>
        <div className="netdetail__acts">
          <Link href="/locations" className="btn btn--amber">
            Get a Free Screen<span aria-hidden="true">&#8594;</span>
          </Link>
          <Link href="/advertisers" className="btn btn--ghost">
            Reach Local Customers
          </Link>
        </div>
      </div>
    </section>
  );
}
