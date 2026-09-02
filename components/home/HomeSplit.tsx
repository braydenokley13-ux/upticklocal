"use client";

import CinematicStage from "@/components/home/CinematicStage";
import FinaleChapter from "@/components/home/FinaleChapter";
import MobileFinale from "@/components/home/MobileFinale";
import MobileStory from "@/components/home/MobileStory";
import { LIVE_QUERY } from "@/components/home/WorldLayer";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The opening and the close are two different tellings of one scene, and
 * CSS decides which one is on screen (see `.home--desktop` / `.home--phone`):
 * a landscape desktop gets the pinned cinematic over the live model,
 * everything else gets the phone's baked frames. Both are in the HTML so
 * the first paint is right without JavaScript; these components only make
 * sure the hidden telling does no scroll work.
 */
export function StoryAct() {
  const live = useMediaQuery(LIVE_QUERY);
  return (
    <>
      <div className="home--desktop">
        <CinematicStage enabled={live} />
      </div>
      <div className="home--phone">
        <MobileStory enabled={!live} />
      </div>
    </>
  );
}

export function FinaleAct() {
  const live = useMediaQuery(LIVE_QUERY);
  return (
    <>
      <div className="home--desktop">
        <FinaleChapter enabled={live} />
      </div>
      <div className="home--phone">
        <MobileFinale />
      </div>
    </>
  );
}
