import JSZip from "jszip";
import type { Manifest } from "./types.js";

export interface StaticSiteResult {
  blob: Blob;
  bytes: Uint8Array;
  files: string[];
}

interface PostPage {
  sourceFile: string;
  outputFile: string;
  title: string;
  date: string;
  sourceUrl: string;
  tags: string[];
  bodyHtml: string;
}

export async function buildStaticSiteZip(
  backupBytes: Uint8Array,
  manifest: Manifest,
  opts: { siteName?: string } = {},
): Promise<StaticSiteResult> {
  const sourceZip = await JSZip.loadAsync(backupBytes);
  const out = new JSZip();
  const siteName = safeSiteName(opts.siteName ?? `${manifest.source.userName}-archive`);
  const posts = await loadPosts(sourceZip, manifest);

  for (const fileName of Object.keys(sourceZip.files)) {
    const file = sourceZip.files[fileName]!;
    if (file.dir || !fileName.startsWith("assets/")) continue;
    out.file(fileName, await file.async("uint8array"));
  }

  out.file("index.html", renderIndex(manifest, posts));
  out.file("style.css", SITE_CSS);
  out.file("manifest.json", JSON.stringify(manifest, null, 2));
  out.file("README.md", buildStaticSiteReadme(manifest, siteName));
  out.file("AGENT.md", buildStaticSiteAgentInstructions(siteName));

  for (const post of posts) {
    out.file(post.outputFile, renderPost(manifest, post));
  }

  const bytes = new Uint8Array(
    await out.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
  );
  const blob = new Blob([bytes], { type: "application/zip" });
  return { blob, bytes, files: Object.keys(out.files).sort() };
}

async function loadPosts(sourceZip: JSZip, manifest: Manifest): Promise<PostPage[]> {
  const pages: PostPage[] = [];
  for (const [index, item] of manifest.articles.entries()) {
    const sourceFile = item.file;
    const file = sourceZip.files[sourceFile];
    if (!file || file.dir) continue;
    const raw = await file.async("string");
    const body = stripFrontmatter(raw).trimStart().replace(/^# .+?\n+/, "");
    const base = `${item.createdAt.slice(0, 10)}-${item.shortHash || String(index + 1).padStart(3, "0")}`;
    pages.push({
      sourceFile,
      outputFile: `posts/${base}.html`,
      title: item.title,
      date: item.createdAt,
      sourceUrl: item.sourceUrl,
      tags: item.tags,
      bodyHtml: markdownToHtml(body),
    });
  }
  return pages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---\n")) return raw;
  const end = raw.indexOf("\n---\n", 4);
  return end >= 0 ? raw.slice(end + 5) : raw;
}

function markdownToHtml(markdown: string): string {
  const blocks = markdown.trim().split(/\n{2,}/);
  return blocks.map(renderBlock).join("\n");
}

function renderBlock(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return rewriteAssetPaths(trimmed);
  if (/^---+$/.test(trimmed)) return "<hr />";
  const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
  if (heading) {
    const level = heading[1]!.length;
    return `<h${level}>${renderInline(heading[2]!)}</h${level}>`;
  }
  if (/^>\s+/m.test(trimmed)) {
    const body = trimmed
      .split("\n")
      .map((line) => line.replace(/^>\s?/, ""))
      .join("\n");
    return `<blockquote>${renderInline(body)}</blockquote>`;
  }
  if (/^[-*]\s+/m.test(trimmed)) {
    const items = trimmed
      .split("\n")
      .filter((line) => /^[-*]\s+/.test(line))
      .map((line) => `<li>${renderInline(line.replace(/^[-*]\s+/, ""))}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  }
  const imageOnly = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (imageOnly) {
    return `<figure><img src="${rewriteAssetUrl(escapeAttr(imageOnly[2]!))}" alt="${escapeAttr(imageOnly[1]!)}" /></figure>`;
  }
  return `<p>${renderInline(trimmed).replace(/\n/g, "<br />")}</p>`;
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => {
      return `<img src="${rewriteAssetUrl(escapeAttr(url))}" alt="${escapeAttr(alt)}" />`;
    })
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function rewriteAssetPaths(html: string): string {
  return html.replace(/(["'])\.\.\/assets\//g, "$1../assets/");
}

function rewriteAssetUrl(url: string): string {
  return url.startsWith("../assets/") ? url : url;
}

function renderIndex(manifest: Manifest, posts: PostPage[]): string {
  const name = escapeHtml(manifest.source.displayName);
  const user = escapeHtml(manifest.source.userName);
  const items = posts
    .map(
      (post) => `<li>
        <a href="${escapeAttr(post.outputFile)}">${escapeHtml(post.title)}</a>
        <time datetime="${escapeAttr(post.date)}">${formatDate(post.date)}</time>
      </li>`,
    )
    .join("\n");
  return pageShell(
    `${name}的文集`,
    `<section class="hero">
      <h1>${name}的文集</h1>
      <p>共 ${posts.length} 篇。由 <a href="https://matters.town/@${user}">@${user}</a> 在 matters.town 發表，由 <a href="https://github.com/thematters/matters-lifeboat">Matters 救生艇</a> 備份。</p>
    </section>
    <ol class="post-list">${items}</ol>`,
    "",
  );
}

function renderPost(manifest: Manifest, post: PostPage): string {
  const tags = post.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const ipfs = manifest.articles.find((item) => item.file === post.sourceFile)?.dataHash;
  const ipfsLink = ipfs ? ` · <a href="https://${escapeAttr(ipfs)}.ipfs.dweb.link/">IPFS</a>` : "";
  return pageShell(
    post.title,
    `<article>
      <p><a href="../index.html">← 回到文集</a></p>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="meta"><time datetime="${escapeAttr(post.date)}">${formatDate(post.date)}</time> · <a href="${escapeAttr(post.sourceUrl)}">在 Matters 看原文</a>${ipfsLink}</p>
      ${tags ? `<p class="tags">${tags}</p>` : ""}
      <div class="content">${post.bodyHtml}</div>
    </article>`,
    "../",
  );
}

function pageShell(title: string, body: string, assetPrefix: string): string {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${assetPrefix}style.css" />
</head>
<body>
  <main>${body}</main>
  <footer>Backup produced by <a href="https://github.com/thematters/matters-lifeboat">Matters 救生艇</a></footer>
</body>
</html>`;
}

function buildStaticSiteReadme(manifest: Manifest, siteName: string): string {
  return `# ${siteName}

${manifest.source.displayName}（@${manifest.source.userName}）的 Matters 靜態備份站。

## 最簡單部署

1. 解壓縮這個 zip。
2. 打開 Cloudflare Workers & Pages，選 Upload your static files。
3. 把解壓後的整個資料夾拖上去。
4. 看到檔案清單後，按 Deploy。

不需要安裝 Node.js，不需要 GitHub，不需要 build command。若 Cloudflare 問 build command，代表你走到 Git/GitHub 流程了，請回上一頁選 Upload your static files。

## Agent 指令

請把這個資料夾部署到 Cloudflare Workers & Pages 的 Upload your static files。這已經是純靜態網站，不要執行 npm install，也不要重新 build。`;
}

function buildStaticSiteAgentInstructions(siteName: string): string {
  return `# AGENT.md

這是 ${siteName} 的純靜態網站包。

部署規則：
- 直接把整個資料夾上傳到 Cloudflare Workers & Pages 的 Upload your static files。
- 不需要 npm install。
- 不需要 build command。
- 若使用 GitHub Pages、Netlify、Vercel static upload，也請把根目錄當 publish directory。
`;
}

function safeSiteName(name: string): string {
  return name.trim().replace(/[^\w.-]+/g, "-").replace(/-+/g, "-") || "matters-archive";
}

function formatDate(date: string): string {
  return date.slice(0, 10);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

const SITE_CSS = `:root {
  color-scheme: light;
  --ink: #151515;
  --muted: #626262;
  --line: #e5e1da;
  --paper: #fffdfa;
  --wash: #f6f4ef;
  --brand: #245f53;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--wash);
  color: var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans TC", "PingFang TC", sans-serif;
  line-height: 1.78;
}
main {
  width: min(860px, calc(100% - 32px));
  margin: 0 auto;
  padding: 44px 0 56px;
}
a { color: var(--brand); text-underline-offset: 3px; }
.hero {
  border-bottom: 1px solid var(--line);
  padding-bottom: 24px;
  margin-bottom: 12px;
}
h1 { font-size: clamp(30px, 5vw, 54px); line-height: 1.12; margin: 0 0 12px; }
article h1 { font-size: clamp(28px, 4vw, 42px); }
h2, h3 { margin-top: 1.6em; line-height: 1.25; }
.meta, time, footer { color: var(--muted); font-size: 14px; }
.post-list { list-style: none; padding: 0; margin: 0; }
.post-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}
.post-list a { font-size: 18px; font-weight: 650; }
.tag {
  display: inline-block;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 9px;
  margin: 2px 6px 2px 0;
  color: var(--muted);
  font-size: 13px;
}
.content {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: clamp(18px, 4vw, 40px);
  margin-top: 24px;
}
img { max-width: 100%; height: auto; }
figure { margin: 24px 0; }
blockquote { border-left: 4px solid var(--line); margin-left: 0; padding-left: 16px; color: var(--muted); }
hr { border: 0; border-top: 1px solid var(--line); margin: 28px 0; }
footer {
  width: min(860px, calc(100% - 32px));
  margin: 0 auto;
  border-top: 1px solid var(--line);
  padding: 20px 0 36px;
}
@media (max-width: 640px) {
  .post-list li { grid-template-columns: 1fr; gap: 4px; }
}
`;
