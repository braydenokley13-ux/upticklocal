import GrowthChapter from "@/components/home/GrowthChapter";
import { FinaleAct, StoryAct } from "@/components/home/HomeSplit";
import ModesChapter from "@/components/home/ModesChapter";
import ProofChapter from "@/components/home/ProofChapter";
import SuiteChapter from "@/components/home/SuiteChapter";
import WorldLayer from "@/components/home/WorldLayer";

/**
 * One continuous argument, in three worlds:
 *
 *   blue hour   — the company → the block is a network → Uptick connects it → the screen
 *   canvas      — one network, three ways to use it → Growth: Anchor and Drop → Uptick Suite
 *   blue hour   — the counter it lives on, for real → back to the block, four doors
 *
 * A landscape desktop tells the opening over the live model in one pinned
 * scene; a phone tells it in one column of baked frames. The product
 * chapters between are one DOM, composed differently for each.
 */
export default function HomePage() {
  return (
    <>
      <WorldLayer />
      <StoryAct />
      <ModesChapter />
      <GrowthChapter />
      <SuiteChapter />
      <ProofChapter />
      <FinaleAct />
    </>
  );
}
