import type { ReactNode } from "react";
import { PROGRAM } from "@/lib/program";

type TocItem = {
  id: string;
  label: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  lead: string;
  toc: TocItem[];
  children: ReactNode;
};

export default function LegalDocument({ eyebrow, title, lead, toc, children }: LegalDocumentProps) {
  return (
    <div className="page program-page program-page--legal">
      <header className="program-document__hero" data-theme="light">
        <div className="program-shell">
          <p className="mono-tag mono-tag--ink">{eyebrow}</p>
          <h1 className="program-document__title">{title}</h1>
          <p className="program-document__lead">{lead}</p>
          <p className="program-document__effective">
            Effective <time dateTime={PROGRAM.effectiveDateISO}>{PROGRAM.effectiveDate}</time>
          </p>
          <aside className="program-review-note" aria-label="Founder and legal review note">
            <strong>Founder / legal review before launch.</strong> This public foundation intentionally does not invent a legal entity,
            notice address, governing jurisdiction, arbitration terms, or exact age threshold. Confirm those facts before treating this
            page as final legal advice.
          </aside>
        </div>
      </header>

      <div className="program-document__body" data-theme="light">
        <div className="program-shell program-document__layout">
          <nav className="program-document__toc" aria-label="On this page">
            <p className="mono-tag mono-tag--ink">On this page</p>
            <ul>
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <article className="program-document__content">{children}</article>
        </div>
      </div>
    </div>
  );
}
