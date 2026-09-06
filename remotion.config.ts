import { Config } from "@remotion/cli/config";

/**
 * Remotion configuration for the film R&D lab. The entry point is the film
 * project under `film/`; `public/` is shared with the Next app so plates,
 * fonts and renders resolve the same way in the lab and in a render.
 */
Config.setEntryPoint("./film/index.ts");
Config.setPublicDir("./public");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
// A local Chromium (Playwright's in this environment) avoids a download.
if (process.env.FILM_CHROME) Config.setBrowserExecutable(process.env.FILM_CHROME);
