import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Screen background. */
  tone?: "paper" | "messages" | "green";
  /** Sits under the device. */
  caption?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * The device shell. Widths are set in CSS from a single `--phone-w` so every
 * mockup on the page scales together and none of them ever overflow a narrow
 * viewport.
 */
export default function Phone({ children, tone = "paper", caption, size = "md", className }: Props) {
  return (
    <figure className={`phone phone--${size}${className ? ` ${className}` : ""}`}>
      <div className="phone__shell">
        <div className="phone__screen" data-tone={tone}>
          {children}
        </div>
      </div>
      {caption ? <figcaption className="phone__caption">{caption}</figcaption> : null}
    </figure>
  );
}
