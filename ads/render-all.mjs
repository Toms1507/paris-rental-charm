// Rend toutes les publicités dans out/.
//   node render-all.mjs            → toutes les vidéos (MP4)
//   node render-all.mjs Regle90    → seulement les compositions dont l'id contient « Regle90 »
//   node render-all.mjs --stills   → images de contrôle (une par scène) dans out/stills
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, getCompositions } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const stills = args.includes("--stills");
const filter = args.find((a) => !a.startsWith("--"));

// Chromium préinstallé (environnement cloud) si présent, sinon Remotion télécharge le sien.
const LOCAL_CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (existsSync(LOCAL_CHROME) ? LOCAL_CHROME : null);

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter(
  (c) => !filter || c.id.includes(filter),
);

mkdirSync("out/stills", { recursive: true });
for (const c of comps) {
  const composition = await selectComposition({ serveUrl, id: c.id, browserExecutable });
  if (stills) {
    const step = 30;
    for (let f = 20; f < c.durationInFrames; f += step) {
      await renderStill({
        serveUrl,
        composition,
        frame: f,
        output: `out/stills/${c.id}-${String(f).padStart(4, "0")}.png`,
        browserExecutable,
        scale: 0.5,
      });
    }
    console.log(`✓ ${c.id} (images)`);
    continue;
  }
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 18,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 92,
    outputLocation: `out/${c.id}.mp4`,
    browserExecutable,
    onProgress: ({ progress }) => process.stdout.write(`\r${c.id} ${Math.round(progress * 100)} %`),
  });
  console.log(`\n✓ out/${c.id}.mp4 (${(c.durationInFrames / c.fps).toFixed(1)} s)`);
}
