import { MEMBERSHIP_PILOT_HREF, PROGRAM } from "@/lib/program";

type MembershipCtaProps = {
  className?: string;
};

/**
 * The public site does not own membership signup. Use the configured
 * destination when one exists; otherwise make the next step an honest pilot
 * access inquiry through the site's existing support address.
 */
export default function MembershipCta({ className = "btn btn--mint" }: MembershipCtaProps) {
  const configured = Boolean(PROGRAM.membershipJoinUrl);
  return (
    <div className="program-cta">
      <a className={className} href={configured ? PROGRAM.membershipJoinUrl ?? MEMBERSHIP_PILOT_HREF : MEMBERSHIP_PILOT_HREF}>
        {configured ? "Join Uptick Local" : "Ask about pilot access"}
      </a>
      <p className="program-cta__note">
        {configured
          ? "Membership access opens through the current Uptick link."
          : "Self-serve membership access is not live yet; this opens an email about pilot access."}
      </p>
    </div>
  );
}
