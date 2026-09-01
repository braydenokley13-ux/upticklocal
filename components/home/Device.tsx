import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "light" | "pass";
  caption?: ReactNode;
  className?: string;
};

/**
 * A restrained device silhouette. On wide screens it frames the interface;
 * on a phone the bezel comes off and the interface is shown at full width —
 * a picture of a phone inside a phone helps nobody.
 */
export default function Device({ children, tone = "light", caption, className }: Props) {
  return (
    <figure className={`device${className ? ` ${className}` : ""}`}>
      <div className="device__shell">
        <div className="device__screen" data-tone={tone}>
          {children}
        </div>
      </div>
      {caption ? <figcaption className="device__caption">{caption}</figcaption> : null}
    </figure>
  );
}
