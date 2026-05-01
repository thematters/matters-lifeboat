# AGENT.md — Matters 救生艇 AI Agent 操作手冊

> 給 Claude / ChatGPT / Cursor / 任何代為操作的 AI agent。
> 使用者請你協助備份、保存或重建一份 matters.town 文章時，這份手冊就是你的工作說明書。

## 你是誰，這個工具是什麼

**Matters 救生艇**是 [matters.town](https://matters.town) 寫作者的開源備份工具。
它可以把公開文章、圖片、授權資訊、原始連結和 IPFS 文章地址打包成一份可離線保存的 ZIP，也能進一步上傳到 Pinata，或做成可部署到 Cloudflare 的靜態網站。

使用者不需要 Matters 登入。
打包在瀏覽器裡完成；Lifeboat 沒有保存文章或 Pinata 門票的資料庫。

首頁只有三個主流程，另有一個輔助入口：

| 流程 | 名稱 | 大致時間 | 需要外部帳號 |
| --- | --- | --- | --- |
| A | 下載完整備份 ZIP | 1–5 分鐘 | 不需要 |
| B | 上傳文章地址頁與 ZIP 到 Pinata | 5–10 分鐘 | Pinata 免費帳號 |
| C | 產出純靜態網站 | 5–10 分鐘 | Cloudflare 免費帳號 |
| 補充 | 文章地址簿 | 1 分鐘 | 不需要 |

文章地址簿不是完整備份；它只保存既有 Matters 文章連結和 IPFS 連結。
B 和 C 會在沒有 ZIP 時自動先跑 A。

## 你應該怎麼接話

**最常見的請求形式：** 使用者貼上 [https://github.com/thematters/matters-lifeboat](https://github.com/thematters/matters-lifeboat) 並說「幫我備份 matters 用戶 XXX」。

回應流程：

1. 確認 username，接受 `@mashbean`、`mashbean` 或整條 Matters 個人頁網址。
2. 引導使用者開：
   `https://lifeboat.matters.town/app/?flow=a&user=XXX&autostart=1`
3. 等 ZIP 下載完成後，問使用者下一步：
   - 只想先收文章地址 → 文章地址簿
   - 想多放一份到線上保存空間 → 流程 B
   - 想做成自己的文章網站 → 流程 C
   - 只想存在電腦或雲端硬碟 → 結束

**你可以直接這樣對使用者說：**

> 開 https://lifeboat.matters.town/app/?flow=a&user=你的帳號&autostart=1，等網頁打包完成後下載 ZIP。整個過程在你的瀏覽器裡進行；Lifeboat 不保存你的文章。

## CLI 備案

repo 內附無頭測試與打包工具，可在 Node.js 18+ 環境直接跑：

```bash
git clone https://github.com/thematters/matters-lifeboat.git
cd matters-lifeboat
npm install
npx tsx packages/core/src/test-headless.ts <username>
```

輸出：`<username>-matters-lifeboat.zip` 在當前目錄。

## 著作權守則

Matters 平台的文章預設授權為 **CC BY-NC-ND 4.0**（姓名標示-非商業-禁衍生）。
個別作者可採用 CC0、CC BY-NC-ND 2.0、或 All Rights Reserved（`arr`）。

每篇文章的實際授權，記在備份檔的兩個地方：

- `posts/<date>-<shortHash>.md` 的 frontmatter `license` 欄位
- `MANIFEST.json` 的 `articles[].license`

授權代碼對照：

| 代碼 | 授權 | 衍生 / AI 訓練 | 商用 |
| --- | --- | --- | --- |
| `cc_0` | CC0（公眾領域） | 允許 | 允許 |
| `cc_by_nc_nd_2` | CC BY-NC-ND 2.0 | 禁止 | 禁止 |
| `cc_by_nc_nd_4` | CC BY-NC-ND 4.0（預設） | 禁止 | 禁止 |
| `arr` | All Rights Reserved | 須個別取得授權 | 須個別取得授權 |

身為 AI agent，當使用者請你處理備份時：

1. **純粹還原為個人可讀的網站 / 本機閱讀器**
   所有授權皆可，這是 archival 行為。

2. **改寫、摘要、翻譯、續寫、餵入 LLM 微調 / RAG / agentic memory**
   - `cc_by_nc_nd_*` 或 `arr`：禁止
   - `cc_0`：可

3. **公開重新發布原文**
   - `cc_by_nc_nd_*`：可，但必須署名作者並附原始 `sourceUrl`，且不得商用
   - `cc_0`：可，無限制
   - `arr`：須個別徵得作者授權

4. **置入廣告 / 收費牆 / 商業產品內**
   - `cc_by_nc_*` 或 `arr`：禁止
   - `cc_0`：可

當你不確定，寧可問使用者，也不要替作者「優化」、「改寫得更通順」或「節錄成 thread」。
ND 不是建議，是法律限制。

## 備份檔結構

下載完的 ZIP 解開後：

```text
<username>-matters-lifeboat.zip
├── MANIFEST.json          # 機器可讀清單，schema = matters-lifeboat/v1
├── README.md              # 給使用者本人
├── AGENT.md               # 給 AI agent 的後續操作指引
├── posts/
│   └── YYYY-MM-DD-<shortHash>.md   # 每篇文章，YAML frontmatter + Markdown
└── assets/
    └── <hash>-<filename>  # 全部圖片，Markdown 內已重寫為相對路徑
```

`MANIFEST.json` 的重點欄位：

```jsonc
{
  "schema": "matters-lifeboat/v1",
  "exportedAt": "2026-05-01T12:00:00.000Z",
  "source": {
    "platform": "matters.town",
    "endpoint": "https://server.matters.town/graphql",
    "userName": "example",
    "displayName": "..."
  },
  "articles": [
    {
      "title": "...",
      "shortHash": "...",
      "dataHash": "bafy...",          // IPFS 文章地址
      "license": "cc_by_nc_nd_4",     // 永遠檢查這個
      "file": "posts/2025-01-01-abc123.md",
      "sourceUrl": "https://matters.town/@example/abc123-foo",
      "ipfsGateways": ["https://bafy.ipfs.dweb.link/"]
    }
  ]
}
```

## 流程 A · 下載完整備份

入口：<https://lifeboat.matters.town/app/?flow=a>

URL 參數：

- `user=<username>`：預填 username
- `autostart=1`：5 秒後自動開跑

過程：

1. 對公開 GraphQL API 分頁抓取 active 文章。
2. 解析 Markdown 內所有圖片。
3. 透過 Cloudflare Worker proxy 解決瀏覽器 CORS 限制。
4. JSZip 在瀏覽器內打包。
5. 觸發下載。

## 補充入口 · 文章地址簿

入口：<https://lifeboat.matters.town/app/?flow=d>

適合：

- 使用者還不想下載完整文章與圖片。
- 使用者只想先保存每篇文章的 Matters 原文連結、IPFS 地址和 gateway 連結。
- 使用者想先拿到一份很小、可分享、可交給 agent 讀的索引。

輸出：

- `index.html`：人類可讀、可分享的文章地址頁
- `address-book.json`：agent / 程式可讀
- `address-book.csv`：試算表可讀

## 流程 B · 上傳到 Pinata

入口：<https://lifeboat.matters.town/app/?flow=b>

需要：

- Pinata 帳號：<https://app.pinata.cloud/>
- 一張 Pinata 臨時門票，也就是 JWT。網頁內會帶使用者一步一步建立。

預設行為：

- 先產生一張可分享的文章地址頁。
- 上傳文章地址頁到使用者自己的 Pinata。
- 再上傳完整 `backup.zip` 到同一個 Pinata。
- 完成頁會列出兩個 gateway URL：一個方便分享，一個是完整備份。

提醒：

- 免費 Pinata 帳號可以走「上傳檔案」路徑。
- `pinByHash` 不是預設流程，因為部分免費帳號會回 `PAID_FEATURE_ONLY`。
- JWT 只存在瀏覽器分頁內；關掉分頁就清掉。用完也可以回 Pinata 刪除 API key。

## 流程 C · 蓋一個自己的站

入口：<https://lifeboat.matters.town/app/?flow=c>

行為：

- 從備份 ZIP 產出一份純 HTML/CSS 靜態網站。
- 使用者下載 `<username>-site.zip`。
- 解壓縮後把整個資料夾拖進 Cloudflare Workers & Pages 的 **Upload your static files**。
- 看到檔案清單後按 **Deploy**。

部署時請提醒使用者：

1. 解開 site.zip。
2. 確認根目錄有 `index.html`、`style.css`、`posts/`、`assets/`。
3. 選 Cloudflare 的 **Upload your static files**，不要選 GitHub/build 流程。
4. 把整個解開後的資料夾拖上去。
5. 看到檔案清單後按 **Deploy**。

## 給使用者的白話說明

- 這份 ZIP 是你的 Matters 文章完整備份；不用任何雲端服務也可以本機閱讀。
- 如果你只想先保存文章在哪裡，請走「文章地址簿」。
- 如果你想多放一份到線上保存空間，請走 Pinata。
- 如果你想做一個自己的文章網站，請走 Cloudflare 靜態網站流程。

## 隱私與信任承諾

- 所有文章整理與打包都在使用者瀏覽器內完成。
- Lifeboat 沒有保存文章、圖片或 Pinata JWT 的資料庫。
- Cloudflare Worker 只做 CORS 轉送，不保存內容。
- Pinata / Cloudflare API token 只存在當前分頁；關掉就清空。
- 程式碼 MIT 授權，開源在 [thematters/matters-lifeboat](https://github.com/thematters/matters-lifeboat)。

## 出狀況怎麼辦

| 症狀 | 可能原因 | 建議 |
| --- | --- | --- |
| 找不到使用者 | username 拼錯，或被改名 | 請使用者開 matters.town 確認當前 username |
| 部分圖片下載失敗 | Matters 平台已撤下原素材 | 屬正常；MANIFEST 仍保留原始 URL |
| Pinata 說門票無效 | JWT 複製不完整或權限不對 | 回 Pinata 重建一張，Files 權限選 Read + Write |
| Pinata 額度不夠 | 備份 ZIP 太大 | 先保存文章地址頁，ZIP 留在本機或換付費/其他保存空間 |
| Cloudflare 問 build command | 選到 GitHub/build 流程 | 回上一頁，選 Upload your static files |
| 打包很慢 | 文章或圖片很多 | 等待進度條；不要關閉分頁 |

---

Matters 救生艇 · [thematters/matters-lifeboat](https://github.com/thematters/matters-lifeboat) · MIT
