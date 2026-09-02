import Link from "next/link";
import { FINALE } from "@/lib/content";

/** The four next actions, as one row of doors on a desktop and one list on a phone. */
export default function Doors() {
  return (
    <ul className="doors">
      {FINALE.doors.map((d) => (
        <li key={d.id}>
          <Link href={d.href} className="door" data-way={d.id}>
            <span className="door__name">{d.name}</span>
            <span className="door__line">{d.line}</span>
            <span className="door__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
