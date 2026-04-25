# Matters 救生艇 (matters-lifeboat) — UX 流程規格

> 版本：v0.1（MVP 設計稿，待 usability test 驗證後收斂）
> 適用讀者：前端實作 agent、設計 reviewer、mashbean
> 設計語氣：**數位自主權 / 備份是好習慣**；不恐嚇、不渲染平台焦慮；正面 empowerment。

---

## 0. 設計總原則

1. **漸進揭露（progressive disclosure）**：流程 A → B → C 依難度排列，一般人從 A 開始，不強迫懂 IPFS／GitHub。
2. **默認可用（default-safe）**：所有進階欄位都有合理預設值、都可略過。
3. **可逆（undoable）**：任何寫入動作（re-pin、git push）前都要 dry-run preview。
4. **AI-agent friendly**：每一個 state 都有對應的 deterministic URL + JSON 狀態回報端點。
5. **token 0-storage**：API token 僅存 sessionStorage，不進 localStorage、不送 server、tab 關閉即消失。UI 明確告知。
6. **時間透明**：每個長任務都預告「預估 X 分鐘」與即時進度（已處理 N / 總數 M）。

---

## 1. Landing Page 結構

網域：`matters-lifeboat.pages.dev`（暫定）／未來或 `lifeboat.matters.town`。
技術：Astro static。中英雙語（預設依 `navigator.language`，可切換）。

### 1.1 Hero Section

| 元素 | 繁中 | English |
|---|---|---|
| H1 | 你的文字，你自己收著 | Your writing, in your own hands |
| 子標 | 一鍵備份你在 Matters 上的所有文章、圖片與 IPFS 指紋。免註冊、全在你的瀏覽器裡跑。 | Back up every article, image, and IPFS fingerprint from Matters in one click. No signup. Runs entirely in your browser. |
| 主 CTA | 開始備份 → | Start Backup → |
| 次 CTA | 看看它怎麼運作（30 秒影片） | See how it works (30s) |
| 視覺重點 | 一個半透明「救生艇」SVG 漂浮在海面上，下方是排列成浪的文章卡片剪影；**不畫沈船**。 | Same. |

設計 token：主色 `color.brand.green.500`（取自 thematters/design-system），hero 背景 `color.grey.50`。

### 1.2 三流程卡片（Three Tiers Section）

橫向 3 張卡片，同寬。每張卡片包含：圖示、標題、一句話描述、技能需求標籤、主 CTA。

**A. 備份 Backup**
- Icon：下載雲
- 描述：把你的文章打包成 ZIP，馬上下載。
- 技能：🟢 零門檻 / No setup
- CTA：「我只想要 ZIP」／"Just give me the ZIP"

**B. 永存 Preserve**
- Icon：錨
- 描述：把你文章的 IPFS 指紋 re-pin 到你自己的帳號，Matters 以外也永遠找得到。
- 技能：🟡 需要 Storacha 或 Pinata 免費帳號（5 分鐘申請）
- CTA：「我要自己留一份 IPFS」／"I'll pin to my own IPFS"

**C. 立站 Publish**
- Icon：小房子
- 描述：把你的文章長成一個你自己的網站，Matters 也好、不在也好，它都會在。
- 技能：🟠 需要 GitHub 帳號（會帶你走完每一步）
- CTA：「我要擁有自己的網站」／"I'll have my own archive site"

### 1.3 Why Section — 「為什麼要備份？」

**不用恐嚇語氣**。三個正面 bullet：

- **備份是好習慣**：你 Google Docs 會備份、Notion 會匯出，Matters 也該有一份在手上。
- **IPFS 指紋在你手上**：你的每一篇文章都有一個宇宙唯一的指紋（CID），這是去中心化的好處；救生艇幫你把指紋整理成一份可攜的檔案。
- **你的作品，可以長去任何地方**：備份完之後，要搬到 Mirror、要做成網站、要印成書，都是你的事——不是平台的事。

### 1.4 Trust Section

| 元素 | 繁中 | English |
|---|---|---|
| 小標 | 為什麼你可以放心用這個工具 | Why this is safe |
| Bullet 1 | 全部在你的瀏覽器跑，沒有後端儲存你的資料 | Runs 100% in your browser. No server stores your data. |
| Bullet 2 | API token 只在這個分頁的記憶體裡，關掉就沒了 | Your API tokens live only in this tab's memory. Closing the tab wipes them. |
| Bullet 3 | 開源在 GitHub，任何人可以檢查我們有沒有說謊 | Open source on GitHub — audit the code yourself. |
| Bullet 4 | Matters 官方出品，但不依賴 Matters 伺服器的登入或 session | Made by Matters, but doesn't require a Matters login or session. |

### 1.5 FAQ Section（accordion，預設關）

8 題：
1. 這是官方工具嗎？
2. 我要付錢嗎？
3. 我不懂 IPFS，我用 A 流程就夠嗎？
4. Storacha 跟 Pinata 哪個好？
5. GitHub 我完全沒用過可以嗎？
6. 我的 token 會被你們看到嗎？
7. 如果我有 500 篇文章會跑很久嗎？
8. Matters 會不會因此把我 ban 掉？（答：不會，我們只用公開 API。）

### 1.6 Footer
- GitHub repo 連結（大）
- Matters 官方連結（小）
- 授權：MIT
- 「Made with 🌱 by Matters community」

---

## 2. App 三流程 Step-by-Step Screens

**共用 layout**：左側 3-step stepper（A=3 步 / B=5 步 / C=6 步）、中央主內容、右側即時 log（可收合，for AI agent 與 power user）。

**URL schema**（for AI agent 深連結）：
```
/app/a/input                    # 輸入 username
/app/a/preview?u=mashbean       # 預覽文章清單
/app/a/done?u=mashbean&id=xxx   # 下載完成

/app/b/input
/app/b/provider                 # 選 Storacha / Pinata
/app/b/token
/app/b/confirm
/app/b/pinning
/app/b/done

/app/c/input
/app/c/github-auth
/app/c/repo-setup
/app/c/template-pick
/app/c/deploying
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
- **主 CTA**：「要不要也把它 pin 到自己的 IPFS？」→ 無縫接 B 流程（username 已帶入）
- **次要動作**：「做成一個網站」→ 接 C 流程；「再見，謝謝」→ 回 landing

---

### 2.B. 流程 B：永存（5 screens）

#### B-1 輸入 username
同 A-1。

#### B-2 選 pinning provider

- **目的**：降低決策焦慮——「我應該選哪個？」
- **內容**：兩張對照卡片
  - **Storacha**：免費 5 GB / 基於 Filecoin / 註冊 3 分鐘 / ⭐推薦
  - **Pinata**：免費 1 GB / 老牌穩定 / 已有帳號適合
  - 底部「我兩個都不懂」→ 內嵌 90 秒影片「2 分鐘學會 IPFS pinning」
- **主 CTA**：「我選 Storacha」／「我選 Pinata」
- **次要動作**：「我已經有 token，直接下一步」

#### B-3 貼 API token

- **目的**：收 token，**最大化信任**。
- **內容**：
  - 一個大的 monospace textarea（paste-friendly）
  - Token input 上方一個顯眼 callout：「🔒 這個 token 只會存在這個分頁的記憶體。你關掉這個 tab 它就消失了。我們沒有後端，就算想偷也偷不到。」
  - 連結：「怎麼拿到 Storacha token？」→ side-panel 教學（截圖步驟）
  - 「測試 token」按鈕（呼叫 provider 的 `/user` endpoint 驗證權限 + 剩餘額度）
- **主 CTA**：「確認 token 沒問題，下一步」（testing 通過才 enable）
- **錯誤**：
  - token 格式錯 → 「這看起來不像 Storacha token。Storacha token 通常以 `did:key:` 開頭。」
  - 401 → 「Storacha 說這個 token 無效。是不是過期了？」+ 「重新生一個」連結
  - 403 權限不足 → 「這個 token 沒有 upload 權限。要不要回 Storacha 重新生一個有 `Store` scope 的？」
  - 額度不夠 → 「你有 143 篇需要約 67 MB，但你的帳戶剩 50 MB。要不要先升級，或勾掉一些大檔？」
- **預估時間**：測試 token「大概 2 秒」

#### B-4 Dry-run 確認

- **目的**：**最重要的一步**——在真的花配額前，讓使用者看見「我要 pin 什麼」。
- **內容**：
  - 「即將把這 143 個 CID pin 到你的 Storacha 帳號」
  - 可展開的 CID 清單 + 預估容量
  - 「這會消耗你 Storacha 配額的 67 MB / 5000 MB」進度條預覽
  - checkbox：「我懂，這個動作會寫入我的 IPFS 帳號，不可逆」（明確 informed consent）
  - dry-run 按鈕：「只跑一次測試 pin（第一篇）」
- **主 CTA**：「開始 pin 全部 143 篇」
- **次要動作**：「回去改選項」

#### B-5 Pinning 中 & 完成

- **Loading**：
  - 進度條 + 即時「已 pin N / 143」
  - 預估剩餘時間（IPFS pin 慢，要老實告知：「約 8-12 分鐘」）
  - 可最小化到 browser tab title：`(47/143) Matters Lifeboat`
  - 「中途關掉 tab 會怎樣？」tooltip：「已經 pin 成功的不會消失，未完成的會中斷；下次回來可以續傳。」
- **錯誤**：
  - 某幾個 CID pin 失敗（常見：gateway timeout）→ 不擋全體，結尾統計失敗清單 + 「重試失敗的 3 筆」按鈕
  - 配額中途爆掉 → 暫停 + 「你用完配額了。已成功 pin 87 篇。要升級繼續嗎？」
- **成功狀態**：
  - 勾勾動畫 + 「你的 143 篇文章現在有了兩份 IPFS pin：Matters 的 + 你自己的。」
  - 給一份 `pinning-receipt.json` 下載（含每個 CID 的 pin status + timestamp）
  - Handoff 指南（見 §5）

---

### 2.C. 流程 C：立站（6 screens）

#### C-1 輸入 username
同 A-1，但額外預覽「你的網站長這樣」靜態 preview。

#### C-2 GitHub 授權

- **目的**：連 GitHub，**這是整個專案最易卡關處**。
- **內容**：
  - 「需要 GitHub 授權，才能幫你開一個放文章的 repo。」
  - 大 OAuth 按鈕：「用 GitHub 登入」
  - 底下白話解釋：
    - 「我們會要求什麼權限？」→ 只要 `repo` scope（建立 public repo、push code）
    - 「我們會看到你其他 repo 嗎？」→ 看得到清單，不會讀內容
    - 「怎麼撤銷？」→ GitHub Settings → Applications → Revoke
  - 「我完全沒用過 GitHub 耶」→ 嵌入 3 分鐘「註冊 GitHub 帳號」影片
- **主 CTA**：「用 GitHub 登入」
- **次要動作**：「先產生 ZIP，我自己上傳」→ 降級到流程 A

#### C-3 Repo 設定

- **目的**：選 repo 名稱 + public/private。
- **內容**：
  - Repo 名稱 input（預設：`<username>-archive`，即時檢查可用性）
  - Public / Private 切換（預設 Public，附說明：「Public 才能用 Cloudflare Pages 免費方案」）
  - Domain 預覽：`https://<username>-archive.pages.dev`（之後可綁自訂網域）
- **主 CTA**：「看看網站長怎樣」
- **錯誤**：
  - Repo 名已存在 → 「你已經有這個名字的 repo 了。要用它（覆蓋）還是換個名字？」
  - Rate limit → 「GitHub 說我們請求太快了。30 秒後再試？」

#### C-4 Template 選擇

- **目的**：減少挑色焦慮，給 3 個預設就好。
- **內容**：3 張 template 卡片 + live preview iframe
  - **Minimal（預設）**：白底、襯線字、極簡
  - **Journal**：類似 Substack 的閱讀視感
  - **Zine**：方格、彩色封面、較視覺
- **主 CTA**：「用 Minimal 建站」
- **次要動作**：「之後再換 template」（承諾換 template 只是改一個 config 值）
- **預估時間**：「下一步會花 3-5 分鐘，因為我們要 build 整個網站」

#### C-5 Deploying

- **Loading**：
  - **5 個 sub-step 明確顯示**（這是一般人最焦慮的一段，要給足安全感）：
    1. ⏳ 建立 GitHub repo
    2. ⏳ 推送文章內容
    3. ⏳ 設定 Cloudflare Pages
    4. ⏳ 首次 build
    5. ⏳ DNS 生效
  - 每步完成勾一個綠勾
  - 右側 log viewer（可收合，for debug）
- **錯誤**：
  - CF Pages quota 爆 → 「你的 Cloudflare 帳號今天的 build 額度用完了，明天再試？或用我們的 community CF account」
  - Build fail（文章裡有壞 markdown）→ 「第 N 篇文章裡有個 syntax 問題。我們先把它移到 `_drafts/`，網站還是會 build 成功，你有空再處理？」（非阻斷 + graceful degrade）

#### C-6 完成

- **內容**：
  - 大大的 QR code 指向新網站
  - 「🎉 你的網站活了：`https://<username>-archive.pages.dev`」
  - 一個 `open in new tab` 按鈕（明顯）
  - Handoff 指南：「下次怎麼加新文章？」「怎麼換 template？」「怎麼綁自己的網域？」（見 §5）
- **主 CTA**：「打開我的網站」
- **次要動作**：「分享到 Matters 通知朋友」（預填推文）

---

## 3. 五個最危險的卡關時刻 & 設計對策

| # | 時刻 | 一般用戶會怎樣 | 設計對策 |
|---|---|---|---|
| 1 | **A-1 輸入 username**：不確定要貼 `@mashbean` 還是 `mashbean` 還是整條 URL | 輸入錯、按下去、看到錯誤、放棄 | 接受所有格式、auto-strip `@` 與 `https://matters.town/`、input 下面 placeholder 寫「支援 @mashbean、mashbean、或整條網址」；錯誤訊息不說「格式錯」而說「找不到這個使用者，要不要檢查拼字」 |
| 2 | **B-3 貼 token**：不知道 token 安不安全、會不會被偷 | 猶豫、關 tab | Token input 上方固定放一個綠色信任卡（見 B-3）；「測試 token」按鈕給即時回饋；文案強調 sessionStorage 與開源可檢查 |
| 3 | **B-4 Dry-run 到 B-5 開始 pin**：不懂「pin」是什麼、怕 pin 錯、怕花錢 | 點了取消 | Dry-run 是強制步驟；提供「只 pin 第一篇試試」的 baby step；明確「5 GB 免費，你用 67 MB」安心數字；checkbox 的 informed consent 文案避免法律感、用白話 |
| 4 | **C-2 GitHub 授權**：看到 OAuth 權限畫面一堆英文就怕 | 關 tab | 授權前我們先用白話預告「接下來會看到 GitHub 的授權畫面，勾 repo 就好」；提供「GitHub 登入預演截圖」side-panel；降級路徑：「不想授權也可以走 A 流程」 |
| 5 | **C-5 Deploying 的 3-5 分鐘等待**：不知道在幹嘛、懷疑壞了 | 重整、刷新、導致 state 丟失 | 5 個 sub-step 一步一步勾綠、每步預告時間、右側滾動 log（即使不懂也覺得在動）、title bar 顯示進度、**最重要**：加一個「這不會壞掉，你可以關 tab 去喝咖啡，回來給你看成果」＋ 如果真關掉，URL `?job=<id>` 可以 rehydrate 進度 |

---

## 4. AI Agent 使用者專屬入口

### 4.1 機器可讀 URL schema

所有流程支援 query param 注入狀態：

```
/app/a/input?u=mashbean&autostart=1
/app/b/token?provider=storacha&token=<redacted>&autostart=1
/app/c/repo-setup?name=mashbean-archive&visibility=public
```

`autostart=1` 時，畫面顯示一個 5 秒 countdown「AI agent 要求自動執行，5 秒後開始，要暫停按這裡」，避免 agent 偷跑使用者不知情。

### 4.2 JSON 狀態端點

每個 screen 左下角有 `[ JSON ]` 按鈕，吐出當前 state：

```json
{
  "flow": "B",
  "step": "pinning",
  "username": "mashbean",
  "progress": { "done": 47, "total": 143, "failed": 2 },
  "estimated_remaining_ms": 420000,
  "provider": "storacha",
  "quota_used_bytes": 23456789,
  "quota_total_bytes": 5368709120,
  "last_error": null,
  "resume_url": "https://matters-lifeboat.pages.dev/app/b/pinning?job=abc123"
}
```

Agent 可 `fetch()` URL + header `Accept: application/json`，拿到同結構。

### 4.3 CLI fallback

`npx matters-lifeboat` 提供完整 CLI：

```
npx matters-lifeboat backup @mashbean --out ./archive.zip
npx matters-lifeboat pin @mashbean --provider storacha --token $TOKEN
npx matters-lifeboat site @mashbean --repo mashbean-archive --template minimal
```

所有 CLI 輸出 NDJSON（每行一 event），for agent parsing。退出碼：`0` success / `1` user error / `2` network / `3` quota / `4` auth。

### 4.4 `/ai.txt` 與 `/.well-known/matters-lifeboat.json`

landing 根目錄放一份 agent-friendly 說明：

```
# ai.txt — Matters Lifeboat
This tool helps users export their matters.town content.
Safe for AI agents to invoke on behalf of users with explicit consent.
Primary flows: A (backup), B (preserve), C (publish).
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
- /manifest.json      每篇文章的 IPFS 指紋（CID）清單
- /README.md          就是你現在在看的這個

## 下次想再備份一次怎麼辦？

最簡單：來這裡重跑一次 https://matters-lifeboat.pages.dev
進階：裝 CLI，`npx matters-lifeboat backup @mashbean`

## 我現在有這個 ZIP，可以做什麼？

- 丟進 Google Drive / iCloud：你的備份就在三處（Matters、你電腦、雲端）
- 丟進 Obsidian / Logseq：直接用 Markdown 閱讀與編輯
- 丟進自己的部落格：.md 直接貼到 Hugo / Astro / Jekyll

## 什麼是 CID？

CID（Content Identifier）是你每篇文章在 IPFS 網路上的唯一指紋。
你不需要懂 IPFS 也能用這個 ZIP——但如果以後有興趣，可以走「永存」流程。
```

### 5.2 B-flow handoff：`README-pinned.md`

```
# 你剛把 143 篇文章 pin 到你自己的 IPFS 帳號了

這表示：
- 就算 Matters 那邊 un-pin，你的 Storacha 還有一份
- 任何人用這些 CID 都能從全球 IPFS 網路抓到你的內容

## 以後會發生什麼事？

- Storacha 免費 5 GB，你現在用了 67 MB，還有很多空間
- 不會自動續 pin 新文章。下次你發新文章，想 pin 要再跑一次這個工具
- Storacha 帳號不會過期，但 token 會——建議 6 個月後重新生一個

## 怎麼讓其他人看到我的 IPFS 版？

貼這個連結格式：
https://<CID>.ipfs.w3s.link/
例如你的第一篇是：
https://bafy....ipfs.w3s.link/

## receipt 檔案是什麼？

pinning-receipt.json 是證明你當下成功 pin 的收據。
建議存一份到雲端。
```

### 5.3 C-flow handoff：`README-site.md`

```
# 你的網站活了

- 網址：https://mashbean-archive.pages.dev
- 原始碼：https://github.com/mashbean/mashbean-archive
- 部署：Cloudflare Pages（免費方案：每月 500 次 build 綽綽有餘）

## 下次我在 Matters 發新文章怎麼辦？

（MVP 階段）：回來跑一次救生艇，會幫你 push 新文章到同一個 repo，網站自動重新 build。
（未來）：我們會做 cron 版本，每週自動同步一次。

## 怎麼換 template？

你的 repo 裡有一個 `lifeboat.config.json`，改 `"template": "journal"` 推上去就好。

## 怎麼綁自己的網域？

1. 去 Cloudflare Pages dashboard
2. 點你的 project → Custom domains → Set up a domain
3. 跟著它的步驟（大概 10 分鐘）
我們有一份詳細教學：https://matters-lifeboat.pages.dev/docs/custom-domain

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
