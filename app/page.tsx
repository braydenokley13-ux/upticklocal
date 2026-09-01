import CinematicStage from "@/components/home/CinematicStage";
import ClaimChapter from "@/components/home/ClaimChapter";
import FinaleChapter from "@/components/home/FinaleChapter";
import RedeemChapter from "@/components/home/RedeemChapter";
import RelationshipChapter from "@/components/home/RelationshipChapter";
import ResponsibilityChapter from "@/components/home/ResponsibilityChapter";
import WaysChapter from "@/components/home/WaysChapter";
import WorldLayer from "@/components/home/WorldLayer";

/**
 * One continuous argument, in three worlds:
 *
 *   blue hour   — the company → the block is a network → Uptick connects it → the screen
 *   canvas      — three ways in (Host / Advertise / Growth) → Growth, in detail
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
      <WaysChapter />
      <ClaimChapter />
      <RedeemChapter />
      <RelationshipChapter />
      <ResponsibilityChapter />
      <FinaleChapter />
    </>
  );
}
