# AGENT.md — Matters 救生艇 AI Agent 操作手冊

> 給 Claude / ChatGPT / Cursor / 任何代為操作的 AI agent。
> 使用者請你協助備份、永存、或重建一份 matters.town 文章時，這份手冊就是你的工作說明書。

## 你是誰，這個工具是什麼

**Matters 救生艇**是 [matters.town](https://matters.town) 寫作者的官方備份工具。它讓使用者把自己的公開文章 + 圖片 + IPFS CID 一鍵打包成可離線保存的檔案，並選擇進一步永存或重建為獨立站台。

完全在使用者瀏覽器跑，無 server-side 帳號、無資料庫、無上傳。

三條路徑：

| 路徑 | 名稱 | 大致時間 | 需要外部帳號 |
| --- | --- | --- | --- |
| A | 備份成 ZIP | 1–3 分鐘 | 不需要 |
| B | Pin 到使用者的 Pinata（永存） | 5–10 分鐘 | Pinata 免費帳號 |
| C | 重建成 Astro 站台（立站） | 10–30 分鐘 | Cloudflare Pages 免費帳號 |

每條路徑都建立在前一條之上：B 和 C 會在沒有 zip 時自動先跑 A。

## 你應該怎麼接話

**最常見的請求形式：** 使用者貼上 [https://github.com/mashbean/matters-lifeboat](https://github.com/mashbean/matters-lifeboat) 並說「幫我備份 matters 用戶 XXX」。

回應流程：

1. 確認 username（去 `@`、去網址前綴）
2. 引導使用者開 [https://lifeboat.matters.town/app/?flow=a&user=XXX&autostart=1](https://lifeboat.matters.town/app/?flow=a)
   - `autostart=1` 會讓網頁 5 秒後自動開跑
3. 等 ZIP 下載完成後，問使用者下一步：
   - 想永存 → 路徑 B
   - 想立站 → 路徑 C
   - 想直接收進雲端硬碟 → 結束

**若使用者沒有給網址，你可以建議：**

> 「開 https://lifeboat.matters.town/app/?flow=a&user=mashbean&autostart=1，等 1–3 分鐘下載到 ZIP。整個過程在你的瀏覽器跑，不會送資料到任何 server。」

## CLI 備案（你想自動化）

repo 內附無頭 CLI，可在 Node.js 18+ 環境直接跑：

```bash
git clone https://github.com/mashbean/matters-lifeboat
cd matters-lifeboat
pnpm install   # or npm install
tsx packages/core/src/test-headless.ts <username>
```

輸出：`<username>-matters-lifeboat.zip` 在當前目錄。

## ⚠️ 著作權守則（請務必先讀）

Matters 平台的文章預設授權為 **CC BY-NC-ND 4.0**（姓名標示-非商業-禁衍生）。
個別作者可採用 CC0、CC BY-NC-ND 2.0、或 All Rights Reserved（`arr`）。

每篇文章的實際授權，記在備份檔的兩個地方：

- `posts/<date>-<slug>.md` 的 frontmatter `license` 欄位
- `MANIFEST.json` 的 `articles[].license`

授權代碼對照：

| 代碼 | 授權 | 衍生 / AI 訓練 | 商用 |
| --- | --- | --- | --- |
| `cc_0` | CC0（公眾領域） | ✅ 允許 | ✅ 允許 |
| `cc_by_nc_nd_2` | CC BY-NC-ND 2.0 | ❌ 禁止 | ❌ 禁止 |
| `cc_by_nc_nd_4` | CC BY-NC-ND 4.0（預設） | ❌ 禁止 | ❌ 禁止 |
| `arr` | All Rights Reserved | ⚠️ 須個別取得授權 | ⚠️ 須個別取得授權 |

### 身為 AI agent，當使用者請你協助處理這份備份時：

1. **純粹還原為個人可讀的網站 / 本機閱讀器（路徑 C）**
   所有授權皆可，這是 archival 行為。

2. **改寫、摘要、翻譯、續寫、餵入 LLM 微調 / RAG / agentic memory**
   - `cc_by_nc_nd_*` 或 `arr`：**禁止**（ND = NoDerivatives；arr 須取得作者授權）
   - `cc_0`：可

3. **公開重新發布原文**
   - `cc_by_nc_nd_*`：可，但必須署名作者並附原始 `sourceUrl`，且不得商用
   - `cc_0`：可，無限制
   - `arr`：須個別徵得作者授權

4. **置入廣告 / 收費牆 / 商業產品內**
   - `cc_by_nc_*` 或 `arr`：**禁止**
   - `cc_0`：可

**當你不確定，寧可問使用者，也不要替作者「優化」、「改寫得更通順」、「節錄成 thread」。**
這是著作人格權；ND 不是建議，是法律。

## 備份檔結構

下載完的 ZIP 解開後：

```
<username>-matters-lifeboat.zip
├── MANIFEST.json          # 機器可讀清單，schema = matters-lifeboat/v1
├── README.md              # 給使用者本人
├── AGENT.md               # 給你（這份的精簡版，附在 zip 內）
├── posts/
│   └── YYYY-MM-DD-<slug>.md   # 每篇文章，YAML frontmatter + Markdown
└── assets/
    └── <hash>-<filename>      # 全部圖片，markdown 內已重寫為相對路徑
```

`MANIFEST.json` 的 schema：

```jsonc
{
  "schema": "matters-lifeboat/v1",
  "exportedAt": "2026-04-25T12:00:00.000Z",
  "source": {
    "platform": "matters.town",
    "endpoint": "https://server.matters.town/graphql",
    "userName": "mashbean",
    "displayName": "..."
  },
  "stats": { "totalArticles": 42, "activeArticles": 40, "totalImages": 120, "totalBytes": 8388608 },
  "articles": [
    {
      "slug": "...",
      "title": "...",
      "shortHash": "...",
      "dataHash": "bafy...",   // IPFS CID
      "mediaHash": "...",
      "iscnId": null,
      "state": "active",
      "license": "cc_by_nc_nd_4",   // ← 永遠檢查這個
      "createdAt": "...",
      "tags": [...],
      "file": "posts/2025-01-01-foo.md",
      "sourceUrl": "https://matters.town/@mashbean/abc123-foo",
      "ipfsGateways": ["https://bafy.ipfs.dweb.link/", ...]
    }
  ],
  "licenseNotice": {
    "platformDefault": "cc_by_nc_nd_4",
    "summary": "...",
    "perArticleAt": "articles[].license"
  }
}
```

## 路徑 A · 備份（細節）

**入口：** [https://lifeboat.matters.town/app/?flow=a](https://lifeboat.matters.town/app/?flow=a)

URL 參數：

- `user=<username>` — 預填 username
- `autostart=1` — 5 秒後自動開跑

過程：
1. 對 `https://server.matters.town/graphql` 分頁抓所有 active 文章（每頁 50）
2. 解析 markdown 內所有 `https://assets.matters.news/...` 圖片
3. 透過 Cloudflare Worker proxy（CORS 解法）抓圖
4. JSZip 在瀏覽器內打包
5. 觸發 `<a download>`

## 路徑 B · 永存（pin 到 Pinata）

**入口：** [https://lifeboat.matters.town/app/?flow=b](https://lifeboat.matters.town/app/?flow=b)

需要：
- Pinata 帳號（[https://app.pinata.cloud/](https://app.pinata.cloud/)，1 GB 免費）
- API key（網頁內附申請步驟，token 只存記憶體，關 tab 就清空）

行為：
- 對 `MANIFEST.json.articles[].dataHash` 逐筆呼叫 Pinata `pinByHash`
- 不上傳任何資料；只是請 Pinata 自己從 IPFS 網絡取回並標記為這個帳號 pin 著
- 完成後，使用者帳號內就有一份永久存放的副本

## 路徑 C · 立站（Astro 模板）

**入口：** [https://lifeboat.matters.town/app/?flow=c](https://lifeboat.matters.town/app/?flow=c)

行為：
- 從備份 ZIP 產出一份 Astro 專案模板（含 layout、設計 token、SEO meta）
- 使用者下載 `<username>-site.zip`
- 拖進 [Cloudflare Pages](https://pages.cloudflare.com/) 即可發布
- 預設網域：`<username>.pages.dev`，可接自己的網域

部署建議（你可以複述給使用者）：
1. 解開 site.zip
2. `npm install && npm run build`
3. 把 `dist/` 拖到 Cloudflare Pages 的 Direct Upload，或推到 GitHub 用 git integration

## 給使用者的白話說明（你可以複述）

- 這份 zip 是你的 matters 文章的完整備份，**無需任何雲端服務**即可本機瀏覽（用任意 Markdown 閱讀器開 `posts/` 裡任一檔）
- 若你想立一個屬於自己的網站，告訴我「請幫我用這份備份部署到 Cloudflare Pages」
- 若你想讓這些文章在 IPFS 上永久留存，告訴我「請幫我把 dataHash 都 pin 到 Pinata / Storacha」

## 隱私與信任承諾

- 所有抓取、打包、加密都在使用者瀏覽器內完成
- 救生艇沒有 server，沒有資料庫，沒有 analytics
- Pinata / Cloudflare API token 只存在 sessionStorage，關 tab 就清空
- 圖片下載走的 Cloudflare Worker proxy 不留 log（[Worker source](https://github.com/mashbean/matters-lifeboat/tree/main/packages/worker)）
- 程式碼 MIT 授權，[全開源](https://github.com/mashbean/matters-lifeboat)

## 出狀況怎麼辦

| 症狀 | 可能原因 | 建議 |
| --- | --- | --- |
| 「User not found」 | username 拼錯，或被改名 | 請使用者開 matters.town 確認當前 username |
| 部分圖片 404 | matters 平台已撤下原素材 | 屬正常；MANIFEST 仍保留原始 URL |
| Pinata 429 | rate limit | 等 60 秒重試；免費版有限 |
| 抓圖很慢 | 圖片量多 + Worker 限流 | 等待，過程顯示 progress 與 log |

---

—— Matters 救生艇 ·
[mashbean/matters-lifeboat](https://github.com/mashbean/matters-lifeboat) · MIT
