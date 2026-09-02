import ConsentToggle from "@/components/home/ConsentToggle";
import { CLAIM, OFFER_SHORT } from "@/lib/content";

/**
 * The customer's claim page, the ten seconds after they scan. Shown inside a
 * device silhouette on wide screens and at full width on a phone — where the
 * viewport already is the phone. The number field and the send action are
 * pictures of controls, not controls: there is no backend to send to, and a
 * form that drops what you typed is worse than none.
 */
export default function ClaimUI() {
  return (
    <div className="claimui">
      <p className="claimui__brand">
        <span className="claimui__dot" aria-hidden="true" />
        uptick local
      </p>
      <p className="claimui__merchant">{CLAIM.merchant}</p>
      <p className="claimui__offer">{OFFER_SHORT}</p>
      <p className="claimui__label">Phone number</p>
      <p className="claimui__field" aria-label="Phone number field, example">
        (555) 000&#8209;0000
      </p>
      <p className="claimui__help">Used once, to text you the claim link.</p>
      <p className="claimui__cta">Send my claim</p>
      <ConsentToggle />
    </div>
  );
}
