import type { ReactNode } from "react";

type Props = {
  from: string;
  time: string;
  children: ReactNode;
  fine?: string;
  label: string;
  className?: string;
};

/**
 * A text message, in Uptick's own voice rather than an imitation of any
 * phone's messaging app: sender, time, the message, the link.
 */
export default function Sms({ from, time, children, fine, label, className }: Props) {
  return (
    <div className={`sms${className ? ` ${className}` : ""}`} aria-label={label}>
      <p className="sms__from">
        {from} <span>{time}</span>
      </p>
      <p className="sms__body">{children}</p>
      {fine ? <p className="sms__fine">{fine}</p> : null}
    </div>
  );
}
