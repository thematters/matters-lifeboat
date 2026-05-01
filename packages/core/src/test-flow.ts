import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import JSZip from "jszip";
import {
  buildFingerprintArchive,
  buildFingerprintPage,
  buildStaticSiteZip,
  exportFingerprints,
  exportUser,
  PinataClient,
} from "./index.js";

async function main() {
  const args = process.argv.slice(2);
  const userName = args.find((arg) => !arg.startsWith("--")) ?? "mashbean";
  const includeImages = args.includes("--images");
  const outDir = resolve("./tmp/flow-test");
  await mkdir(outDir, { recursive: true });

  const exportResult = await exportUser({
    userName,
    includeImages,
    endpoint: "https://server.matters.town/graphql",
    onProgress: (p) => {
      if (p.phase === "fetching-articles" && p.current === p.total) {
        console.log(`[backup] ${p.message}`);
      }
    },
  });

  const site = await buildStaticSiteZip(exportResult.bytes, exportResult.manifest, {
    siteName: `${userName}-archive`,
  });
  const fingerprints = await exportFingerprints({
    userName,
    endpoint: "https://server.matters.town/graphql",
  });
  const fingerprintZip = await JSZip.loadAsync(fingerprints.bytes);
  if (!fingerprintZip.files["index.html"] || !fingerprintZip.files["address-book.json"]) {
    throw new Error("fingerprint archive missing expected files");
  }
  const fingerprintPage = buildFingerprintPage(exportResult.manifest);
  if (!fingerprintPage.html.includes(exportResult.manifest.articles[0]?.dataHash ?? "")) {
    throw new Error("article address page missing article CID");
  }
  const fingerprintFromBackup = await buildFingerprintArchive(exportResult.manifest);
  if (
    fingerprintFromBackup.manifest.stats.totalFingerprints !==
    exportResult.manifest.articles.filter((article) => Boolean(article.dataHash)).length
  ) {
    throw new Error("fingerprint manifest count mismatch");
  }
  const siteZip = await JSZip.loadAsync(site.bytes);
  const siteFiles = Object.keys(siteZip.files).filter((file) => !siteZip.files[file]!.dir);
  const postFiles = siteFiles.filter((file) => file.startsWith("posts/") && file.endsWith(".html"));
  const indexHtml = await siteZip.files["index.html"]?.async("string");
  if (!indexHtml?.includes(exportResult.manifest.source.displayName)) {
    throw new Error("static site index.html did not include display name");
  }
  if (postFiles.length !== exportResult.manifest.stats.totalArticles) {
    throw new Error(
      `static site post count mismatch: ${postFiles.length} != ${exportResult.manifest.stats.totalArticles}`,
    );
  }

  const sampleCids = exportResult.manifest.articles
    .map((article) => article.dataHash)
    .filter(Boolean)
    .slice(0, 2);
  const pinataCalls: Array<{ url: string; body?: unknown }> = [];
  const pinata = new PinataClient({
    jwt: "test.jwt",
    fetchImpl: (async (url, init) => {
      const bodyText = typeof init?.body === "string" ? init.body : undefined;
      pinataCalls.push({
        url: String(url),
        body: bodyText ? JSON.parse(bodyText) : undefined,
      });
      if (String(url).endsWith("/data/testAuthentication")) return response({}, 200);
      if (String(url).endsWith("/pinning/pinByHash")) {
        const body = JSON.parse(String(init?.body ?? "{}"));
        if (body.hashToPin === sampleCids[1]) {
          return response({ error: { reason: "HASH_ALREADY_PINNED" } }, 409);
        }
        return response({}, 200);
      }
      if (String(url).endsWith("/v3/files")) {
        const index = pinataCalls.filter((call) => call.url.endsWith("/v3/files")).length;
        return response(
          {
            data: {
              cid: index === 1 ? "bafybeigdyrztztstestproofcid" : "bafybeigdyrztztstestbackupcid",
              name: index === 1 ? "article-address-page.html" : "backup.zip",
            },
          },
          200,
        );
      }
      return response({}, 404);
    }) as typeof fetch,
  });
  const authOk = await pinata.verifyAuth();
  const pinResults = await pinata.pinMany(sampleCids);
  const proofUpload = await pinata.uploadPublicFile(fingerprintPage.blob, fingerprintPage.fileName);
  const uploadResult = await pinata.uploadPublicFile(exportResult.blob, `${userName}-backup.zip`);
  if (!authOk) throw new Error("mock Pinata auth failed");
  if (pinResults[0]?.status !== "success") throw new Error("mock Pinata success path failed");
  if (sampleCids.length > 1 && pinResults[1]?.status !== "already-pinned") {
    throw new Error("mock Pinata already-pinned path failed");
  }
  if (!uploadResult.cid) throw new Error("mock Pinata upload path failed");

  const backupPath = resolve(outDir, `${userName}-backup.zip`);
  const sitePath = resolve(outDir, `${userName}-static-site.zip`);
  const fingerprintPath = resolve(outDir, `${userName}-article-address-book.zip`);
  const reportPath = resolve(outDir, `${userName}-report.json`);
  await writeFile(backupPath, exportResult.bytes);
  await writeFile(sitePath, site.bytes);
  await writeFile(fingerprintPath, fingerprints.bytes);
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        userName,
        includeImages,
        backup: {
          articles: exportResult.manifest.stats.totalArticles,
          images: exportResult.manifest.stats.totalImages,
          imageFailures: exportResult.imageFailures.length,
          bytes: exportResult.bytes.length,
          path: backupPath,
        },
        staticSite: {
          files: siteFiles.length,
          posts: postFiles.length,
          hasIndex: Boolean(siteZip.files["index.html"]),
          hasStyle: Boolean(siteZip.files["style.css"]),
          hasManifest: Boolean(siteZip.files["manifest.json"]),
          hasReadme: Boolean(siteZip.files["README.md"]),
          path: sitePath,
        },
        fingerprints: {
          files: Object.keys(fingerprintZip.files).filter((file) => !fingerprintZip.files[file]!.dir)
            .length,
          articles: fingerprints.manifest.stats.totalArticles,
          cids: fingerprints.manifest.stats.totalFingerprints,
          bytes: fingerprints.bytes.length,
          path: fingerprintPath,
        },
        pinataMock: {
          authOk,
          cids: sampleCids.length,
          results: pinResults,
          proofUpload,
          backupUpload: uploadResult,
          calls: pinataCalls.length,
        },
      },
      null,
      2,
    ),
  );

  console.log("===== flow test ok =====");
  console.log(`backup: ${backupPath}`);
  console.log(`site:   ${sitePath}`);
  console.log(`fp:     ${fingerprintPath}`);
  console.log(`report: ${reportPath}`);
}

function response(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
