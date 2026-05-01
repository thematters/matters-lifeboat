import JSZip from "jszip";
import type { FingerprintManifest, MattersUser, Manifest } from "./types.js";
import { buildGateways } from "./frontmatter.js";

export interface FingerprintArchiveResult {
  blob: Blob;
  bytes: Uint8Array;
  manifest: FingerprintManifest;
  files: string[];
}

export interface FingerprintPageResult {
  blob: Blob;
  html: string;
  fileName: string;
}

export async function buildFingerprintArchive(
  source: MattersUser | Manifest | FingerprintManifest,
): Promise<FingerprintArchiveResult> {
  const manifest = toFingerprintManifest(source);
  const zip = new JSZip();

  zip.file("index.html", renderFingerprintPage(manifest));
  zip.file("address-book.json", JSON.stringify(manifest, null, 2));
  zip.file("address-book.csv", renderFingerprintCsv(manifest));
  zip.file("README.md", buildReadme(manifest));
  zip.file("AGENT.md", buildAgentInstructions(manifest));

  const bytes = new Uint8Array(
    await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
  );
  const blob = new Blob([bytes], { type: "application/zip" });
  return { blob, bytes, manifest, files: Object.keys(zip.files).sort() };
}

export function buildFingerprintPage(
  source: MattersUser | Manifest | FingerprintManifest,
): FingerprintPageResult {
  const manifest = toFingerprintManifest(source);
  const html = renderFingerprintPage(manifest);
  const fileName = `${manifest.source.userName}-article-address-page.html`;
  return {
    html,
    fileName,
    blob: new Blob([html], { type: "text/html;charset=utf-8" }),
  };
}

export function toFingerprintManifest(
  source: MattersUser | Manifest | FingerprintManifest,
): FingerprintManifest {
  if ("schema" in source && source.schema === "matters-lifeboat-fingerprints/v1") {
    return source;
  }

  if ("schema" in source) {
    return {
      schema: "matters-lifeboat-fingerprints/v1",
      exportedAt: new Date().toISOString(),
      source: source.source,
      stats: {
        totalArticles: source.articles.length,
        activeArticles: source.articles.filter((a) => a.state === "active").length,
        totalFingerprints: source.articles.filter((a) => Boolean(a.dataHash)).length,
      },
      articles: source.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        shortHash: a.shortHash,
        dataHash: a.dataHash,
        mediaHash: a.mediaHash,
        iscnId: a.iscnId,
        state: a.state,
        license: a.license,
        createdAt: a.createdAt,
        tags: a.tags,
        sourceUrl: a.sourceUrl,
        ipfsGateways: a.ipfsGateways.length > 0 ? a.ipfsGateways : buildGateways(a.dataHash),
      })),
      note:
        "這是一份文章地址簿，不是完整備份。它保留每篇文章的 CID 與可查驗連結，方便先把文章索引掌握在自己手上。",
    };
  }

  return {
    schema: "matters-lifeboat-fingerprints/v1",
    exportedAt: new Date().toISOString(),
    source: {
      platform: "matters.town",
      endpoint: "https://server.matters.town/graphql",
      userName: source.userName,
      displayName: source.displayName,
    },
    stats: {
      totalArticles: source.articles.length,
      activeArticles: source.articles.filter((a) => a.state === "active").length,
      totalFingerprints: source.articles.filter((a) => Boolean(a.dataHash)).length,
    },
    articles: source.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      shortHash: a.shortHash,
      dataHash: a.dataHash,
      mediaHash: a.mediaHash,
      iscnId: a.iscnId,
      state: a.state,
      license: a.license,
      createdAt: a.createdAt,
      tags: a.tags,
      sourceUrl: `https://matters.town/@${source.userName}/${a.shortHash}-${a.slug}`,
      ipfsGateways: buildGateways(a.dataHash),
    })),
    note:
      "這是一份文章地址簿，不是完整備份。它保留每篇文章的 CID 與可查驗連結，方便先把文章索引掌握在自己手上。",
  };
}

function renderFingerprintPage(manifest: FingerprintManifest): string {
  const rows = manifest.articles
    .map((article) => {
      const gateways = article.ipfsGateways
        .map((url, index) => `<a href="${escapeAttr(url)}">IPFS ${index + 1}</a>`)
        .join(" · ");
      return `<article class="post">
        <div class="post-main">
          <h2>${escapeHtml(article.title)}</h2>
          <p class="meta">${formatDate(article.createdAt)} · ${escapeHtml(article.state)} · ${escapeHtml(article.license ?? "license unknown")}</p>
          <p class="links"><a href="${escapeAttr(article.sourceUrl)}">Matters 原文</a> · ${gateways}</p>
        </div>
        <code>${escapeHtml(article.dataHash)}</code>
      </article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(manifest.source.displayName)} 的文章地址簿</title>
  <style>${FINGERPRINT_CSS}</style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Matters Lifeboat · Article address book</p>
      <h1>${escapeHtml(manifest.source.displayName)} 的文章地址</h1>
      <p>
        這不是完整備份，而是一張索引卡：它列出每篇文章在 Matters 的原文連結、
        IPFS CID，以及可以查驗的 IPFS gateway 連結。
      </p>
    </section>

    <section class="summary" aria-label="summary">
      <div><strong>${manifest.stats.totalArticles}</strong><span>篇文章</span></div>
      <div><strong>${manifest.stats.totalFingerprints}</strong><span>個 CID</span></div>
      <div><strong>${formatDate(manifest.exportedAt)}</strong><span>匯出日期</span></div>
    </section>

    <section class="plain">
      <h2>這份清單可以做什麼？</h2>
      <p>
        如果你擔心帳號被下架，或擔心 Matters 主站哪天不在了，可以先把這份清單收好。
        它讓你知道「哪些文章曾經對應到哪些 IPFS 地址」，之後要找回、驗證、分享或補做完整備份都比較容易。
      </p>
    </section>

    <section class="posts">
      ${rows}
    </section>
  </main>
</body>
</html>`;
}

function renderFingerprintCsv(manifest: FingerprintManifest): string {
  const header = [
    "title",
    "createdAt",
    "state",
    "license",
    "mattersUrl",
    "dataHash",
    "gateway1",
    "gateway2",
  ];
  const rows = manifest.articles.map((article) =>
    [
      article.title,
      article.createdAt,
      article.state,
      article.license ?? "",
      article.sourceUrl,
      article.dataHash,
      article.ipfsGateways[0] ?? "",
      article.ipfsGateways[1] ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function buildReadme(manifest: FingerprintManifest): string {
  return `# ${manifest.source.displayName} 的文章地址簿

這不是完整備份，而是一份輕量索引。

它保留：

- 每篇文章的標題
- Matters 原文連結
- IPFS CID（dataHash）
- 可點開的 IPFS gateway 連結
- 授權與日期

如果你擔心帳號被下架，或擔心 Matters 主站哪天不在了，可以先把這份清單收好。之後要補做完整備份、做靜態站、或查驗文章是否仍可從 IPFS 取回，都可以從這裡開始。

## 檔案

- \`index.html\`：人類可讀的分享頁
- \`address-book.json\`：agent / 程式可讀
- \`address-book.csv\`：試算表可讀
- \`AGENT.md\`：給 AI agent 的操作指引
`;
}

function buildAgentInstructions(manifest: FingerprintManifest): string {
  return `# AGENT.md

這是 @${manifest.source.userName} 的 Matters 文章地址簿。

請先讀 \`address-book.json\`。每篇文章的 \`dataHash\` 是 IPFS CID，\`ipfsGateways\` 是可查驗連結。

重要限制：

- 這不是完整文章備份。
- 不包含圖片檔與 Markdown 內文。
- 若使用者要完整保存，請回到 Matters Lifeboat 跑完整 ZIP 備份。
- 若使用者只想公開一張證明清單，可以上傳 \`index.html\` 到 Pinata public IPFS，並分享回傳的 gateway URL。
`;
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
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

const FINGERPRINT_CSS = `:root {
  color-scheme: light;
  --ink: #202124;
  --muted: #666;
  --line: #dedede;
  --paper: #fff;
  --wash: #f7f7f7;
  --brand: #5a43e5;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--wash);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Noto Sans TC", sans-serif;
  line-height: 1.65;
}
main {
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 40px 0 64px;
}
a { color: var(--brand); text-underline-offset: 3px; }
.hero, .plain, .post, .summary {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.hero { padding: 28px; margin-bottom: 16px; }
.eyebrow { margin: 0 0 8px; color: var(--brand); font-size: 13px; font-weight: 700; }
h1 { margin: 0 0 12px; font-size: clamp(28px, 5vw, 48px); line-height: 1.15; }
h2 { margin: 0 0 8px; font-size: 20px; line-height: 1.35; }
p { margin: 0; }
.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  margin-bottom: 16px;
}
.summary div { padding: 18px; background: var(--paper); }
.summary strong { display: block; font-size: 24px; color: var(--brand); }
.summary span, .meta { color: var(--muted); font-size: 13px; }
.plain { padding: 22px; margin-bottom: 16px; }
.posts { display: grid; gap: 12px; }
.post {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  padding: 18px;
}
.links { margin-top: 8px; }
code {
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
  background: var(--wash);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
@media (max-width: 640px) {
  .summary { grid-template-columns: 1fr; }
}`;
