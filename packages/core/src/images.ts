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

/**
 * Older Matters articles may have an empty contents.markdown while contents.html
 * still contains the full post. Keep the ZIP Markdown-readable by falling back
 * to a small HTML-to-Markdown conversion for common article markup.
 */
export function articleBodyToMarkdown(
  article: MattersArticle,
  assetsByUrl: Map<string, string>,
): string {
  const markdown = article.markdown.trim();
  if (markdown) return rewriteMarkdownImages(markdown, assetsByUrl);
  return htmlToMarkdown(rewriteHtmlImages(article.html, assetsByUrl)).trim();
}

function rewriteHtmlImages(html: string, assetsByUrl: Map<string, string>): string {
  return html.replace(HTML_IMG, (full, url: string) => {
    const local = assetsByUrl.get(url);
    return local ? full.replace(url, `../${local}`) : full;
  });
}

function htmlToMarkdown(html: string): string {
  if (!html.trim()) return "";
  let out = html
    .replace(/<br\b[^>]*>/gi, "\n")
    .replace(/<\/(p|div|section|article|blockquote|figure)>/gi, "\n\n")
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_full, level: string, text: string) => {
      return `\n\n${"#".repeat(Number(level))} ${cleanInline(text)}\n\n`;
    })
    .replace(/<img\b[^>]*src="([^"]+)"[^>]*>/gi, (full, url: string) => {
      const alt = full.match(/\balt="([^"]*)"/i)?.[1] ?? "";
      return `\n\n![${escapeMarkdown(decodeHtml(stripTags(alt)))}](${url})\n\n`;
    })
    .replace(
      /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      (_full, url: string, text: string) => {
        const label = cleanInline(text);
        return label ? `[${label}](${url})` : url;
      },
    )
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_full, _tag: string, text: string) => {
      return `**${cleanInline(text)}**`;
    })
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_full, _tag: string, text: string) => {
      return `*${cleanInline(text)}*`;
    })
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_full, text: string) => {
      return `- ${cleanInline(text)}\n`;
    })
    .replace(/<\/(ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  out = decodeHtml(out)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return out;
}

function cleanInline(html: string): string {
  return decodeHtml(stripTags(html))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_full, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_full, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function escapeMarkdown(value: string): string {
  return value.replace(/[[\]\\]/g, "\\$&");
}
