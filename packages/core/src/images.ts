import type { MattersArticle } from "./types.js";

export interface ImageAsset {
  url: string;
  filename: string;
  bytes: Uint8Array;
  mime: string;
}

const MD_IMG = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
const HTML_IMG = /<img[^>]+src="([^"]+)"/gi;

export function extractImageUrls(a: MattersArticle): string[] {
  const urls = new Set<string>();
  for (const m of a.markdown.matchAll(MD_IMG)) if (m[1]) urls.add(m[1]);
  for (const m of a.html.matchAll(HTML_IMG)) if (m[1]) urls.add(m[1]);
  if (a.cover) urls.add(a.cover);
  return [...urls];
}

/**
 * Download images with concurrency control. Fails gracefully per image.
 */
export async function downloadImages(
  urls: string[],
  opts: {
    concurrency?: number;
    fetchImpl?: typeof fetch;
    onProgress?: (done: number, total: number) => void;
  } = {},
): Promise<{ assets: ImageAsset[]; failures: Array<{ url: string; error: string }> }> {
  const concurrency = opts.concurrency ?? 6;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const assets: ImageAsset[] = [];
  const failures: Array<{ url: string; error: string }> = [];
  let index = 0;
  let done = 0;

  async function worker() {
    while (true) {
      const i = index++;
      if (i >= urls.length) return;
      const url = urls[i]!;
      try {
        const res = await fetchImpl(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const mime = res.headers.get("content-type") ?? "application/octet-stream";
        const buf = new Uint8Array(await res.arrayBuffer());
        assets.push({
          url,
          filename: urlToFilename(url, mime),
          bytes: buf,
          mime,
        });
      } catch (err) {
        failures.push({ url, error: (err as Error).message });
      } finally {
        done++;
        opts.onProgress?.(done, urls.length);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()));
  return { assets, failures };
}

/**
 * Derive a stable, readable filename from a URL + content-type.
 */
export function urlToFilename(url: string, mime: string): string {
  const u = new URL(url);
  const last = u.pathname.split("/").filter(Boolean).pop() ?? "image";
  const ext = mimeToExt(mime) ?? extFromPath(last) ?? ".bin";
  const base = last.replace(/\.[a-zA-Z0-9]+$/, "");
  // Fold in a short hash of the URL to avoid collisions across articles.
  const hash = shortHash(url);
  return `assets/${base}-${hash}${ext}`;
}

function mimeToExt(mime: string): string | null {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  };
  return map[mime.split(";")[0]!.trim()] ?? null;
}

function extFromPath(name: string): string | null {
  const m = name.match(/\.[a-zA-Z0-9]+$/);
  return m ? m[0].toLowerCase() : null;
}

function shortHash(s: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Rewrite markdown to point image URLs at local asset paths.
 */
export function rewriteMarkdownImages(
  markdown: string,
  assetsByUrl: Map<string, string>,
): string {
  return markdown.replace(MD_IMG, (full, url: string) => {
    const local = assetsByUrl.get(url);
    return local ? full.replace(url, `../${local}`) : full;
  });
}
