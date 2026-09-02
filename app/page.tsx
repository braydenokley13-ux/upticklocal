import ClaimChapter from "@/components/home/ClaimChapter";
import { FinaleAct, StoryAct } from "@/components/home/HomeSplit";
import MobileGrowth from "@/components/home/MobileGrowth";
import MobileWays from "@/components/home/MobileWays";
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
 * A landscape desktop tells it over the live model in one pinned scene, with
 * the product chapters laid out wide. A phone tells it in one column of
 * baked frames, with the screen and the claim shown at the width of the
 * phone itself. Same copy, same product, two compositions.
 */
export default function HomePage() {
  return (
    <>
      <WorldLayer />
      <StoryAct>
        <div className="home--desktop">
          <WaysChapter />
          <ClaimChapter />
          <RedeemChapter />
          <RelationshipChapter />
        </div>
        <div className="home--phone">
          <MobileWays />
          <MobileGrowth />
        </div>
      </StoryAct>
      <ResponsibilityChapter />
      <FinaleAct />
    </>
  );
}
