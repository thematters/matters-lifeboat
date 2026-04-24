/**
 * Headless end-to-end test: export a real matters.town user and dump the zip to disk.
 * Usage:  tsx src/test-headless.ts [userName] [--no-images]
 * Default user: mashbean (143 articles at time of writing).
 */
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { exportUser } from "./index.js";

async function main() {
  const args = process.argv.slice(2);
  const userName = args.find((a) => !a.startsWith("--")) ?? "mashbean";
  const includeImages = !args.includes("--no-images");

  const outDir = resolve("./tmp");
  await mkdir(outDir, { recursive: true });

  const started = Date.now();
  let lastPhase = "";
  const result = await exportUser({
    userName,
    includeImages,
    onProgress: (p) => {
      const line = `[${p.phase}] ${p.message}`;
      if (p.phase !== lastPhase || p.current % 10 === 0 || p.current === p.total) {
        console.log(line);
        lastPhase = p.phase;
      }
    },
  });

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const outPath = resolve(outDir, `${userName}-lifeboat.zip`);
  await writeFile(outPath, result.bytes);
  const manifestPath = resolve(outDir, `${userName}-manifest.json`);
  await writeFile(manifestPath, JSON.stringify(result.manifest, null, 2));

  console.log("");
  console.log("===== 完成 =====");
  console.log(`zip:       ${outPath}`);
  console.log(`manifest:  ${manifestPath}`);
  console.log(`size:      ${(result.bytes.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`articles:  ${result.manifest.stats.totalArticles}`);
  console.log(`images:    ${result.manifest.stats.totalImages}`);
  console.log(`failures:  ${result.imageFailures.length}`);
  console.log(`elapsed:   ${elapsed}s`);
  if (result.imageFailures.length > 0) {
    console.log("");
    console.log("image failures (first 5):");
    for (const f of result.imageFailures.slice(0, 5)) {
      console.log(`  - ${f.url} — ${f.error}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
