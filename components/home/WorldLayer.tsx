"use client";

import dynamic from "next/dynamic";
import { OFFER_TEXT } from "@/lib/content";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Three and the block cost real bytes, so they load as their own chunk and
 * only on screens wide enough to earn them. Narrow viewports never download
 * any of it — they get the drawn elevation, which is the intended art
 * direction there rather than a consolation prize.
 */
const NeighborhoodCanvas = dynamic(() => import("@/components/home/NeighborhoodCanvas"), {
  ssr: false,
});

export default function WorldLayer() {
  const wideEnough = useMediaQuery("(min-width: 861px)");
  if (!wideEnough) return null;
  return <NeighborhoodCanvas offerText={OFFER_TEXT} />;
}
