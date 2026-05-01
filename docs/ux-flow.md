# Matters 救生艇 (matters-lifeboat) — UX 流程規格

> 版本：v0.2（2026-05-01 實測後收斂）
> 適用讀者：前端實作 agent、設計 reviewer、Matters 維護者
> 設計語氣：**數位自主權 / 備份是好習慣**；不恐嚇、不渲染平台焦慮；正面 empowerment。

---

## 0.1 2026-05-01 實測後決策

以下決策覆蓋本文後面仍保留的早期探索段落：

- 首頁只保留三個主流程：`A 備份 ZIP`、`B Pinata 文章地址頁 + ZIP`、`C Cloudflare 靜態站`。
- `文章地址簿` 保留為補充入口，不再作為同級第四張主卡片。
- Pinata 不再預設 `pinByHash`；實測免費帳號會回 `PAID_FEATURE_ONLY`。預設改成上傳可分享的 HTML 文章地址頁與完整 ZIP。
- Cloudflare 不需要 GitHub。預設只教 `Workers & Pages -> Create application -> Upload your static files -> Deploy`。
- 面向非技術使用者時，`CID` 解釋為「文章在 IPFS 上的地址 / 指紋」，`JWT` 解釋為「臨時門票」。

## 0. 設計總原則

1. **漸進揭露（progressive disclosure）**：首頁只給三個主選擇；文章地址簿放在主流程下方，作為「還不想完整備份」的輕量入口。
2. **默認可用（default-safe）**：所有進階欄位都有合理預設值、都可略過。
3. **可逆（undoable）**：任何寫入動作（re-pin、公開部署）前都要 dry-run preview。
4. **AI-agent friendly**：每一個 state 都有對應的 deterministic URL + JSON 狀態回報端點。
5. **token 0-storage**：API token 僅存 sessionStorage，不進 localStorage、不送 server、tab 關閉即消失。UI 明確告知。
6. **時間透明**：每個長任務都預告「預估 X 分鐘」與即時進度（已處理 N / 總數 M）。

---

## 1. Landing Page 結構

網域：`lifeboat.matters.town`。
技術：純靜態 HTML/CSS/JS。中英雙語（預設依 `navigator.language`，可切換）。

### 1.1 Hero Section

| 元素 | 繁中 | English |
|---|---|---|
| H1 | 你的文字，你自己收著 | Your writing, in your own hands |
| 子標 | 下載完整 ZIP、存到 Pinata，或蓋一個自己的網站；還不想完整備份時，也可以先保存文章地址簿。 | Download a full ZIP, store it on Pinata, or publish your own static site; you can also save an article address book first. |
| 主 CTA | 開始備份 → | Start Backup → |
| 次 CTA | 看看它怎麼運作（30 秒影片） | See how it works (30s) |
| 視覺重點 | 一個半透明「救生艇」SVG 漂浮在海面上，下方是排列成浪的文章卡片剪影；**不畫沈船**。 | Same. |

設計 token：主色 `color.brand.green.500`（取自 thematters/design-system），hero 背景 `color.grey.50`。

### 1.2 三個主流程 + 一個輔助入口

三張主卡片，桌面一列三欄、手機單欄。每張卡片包含：圖示、標題、一句話描述、技能需求標籤、主 CTA。

**A. 備份 Backup**
- Icon：下載雲
- 描述：把你的文章打包成 ZIP，馬上下載。
- 技能：🟢 零門檻 / No setup
- CTA：「我只想要 ZIP」／"Just give me the ZIP"

**B. 保存 Preserve**
- Icon：錨
- 描述：上傳一張可分享的文章地址頁，再上傳完整 backup.zip 到自己的 Pinata public IPFS。
- 技能：🟡 需要 Pinata 免費帳號（5 分鐘申請）
- CTA：「上傳到 Pinata」／"Upload to Pinata"

**C. 架站 Publish**
- Icon：小房子
- 描述：產出純 HTML/CSS 靜態網站包；Cloudflare 選 Upload your static files、拖上去後按 Deploy。
- 技能：🟠 需要 Cloudflare Pages 免費帳號（會帶你走完 Direct Upload）
- CTA：「我要擁有自己的網站」／"I'll have my own archive site"

**補充：文章地址簿**
- 位置：三張主卡下方，使用較輕的提示框，不與主流程同級。
- 描述：不下載完整文章與圖片，只整理每篇文章的 Matters 連結、IPFS CID 與 gateway 連結。
- CTA：「保存文章地址簿」。

### 1.3 Why Section — 「為什麼要備份？」

**不用恐嚇語氣**。三個正面 bullet：

- **備份是好習慣**：你 Google Docs 會備份、Notion 會匯出，Matters 也該有一份在手上。
- **文章地址在你手上**：你的每一篇文章都有一個內容地址（CID），這是去中心化的好處；救生艇幫你把地址整理成一份可攜的檔案。
- **你的作品，可以長去任何地方**：備份完之後，要搬到 Mirror、要做成網站、要印成書，都是你的事——不是平台的事。

### 1.4 Trust Section

| 元素 | 繁中 | English |
|---|---|---|
| 小標 | 為什麼你可以放心用這個工具 | Why this is safe |
| Bullet 1 | 全部在你的瀏覽器跑，沒有後端儲存你的資料 | Runs 100% in your browser. No server stores your data. |
| Bullet 2 | API token 只在這個分頁的記憶體裡，關掉就沒了 | Your API tokens live only in this tab's memory. Closing the tab wipes them. |
| Bullet 3 | 開源在 GitHub，任何人可以檢查我們有沒有說謊 | Open source on GitHub — audit the code yourself. |
| Bullet 4 | Matters 開源工具，但不需要 Matters 登入或 session | Made by Matters, but doesn't require a Matters login or session. |

### 1.5 FAQ Section（accordion，預設關）

8 題：
1. 這是開源工具嗎？
2. 我要付錢嗎？
3. 我不懂 IPFS，我用 A 流程就夠嗎？
4. Pinata 的 JWT 是什麼？會不會很危險？
5. Cloudflare 我完全沒用過可以嗎？
6. 我的 token 會被你們看到嗎？
7. 如果我有 500 篇文章會跑很久嗎？
8. Matters 會不會因此把我 ban 掉？（答：不會，我們只用公開 API。）

### 1.6 Footer
- GitHub repo 連結（大）
- Matters 官方連結（小）
- 授權：MIT
- 「Made with 🌱 by Matters community」

---

## 2. App 流程 Step-by-Step Screens

**共用 layout**：左側 stepper（0=2 步 / A=3 步 / B=4 步 / C=4 步）、中央主內容、右側即時 log（可收合，for AI agent 與 power user）。

**URL schema**（for AI agent 深連結）：
```
/app/a/input                    # 輸入 username
/app/a/preview?u=mashbean       # 預覽文章清單
/app/a/done?u=mashbean&id=xxx   # 下載完成

/app/d/input                    # 輸入 username
/app/d/done?u=mashbean          # 文章地址簿完成

/app/b/input
/app/b/token
/app/b/confirm
/app/b/done

/app/c/input
/app/c/download
/app/c/cloudflare-guide
/app/c/done
```

所有 state 都可透過 `?state=<json>` query param 注入（for Claude agent 復原流程）。

---

### 2.A. 流程 A：備份（3 screens）

#### A-1 輸入 username

- **目的**：收 Matters username，驗證帳號存在、文章數 > 0。
- **必填**：`@username`（可接受貼整條 URL `matters.town/@mashbean`，自動擷取）
- **選填**：折疊的「進階」區塊（是否包圖片？是否包 HTML？是否包 drafts？預設：包圖片、包 HTML、不包 drafts）
- **主 CTA**：「查看我的文章」
- **次要動作**：「我是 AI agent，用 CLI 模式」→ 跳 `/app/a/cli-hint`
- **Loading**：GraphQL 查 `userByName` + `articlesConnection.totalCount`，顯示骨架卡。
- **錯誤**：
  - username 不存在 → 「找不到 @xxx 這個使用者。要不要檢查一下拼字？」＋ 一個「你是不是忘了 @ 之後接帳號」的 tooltip
  - 文章數 = 0 → 「這個帳號目前沒有公開文章可以備份。如果你剛發了草稿，它不會在這裡出現。」
  - 網路錯誤 → 「連不上 Matters。可能是 matters.town 暫時忙線，過 30 秒再試試？」+ retry button
- **預估時間**：「下一步大概 3 秒」

#### A-2 預覽文章清單

- **目的**：讓使用者看到「我確實要備份這些」，增加信心與控制感。
- **內容**：
  - 顯示「@mashbean 共 143 篇文章，總 media 約 67 MB」
  - 虛擬捲動列表：每篇顯示標題、發表日期、字數、是否有封面圖、`dataHash` 前 8 碼
  - 每篇可勾選（預設全選）、右上角「全選 / 全不選」
  - Sidebar：格式選項（✅ Markdown、✅ 圖片、✅ IPFS CID manifest、□ HTML、□ 原始 JSON）
- **主 CTA**：「打包下載 ZIP（預估 2 分鐘）」
- **次要動作**：「複製一份 CID 清單到剪貼簿」（for power user）
- **Loading**（打包中）：
  - Progress bar + 「正在處理第 N / 143 篇」
  - 顯示目前正在下載的那一篇標題（讓人感覺在動）
  - 「這份下載不會送到任何伺服器，全部在你的瀏覽器跑」小字提醒
- **錯誤**：
  - 某幾張圖下載失敗 → 不擋流程，結尾給一份 `missing-assets.txt`
  - 瀏覽器記憶體爆 → 「文章很多，建議分批下載；已幫你切成 2 批」＋ batch mode
- **空狀態**：不會到這裡（A-1 已擋）

#### A-3 完成

- **目的**：給使用者成就感 + 指路下一步。
- **內容**：
  - 勾勾動畫（不要太誇張，1.5 秒）
  - 「你備份了 143 篇文章、286 張圖、一份 CID 清單」
  - ZIP 下載已觸發（若瀏覽器擋了有一個大的 Re-download 按鈕）
  - 一份 **Handoff 指南**（見 §5）線上版 + 塞進 ZIP 的 `README.md`
- **主 CTA**：「要不要也把它存到自己的 Pinata/IPFS？」→ 無縫接 B 流程（username 已帶入）
- **次要動作**：「做成一個網站」→ 接 C 流程；「再見，謝謝」→ 回 landing

---

### 2.B. 流程 B：保存（4 screens）

#### B-1 輸入 username
同 A-1。

#### B-2 準備 Pinata 臨時門票

- **目的**：把 Pinata API Key 流程拆成幼幼班步驟。
- **內容**：
  - 打開 Pinata → API Keys → New Key。
  - 名字填 `matters-lifeboat`。
  - Files 勾 Read + Write。
  - 複製那串很長、開頭像 `eyJ` 的 JWT。
- **主 CTA**：「我拿到臨時門票了」
- **次要動作**：「我只是想先下載 ZIP」→ 回 A 流程

#### B-3 貼 Pinata JWT

- **目的**：收 token，**最大化信任**。
- **內容**：
  - 一個大的 monospace textarea（paste-friendly）
  - Token input 上方一個顯眼 callout：「🔒 這個 token 只會存在這個分頁的記憶體。你關掉這個 tab 它就消失了。我們沒有後端，就算想偷也偷不到。」
  - 連結：「怎麼拿到 Pinata JWT？」→ side-panel 教學（截圖步驟）
  - 「測試這張門票」按鈕（呼叫 Pinata endpoint 驗證權限）
- **主 CTA**：「確認 token 沒問題，下一步」（testing 通過才 enable）
- **錯誤**：
  - token 格式錯 → 「這看起來不像 Pinata JWT。它通常是一長串、開頭像 `eyJ`。」
  - 401 → 「Pinata 說這張門票無效。可能複製少了一段，重新複製一次就好。」
  - 403 權限不足 → 「這張門票不能上傳檔案。回 Pinata 重新做一張，Files 要勾 Read + Write。」
  - 額度不夠 → 「你有 143 篇需要約 67 MB，但你的帳戶剩 50 MB。要不要先升級，或勾掉一些大檔？」
- **預估時間**：測試 token「大概 2 秒」

#### B-4 Dry-run 確認

- **目的**：**最重要的一步**——在真的花配額前，讓使用者看見「我要上傳什麼」。
- **內容**：
  - 「即將上傳 2 個檔案：可分享的文章地址頁、完整 backup.zip」
  - 可展開的 CID 清單 + 預估容量。
  - 「文章地址頁是給人看的，backup.zip 是完整保存用。」
  - checkbox：「我懂，這個動作會寫入我的 IPFS 帳號，不可逆」（明確 informed consent）
  - dry-run 按鈕：「只測試 Pinata 門票」
- **主 CTA**：「確認，上傳文章地址頁與 ZIP」
- **次要動作**：「回去改選項」

#### B-5 上傳中 & 完成

- **Loading**：
  - 進度條 + 即時「正在上傳文章地址頁 / 正在上傳 backup.zip」
  - 預估剩餘時間（檔案大時要老實告知）
  - 可最小化到 browser tab title：`(47/143) Matters Lifeboat`
  - 「中途關掉 tab 會怎樣？」tooltip：「已經上傳成功的不會消失，未完成的會中斷。」
- **錯誤**：
  - 文章地址頁上傳成功、ZIP 失敗 → 保留文章地址頁連結，提示可重試 ZIP。
  - 配額中途爆掉 → 暫停 + 「文章地址頁已成功。ZIP 太大，Pinata 免費額度可能不夠。」
- **成功狀態**：
  - 勾勾動畫 + 「你的文章地址頁可以分享了。完整 ZIP 也已經放到你的 Pinata。」
  - 顯示文章地址頁 gateway 連結與 ZIP gateway 連結。
  - Handoff 指南（見 §5）

---

### 2.C. 流程 C：架站（4 screens）

#### C-1 輸入 username
同 A-1，但額外預覽「你的網站長這樣」靜態 preview。

#### C-2 下載靜態網站包

- **目的**：先在本機產生可直接上傳的網站資料夾，讓使用者不用碰 build 或 GitHub。
- **內容**：
  - 顯示網站預覽與即將下載的 `site.zip`。
  - 提醒「下載後請先解壓縮，Cloudflare 要拖整個資料夾，不是拖 zip」。
  - 如果使用者看到 Cloudflare 要 build command，代表走錯入口；請回到 Upload your static files。
- **主 CTA**：「下載網站包」
- **次要動作**：「我只想要完整備份 ZIP」→ 回 A 流程

#### C-3 Cloudflare Direct Upload

- **目的**：逐步帶使用者完成 Cloudflare 最容易漏掉的 deploy 步驟。
- **內容**：
  1. 打開 Cloudflare → Workers & Pages。
  2. 按 Create application。
  3. 選 Pages。
  4. 選 Upload your static files，不選 GitHub。
  5. 專案名稱填 `<username>-archive`。
  6. 把解壓縮後的整個資料夾拖進去。
  7. 看到檔案清單後，按 **Deploy**。
  8. 打開 Cloudflare 給你的 `pages.dev` 網址。
- **主 CTA**：「打開 Cloudflare Pages」
- **錯誤**：
  - 看到 Build command 欄位 → 「你選到 GitHub / build 流程了，請回上一頁選 Upload your static files。」
  - 找不到 Deploy → 「先確認檔案清單有出現；Cloudflare 會在右下或頁面底部顯示 Deploy。」

#### C-4 完成

- **內容**：
  - 「你的網站活了：`https://<username>-archive.pages.dev`」
  - 一個 `open in new tab` 按鈕。
  - Handoff 指南：「下次怎麼更新文章？」「怎麼把網址分享出去？」「怎麼綁自己的網域？」（見 §5）
- **主 CTA**：「打開我的網站」
- **次要動作**：「分享到 Matters 通知朋友」（預填推文）

---

## 3. 五個最危險的卡關時刻 & 設計對策

| # | 時刻 | 一般用戶會怎樣 | 設計對策 |
|---|---|---|---|
| 1 | **A-1 輸入 username**：不確定要貼 `@mashbean` 還是 `mashbean` 還是整條 URL | 輸入錯、按下去、看到錯誤、放棄 | 接受所有格式、auto-strip `@` 與 `https://matters.town/`、input 下面 placeholder 寫「支援 @mashbean、mashbean、或整條網址」；錯誤訊息不說「格式錯」而說「找不到這個使用者，要不要檢查拼字」 |
| 2 | **B-3 貼 token**：不知道 token 安不安全、會不會被偷 | 猶豫、關 tab | Token input 上方固定放一個綠色信任卡（見 B-3）；「測試 token」按鈕給即時回饋；文案強調 sessionStorage 與開源可檢查 |
| 3 | **B-4 確認上傳**：不懂「文章地址頁」和 `backup.zip` 差在哪裡 | 點了取消 | 明確說文章地址頁是給人看的分享頁，ZIP 是完整保存；兩個檔案分開列出容量與用途 |
| 4 | **C-3 Cloudflare Direct Upload**：選到 GitHub / build 流程 | 找不到 Deploy、被 build command 卡住 | 步驟只寫 Upload your static files；旁邊放錯路提示：「看到 build command 就回上一頁」 |
| 5 | **C-3 Deploy 按鈕**：檔案拖上去後沒有按 Deploy | 以為已完成但網站沒出現 | 把「看到檔案清單後，按 Deploy」做成獨立步驟與粗體按鈕文案 |

---

## 4. AI Agent 使用者專屬入口

### 4.1 機器可讀 URL schema

所有流程支援 query param 注入狀態：

```
/app/a/input?u=mashbean&autostart=1
/app/d/input?u=mashbean&autostart=1
/app/b/token?provider=pinata&token=<redacted>&autostart=1
/app/c/download?u=mashbean&autostart=1
```

`autostart=1` 時，畫面顯示一個 5 秒 countdown「AI agent 要求自動執行，5 秒後開始，要暫停按這裡」，避免 agent 偷跑使用者不知情。

### 4.2 JSON 狀態端點

每個 screen 左下角有 `[ JSON ]` 按鈕，吐出當前 state：

```json
{
  "flow": "B",
  "step": "uploading",
  "username": "mashbean",
  "progress": { "done": 1, "total": 2, "failed": 0 },
  "estimated_remaining_ms": 90000,
  "provider": "pinata",
  "current_file": "backup.zip",
  "last_error": null,
  "resume_url": "https://lifeboat.matters.town/app/?flow=b&job=abc123"
}
```

Agent 可 `fetch()` URL + header `Accept: application/json`，拿到同結構。

### 4.3 CLI fallback

`npx matters-lifeboat` 提供完整 CLI：

```
npx matters-lifeboat backup @mashbean --out ./archive.zip
npx matters-lifeboat address-book @mashbean --out ./article-address-book.zip
npx matters-lifeboat pinata-upload @mashbean --token $TOKEN
npx matters-lifeboat site @mashbean --out ./site.zip
```

所有 CLI 輸出 NDJSON（每行一 event），for agent parsing。退出碼：`0` success / `1` user error / `2` network / `3` quota / `4` auth。

### 4.4 `/ai.txt` 與 `/.well-known/matters-lifeboat.json`

landing 根目錄放一份 agent-friendly 說明：

```
# ai.txt — Matters Lifeboat
This tool helps users export their matters.town content.
Safe for AI agents to invoke on behalf of users with explicit consent.
Primary flows: D (article address book), A (backup), B (Pinata upload), C (Cloudflare static site).
Machine-readable state: append ?format=json to any /app/* URL.
CLI: `npx matters-lifeboat` (outputs NDJSON).
Rate limits: 60 req/min to upstream GraphQL. Tool self-throttles.
```

---

## 5. 每個 Flow 結束後的 Handoff 文件

流程完成時，給使用者一份 **Markdown Handoff Note**（線上版 + 下載版 + 塞進 ZIP）。

### 5.1 A-flow handoff：`README-backup.md`

```
# 你剛備份了什麼？

Hi @mashbean，

這個 ZIP 裡面有：
- /articles/          你的 143 篇文章，每篇一個 .md
- /images/            你文章裡用過的 286 張圖
- /manifest.json      每篇文章的 IPFS 地址（CID）清單
- /README.md          就是你現在在看的這個

## 下次想再備份一次怎麼辦？

最簡單：來這裡重跑一次 https://lifeboat.matters.town
進階：裝 CLI，`npx matters-lifeboat backup @mashbean`

## 我現在有這個 ZIP，可以做什麼？

- 丟進 Google Drive / iCloud：你的備份就在三處（Matters、你電腦、雲端）
- 丟進 Obsidian / Logseq：直接用 Markdown 閱讀與編輯
- 丟進自己的部落格：可把 Markdown 交給熟悉網站製作的人；或走 C 流程產出可直接上傳的 `site.zip`

## 什麼是 CID？

CID（Content Identifier）是你每篇文章在 IPFS 網路上的唯一指紋。
你不需要懂 IPFS 也能用這個 ZIP——但如果以後有興趣，可以走「保存」流程。
```

### 5.2 B-flow handoff：`README-pinned.md`

```
# 你剛把文章地址頁與 backup.zip 放到 Pinata 了

這表示：
- 你有一張可以分享的文章地址頁
- 你也有一份完整 backup.zip 放在自己的 Pinata

## 以後會發生什麼事？

- 不會自動同步新文章。下次你發新文章，想更新就再跑一次救生艇。
- JWT 用完可以回 Pinata 刪掉，之後需要時再做一張新的。
- 如果 ZIP 因為額度太大上傳失敗，文章地址頁仍然可以先分享與保存。

## 怎麼讓其他人看到我的 IPFS 版？

貼這個連結格式：
https://gateway.pinata.cloud/ipfs/<CID>
例如你的第一篇是：
https://gateway.pinata.cloud/ipfs/bafy...

## receipt 檔案是什麼？

完成頁列出的兩個 gateway URL 就是收據：一個給文章地址頁，一個給 backup.zip。
建議和下載檔一起存到雲端。
```

### 5.3 C-flow handoff：`README-site.md`

```
# 你的網站活了

- 網址：https://mashbean-archive.pages.dev
- 部署：Cloudflare Pages Direct Upload
- 備份來源：你剛下載的 `site.zip`

## 下次我在 Matters 發新文章怎麼辦？

（MVP 階段）：回來跑一次救生艇，會幫你 push 新文章到同一個 repo，網站自動重新 build。
（未來）：我們會做 cron 版本，每週自動同步一次。

## 怎麼換 template？

你的 repo 裡有一個 `lifeboat.config.json`，改 `"template": "journal"` 推上去就好。

## 怎麼綁自己的網域？

1. 去 Cloudflare Pages dashboard
2. 點你的 project → Custom domains → Set up a domain
3. 跟著它的步驟（大概 10 分鐘）
我們有一份詳細教學：https://lifeboat.matters.town/docs/custom-domain

## GitHub / CF 授權想撤銷？

- GitHub: Settings → Applications → Authorized OAuth Apps → Matters Lifeboat → Revoke
- Cloudflare: 自動用你自己的帳號，不需要撤銷我們的授權（我們根本沒存）
```

---

## 6. 無障礙 & 響應式注意事項（摘要）

- WCAG 2.1 AA：色彩對比 ≥ 4.5:1、focus ring 明顯、所有按鈕鍵盤可達。
- 行動版：三個 flow 都要能在手機完成 A（備份）；B/C 允許提示「建議在電腦上完成」但不擋。
- Reduced motion：所有勾勾動畫、過場尊重 `prefers-reduced-motion`。
- 語系：繁中（預設）、英文；預留 i18n key，未來加簡中／日文。

---

## 7. 測量埋點建議（privacy-first）

- **完全不送個資、不送 username、不送 token**。
- 只送 aggregate events（Plausible 或 self-hosted Umami）：
  - `flow_started` { flow: A|B|C }
  - `flow_completed` { flow, article_count_bucket: <10|<100|<1000|1000+ }
  - `flow_abandoned` { flow, last_step }
  - `error_shown` { flow, step, error_code }
- 每個埋點都要能拿來驗證第 3 章「5 個危險時刻」的假設。

---

*Spec 結束。Usability test plan 見 `usability-test-plan.md`、文案總表見 `ux-copywriting.md`。*
