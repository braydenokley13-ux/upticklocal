import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";
import { PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Read the Terms for the bounded Uptick Local membership pilot, its featured benefit, participating locations, redemption and optional messaging.",
};

const TOC = [
  { id: "terms-scope", label: "Scope" },
  { id: "terms-membership", label: "Membership" },
  { id: "terms-benefits", label: "Featured benefit" },
  { id: "terms-claims", label: "Claims and redemption" },
  { id: "terms-merchants", label: "Participating merchants" },
  { id: "terms-sms", label: "SMS" },
  { id: "terms-referrals", label: "Referrals" },
  { id: "terms-conduct", label: "Responsible use" },
  { id: "terms-changes", label: "Suspension and changes" },
  { id: "terms-disclaimers", label: "Disclaimers" },
  { id: "terms-contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow={`${PROGRAM.brandName} · Terms`}
      title="The simple rules around an Uptick."
      lead="These Terms describe the bounded Uptick Local membership pilot, the featured member benefit and the rules that apply when enrollment opens."
      toc={TOC}
    >
      <section id="terms-scope">
        <h2>What these Terms cover.</h2>
        <p>
          These Terms apply to the public Uptick Local website, the free Uptick
          Local pilot membership, featured benefits and related membership
          messaging. They do not replace the terms of an independent
          participating merchant or another service a member reaches through an
          Uptick.
        </p>
        <p>
          In these Terms, <strong>Uptick</strong> means an eligible local item
          or perk made available through the Uptick Local membership, and{" "}
          <strong>participating location</strong> means the merchant location
          identified with that Uptick.
        </p>
        <p>
          Pilot enrollment is not open. Uptick will publish the operating legal
          entity, notice address and finalized enrollment terms before admitting
          members.
        </p>
      </section>

      <section id="terms-membership">
        <h2>Uptick Local membership.</h2>
        <p>
          Uptick Local is a free pilot membership for admitted adults age{" "}
          {PROGRAM.minimumMemberAge} or older. The pilot targets{" "}
          {PROGRAM.pilotTargetMembers} admitted members and has a hard cap of{" "}
          {PROGRAM.pilotMemberCap}. There is no fixed membership fee. A member
          is responsible for providing accurate information needed for
          membership and fulfillment.
        </p>
        <p>
          Membership does not guarantee that a particular Uptick, location or
          market will always be available. Availability depends on participating
          markets, participating locations, capacity, timing and the
          offer-specific terms shown with the Uptick.
        </p>
      </section>

      <section id="terms-benefits">
        <h2>The featured member benefit.</h2>
        <p>
          For each published weekly release, an eligible admitted member
          receives one featured item or perk backed by approved supply. No
          purchase or payment by the member is required. A week without an
          approved published release does not create a benefit.
        </p>
        <p>
          The named participating location fulfills the benefit. Its displayed
          description, location, timing, approved capacity, expiration and
          redemption limits are part of the benefit-specific terms. Read them
          before traveling to redeem.
        </p>
      </section>

      <section id="terms-claims">
        <h2>Claims, reservations and redemption.</h2>
        <ul className="program-list">
          <li>
            An issued benefit is backed by approved supply for the applicable
            release. Opening or claiming it records member activity; it does not
            create an additional unit.
          </li>
          <li>
            An Uptick may expire, be limited to a time or day, or be limited to
            one per admitted member under the displayed terms.
          </li>
          <li>
            A member must follow the displayed redemption instructions and
            present the requested member experience or verification method.
          </li>
          <li>
            Verification may be staff-gated or may use a QR code, NFC, Uptick
            Tap or another method described with the Uptick. Not every method is
            live today; only use the method actually presented in the applicable
            flow.
          </li>
          <li>
            Do not duplicate, sell, misrepresent or attempt to redeem another
            member&rsquo;s claim. Unless an Uptick says otherwise, it has no
            cash value and is not a substitute for cash.
          </li>
        </ul>
        <p>
          Uptick may record the claim, redemption, time and verification method
          to operate the service, prevent abuse and report relevant activity. If
          a location cannot fulfill an Uptick, its own operating conditions and
          the displayed offer terms may control what happens next. Uptick may
          provide recovery fulfillment or another recorded resolution when the
          approved process allows it; a member can contact Uptick support with a
          question.
        </p>
      </section>

      <section id="terms-merchants">
        <h2>Participating merchants.</h2>
        <p>
          An approved local merchant may fulfill an Uptick according to the
          benefit&rsquo;s terms. The merchant remains responsible for its own
          staff, products, services, hours, taxes, licenses and legal
          obligations. Uptick manages the membership relationship and the
          delivery of Uptick membership messages.
        </p>
        <p>
          A merchant is not automatically an Uptick SMS sender, and joining
          Uptick does not automatically enroll a member in that merchant&rsquo;s
          independent marketing program. A merchant does not receive Uptick SMS
          consent or member history.
        </p>
      </section>

      <section id="terms-sms">
        <h2>Uptick Local Membership SMS.</h2>
        <p>
          SMS is an optional delivery channel. If a member separately chooses
          the Uptick Local Membership messaging program, the member may receive
          recurring automated SMS from {SMS_PROGRAM.sender} about membership,
          local perks and necessary service or support communications.
        </p>
        <ul className="program-list">
          <li>{SMS_PROGRAM.frequency}</li>
          <li>{SMS_PROGRAM.rates}</li>
          <li>
            <strong>Reply STOP</strong> to stop Uptick Local Membership
            messages.
          </li>
          <li>STOP does not cancel membership or an already issued benefit.</li>
          <li>
            <strong>Reply START</strong> to ask the carrier to remove its sender
            block. START does not provide consent or enroll a member.
          </li>
          <li>
            <strong>Reply HELP</strong> for help, or contact{" "}
            <a href={`mailto:${PROGRAM.supportEmail}`}>
              {PROGRAM.supportEmail}
            </a>
            .
          </li>
          <li>
            Consent to receive SMS is not a condition of purchase, and it is not
            permission for a participating merchant to market to the member.
          </li>
          <li>Carriers are not liable for delayed or undelivered messages.</li>
        </ul>
        <p>
          A member is responsible for providing a mobile number they are
          authorized to use and for telling Uptick if the number changes. See
          the <Link href={PROGRAM.urls.sms}>SMS program page</Link> and{" "}
          <Link href={PROGRAM.urls.privacy}>Privacy Policy</Link> for more
          detail.
        </p>
      </section>

      <section id="terms-referrals">
        <h2>Referrals.</h2>
        <p>
          If Uptick makes a referral feature or referral benefit available, it
          may include additional rules shown at the time. Use a referral feature
          only for genuine personal invitations. Do not create duplicate
          accounts, impersonate someone, send unsolicited bulk messages, mislead
          a recipient or attempt to obtain a benefit through abuse or fraud.
        </p>
      </section>

      <section id="terms-conduct">
        <h2>Responsible use.</h2>
        <p>
          Members may not interfere with the service, probe or bypass security,
          manipulate claims or redemption records, use another person&rsquo;s
          information without permission, submit false information, or use an
          Uptick in a way that violates law or the offer&rsquo;s terms. Contact
          Uptick if a member believes a claim or redemption record is wrong.
        </p>
      </section>

      <section id="terms-changes">
        <h2>Suspension, termination and service changes.</h2>
        <p>
          Uptick may suspend or end access to membership or a particular Uptick
          when reasonably necessary to address abuse, fraud, security, legal
          requirements, a merchant withdrawal, capacity or a change in the
          service. Uptick may also change, pause or discontinue parts of the
          product. We will not describe an offer as available when we know it is
          not.
        </p>
        <p>
          Pausing SMS does not cancel membership or an already issued benefit.
          No service change gives a participating merchant permission to use
          Uptick membership SMS consent or member history. SMS controls remain
          described on the <Link href={PROGRAM.urls.sms}>SMS program page</Link>
          .
        </p>
      </section>

      <section id="terms-disclaimers">
        <h2>Availability and disclaimers.</h2>
        <p>
          Uptick Local and each Uptick are provided as presented and subject to
          participating-market, participating-location, capacity, timing,
          verification and offer-specific conditions. Uptick does not guarantee
          that every location or perk will always be available, that a message
          will arrive at a particular time, or that a merchant will remain
          participating.
        </p>
        <p>
          To the extent permitted by applicable law, Uptick disclaims warranties
          that are not expressly stated in these Terms. Nothing here limits a
          right or remedy that applicable law does not allow us to limit.
        </p>
      </section>

      <section id="terms-contact">
        <h2>Contact.</h2>
        <p>
          Questions about membership, an Uptick or these Terms can be sent to
          <a href={`mailto:${PROGRAM.supportEmail}`}> {PROGRAM.supportEmail}</a>
          . The public policy links are the
          <Link href={PROGRAM.urls.privacy}> Privacy Policy</Link> and{" "}
          <Link href={PROGRAM.urls.sms}> SMS program page</Link>.
        </p>
        <p className="program-document__smallprint">
          Pilot enrollment remains unavailable until Uptick publishes its
          operating legal identity, notice address and finalized enrollment
          terms.
        </p>
      </section>
    </LegalDocument>
  );
}
