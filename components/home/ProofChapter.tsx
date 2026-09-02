import Link from "next/link";
import { CTA, PROOF } from "@/lib/content";

const PLACES = ["Convenience stores", "Gas stations", "Cafés", "Restaurants", "Salons & barbers", "Gyms"];

/**
 * The model says how the system works. The photograph says it exists in a
 * real place. Documentary only: the caption states exactly what the picture
 * is, and there is one picture because that is how many we have.
 */
export default function ProofChapter() {
  const photo = PROOF.photos[0];
  return (
    <section id="proof" className="chapter chapter--proof" data-theme="dark" aria-labelledby="proof-heading">
      <div className="chapter__inner proof">
        <div className="proof__copy">
          <p className="mono-tag">07 · {PROOF.tag}</p>
          <h2 id="proof-heading" className="chapter__title chapter__title--light">
            {PROOF.title}
          </h2>
          <p className="chapter__lead chapter__lead--light">{PROOF.body}</p>
          <ul className="places" aria-label="Where screens go">
            {PLACES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="chapter__acts">
            <Link href={CTA.host.href} className="btn btn--ghost">
              {CTA.host.label}
            </Link>
          </div>
        </div>
        <figure className="proof__photo">
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" />
          <figcaption>{photo.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
