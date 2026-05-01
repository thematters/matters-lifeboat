export * from "./types.js";
export { MattersClient, MattersGraphQLError, DEFAULT_ENDPOINT } from "./graphql.js";
export { articleToPostFile, buildGateways } from "./frontmatter.js";
export { extractImageUrls, downloadImages, rewriteMarkdownImages } from "./images.js";
export { buildExportZip } from "./zip.js";
export type { ZipResult, BuildZipOptions } from "./zip.js";
export { PinataClient } from "./pin.js";
export type { PinResult, PinProgress, PinataClientOptions, PinataUploadResult } from "./pin.js";
export { buildStaticSiteZip } from "./site.js";
export type { StaticSiteResult } from "./site.js";
export {
  buildFingerprintArchive,
  buildFingerprintPage,
  toFingerprintManifest,
} from "./fingerprint.js";
export type { FingerprintArchiveResult, FingerprintPageResult } from "./fingerprint.js";

import { MattersClient } from "./graphql.js";
import { buildExportZip } from "./zip.js";
import { buildFingerprintArchive as createFingerprintArchive } from "./fingerprint.js";
import type {
  ExportOptions,
  ExportProgress,
  FingerprintOptions,
  FingerprintProgress,
} from "./types.js";
import type { ZipResult } from "./zip.js";
import type { FingerprintArchiveResult } from "./fingerprint.js";

/**
 * End-to-end: fetch all articles for a user and build the export zip.
 */
export async function exportUser(opts: ExportOptions): Promise<ZipResult> {
  const emit = (p: ExportProgress) => opts.onProgress?.(p);
  emit({ phase: "init", current: 0, total: 0, message: `開始備份 @${opts.userName}` });

  const client = new MattersClient({ endpoint: opts.endpoint });
  emit({ phase: "fetching-metadata", current: 0, total: 0, message: "連線到 matters.town…" });

  const user = await client.fetchAllArticles(opts.userName, {
    pageSize: opts.pageSize ?? 50,
    onPage: (cur, total) =>
      emit({
        phase: "fetching-articles",
        current: cur,
        total,
        message: `已取得 ${cur} / ${total} 篇文章`,
      }),
  });

  const result = await buildExportZip(user, {
    includeImages: opts.includeImages ?? true,
    onProgress: (phase, done, total) =>
      emit({
        phase: phase === "packaging" ? "packaging" : "downloading-images",
        current: done,
        total,
        message:
          phase === "downloading-images"
            ? `下載圖片 ${done} / ${total}`
            : `打包檔案 ${done} / ${total}`,
      }),
  });

  emit({
    phase: "done",
    current: user.articles.length,
    total: user.articles.length,
    message: `完成 · ${user.articles.length} 篇 · ${(result.bytes.length / 1024 / 1024).toFixed(2)} MB`,
  });
  return result;
}

export async function exportFingerprints(
  opts: FingerprintOptions,
): Promise<FingerprintArchiveResult> {
  const emit = (p: FingerprintProgress) => opts.onProgress?.(p);
  emit({ phase: "init", current: 0, total: 0, message: `開始整理 @${opts.userName} 的文章地址簿` });

  const client = new MattersClient({ endpoint: opts.endpoint });
  const user = await client.fetchArticleFingerprints(opts.userName, {
    pageSize: opts.pageSize ?? 50,
    onPage: (cur, total) =>
      emit({
        phase: "fetching-articles",
        current: cur,
        total,
        message: `已取得 ${cur} / ${total} 篇文章地址`,
      }),
  });

  emit({
    phase: "packaging",
    current: user.articles.length,
    total: user.articles.length,
    message: "正在產生 HTML / JSON / CSV 文章地址簿",
  });
  const result = await createFingerprintArchive(user);

  emit({
    phase: "done",
    current: user.articles.length,
    total: user.articles.length,
    message: `完成 · ${user.articles.length} 篇 · ${(result.bytes.length / 1024).toFixed(1)} KB`,
  });
  return result;
}
