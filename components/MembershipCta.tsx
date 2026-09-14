import { MEMBERSHIP_PILOT_HREF, PROGRAM } from "@/lib/program";

type MembershipCtaProps = {
  className?: string;
};

/**
 * The public site does not own membership signup. Use the configured
 * destination only after pilot enrollment is explicitly opened. Until the
 * operating identity and notice details are finalized, the honest next step
 * is an access inquiry through the existing support address.
 */
export default function MembershipCta({
  className = "btn btn--mint",
}: MembershipCtaProps) {
  const configured =
    PROGRAM.pilotEnrollmentOpen && Boolean(PROGRAM.membershipJoinUrl);
  return (
    <div className="program-cta">
      <a
        className={className}
        href={
          configured
            ? (PROGRAM.membershipJoinUrl ?? MEMBERSHIP_PILOT_HREF)
            : MEMBERSHIP_PILOT_HREF
        }
      >
        {configured ? "Join Uptick Local" : "Ask about pilot access"}
      </a>
      <p className="program-cta__note">
        {configured
          ? "Membership access opens through the current Uptick link."
          : "Pilot enrollment is not open yet; this opens an email to the current support address."}
      </p>
    </div>
  );
}
