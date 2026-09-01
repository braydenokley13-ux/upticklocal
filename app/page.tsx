import CinematicStage from "@/components/home/CinematicStage";
import ClaimChapter from "@/components/home/ClaimChapter";
import DoorsChapter from "@/components/home/DoorsChapter";
import FinaleChapter from "@/components/home/FinaleChapter";
import RedeemChapter from "@/components/home/RedeemChapter";
import RelationshipChapter from "@/components/home/RelationshipChapter";
import ResponsibilityChapter from "@/components/home/ResponsibilityChapter";
import WorldLayer from "@/components/home/WorldLayer";

/**
 * The homepage is one continuous argument told in ten chapters:
 *
 *   the block → your business → the network → the offer → the screen →
 *   the claim → visit + redeem → the follow-up → the split of work →
 *   two doors → back to the block.
 *
 * Chapters 1–4 and 10 are camera work over the architectural model; 5–9 are
 * held DOM. The model lives in one fixed layer behind everything, so the two
 * halves read as one page rather than a landing page pasted over an animation.
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
