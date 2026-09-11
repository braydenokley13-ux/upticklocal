import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument from "@/components/LegalDocument";
import { PROGRAM, SMS_PROGRAM } from "@/lib/program";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Uptick Local handles member information, local perk activity, SMS consent and support communications.",
};

const TOC = [
  { id: "privacy-scope", label: "Scope" },
  { id: "privacy-collect", label: "Information we receive" },
  { id: "privacy-use", label: "How we use it" },
  { id: "privacy-share", label: "How we share it" },
  { id: "privacy-sms", label: "Mobile and SMS data" },
  { id: "privacy-retain", label: "Retention and security" },
  { id: "privacy-choices", label: "Your choices" },
  { id: "privacy-rights", label: "State privacy rights" },
  { id: "privacy-age", label: "Age and children" },
  { id: "privacy-changes", label: "Changes" },
  { id: "privacy-contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow={`${PROGRAM.brandName} · Privacy`}
      title="A clear account of the information Uptick needs."
      lead="This Privacy Policy foundation describes the information Uptick Local may handle to operate membership, deliver requested communications and measure local perk activity. It is written for founder and legal review before publication."
      toc={TOC}
    >
      <section id="privacy-scope">
        <h2>What this policy covers.</h2>
        <p>
          This policy describes the public Uptick Local website, the free Uptick Local consumer membership, Uptick Drops and related
          messaging and support. It does not control the privacy practices of an independent participating merchant, another website a
          member visits, or a third-party service that has its own policy.
        </p>
        <p>
          Uptick Local is the public brand used on this site. The legal entity that will issue the final policy, its notice address and
          the jurisdiction-specific terms are not inserted here until they are confirmed.
        </p>
      </section>

      <section id="privacy-collect">
        <h2>Information we may receive.</h2>
        <h3>Information a member may provide</h3>
        <ul className="program-list">
          <li>A mobile phone number used to identify a membership or deliver messages a member has chosen to receive.</li>
          <li>A home ZIP code and, if a member chooses to provide it, a work ZIP code to help determine eligible local perks.</li>
          <li>Membership choices, preferences and other information a member submits through an Uptick flow.</li>
          <li>Support communications, including the information included when a member emails or otherwise contacts Uptick.</li>
        </ul>
        <h3>Information created through use</h3>
        <ul className="program-list">
          <li>Membership status, acquisition or source attribution, and the Uptick Drops made available to a member.</li>
          <li>Choices, claims, redemption records and the method used to verify a redemption.</li>
          <li>Referral activity and messaging status, including consent and opt-out history.</li>
          <li>Limited technical and security information needed to protect the service, such as device, browser, log and abuse-prevention signals.</li>
          <li>
            Directions or navigation actions, only if Uptick actually records that action in a product flow. The current public site
            does not collect continuous location information.
          </li>
        </ul>
        <p>
          If Uptick later introduces optional richer location or route functionality, the feature and its data use will be explained
          before use and will require an appropriate choice or permission where applicable.
        </p>
      </section>

      <section id="privacy-use">
        <h2>How we use information.</h2>
        <p>We may use the information above to:</p>
        <ul className="program-list">
          <li>Operate and maintain Uptick Local membership.</li>
          <li>Deliver requested recurring, service, transactional and support communications.</li>
          <li>Determine which local perks may be eligible for a member based on the information the member provides and the participating network.</li>
          <li>Prevent abuse, fraud, duplicate claims and other activity that could undermine a benefit or the service.</li>
          <li>Verify redemptions and maintain records of relevant Uptick activity.</li>
          <li>Respond to support requests and communicate about the service.</li>
          <li>Improve Uptick, understand how the membership and local network are used, and produce merchant or network analytics.</li>
          <li>Meet legal, security and other obligations that apply to the service.</li>
        </ul>
      </section>

      <section id="privacy-share">
        <h2>How we share information.</h2>
        <p>
          We may share information with service providers that help us host, secure, support, analyze or message the product. They
          receive what is reasonably needed for the task and are expected to process it on Uptick&rsquo;s instructions.
        </p>
        <p>
          A participating merchant may receive limited information only as needed to operate, fulfill or measure relevant Uptick
          activity—for example, information needed to verify that a specific benefit was presented or redeemed. A merchant does not
          automatically receive a member&rsquo;s phone number or SMS consent just because it fulfills an Uptick.
        </p>
        <p>
          Merchant, enterprise and brand analytics should be aggregated or de-identified unless a different use is specifically
          disclosed and permitted. We may also disclose information when reasonably necessary to comply with law, respond to a valid
          legal process, protect people or property, investigate abuse, or support a business transfer, subject to applicable law.
        </p>
        <p>
          We do not sell or rent raw member phone-number lists. Uptick Local membership consent is not a transferable marketing list
          for participating merchants or other senders.
        </p>
      </section>

      <section id="privacy-sms">
        <h2>Mobile information and SMS consent.</h2>
        <div className="program-callout">
          <strong>{SMS_PROGRAM.mobileInfoNonSharing}</strong> We do not sell or rent raw member phone-number lists. SMS opt-in data and
          consent are not transferred to participating merchants or other senders for their own marketing. Service providers may
          process this information only as needed to operate Uptick Local and deliver the messages a member chose.
        </div>
        <p>
          Uptick Local messages are described on the <Link href={PROGRAM.urls.sms}>SMS program page</Link>. A member&rsquo;s choice to
          receive Uptick messages is separate from any independent marketing program a participating merchant may operate. If
          merchant-specific marketing is offered later, it requires its own appropriate permission.
        </p>
      </section>

      <section id="privacy-retain">
        <h2>Retention and security.</h2>
        <p>
          We keep information for as long as reasonably necessary to provide membership, deliver communications, verify activity,
          prevent abuse, resolve disputes, meet legal or accounting obligations, and enforce applicable terms. When information is no
          longer needed for those purposes, we aim to delete it, anonymize it or securely isolate it. We may retain a limited
          suppression or opt-out record so we can honor a request not to receive messages.
        </p>
        <p>
          We use reasonable administrative, technical and organizational safeguards appropriate to the information and the service.
          No transmission or storage system can be guaranteed completely secure, so members should use care when sending information
          and contact us if they suspect misuse.
        </p>
      </section>

      <section id="privacy-choices">
        <h2>Your choices.</h2>
        <ul className="program-list">
          <li>
            <strong>SMS:</strong> reply STOP to stop Uptick Local Membership texts or HELP for help. See the <Link href={PROGRAM.urls.sms}>SMS program page</Link>.
          </li>
          <li>
            <strong>Information:</strong> contact us to ask to update inaccurate membership information or ask a question about how it is used.
          </li>
          <li>
            <strong>Optional features:</strong> if a future route or location feature is introduced, a member can choose whether to use it and whether to grant any requested permission.
          </li>
          <li>
            <strong>Legal requests:</strong> depending on where a member lives, applicable law may provide additional access, correction, deletion, portability or objection choices.
          </li>
        </ul>
      </section>

      <section id="privacy-rights">
        <h2>State privacy rights.</h2>
        <p>
          Some state privacy laws provide rights that may include access to personal information, correction, deletion, portability,
          appeal or limits on certain uses. Whether a right applies depends on the member, the service, the state and legal exceptions.
          This foundation does not attempt to claim that every state law applies to Uptick or to list a right that may not be available.
        </p>
        <p>
          To make a request, contact <a href={`mailto:${PROGRAM.supportEmail}`}>{PROGRAM.supportEmail}</a>. We may need to verify the
          request, ask for details needed to find the relevant information, and apply lawful exceptions. The final request process,
          response timelines, appeal path and any authorized-agent procedure require founder and legal confirmation.
        </p>
      </section>

      <section id="privacy-age">
        <h2>Age and children.</h2>
        <p>
          Uptick is not being built as a child-directed service, and we do not knowingly target children with membership or SMS
          enrollment. The precise minimum age, any parental-consent process and the response to information submitted by a child must
          be confirmed by founder and legal review before launch. If you believe a child has provided information to Uptick, contact us.
        </p>
      </section>

      <section id="privacy-changes">
        <h2>Policy changes.</h2>
        <p>
          We may update this policy as the membership, messaging program or applicable requirements change. We will post the updated
          version here and change the effective date. If a change is material, we will provide any additional notice required by law.
        </p>
      </section>

      <section id="privacy-contact">
        <h2>Contact Uptick.</h2>
        <p>
          Questions about this policy or information connected to Uptick Local can be sent to
          <a href={`mailto:${PROGRAM.supportEmail}`}> {PROGRAM.supportEmail}</a>.
        </p>
        <p className="program-document__smallprint">
          Founder/legal review item: add the confirmed legal entity name, notice address and any required state-specific disclosures
          before final publication.
        </p>
      </section>
    </LegalDocument>
  );
}
