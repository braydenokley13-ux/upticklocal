import CinematicStage from "@/components/home/CinematicStage";
import ClaimChapter from "@/components/home/ClaimChapter";
import DoorsChapter from "@/components/home/DoorsChapter";
import FinaleChapter from "@/components/home/FinaleChapter";
import RedeemChapter from "@/components/home/RedeemChapter";
import RelationshipChapter from "@/components/home/RelationshipChapter";
import ResponsibilityChapter from "@/components/home/ResponsibilityChapter";
import WorldLayer from "@/components/home/WorldLayer";

/**
 * One continuous argument, in three worlds:
 *
 *   blue hour   — your business → the block → the offer → the screen
 *   canvas      — the claim → the visit → the follow-up → who does what → two doors
 *   blue hour   — back to the block
 *
 * The model lives in one fixed layer behind the page; the canvas chapters
 * paint over it, and the finale lets it back through.
 */
export default function HomePage() {
  return (
    <>
      <WorldLayer />
      <CinematicStage />
      <ClaimChapter />
      <RedeemChapter />
      <RelationshipChapter />
      <ResponsibilityChapter />
      <DoorsChapter />
      <FinaleChapter />
    </>
  );
}
