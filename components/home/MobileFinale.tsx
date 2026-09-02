import Link from "next/link";
import Frame from "@/components/home/Frame";
import { WAYS } from "@/lib/content";

/** Back to the block at blue hour, every counter lit — and the three doors, as a list. */
export default function MobileFinale() {
  return (
    <section className="m-finale" data-theme="dark" aria-labelledby="m-finale-h">
      <Frame name="finale" className="m-finale__picture" alt="The finished block at blue hour, every counter screen lit." />
      <div className="m-finale__scrim" aria-hidden="true" />
      <div className="m-finale__copy">
        <p className="mono-tag">Your business · The businesses around it · One local network</p>
        <h2 id="m-finale-h" className="m-display m-display--light">
          Put your business on the local map.
        </h2>
        <ul className="m-doors">
          {WAYS.map((w) => (
            <li key={w.id}>
              <Link href={w.cta.href} className="m-door" data-way={w.id}>
                <span className="m-door__name">{w.name}</span>
                <span className="m-door__line">{w.short}</span>
                <span className="m-door__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
