import { useState } from "react";
import JSZip from "jszip";
import type { SharedSession } from "../App";

interface Props {
  session: SharedSession;
  setSession: (s: SharedSession) => void;
  onBack: () => void;
}

/**
 * Flow C (semi-auto per UX agent recommendation):
 * 1. Take the already-exported zip.
 * 2. Re-pack it inside a ready-to-deploy Astro skeleton.
 * 3. Offer user a download + one-click CF Pages + GitHub deploy links.
 *
 * This intentionally avoids GitHub OAuth / device flow in MVP — that was the
 * biggest UX risk flagged in the usability spec.
 */
export function FlowC({ session, onBack }: Props) {
  const [building, setBuilding] = useState(false);
  const [siteZip, setSiteZip] = useState<Blob | null>(null);
  const [repoName, setRepoName] = useState(() =>
    session.zip ? `${session.zip.manifest.source.userName}-archive` : "matters-archive",
  );

  if (!session.zip) {
    return (
      <>
        <button className="back" onClick={onBack}>
          ← 回到選擇
        </button>
        <div className="card">
          <h2>需要先備份</h2>
          <p>「立站」會把你的備份打成一個可直接上傳到 Cloudflare Pages 的 Astro 專案，所以請先跑 A 流程。</p>
          <button className="btn btn-primary" onClick={onBack}>
            去做備份 →
          </button>
        </div>
      </>
    );
  }

  const zip = session.zip;

  async function buildSiteZip() {
    setBuilding(true);
    const out = new JSZip();
    const innerZip = await JSZip.loadAsync(zip.bytes);
    // copy content from the export into the site's src/content/posts/
    const postFiles = Object.keys(innerZip.files).filter((f) =>
      f.startsWith("posts/") && !innerZip.files[f]!.dir,
    );
    for (const pf of postFiles) {
      const content = await innerZip.files[pf]!.async("string");
      out.file(`src/content/posts/${pf.replace(/^posts\//, "")}`, content);
    }
    const assetFiles = Object.keys(innerZip.files).filter((f) =>
      f.startsWith("assets/") && !innerZip.files[f]!.dir,
    );
    for (const af of assetFiles) {
      const bin = await innerZip.files[af]!.async("uint8array");
      out.file(`public/${af}`, bin);
    }
    const manifestJson = await innerZip.files["MANIFEST.json"]?.async("string");
    if (manifestJson) out.file("public/manifest.json", manifestJson);

    // Astro scaffold files
    const displayName = zip.manifest.source.displayName;
    const userName = zip.manifest.source.userName;

    out.file("package.json", JSON.stringify(astroPackageJson(repoName), null, 2));
    out.file("astro.config.mjs", ASTRO_CONFIG);
    out.file("tsconfig.json", ASTRO_TSCONFIG);
    out.file("src/content/config.ts", CONTENT_CONFIG);
    out.file("src/layouts/Base.astro", BASE_LAYOUT(displayName, userName));
    out.file("src/pages/index.astro", INDEX_PAGE(displayName, userName));
    out.file("src/pages/posts/[...slug].astro", POST_PAGE);
    out.file(".gitignore", "node_modules\ndist\n.DS_Store\n");
    out.file("README.md", READMEForSite(displayName, userName, repoName));

    const bytes = new Uint8Array(
      await out.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
    );
    setSiteZip(new Blob([bytes], { type: "application/zip" }));
    setBuilding(false);
  }

  function download() {
    if (!siteZip) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(siteZip);
    a.download = `${repoName}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <>
      <button className="back" onClick={onBack}>
        ← 回到選擇
      </button>

      <div className="card">
        <h2>🏝️ 立站流程 · 產一個你自己的 Astro 站台</h2>
        <p>
          我們會用你 <strong>{zip.manifest.stats.totalArticles}</strong> 篇備份，
          產出一個<strong>已經可以用</strong>的 Astro 專案壓縮檔。你只要：
        </p>
        <ol style={{ lineHeight: 1.9 }}>
          <li>下載下面的 <code>{repoName}.zip</code></li>
          <li>打開 <a href="https://dash.cloudflare.com/?to=/:account/pages/new/provider/direct-upload" target="_blank" rel="noreferrer">Cloudflare Pages 直接上傳</a></li>
          <li>把解壓後的整個資料夾拖上去，點「Save and Deploy」</li>
          <li>約 3 分鐘後，你的網站就活著了</li>
        </ol>
        <div className="trust">
          <strong>為什麼 semi-auto 而不是 GitHub OAuth 自動化：</strong>
          跳過 OAuth 可以避免你授權未知 app 的疑慮。拖拉一次到 Cloudflare 就好，之後你要接到自己的 GitHub、自訂網域都是你的事。
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 13, color: "var(--color-ink-500)" }}>專案名稱（未來 repo 名）</label>
          <input
            className="input"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value.replace(/\s+/g, "-"))}
          />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => void buildSiteZip()}
            disabled={building}
          >
            {building ? "打包中⋯" : siteZip ? "重新打包" : "生成站台專案 →"}
          </button>
          {siteZip && (
            <button className="btn btn-primary" onClick={download}>
              ⬇️ 下載 {repoName}.zip
            </button>
          )}
          {siteZip && (
            <a
              href="https://dash.cloudflare.com/?to=/:account/pages/new/provider/direct-upload"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              打開 Cloudflare Pages ↗
            </a>
          )}
        </div>

        {siteZip && (
          <div className="callout success" style={{ marginTop: 20 }}>
            <strong>🏝️ 準備好了。</strong>
            下載後解壓縮，拖到 Cloudflare Pages 的 Direct Upload 區。
            Build command 留空，publish directory 填 <code>dist</code>（或讓 CF 自動偵測 Astro）。
          </div>
        )}

        <div className="callout info" style={{ marginTop: 20 }}>
          <strong>想讓 AI agent 幫你做？</strong>
          下載的 zip 裡附有 <code>README.md</code>，裡面有給 Claude / ChatGPT 的逐步指令。
          你只要把它貼給 agent 說「請照這個流程幫我部署」就行。
        </div>
      </div>
    </>
  );
}

function astroPackageJson(name: string) {
  return {
    name,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
    },
    dependencies: {
      astro: "^4.5.0",
    },
  };
}

const ASTRO_CONFIG = `import { defineConfig } from "astro/config";
export default defineConfig({
  site: "https://example.pages.dev",
  markdown: { gfm: true },
});
`;

const ASTRO_TSCONFIG = `{
  "extends": "astro/tsconfigs/base"
}
`;

const CONTENT_CONFIG = `import { defineCollection, z } from "astro:content";
const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    shortHash: z.string().optional(),
    author: z.string().optional(),
    state: z.string().optional(),
    createdAt: z.string().or(z.date()),
    revisedAt: z.string().or(z.date()).optional(),
    tags: z.array(z.string()).optional(),
    iscnId: z.string().nullable().optional(),
    ipfs: z
      .object({
        dataHash: z.string(),
        mediaHash: z.string(),
        gateways: z.array(z.string()).optional(),
      })
      .optional(),
    source: z.string().optional(),
    summary: z.string().optional(),
    cover: z.string().nullable().optional(),
  }),
});
export const collections = { posts };
`;

const BASE_LAYOUT = (name: string, _user: string) => `---
const { title } = Astro.props;
---
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title ?? "${name} 的文集"}</title>
  <style>
    :root { --ink:#0f172a; --muted:#64748b; --brand:#0f766e; --bg:#f8fafc; }
    * { box-sizing:border-box; }
    body { font-family: "Noto Sans TC","PingFang TC",system-ui,sans-serif; color:var(--ink); background:var(--bg); margin:0; line-height:1.8; }
    main { max-width: 720px; margin: 0 auto; padding: 48px 20px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    a { color: var(--brand); }
    .meta { color: var(--muted); font-size: 13px; }
    .tag { display:inline-block; background:#ecfdf5; color:#0f766e; padding:2px 8px; border-radius:999px; margin:2px 4px 2px 0; font-size:12px; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    article h2, article h3 { margin-top: 1.5em; }
    footer { margin-top: 64px; border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 12px; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <main>
    <slot />
    <footer>
      ${name}（@${_user}）的 Matters 文集 · Backup produced by
      <a href="https://github.com/mashbean/matters-lifeboat">Matters 救生艇</a>
    </footer>
  </main>
</body>
</html>
`;

const INDEX_PAGE = (name: string, user: string) => `---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
const posts = (await getCollection("posts")).sort(
  (a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime(),
);
---
<Base title="${name} 的文集">
  <h1>${name} 的文集</h1>
  <p class="meta">
    共 {posts.length} 篇。由 <a href="https://matters.town/@${user}">@${user}</a> 在 matters.town 發表，
    由 <a href="https://github.com/mashbean/matters-lifeboat">救生艇</a> 備份。
  </p>
  <ul style="list-style:none;padding:0;">
    {posts.map((p) => (
      <li style="padding:16px 0;border-bottom:1px solid #e2e8f0;">
        <a href={\`/posts/\${p.slug}\`} style="font-size:17px;font-weight:600;">{p.data.title}</a>
        <div class="meta">{new Date(p.data.createdAt).toLocaleDateString("zh-Hant-TW")}</div>
      </li>
    ))}
  </ul>
</Base>
`;

const POST_PAGE = `---
import { getCollection } from "astro:content";
import Base from "../../layouts/Base.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((p) => ({ params: { slug: p.slug }, props: { p } }));
}
const { p } = Astro.props;
const { Content } = await p.render();
---
<Base title={p.data.title}>
  <article>
    <h1>{p.data.title}</h1>
    <p class="meta">
      {new Date(p.data.createdAt).toLocaleDateString("zh-Hant-TW")}
      {p.data.source && (<> · <a href={p.data.source}>在 matters 上看原文</a></>)}
      {p.data.ipfs?.dataHash && (
        <> · <a href={\`https://\${p.data.ipfs.dataHash}.ipfs.dweb.link/\`} rel="nofollow">IPFS</a></>
      )}
    </p>
    <p>{(p.data.tags ?? []).map((t) => <span class="tag">{t}</span>)}</p>
    <Content />
  </article>
</Base>
`;

const READMEForSite = (name: string, user: string, repo: string) => `# ${repo}

${name}（@${user}）的 Matters 文章個人站台，由 [Matters 救生艇](https://github.com/mashbean/matters-lifeboat) 產生。

## 給 AI Agent 的部署指令

如果你在對一個 AI agent（Claude / ChatGPT / etc.）講話，請貼以下給它：

> 我有一個 Astro 專案資料夾，請幫我部署到 Cloudflare Pages。步驟：
> 1. \`npm install && npm run build\`
> 2. 把 \`dist/\` 上傳到 Cloudflare Pages（Direct Upload），或連結我的 GitHub repo 給 CF Pages 自動 build
> 3. 部署完成後告訴我網址

## 給人類的部署步驟

\`\`\`bash
npm install
npm run build   # 產生 dist/
\`\`\`

### 最簡單：拖到 Cloudflare Pages
1. 打開 https://dash.cloudflare.com → Pages → Create a project → Direct Upload
2. 把整個資料夾（或只上傳 \`dist/\`）拖上去
3. Save and Deploy

### 或連到 GitHub
1. 建一個新 GitHub repo，push 這個資料夾上去
2. Cloudflare Pages → Create a project → Connect to Git → 選這個 repo
3. Framework preset: **Astro**（會自動填 build command）
4. Deploy

## 檔案結構

\`\`\`
src/
  content/posts/    你的每一篇文章（Markdown + frontmatter）
  layouts/Base.astro
  pages/index.astro
  pages/posts/[...slug].astro
public/
  assets/           所有文章內嵌圖片
  manifest.json     原始備份的機器可讀清單
\`\`\`

## 永久可攜

每一篇文章的 frontmatter 都含有 \`ipfs.dataHash\`。只要有人 pin 著這個 CID，
內容就能從任何 IPFS gateway 取回。建議用 [Matters 救生艇 B 流程](https://lifeboat.matters.town?flow=b) pin 到你自己的 Pinata 帳號。
`;
