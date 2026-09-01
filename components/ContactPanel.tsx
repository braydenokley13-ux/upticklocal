import { CONTACT_EMAIL } from "@/lib/content";

type Props = {
  id?: string;
  tag: string;
  title: string;
  lead: string;
  /** What to put in the message, so the first reply can be useful. */
  include: string[];
  subject: string;
};

/**
 * There is no application backend yet, so this does not pretend to be one.
 * A form that quietly drops what someone typed is worse than no form; an
 * address with a prefilled subject and a short list of what to include
 * actually gets the conversation started.
 */
export default function ContactPanel({ id, tag, title, lead, include, subject }: Props) {
  return (
    <section id={id} className="band band--deep contact" aria-labelledby={`${id ?? "contact"}-h`}>
      <div className="band__inner contact__grid">
        <div>
          <p className="mono-tag">{tag}</p>
          <h2 id={`${id ?? "contact"}-h`} className="band__title contact__title">
            {title}
          </h2>
          <p className="page__lead">{lead}</p>
        </div>

        <div className="contact__card">
          <p className="mono-tag mono-tag--muted">Include in your message</p>
          <ul className="plainlist contact__list">
            {include.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a
            className="btn btn--mint"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`}
          >
            Email {CONTACT_EMAIL}
          </a>
          <p className="contact__note">Ian White replies to these directly.</p>
        </div>
      </div>
    </section>
  );
}
