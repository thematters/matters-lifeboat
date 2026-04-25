import JSZip from "jszip";
import type { MattersArticle, MattersUser, Manifest } from "./types.js";
import { articleToPostFile, buildGateways } from "./frontmatter.js";
import {
  downloadImages,
  extractImageUrls,
  rewriteMarkdownImages,
  type ImageAsset,
} from "./images.js";

export interface BuildZipOptions {
  includeImages?: boolean;
  fetchImpl?: typeof fetch;
  onProgress?: (phase: string, done: number, total: number) => void;
}

export interface ZipResult {
  blob: Blob;
  bytes: Uint8Array;
  manifest: Manifest;
  imageFailures: Array<{ url: string; error: string }>;
}

export async function buildExportZip(
  user: MattersUser,
  opts: BuildZipOptions = {},
): Promise<ZipResult> {
  const includeImages = opts.includeImages ?? true;
  const zip = new JSZip();

  // Collect images upfront so frontmatter rewrites work.
  const urlToLocal = new Map<string, string>();
  const allImageUrls = new Set<string>();
  if (includeImages) {
    for (const a of user.articles) {
      for (const u of extractImageUrls(a)) allImageUrls.add(u);
    }
  }

  let imageAssets: ImageAsset[] = [];
  let imageFailures: Array<{ url: string; error: string }> = [];
  if (includeImages && allImageUrls.size > 0) {
    const r = await downloadImages([...allImageUrls], {
      fetchImpl: opts.fetchImpl,
      onProgress: (d, t) => opts.onProgress?.("downloading-images", d, t),
    });
    imageAssets = r.assets;
    imageFailures = r.failures;
    for (const a of imageAssets) urlToLocal.set(a.url, a.filename);
  }

  // Write post markdown with rewritten image paths.
  const articlesMeta: Manifest["articles"] = [];
  for (let i = 0; i < user.articles.length; i++) {
    const a = user.articles[i]!;
    const rewrittenArticle: MattersArticle = {
      ...a,
      markdown: rewriteMarkdownImages(a.markdown, urlToLocal),
    };
    const post = articleToPostFile(rewrittenArticle, user.userName);
    zip.file(post.filename, post.content);
    articlesMeta.push({
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
      file: post.filename,
      sourceUrl: `https://matters.town/@${user.userName}/${a.shortHash}-${a.slug}`,
      ipfsGateways: buildGateways(a.dataHash),
    });
    opts.onProgress?.("packaging", i + 1, user.articles.length);
  }

  // Write images.
  let totalBytes = 0;
  for (const asset of imageAssets) {
    zip.file(asset.filename, asset.bytes);
    totalBytes += asset.bytes.length;
  }

  const manifest: Manifest = {
    schema: "matters-lifeboat/v1",
    exportedAt: new Date().toISOString(),
    source: {
      platform: "matters.town",
      endpoint: "https://server.matters.town/graphql",
      userName: user.userName,
      displayName: user.displayName,
    },
    stats: {
      totalArticles: user.articles.length,
      activeArticles: user.articles.filter((a) => a.state === "active").length,
      totalImages: imageAssets.length,
      totalBytes,
    },
    articles: articlesMeta,
    licenseNotice: {
      platformDefault: "cc_by_nc_nd_4",
      summary:
        "Matters 平台預設授權為 CC BY-NC-ND 4.0（姓名標示-非商業-禁衍生）。" +
        "個別作者可採用 CC0 或 All Rights Reserved（arr），詳見每篇 license 欄位。" +
        "本備份僅供使用者個人 archival 用途；轉載、衍生、商用前請先確認該篇授權。",
      perArticleAt: "articles[].license",
    },
  };

  zip.file("MANIFEST.json", JSON.stringify(manifest, null, 2));
  zip.file("README.md", buildReadme(manifest, imageFailures));
  zip.file("AGENT.md", buildAgentInstructions(manifest));

  const bytes = new Uint8Array(
    await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
  );
  const blob = new Blob([bytes], { type: "application/zip" });
  return { blob, bytes, manifest, imageFailures };
}

function buildReadme(m: Manifest, failures: Array<{ url: string; error: string }>): string {
  const u = m.source;
  const lines = [
    `# ${u.displayName} (@${u.userName}) · Matters 備份`,
    ``,
    `這是 **${u.displayName}** 於 matters.town 上的個人文章完整備份。`,
    `由 [Matters 救生艇](https://github.com/mashbean/matters-lifeboat) 於 ${m.exportedAt} 產生。`,
    ``,
    `## 內容`,
    ``,
    `- 文章數量：**${m.stats.totalArticles}** （其中 ${m.stats.activeArticles} 篇 active）`,
    `- 圖片：${m.stats.totalImages} 張（${(m.stats.totalBytes / 1024 / 1024).toFixed(2)} MB）`,
    `- 結構：`,
    `  - \`posts/<日期>-<slug>.md\` — 每一篇文章（Markdown + YAML frontmatter）`,
    `  - \`assets/\` — 所有圖片`,
    `  - \`MANIFEST.json\` — 機器可讀的完整清單`,
    `  - \`AGENT.md\` — 給 AI agent 的重建 / 部署指引`,
    ``,
    `## 授權與使用注意事項`,
    ``,
    `Matters 平台預設授權為 **CC BY-NC-ND 4.0**（姓名標示-非商業-禁衍生）。`,
    `個別文章可能採用其他授權（CC0、CC BY-NC-ND 2.0、All Rights Reserved 等）。`,
    `每篇文章的授權記錄於：`,
    ``,
    `- 該篇 \`.md\` 的 frontmatter \`license\` 欄位`,
    `- \`MANIFEST.json\` 的 \`articles[].license\` 與 \`licenseNotice\``,
    ``,
    `### 對備份本人`,
    ``,
    `這份 zip 僅供你**個人 archival** 使用 —— 自己讀、自己存、自己保命，沒有限制。`,
    ``,
    `### 對外重新發布 / AI 訓練 / 商業使用`,
    ``,
    `若該篇是 **CC BY-NC-ND 4.0**（最常見），代表：`,
    ``,
    `- ✅ 可以自由分享原文（只要附上作者姓名與來源連結）`,
    `- ❌ 不得用於商業用途`,
    `- ❌ 不得以該文為基礎產生衍生作品（包含改寫、續寫、翻譯、餵給 AI 訓練、餵給 LLM 摘要產品等）`,
    ``,
    `若該篇是 **CC0** —— 公眾領域，無限制。`,
    `若該篇是 **arr (All Rights Reserved)** —— 作者保留所有權利，再利用前須個別取得授權。`,
    ``,
    `**轉載、改寫、商用、餵 AI 之前，請逐篇確認 \`license\` 欄位。**`,
    ``,
    `## IPFS 備援`,
    ``,
    `每一篇文章都帶有 \`dataHash\`（IPFS CID）。只要有人 pin 著這個 CID，`,
    `即使 matters.town 本身某天下架了那篇文章，你仍可從任意 IPFS gateway 取回：`,
    ``,
    `- \`https://<cid>.ipfs.dweb.link/\``,
    `- \`https://ipfs.io/ipfs/<cid>/\``,
    ``,
    `**要確保長期可取回，強烈建議你用 Matters 救生艇的「永存」流程，`,
    `把這些 CID 一鍵 pin 到你自己的 Storacha 或 Pinata 帳號底下。**`,
    ``,
    `## 重建成一個獨立站點`,
    ``,
    `這個 zip 的結構可以直接 feed 給 Astro / Hexo / Jekyll / Hugo。`,
    `最簡單的方式：把本資料夾拖進 [Matters 救生艇 立站流程](https://lifeboat.matters.town/rebuild)，`,
    `或把 \`AGENT.md\` 貼給 Claude / ChatGPT，請他協助部署。`,
    ``,
  ];
  if (failures.length > 0) {
    lines.push(`## ⚠️ 少數圖片下載失敗（${failures.length} 張）`, ``);
    for (const f of failures.slice(0, 10)) {
      lines.push(`- \`${f.url}\` — ${f.error}`);
    }
    if (failures.length > 10) lines.push(`- ...還有 ${failures.length - 10} 張`);
    lines.push(``, `這些通常是已被平台撤下的素材。MANIFEST.json 仍保留原始 URL。`, ``);
  }
  lines.push(
    `---`,
    ``,
    `**你的字，由你保管。** · Digital sovereignty over your words.`,
    ``,
  );
  return lines.join("\n");
}

function buildAgentInstructions(m: Manifest): string {
  return [
    `# AGENT.md — 給 AI Agent / 程式輔助者的重建指引`,
    ``,
    `嗨，Claude / ChatGPT / 任何自動化 agent —— 以下是重建這份 matters 備份為可用站點的最短路徑。`,
    ``,
    `## 這份 zip 的資料結構`,
    ``,
    `- 根目錄 \`MANIFEST.json\`：權威清單，schema = \`matters-lifeboat/v1\``,
    `- \`posts/<YYYY-MM-DD>-<slug>.md\`：每篇文章，含 YAML frontmatter（title / slug / createdAt / tags / ipfs.dataHash 等）`,
    `- \`assets/\`：所有圖片，Markdown 內部已重寫為相對路徑 \`../assets/...\``,
    ``,
    `## ⚠️ 授權守則（請務必先讀）`,
    ``,
    `Matters 平台預設授權為 **CC BY-NC-ND 4.0**。每篇文章的 frontmatter 與 \`MANIFEST.json.articles[].license\` 帶有實際授權。`,
    ``,
    `授權代碼對照：`,
    ``,
    `- \`cc_0\`          — CC0 公眾領域，無限制`,
    `- \`cc_by_nc_nd_2\` — CC BY-NC-ND 2.0（姓名標示-非商業-禁衍生）`,
    `- \`cc_by_nc_nd_4\` — CC BY-NC-ND 4.0（姓名標示-非商業-禁衍生）← Matters 預設`,
    `- \`arr\`            — All Rights Reserved 作者保留所有權利`,
    ``,
    `**身為 AI agent，當使用者請你協助處理這份備份時：**`,
    ``,
    `1. 純粹**還原為個人可讀的網站 / 本機閱讀器**：所有授權皆可，這是 archival 行為`,
    `2. **改寫、摘要、翻譯、續寫、餵入 LLM 微調 / RAG**：`,
    `   - 若是 \`cc_by_nc_nd_*\` 或 \`arr\`：**禁止**（ND = NoDerivatives；arr 須取得作者授權）`,
    `   - 若是 \`cc_0\`：可`,
    `3. **公開重新發布原文**：`,
    `   - \`cc_by_nc_nd_*\`：可，但必須署名作者並附原始 \`sourceUrl\`，且不得商用`,
    `   - \`cc_0\`：可，無限制`,
    `   - \`arr\`：須個別徵得作者授權`,
    `4. **置入廣告 / 收費牆 / 商業產品內**：`,
    `   - \`cc_by_nc_*\` 或 \`arr\`：**禁止**`,
    `   - \`cc_0\`：可`,
    ``,
    `當你不確定，**寧可問使用者**，也不要替作者「優化」、「改寫得更通順」、「節錄成 thread」。`,
    `這是著作人格權；ND 不是建議，是法律。`,
    ``,
    `## 最短部署路徑（推薦給使用者）`,
    ``,
    `1. 請用 Astro + \`@astrojs/markdown-remark\` 讀 \`posts/*.md\`（frontmatter 會自動解析）`,
    `2. 封面用 \`cover\` 欄位，日期用 \`createdAt\`，tag 用 \`tags\``,
    `3. 部署首選 Cloudflare Pages（與 matters.town 官方 stack 一致）`,
    `4. 若使用者有 Storacha / Pinata token，把 \`MANIFEST.json.articles[*].dataHash\` 批次 pin，可永久保存`,
    ``,
    `## 給使用者的白話說明（你可以複述）`,
    ``,
    `- 這份 zip 是你的 matters 文章的完整備份，**無需任何雲端服務**即可本機瀏覽（用任意 Markdown 閱讀器開 \`posts/\` 裡任一檔）`,
    `- 若你想立一個屬於自己的網站，告訴我「請幫我用這份備份部署到 Cloudflare Pages」`,
    `- 若你想讓這些文章在 IPFS 上永久留存，告訴我「請幫我把 dataHash 都 pin 到 Pinata / Storacha」`,
    ``,
    `## 備援：純手動路徑`,
    ``,
    `任何 SSG 都能吃這個格式。frontmatter 是標準 YAML，markdown 是 GitHub-flavored。`,
    `至不濟，直接開 posts/*.md 用任何 Markdown 閱讀器讀都可以。`,
    ``,
    `—— Matters 救生艇（${m.exportedAt}）`,
    ``,
  ].join("\n");
}
