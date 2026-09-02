import Link from "next/link";
import { FINALE } from "@/lib/content";

export default function NotFound() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="mono-tag">Off the network</p>
        <div className="page__copy">
          <h1 className="page__title">This screen isn&rsquo;t running anything.</h1>
          <p className="page__lead">The page you were after doesn&rsquo;t exist. Any of these will get you back on the block.</p>
          <div className="page__acts">
            {FINALE.doors.map((d) => (
              <Link key={d.id} href={d.href} className={`btn ${d.id === "growth" ? "btn--mint" : "btn--outline"}`}>
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
