import { EXAMPLE_PASS } from "@/lib/audience";

/**
 * The thing a member actually receives, drawn rather than photographed.
 *
 * It is labelled as an example on the face, because it is one: no store has
 * agreed to this perk and no week has been published. Showing a plausible
 * pass with no label would read as a live offer, which it is not.
 */
export default function PassCard() {
  return (
    <figure className="weekpass" aria-labelledby="weekpass-caption">
      <div className="weekpass__card">
        <div className="weekpass__top">
          <p className="weekpass__week">{EXAMPLE_PASS.week}</p>
          <p className="weekpass__flag">Example</p>
        </div>

        <div className="weekpass__art" aria-hidden="true">
          {/* A cup, a counter, a morning. Line art keeps this honest: it is
              plainly a drawing, not a photograph of a business. */}
          <svg viewBox="0 0 120 92" role="presentation">
            <path
              className="weekpass__steam"
              d="M52 26c0-6 6-6 6-12s-6-6-6-12"
            />
            <path className="weekpass__steam" d="M66 26c0-5 5-5 5-10s-5-5-5-9" />
            <path
              className="weekpass__cup"
              d="M36 38h48v22a16 16 0 0 1-16 16H52a16 16 0 0 1-16-16V38Z"
            />
            <path className="weekpass__cup" d="M84 44h8a9 9 0 0 1 0 18h-8" />
            <line className="weekpass__counter" x1="18" y1="82" x2="102" y2="82" />
          </svg>
        </div>

        <div className="weekpass__body">
          <p className="weekpass__perk">{EXAMPLE_PASS.perk}</p>
          <p className="weekpass__where">{EXAMPLE_PASS.where}</p>
        </div>

        <dl className="weekpass__meta">
          <div>
            <dt>Window</dt>
            <dd>{EXAMPLE_PASS.window}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{EXAMPLE_PASS.cost}</dd>
          </div>
        </dl>
      </div>

      <figcaption id="weekpass-caption" className="weekpass__caption">
        {EXAMPLE_PASS.note}
      </figcaption>
    </figure>
  );
}
