import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";
import { PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Read the Terms for Uptick Local membership, Uptick Drops, participating merchants, claims, redemption and messaging.",
};

const TOC = [
  { id: "terms-scope", label: "Scope" },
  { id: "terms-membership", label: "Membership" },
  { id: "terms-benefits", label: "Uptick Drops" },
  { id: "terms-claims", label: "Claims and redemption" },
  { id: "terms-merchants", label: "Participating merchants" },
  { id: "terms-sms", label: "SMS" },
  { id: "terms-referrals", label: "Referrals" },
  { id: "terms-conduct", label: "Responsible use" },
  { id: "terms-changes", label: "Suspension and changes" },
  { id: "terms-disclaimers", label: "Disclaimers" },
  { id: "terms-contact", label: "Contact and review" },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow={`${PROGRAM.brandName} · Terms`}
      title="The simple rules around an Uptick."
      lead="These Terms describe the current Uptick Local consumer membership and its local perks in readable language. They are a public foundation for founder and legal review before publication."
      toc={TOC}
    >
      <section id="terms-scope">
        <h2>What these Terms cover.</h2>
        <p>
          These Terms apply to the public Uptick Local website, the free Uptick Local consumer membership, Uptick Drops and related
          membership messaging. They do not replace the terms of an independent participating merchant or another service a member
          reaches through an Uptick.
        </p>
        <p>
          In these Terms, <strong>Uptick</strong> means an eligible local item or perk made available through the Uptick Local
          membership, and <strong>participating location</strong> means the merchant location identified with that Uptick.
        </p>
      </section>

      <section id="terms-membership">
        <h2>Uptick Local membership.</h2>
        <p>
          Uptick Local is a free local consumer membership. No paid membership is currently required. A member is responsible for
          providing accurate information, including a current mobile number when using messaging, and for keeping that information
          current enough for the service to work.
        </p>
        <p>
          Membership does not guarantee that a particular Uptick, location or market will always be available. Availability depends on
          participating markets, participating locations, capacity, timing and the offer-specific terms shown with the Uptick.
        </p>
      </section>

      <section id="terms-benefits">
        <h2>Uptick Drops and local perks.</h2>
        <p>
          The hero benefit is a genuinely free item or perk. Uptick may make a featured Uptick available to members and may add other
          eligible local options as the product evolves. Uptick does not publish a permanent deal feed or promise that every member
          sees the same option.
        </p>
        <p>
          The participating location fulfills the specific benefit. The benefit&rsquo;s displayed description, location, timing, capacity,
          expiration, qualifying conditions and limits are part of that Uptick&rsquo;s offer-specific terms. Read them before claiming or
          traveling to redeem.
        </p>
      </section>

      <section id="terms-claims">
        <h2>Claims, reservations and redemption.</h2>
        <ul className="program-list">
          <li>A claim records a member&rsquo;s choice of an Uptick; it is not a reservation unless the Uptick expressly says that it is.</li>
          <li>An Uptick may expire, close when capacity is reached, be limited to a time or day, or be limited to one per member or another stated quantity.</li>
          <li>A member must follow the displayed redemption instructions and present the requested member experience or verification method.</li>
          <li>Verification may be staff-gated or may use a QR code, NFC, Uptick Tap or another method described with the Uptick. Not every method is live today; only use the method actually presented in the applicable flow.</li>
          <li>Do not duplicate, sell, misrepresent or attempt to redeem another member&rsquo;s claim. Unless an Uptick says otherwise, it has no cash value and is not a substitute for cash.</li>
        </ul>
        <p>
          Uptick may record the claim, redemption, time and verification method to operate the service, prevent abuse and report relevant
          activity. If a location cannot fulfill an Uptick, its own operating conditions and the displayed offer terms may control what
          happens next; a member can contact Uptick support with a question.
        </p>
      </section>

      <section id="terms-merchants">
        <h2>Participating merchants.</h2>
        <p>
          A participating gas station, convenience store or other eligible local merchant may fulfill an Uptick according to the
          offer&rsquo;s terms. The merchant remains responsible for its own staff, products, services, hours, taxes, licenses and legal
          obligations. Uptick manages the membership relationship and the delivery of Uptick membership messages.
        </p>
        <p>
          A merchant is not automatically an Uptick SMS sender, and joining Uptick does not automatically enroll a member in that
          merchant&rsquo;s independent marketing program. Merchant-specific marketing requires its own appropriate permission.
        </p>
      </section>

      <section id="terms-sms">
        <h2>Uptick Local Membership SMS.</h2>
        <p>
          SMS is an important delivery channel. If a member separately chooses the Uptick Local Membership messaging program, the
          member may receive recurring automated SMS from {SMS_PROGRAM.sender} about membership, local perks and necessary service or
          support communications.
        </p>
        <ul className="program-list">
          <li>{SMS_PROGRAM.frequency} Message frequency varies.</li>
          <li>{SMS_PROGRAM.rates}</li>
          <li><strong>Reply STOP</strong> to stop Uptick Local Membership messages.</li>
          <li><strong>Reply HELP</strong> for help, or contact <a href={`mailto:${PROGRAM.supportEmail}`}>{PROGRAM.supportEmail}</a>.</li>
          <li>Consent to receive SMS is not a condition of purchase, and it is not permission for a participating merchant to market to the member.</li>
          <li>Carriers are not liable for delayed or undelivered messages.</li>
        </ul>
        <p>
          A member is responsible for providing a mobile number they are authorized to use and for telling Uptick if the number
          changes. See the <Link href={PROGRAM.urls.sms}>SMS program page</Link> and <Link href={PROGRAM.urls.privacy}>Privacy Policy</Link> for more detail.
        </p>
      </section>

      <section id="terms-referrals">
        <h2>Referrals.</h2>
        <p>
          If Uptick makes a referral feature or referral benefit available, it may include additional rules shown at the time. Use a
          referral feature only for genuine personal invitations. Do not create duplicate accounts, impersonate someone, send
          unsolicited bulk messages, mislead a recipient or attempt to obtain a benefit through abuse or fraud.
        </p>
      </section>

      <section id="terms-conduct">
        <h2>Responsible use.</h2>
        <p>
          Members may not interfere with the service, probe or bypass security, manipulate claims or redemption records, use another
          person&rsquo;s information without permission, submit false information, or use an Uptick in a way that violates law or the
          offer&rsquo;s terms. Contact Uptick if a member believes a claim or redemption record is wrong.
        </p>
      </section>

      <section id="terms-changes">
        <h2>Suspension, termination and service changes.</h2>
        <p>
          Uptick may suspend or end access to membership or a particular Uptick when reasonably necessary to address abuse, fraud,
          security, legal requirements, a merchant withdrawal, capacity or a change in the service. Uptick may also change, pause or
          discontinue parts of the product. We will not describe an offer as available when we know it is not.
        </p>
        <p>
          These changes do not give a participating merchant permission to use Uptick membership SMS consent for its own marketing.
          SMS controls remain described on the <Link href={PROGRAM.urls.sms}>SMS program page</Link>.
        </p>
      </section>

      <section id="terms-disclaimers">
        <h2>Availability and disclaimers.</h2>
        <p>
          Uptick Local and each Uptick are provided as presented and subject to participating-market, participating-location,
          capacity, timing, verification and offer-specific conditions. Uptick does not guarantee that every location or perk will
          always be available, that a message will arrive at a particular time, or that a merchant will remain participating.
        </p>
        <p>
          To the extent permitted by applicable law, Uptick disclaims warranties that are not expressly stated in these Terms. Nothing
          here limits a right or remedy that applicable law does not allow us to limit. The final legal entity, jurisdiction,
          liability allocation and any required dispute-resolution provisions must be confirmed by founder and legal review.
        </p>
      </section>

      <section id="terms-contact">
        <h2>Contact and final review items.</h2>
        <p>
          Questions about membership, an Uptick or these Terms can be sent to
          <a href={`mailto:${PROGRAM.supportEmail}`}> {PROGRAM.supportEmail}</a>. The public policy links are the
          <Link href={PROGRAM.urls.privacy}> Privacy Policy</Link> and <Link href={PROGRAM.urls.sms}> SMS program page</Link>.
        </p>
        <p className="program-document__smallprint">
          Founder/legal review items before publication: confirm the legal entity and notice address, governing law, venue or dispute
          resolution terms, age rule, liability language and any required state-specific provisions. None is fabricated in this draft.
        </p>
      </section>
    </LegalDocument>
  );
}
